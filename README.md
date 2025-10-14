# BarkCard

## Dependencies

Select Philippines Address
https://github.com/isaacdarcilla/select-philippines-address.git

## Test Account
20241078393@student-nudasma.online

## Database Collections

### User Data
- **Collection:** `tbl_User`
- **Document ID:** Firebase Auth UID
- **Key Fields:** `v_StudentId`, `v_StudentBalance`, `v_StudentTotalIncome`, `v_StudentTotalExpenses`, `v_ProfileComplete`

### Transactions
- **Collection:** `tbl_Transactions` (with 's')
- **User Identifier:** `v_StudentId` (contains student number WITHOUT dash, e.g., "20241078393")
- **Key Fields:** 
  - Orders: `v_OrderId`, `v_Items`, `v_Total`, `v_Timestamp`, `v_NfcCardId`
  - Other: `v_TransactionType`, `v_TransactionAmount`, `v_Timestamp`

## Important Notes

1. **Transaction Queries:** Always use `v_StudentId` field (student number without dash) to filter transactions by user
2. **Real-time Updates:** All financial data (balance, income, expenses, transactions) updates in real-time
3. **Firestore Index Required:** Composite index on `tbl_Transactions` for `v_StudentId` (Ascending) + `v_Timestamp` (Descending)
4. **Persistent Login:** Users stay logged in across app restarts until they explicitly logout

## Features

- ✅ Email authentication with verification
- ✅ Complete profile with Philippines address picker
- ✅ Real-time balance, income, expenses display
- ✅ Real-time transaction history with filters
- ✅ **Persistent login (stay logged in across app restarts)**
- ✅ Account settings with deactivation
- ✅ Support system with FAQs and email integration
- ✅ Account deactivation prevention on login

## Documentation
- `REALTIME_IMPLEMENTATION.md` - Real-time feature setup and configuration
- `TRANSACTION_REFERENCE.md` - Complete guide for working with transactions
- `SUPPORT_SYSTEM.md` - Support system with Gmail integration
- `PERSISTENT_LOGIN.md` - Session persistence implementation