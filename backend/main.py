from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle
import pandas as pd
import numpy as np

app = FastAPI(title="Retail Demand Forecasting & Dynamic Pricing API")

# Allow the frontend (running on a different port) to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load trained models ONCE at startup — never retrain live
with open('forecast_model.pkl', 'rb') as f:
    forecast_model = pickle.load(f)

with open('elasticity_model.pkl', 'rb') as f:
    elasticity_params = pickle.load(f)

# Load cleaned data so we can look up recent history per store (needed for lag features)
df = pd.read_csv('data/train_with_price.csv', parse_dates=['Date'])


class ForecastRequest(BaseModel):
    store: int
    promo: int = 0
    day_of_week: int = 3
    is_state_holiday: int = 0
    school_holiday: int = 0


class PriceRequest(BaseModel):
    store: int
    current_price: float
    forecasted_demand: float
    objective: str = "revenue"


@app.get("/")
def root():
    return {"message": "Retail Demand Forecasting & Dynamic Pricing API is running"}


@app.get("/stores")
def get_stores():
    """Return a list of available store IDs for the frontend dropdown"""
    stores = sorted(df['Store'].unique().tolist())
    return {"stores": stores[:50]}  # limit for demo speed


@app.post("/forecast")
def forecast(req: ForecastRequest):
    """Predict demand for a given store using recent history for lag features"""
    store_data = df[df['Store'] == req.store].sort_values('Date')
    if store_data.empty:
        return {"error": "Store not found"}

    last_row = store_data.iloc[-1]
    recent7 = store_data.tail(7)['Sales'].mean()

    features = pd.DataFrame([{
        'Store': req.store,
        'DayOfWeek': req.day_of_week,
        'Promo': req.promo,
        'IsStateHoliday': req.is_state_holiday,
        'SchoolHoliday': req.school_holiday,
        'Year': last_row['Date'].year,
        'Month': last_row['Date'].month,
        'Day': last_row['Date'].day,
        'WeekOfYear': int(last_row['Date'].isocalendar()[1]),
        'Sales_Lag1': last_row['Sales'],
        'Sales_Lag7': store_data.iloc[-7]['Sales'] if len(store_data) >= 7 else last_row['Sales'],
        'Sales_RollingMean7': recent7,
    }])

    prediction = forecast_model.predict(features)[0]
    return {
        "store": req.store,
        "forecasted_demand": round(float(prediction), 1),
        "current_price": round(float(last_row['Price']), 2)
    }


@app.post("/optimize-price")
def optimize_price(req: PriceRequest):
    """Recommend optimal price given a forecasted demand"""
    elasticity = elasticity_params['elasticity']
    candidate_prices = np.linspace(req.current_price * 0.7, req.current_price * 1.3, 50)

    results = []
    for p in candidate_prices:
        price_ratio = p / req.current_price
        demand_at_p = req.forecasted_demand * (price_ratio ** elasticity)
        revenue = p * demand_at_p
        results.append({
            "price": round(float(p), 2),
            "demand": round(float(demand_at_p), 1),
            "revenue": round(float(revenue), 2)
        })

    best = max(results, key=lambda r: r['revenue'])
    return {
        "recommended_price": best['price'],
        "expected_demand": best['demand'],
        "expected_revenue": best['revenue'],
        "current_price": req.current_price,
        "elasticity_used": round(float(elasticity), 4),
        "all_candidates": results
    }

@app.get("/forecast-all")
def forecast_all():
    elasticity = elasticity_params['elasticity']
    results = []
    store_ids = sorted(df['Store'].unique().tolist())[:50]
    for store_id in store_ids:
        store_data = df[df['Store'] == store_id].sort_values('Date')
        if store_data.empty or len(store_data) < 7:
            continue
        last_row = store_data.iloc[-1]
        recent7 = store_data.tail(7)['Sales'].mean()
        features = pd.DataFrame([{'Store': store_id, 'DayOfWeek': 3, 'Promo': 0, 'IsStateHoliday': 0, 'SchoolHoliday': 0, 'Year': last_row['Date'].year, 'Month': last_row['Date'].month, 'Day': last_row['Date'].day, 'WeekOfYear': int(last_row['Date'].isocalendar()[1]), 'Sales_Lag1': last_row['Sales'], 'Sales_Lag7': store_data.iloc[-7]['Sales'], 'Sales_RollingMean7': recent7}])
        demand = float(forecast_model.predict(features)[0])
        current_price = float(last_row['Price'])
        candidate_prices = np.linspace(current_price * 0.7, current_price * 1.3, 30)
        best_price = current_price
        best_revenue = current_price * demand
        for p in candidate_prices:
            d = demand * ((p / current_price) ** elasticity)
            rev = p * d
            if rev > best_revenue:
                best_price = p
                best_revenue = rev
        results.append({"store": int(store_id), "forecasted_demand": round(demand, 1), "current_price": round(current_price, 2), "recommended_price": round(best_price, 2), "expected_revenue": round(best_revenue, 2)})
    return {"results": results}


