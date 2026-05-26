# Interface Contract: Excel Layout

## Summary Section Position

```
Row N:   [last daily entry row]
Row N+1: [blank row]
Row N+2: [blank row]
Row N+3: "Summary" header          | ""
Row N+4: "Monthly Savings"         | =SUM(credit range) - SUM(debit range)  [currency format]
Row N+5: "Last Month Remaining"    | <value from DB>                          [currency format]
Row N+6: "Give Back for Expenses"  | =SUM(debit range) * -1                  [currency format, negative]
Row N+7: "Loan Amount"             | <manual value>                           [currency format, negative]
Row N+8: "Balance for Next Month"  | =SUM(N4:N7) or cell-by-cell addition    [currency format, highlighted]
```

## Number Format

All value cells use: `#,##0.00` (2 decimal places with thousands separator).

The currency symbol is omitted from the number format — the label row or column header provides context. Alternatively, use `'₹#,##0.00'` if the user's currency is known at export time.

## Column Mapping

| Column | Content |
|--------|---------|
| A (Description) | Summary label text (e.g., "Monthly Savings") |
| AG (Total) | Computed value (formula or number) |

Columns B-AF (Days 1-31) are left empty in the summary section.

## Formula References

- **Monthly Savings**: References the Total column cells of credit and debit rows above
- **Give Back for Daily Expenses**: References the Total column cells of debit rows above (displayed as negative)
- **Balance for Next Month**: References the 4 preceding summary row values
- **Last Month Remaining**: Static value from DB (or a reference if stored elsewhere)
- **Loan Amount**: Static value (manually entered)

## Import Reading

On import, read the computed value from the Total column (AG) for each of the 5 summary rows. The cell's `v` property contains the cached computed value. The `f` property (formula string) is ignored during import — only the result matters.
