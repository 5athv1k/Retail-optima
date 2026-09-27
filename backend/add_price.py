import pandas as pd
import numpy as np

np.random.seed(42)

df = pd.read_csv('data/train_cleaned.csv', parse_dates=['Date'])

# 1. Base price per store (unchanged)
store_ids = df['Store'].unique()
base_prices = pd.Series(
    np.random.uniform(200, 500, size=len(store_ids)),
    index=store_ids
)
df['BasePrice'] = df['Store'].map(base_prices)

# 2. INDEPENDENT day-to-day price variation — bigger swing (±15%), and NOT tied to promo.
#    This simulates normal price fluctuation (competitor response, small markdowns, etc.)
#    that happens regardless of promo campaigns.
noise = np.random.normal(loc=1.0, scale=0.15, size=len(df))
df['Price'] = df['BasePrice'] * noise

# 3. Promo still gives an ADDITIONAL small cut, but now it's a minor factor,
#    not the dominant source of price variation
df.loc[df['Promo'] == 1, 'Price'] = df.loc[df['Promo'] == 1, 'Price'] * 0.95

# 4. Bake in a REAL elasticity relationship directly: lower price should mechanically
#    push Sales up a bit, and higher price should push Sales down. We do this by
#    adjusting Sales based on how far Price is from that store's BasePrice.
#    This is the honest way to simulate elasticity: we DEFINE the ground-truth
#    relationship first, then the regression should recover it.
price_ratio = df['Price'] / df['BasePrice']  # >1 means priced above base, <1 means below
true_elasticity = -0.8  # ground truth we're injecting, so we can verify the regression finds it
demand_multiplier = price_ratio ** true_elasticity
df['Sales'] = (df['Sales'] * demand_multiplier).round().astype(int)

df['Price'] = df['Price'].round(2)

print(df[['Store', 'Date', 'Sales', 'Promo', 'Price', 'BasePrice']].head(10))
print("\nPrice stats:")
print(df['Price'].describe())
print("\nCorrelation between Price and Promo (should be LOW now):")
print(df[['Price', 'Promo']].corr())

df.to_csv('data/train_with_price.csv', index=False)
print("\nSaved to data/train_with_price.csv")