class WhatIfRequest(BaseModel):
    current_price: float
    forecasted_demand: float
    price_range_pct: float = 30  # ± percent range to explore


@app.post("/what-if")
def what_if(req: WhatIfRequest):
    """Explore a range of candidate prices around current price"""
    elasticity = elasticity_params['elasticity']
    low = req.current_price * (1 - req.price_range_pct / 100)
    high = req.current_price * (1 + req.price_range_pct / 100)
    candidate_prices = np.linspace(low, high, 7)

    results = []
    for p in candidate_prices:
        demand = req.forecasted_demand * ((p / req.current_price) ** elasticity)
        revenue = p * demand
        results.append({
            "price": round(float(p), 2),
            "demand": round(float(demand), 1),
            "revenue": round(float(revenue), 2),
        })

    return {"scenarios": results, "elasticity_used": round(float(elasticity), 4)}

# ── Batch Forecast ──────────────────────────────────────────────────────────
from fastapi import UploadFile, File
import io


@app.post("/batch-forecast")
async def batch_forecast(file: UploadFile = File(...)):
    """Accept a CSV with columns Store,Promo,DayOfWeek and return forecasts + optimal prices for each row"""
    contents = await file.read()
    try:
        upload_df = pd.read_csv(io.StringIO(contents.decode("utf-8-sig")))
        upload_df.columns = upload_df.columns.str.strip()
    except Exception as e:
        return {"error": f"Could not parse CSV: {str(e)}"}

    required = {"Store", "Promo", "DayOfWeek"}
    missing = required - set(upload_df.columns)
    if missing:
        return {"error": f"Missing columns: {', '.join(missing)}. Required: Store, Promo, DayOfWeek"}

    results = []
    for _, row in upload_df.iterrows():
        store_id = int(row["Store"])
        promo = int(row["Promo"])
        day_of_week = int(row["DayOfWeek"])

        store_data = df[df["Store"] == store_id].sort_values("Date")
        if store_data.empty:
            results.append({
                "store": store_id, "promo": promo, "day_of_week": day_of_week,
                "error": "Store not found in training data"
            })
            continue

        last_row = store_data.iloc[-1]
        recent7 = store_data.tail(7)["Sales"].mean()
        lag7_val = store_data.iloc[-7]["Sales"] if len(store_data) >= 7 else last_row["Sales"]

        features = pd.DataFrame([{
            "Store": store_id,
            "DayOfWeek": day_of_week,
            "Promo": promo,
            "IsStateHoliday": 0,
            "SchoolHoliday": 0,
            "Year": last_row["Date"].year,
            "Month": last_row["Date"].month,
            "Day": last_row["Date"].day,
            "WeekOfYear": int(last_row["Date"].isocalendar()[1]),
            "Sales_Lag1": last_row["Sales"],
            "Sales_Lag7": lag7_val,
            "Sales_RollingMean7": recent7,
        }])

        demand = float(forecast_model.predict(features)[0])
        current_price = float(last_row["Price"])

        # Price optimisation
        elasticity = elasticity_params["elasticity"]
        candidate_prices = np.linspace(current_price * 0.7, current_price * 1.3, 50)
        best_price, best_revenue = current_price, 0.0
        for cp in candidate_prices:
            adj_demand = demand * ((cp / current_price) ** elasticity)
            rev = cp * adj_demand
            if rev > best_revenue:
                best_price, best_revenue = cp, rev

        results.append({
            "store": store_id,
            "promo": promo,
            "day_of_week": day_of_week,
            "forecasted_demand": round(demand, 1),
            "current_price": round(current_price, 2),
            "recommended_price": round(best_price, 2),
            "expected_revenue": round(best_revenue, 2),
        })

    return {"results": results, "total_rows": len(results)}
