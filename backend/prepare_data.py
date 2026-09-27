import pandas as pd

# Load data
df = pd.read_csv('data/train.csv', low_memory=False)

# 1. Remove closed-store days — 0 sales on closed days is not "demand", it's noise
df = df[df['Open'] == 1].copy()

# 2. Convert Date to actual datetime, sort by store then date (critical for lag features)
df['Date'] = pd.to_datetime(df['Date'])
df = df.sort_values(['Store', 'Date']).reset_index(drop=True)

# 3. Calendar features
df['Year'] = df['Date'].dt.year
df['Month'] = df['Date'].dt.month
df['Day'] = df['Date'].dt.day
df['WeekOfYear'] = df['Date'].dt.isocalendar().week.astype(int)

# 4. Clean StateHoliday — make it simple binary (was it a holiday at all)
df['StateHoliday'] = df['StateHoliday'].astype(str)
df['IsStateHoliday'] = (df['StateHoliday'] != '0').astype(int)

# 5. Lag features — yesterday's sales, and sales from 7 days ago, PER STORE
df['Sales_Lag1'] = df.groupby('Store')['Sales'].shift(1)
df['Sales_Lag7'] = df.groupby('Store')['Sales'].shift(7)

# 6. Rolling average — smoothed recent trend, PER STORE
df['Sales_RollingMean7'] = df.groupby('Store')['Sales'].shift(1).rolling(7).mean()

# 7. Drop rows where lag features are missing (first few days per store won't have history)
df = df.dropna(subset=['Sales_Lag1', 'Sales_Lag7', 'Sales_RollingMean7'])

print("Final shape:", df.shape)
print(df[['Store','Date','Sales','Sales_Lag1','Sales_Lag7','Sales_RollingMean7','Promo','IsStateHoliday']].head(10))

# Save cleaned data for the next step
df.to_csv('data/train_cleaned.csv', index=False)
print("Saved to data/train_cleaned.csv")