import pandas as pd

# Load files
rop = pd.read_csv("rop.csv")
ca = pd.read_csv("CA_POINTS_NAME_CHANGED.csv")

# Strip BOM from column names if present
rop.columns = rop.columns.str.lstrip("﻿")
ca.columns = ca.columns.str.lstrip("﻿")

# Align join keys: feature_id (rop) <-> GNIS_ID (ca)
# Coerce to nullable Int64 for safe merging (handles empty strings / NaN)
rop["feature_id"] = pd.to_numeric(rop["feature_id"], errors="coerce").astype("Int64")
ca["GNIS_ID"] = pd.to_numeric(ca["GNIS_ID"], errors="coerce").astype("Int64")

# Columns in ca that aren't already in rop (excluding the join key itself)
extra_cols = [c for c in ca.columns if c != "GNIS_ID" and c not in rop.columns]

# Left join: keep all rop rows, attach extra ca columns where a match exists
merged = rop.merge(
    ca[["GNIS_ID"] + extra_cols],
    left_on="feature_id",
    right_on="GNIS_ID",
    how="left",
)

# Drop the redundant GNIS_ID column brought in by the merge
merged.drop(columns=["GNIS_ID"], inplace=True)

merged.to_csv("rop_merged.csv", index=False)
print(f"Done. {len(merged)} rows, {len(merged.columns)} columns.")
print("Columns:", list(merged.columns))
