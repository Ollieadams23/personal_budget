# Personal Budget App

## Overview
This app helps you manage your budget using envelopes for different spending categories. You can add, edit, and delete envelopes, record expenses and income, and transfer or distribute funds between envelopes.

## How to Use
1. **Start the server:**
   - Run `node server.js` in the project directory.
   - Open your browser and go to `http://localhost:3000`.

2. **Add Envelopes:**
   - Enter a name and budget amount, then click "Add Envelope".

3. **Record Expenses/Income:**
   - Click "Expenses" or "Income" in the sidebar.
   - Fill out the form and submit.
   - For income, you can choose to distribute the amount evenly across all envelopes.

4. **Transfer Funds:**
   - Click "Transfer" in the sidebar.
   - Select source and destination envelopes, enter amount, and submit.

5. **Edit/Delete Envelopes:**
   - Click "Edit Envelopes" in the sidebar to manage envelopes.


## Features
- Envelope-based budgeting
- Add, edit, delete envelopes
- Record expenses and income
- Transfer funds between envelopes (each transfer creates two linked ledger entries; deleting a transfer deletes both and reverses budgets)
- Distribute income evenly across envelopes
- Responsive, clean UI


## Requirements
- Node.js
- PostgreSQL database (see DEV_GUIDE.md for schema details)


## Notes
- Transfers are tracked with cross-referencing ledger entries for robust deletion and reversal.
- See DEV_GUIDE.md for developer and schema details.
