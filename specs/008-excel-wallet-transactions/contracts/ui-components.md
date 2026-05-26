# UI Component Contracts: Excel Wallet Transactions

## Overview

React client components for the import/export UI. Components use `'use client'` directive for interactivity.

## Components

### `ImportTransactions`

**Props**:
```typescript
interface ImportTransactionsProps {
  personId: string;
  onImportComplete?: () => void;  // Called after successful import to trigger parent refresh
}
```

**Behavior**:
- File upload area (drag-and-drop + click)
- Accepts `.xlsx`, `.xls` files only
- On upload: calls `importTransactions` server action (first call, no confirm)
- If errors: displays inline error list with cell references
- If warnings: shows warning badge in preview
- If valid: opens preview modal with parsed transactions
- Preview modal: transaction list (grouped by type), total counts, confirm/cancel buttons
- Sheet selector dropdown if file has multiple sheets
- On confirm: calls `importTransactions` (second call with `confirmed=true`)
- On success: closes modal, calls `onImportComplete`, triggers `revalidatePath()`

**States**: Upload (idle/dragging/error), Parsing (spinner), Preview (modal open), Importing (progress), Success (brief toast/done)

---

### `ExportButton`

**Props**:
```typescript
interface ExportButtonProps {
  personId: string;
}
```

**Behavior**:
- Button with dropdown or month-picker to select month/year
- On click: calls `exportTransactions` server action
- Downloads the generated Excel file
- Shows loading state during generation

**States**: Idle, Selecting (month picker open), Loading (generating file), Done (download triggered)

---

### `TemplateDownload`

**Props**:
```typescript
interface TemplateDownloadProps {
  className?: string;
  label?: string;
}
```

**Behavior**:
- Button labeled "Download Template"
- On click: calls `downloadTemplate` server action
- Downloads the generated Excel file
- No dependency on person context

**States**: Idle, Loading (file generation), Done (download triggered)
