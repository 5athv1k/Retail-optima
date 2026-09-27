import pandas as pd
import xgboost as xgb
from sklearn.metrics import mean_absolute_error, mean_absolute_percentage_error
import pickle

# Load cleaned data
df = pd.read_csv('data/train_cleaned.csv', parse_dates=['Date'])

# Features the model will learn from
features = [
    'Store', 'DayOfWeek', 'Promo', 'IsStateHoliday', 'SchoolHoliday',
    'Year', 'Month', 'Day', 'WeekOfYear',
    'Sales_Lag1', 'Sales_Lag7', 'Sales_RollingMean7'
]
target = 'Sales'

X = df[features]
y = df[target]

# TIME-BASED split — NOT random. Train on the past, test on the future.
# This matters a lot: random splitting leaks future info into training, which
# would make the model look better than it actually is.
split_date = df['Date'].quantile(0.8, interpolation='nearest')
train_mask = df['Date'] < split_date
test_mask = df['Date'] >= split_date

X_train, X_test = X[train_mask], X[test_mask]
y_train, y_test = y[train_mask], y[test_mask]

print(f"Train size: {len(X_train)}, Test size: {len(X_test)}")
print(f"Split date: {split_date}")

# Train XGBoost
model = xgb.XGBRegressor(
    n_estimators=300,
    max_depth=6,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42
)

model.fit(X_train, y_train)

# Evaluate
preds = model.predict(X_test)
mae = mean_absolute_error(y_test, preds)
# Safe MAPE: exclude rows where actual sales are near-zero to avoid divide-by-near-zero blowup
mask = y_test > 10
mape = mean_absolute_percentage_error(y_test[mask], preds[mask])
print(f"MAE (avg error in units sold): {mae:.2f}")
print(f"MAPE (avg % error): {mape*100:.2f}%")

# Feature importance — good to show in your report/viva
importance = pd.Series(model.feature_importances_, index=features).sort_values(ascending=False)
print("\nFeature importance:")
print(importance)

# SAVE the trained model — this is the critical step your friend emphasized.
# Backend will just LOAD this file, never retrain live.
with open('forecast_model.pkl', 'wb') as f:
    pickle.dump(model, f)

print("\nModel saved to forecast_model.pkl")