import pandas as pd
import numpy as np
import statsmodels.api as sm

df = pd.read_csv('data/train_with_price.csv', parse_dates=['Date'])

# Elasticity regression only makes sense on positive sales/prices — already guaranteed here,
# but we guard anyway
df = df[(df['Sales'] > 0) & (df['Price'] > 0)].copy()

# log-log setup: log(Sales) = a + b*log(Price) + controls
df['log_Sales'] = np.log(df['Sales'])
df['log_Price'] = np.log(df['Price'])

# Controls: Promo and DayOfWeek dummies, as the architecture doc specifies
# (promo is already baked into price via the discount, but keeping it as a control
# separates "promo boosts footfall" from "promo lowers price" effects)
X = df[['log_Price', 'Promo', 'DayOfWeek']].copy()
X = sm.add_constant(X)
y = df['log_Sales']

model = sm.OLS(y, X).fit()

print(model.summary())

elasticity = model.params['log_Price']
print(f"\n--- ELASTICITY COEFFICIENT: {elasticity:.4f} ---")
print(f"Interpretation: a 1% price increase is associated with a {elasticity:.2f}% change in demand")

# Save the coefficients we need for the pricing optimizer later
import pickle
with open('elasticity_model.pkl', 'wb') as f:
    pickle.dump({
        'elasticity': elasticity,
        'intercept': model.params['const'],
        'promo_coef': model.params['Promo']
    }, f)

print("\nSaved elasticity params to elasticity_model.pkl")