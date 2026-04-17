# Developer Guide: Personal Budget App

## Project Structure
- `server.js`: Express backend, API endpoints for envelopes, expenses, income, transfer, and distribution.
- `public/`: Static frontend files (HTML, CSS, modals).
- `src/script.js`: Frontend logic for UI, modals, and API calls.


## Key Operations
- **Envelope CRUD:**
  - Endpoints: `/envelopes` (GET, POST), `/envelopes/:id` (DELETE)
- **Expenses/Income:**
  - Endpoints: `/envelopes/:id/expenses`, `/envelopes/:id/income` (POST)
- **Transfer:**
  - Endpoint: `/envelopes/transfer/:fromId/:toId/:amount` (POST)
  - Each transfer creates two ledger entries, each referencing the other via `transfer_ref_id`.
  - Deleting a transfer deletes both entries and reverses both budgets.
- **Distribute Income:**
  - Endpoint: `/envelopes/distribute/:amount` (POST)
  - Splits amount evenly, remainder to last envelope, adds to existing budgets

## Envelope Ledger System

Each envelope object contains a `ledger` array that records all transactions affecting that envelope. This provides a detailed transaction history for auditing and calculation purposes.

### Envelope Structure Example
```js
{
  id: 1,
  title: "groceries",
  budget: 100,
  ledger: [
    { amount: 100, date: "2026-04-10T12:00:00Z", description: "Initial deposit", type: "income" },
    { amount: -20, date: "2026-04-11T09:00:00Z", description: "Supermarket", type: "expense" },
    { amount: 50, date: "2026-04-11T10:00:00Z", description: "Transfer from savings", type: "transfer in" }
  ]
}
```


### Ledger Entry Fields
- `amount`: Positive for income, negative for expenses or outgoing transfers.
- `date`: ISO string or Date object when the transaction occurred.
- `description`: Short text describing the transaction.
- `type`: 'income', 'expense', or 'transfer'.
- `transfer_ref_id`: (integer, nullable) If this entry is part of a transfer, references the corresponding ledger entry in the other envelope.

### Transfer Deletion Logic
- When deleting a ledger entry of type 'transfer', the backend will:
  - Find the referenced entry using `transfer_ref_id`.
  - Delete both ledger entries.
  - Reverse both envelope budgets accordingly.

### Database Schema Note
- The app now requires a PostgreSQL database with a `ledger` table that includes a nullable `transfer_ref_id` column referencing `ledger(id)`.
- `type`: One of `income`, `expense`, `transfer in`, `transfer out`, `distribution`, etc.

### How the Ledger Works
- **Adding Income:** Adds a positive entry to the ledger and increases the envelope's budget.
- **Adding Expense:** Adds a positive entry to the ledger and decreases the envelope's budget.
- **Transfers:** Adds a negative entry to the source envelope's ledger (`transfer out`) and a positive entry to the target envelope's ledger (`transfer in`).
- **Distribution:** Adds a positive entry to each envelope's ledger with type `distribution`.

The sum of all `amount` values in the ledger should always equal the envelope's current `budget` value.

### Example Usage
- To view an envelope's transaction history, inspect its `ledger` array.
- To audit or recalculate the budget, sum all `amount` values in the ledger.

## Frontend Modal Loading
- Modals are loaded dynamically from separate HTML files.
- Event handlers for forms are attached only after modal loads (see `script.js`).
- To prevent duplicate requests, form nodes are replaced before adding event listeners.

## Data Storage
- All data is stored in-memory in the `envelopes` array in `server.js`.
- No persistent storage; restarting the server resets all data.

## Development Tips
- Use console logs in `server.js` to debug API calls and envelope state.
- For UI changes, edit modal HTML files and `script.js`.
- For backend changes, update `server.js` endpoints and logic.

## Extending Functionality
- To add persistent storage, integrate a database (e.g., MongoDB).
- To add authentication, use middleware in Express.
- For more advanced UI, consider using a frontend framework.

## Testing
- Manual testing via browser UI.
- Use tools like Postman for API endpoint testing.

## Contact
- For questions or contributions, open an issue or pull request.

## psql create table statements
CREATE TABLE envelopes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    budget NUMERIC(12,2) NOT NULL DEFAULT 0
);

CREATE TABLE ledger (
    id SERIAL PRIMARY KEY,
    envelope_id INTEGER NOT NULL REFERENCES envelopes(id) ON DELETE CASCADE,
    amount NUMERIC(12,2) NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'income', 'expense', 'transfer'
    description TEXT,
    transfer_ref_id INTEGER REFERENCES ledger(id) ON DELETE SET NULL,
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);