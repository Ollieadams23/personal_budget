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
- **Distribute Income:**
  - Endpoint: `/envelopes/distribute/:amount` (POST)
  - Splits amount evenly, remainder to last envelope, adds to existing budgets

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
