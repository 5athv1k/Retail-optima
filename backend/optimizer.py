import pickle
import numpy as np

def load_models():
    with open('elasticity_model.pkl', 'rb') as f:
        elasticity_params = pickle.load(f)
    return elasticity_params

def recommend_price(current_price, forecasted_demand_at_current_price, objective='revenue', cost=None, min_price_pct=0.7, max_price_pct=1.3):
    """
    Given a current price and the forecasted demand AT that price,
    search nearby prices and recommend the one that maximizes the objective.
    """
    params = load_models()
    elasticity = params['elasticity']

    # Candidate prices: from 70% to 130% of current price
    candidate_prices = np.linspace(current_price * min_price_pct, current_price * max_price_pct, 50)

    results = []
    for p in candidate_prices:
        # Demand at candidate price, using elasticity:
        # demand_new = demand_old * (p_new / p_old) ^ elasticity
        price_ratio = p / current_price
        demand_at_p = forecasted_demand_at_current_price * (price_ratio ** elasticity)

        revenue = p * demand_at_p
        if objective == 'margin' and cost is not None:
            score = (p - cost) * demand_at_p
        else:
            score = revenue

        results.append({'price': round(p, 2), 'demand': round(demand_at_p, 1), 'revenue': round(revenue, 2), 'score': round(score, 2)})

    best = max(results, key=lambda r: r['score'])
    return best, results


if __name__ == '__main__':
    # Quick manual test
    current_price = 300
    forecasted_demand = 5000  # e.g. from your XGBoost model's prediction

    best, all_results = recommend_price(current_price, forecasted_demand, objective='revenue')

    print(f"Current price: ₹{current_price}, forecasted demand: {forecasted_demand}")
    print(f"\nRECOMMENDED PRICE: ₹{best['price']}")
    print(f"Expected demand at recommended price: {best['demand']}")
    print(f"Expected revenue: ₹{best['revenue']}")