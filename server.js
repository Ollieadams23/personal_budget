const express = require('express');
const app = express();
const path = require('path');
const port = 3000;


// Import the database pool
const pool = require('./db');


// Serve static files from public
app.use(express.static(path.join(__dirname, 'public')));
// Serve static files from css
app.use('/css', express.static(path.join(__dirname, 'css')));
// Serve static files from src
app.use('/src', express.static(path.join(__dirname, 'src')));



// Global variables for envelopes and total budget
// let envelopes = [
//     { id: 1, title: "groceries", budget: 0, ledger: [] },
//     { id: 2, title: "transport", budget: 0, ledger: [] },
//     { id: 3, title: "entertainment", budget: 0, ledger: [] },
//     { id: 4, title: "bills", budget: 0, ledger: [] },
//     { id: 5, title: "savings", budget: 0, ledger: [] }
// ];
// Each ledger entry: { amount, date, description, type: 'income' | 'expense' }
//let totalBudget = 0;

app.use(express.json()); // for parsing application/json

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

const ledgerUpdate = (outFromEnvelope, inToEnvelope, amount, type, description) => {
    if (outFromEnvelope) {
        outFromEnvelope.ledger.push({ amount: -amount, date: new Date(), description: description, type: type });
    }
    if (inToEnvelope) {
        inToEnvelope.ledger.push({ amount: amount, date: new Date(), description: description, type: type });
    }
};

// DELETE endpoint to remove an envelope by id
app.delete('/envelopes/:id', (req, res) => {
    const id = parseInt(req.params.id);

pool.query('DELETE FROM envelopes WHERE id = $1', [id], (err, result) => {
    if (err) {
        console.log('Error deleting envelope:', err);
        return res.status(500).json({ error: 'Failed to delete envelope.' });
    }else{
        // Optionally update your envelopes array here if needed
        return res.status(204).send();
    }
});

});


// //post request to create envelope
// app.post('/envelopes', (req, res) => {
//     const { title, budget } = req.body;
//     if (!title || typeof budget !== 'number' || budget < 0) {
//         return res.status(400).json({ error: 'Invalid envelope data.' });
//     }
//     const id = envelopes.length ? envelopes[envelopes.length - 1].id + 1 : 1;
//     const newEnvelope = { id, title, budget };
//     envelopes.push(newEnvelope);
//     totalBudget += budget;
//     res.status(201).json(newEnvelope);
// });


//get all envelopes
app.get('/envelopes', (req, res) => {
    pool.query('SELECT * FROM envelopes', (err, result) => {
        if (err) {
            console.log('Error fetching envelopes:', err);
            return res.status(500).json({ error: 'Failed to fetch envelopes.' });
        }
    res.json(result.rows);
});
});


// GET endpoint to retrieve one envelope by category
app.get('/envelopes/:catagory', (req, res) => {
    if (req.params.catagory) {
        const catagory = req.params.catagory;
        pool.query('SELECT * FROM envelopes WHERE title = $1', [catagory], (err, result) => {
            if (err) {
                console.log('Error fetching envelope:', err);
                return res.status(500).json({ error: 'Failed to fetch envelope.' });
            }
            res.json(result.rows.length ? result.rows[0] : { error: 'Category not found.' });
        });
    }
});

// POST endpoint to create a new envelope
app.post('/envelopes', (req, res) => {
    const { title, budget } = req.body;
    //see if title exists in envelopes array
    pool.query('SELECT * FROM envelopes WHERE title = $1', [title], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error fetching envelope.' });
        }if (result.rows.length) {
            return res.status(400).json({ error: 'Envelope with this title already exists.' });
        }
            pool.query('INSERT INTO envelopes (title, budget) VALUES ($1, $2) RETURNING *', [title, budget], (err, result) => {
                if (err) {
                    console.log('Error creating envelope:', err);
                    return res.status(500).json({ error: 'Failed to create envelope.' });
                }
                res.status(201).json(result.rows[0]);
            
                        pool.query('INSERT INTO ledger (envelope_id, amount, type, description) VALUES ($1, $2, $3, $4)', [result.rows[0].id, budget, 'initial', `Initial budget for ${title}`], (err) => {;
                        if (err) {
                            console.log('Error creating ledger entry:', err);
                        }
                        });


            })

        
   
    });
});







//endpoint to take a given amount and evenly distribute it across all envelopes adding to its value using params

app.post('/envelopes/distribute/:amount', (req, res) => {
    const amount = parseFloat(req.params.amount);
    if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ error: 'Invalid amount.' });
    }
    pool.query('SELECT * FROM envelopes', (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch envelopes.' });
        }
        const envelopes = result.rows;
        if (envelopes.length === 0) {
            return res.status(400).json({ error: 'No envelopes to distribute to.' });
        }
        const perEnvelope = Math.floor((amount / envelopes.length) * 100) / 100;
        let distributed = perEnvelope * envelopes.length;
        let remainder = Math.round((amount - distributed) * 100) / 100;

        let completed = 0;
        envelopes.forEach((env, idx) => {
            let addAmount = perEnvelope;
            if (idx === envelopes.length - 1) addAmount += remainder;
            const newBudget = parseFloat(env.budget) + addAmount;
            pool.query('UPDATE envelopes SET budget = $1 WHERE id = $2', [newBudget, env.id], (err) => {
                if (err) console.log('Error updating budget:', err);
                pool.query(
                    'INSERT INTO ledger (envelope_id, amount, type, description) VALUES ($1, $2, $3, $4)',
                    [env.id, addAmount, 'distribution', `Distributed $${addAmount} to envelope`],
                    (err) => {
                        if (err) console.log('Error creating ledger entry:', err);
                        completed++;
                        if (completed === envelopes.length) {
                            // All updates done, send response
                            pool.query('SELECT * FROM envelopes', (err, result) => {
                                if (err) return res.status(500).json({ error: 'Failed to fetch updated envelopes.' });
                                res.status(200).json(result.rows);
                            });
                        }
                    }
                );
            });
        });
    });
});

//transfer money between envelopes using params
app.post('/envelopes/transfer/:fromId/:toId/:amount', (req, res) => {
    const fromId = parseInt(req.params.fromId);//turns the string into an integer
    const toId = parseInt(req.params.toId);//turns the string into an integer
    const amount = parseFloat(req.params.amount);//turns the string into a float
    if (fromId === toId) {
        return res.status(400).json({ error: 'Cannot transfer money to the same envelope.' });
    }
    const fromEnvelope = envelopes.find(env => env.id === fromId);
    if (!fromEnvelope) {
        return res.status(404).json({ error: 'From envelope not found.' });
    }
    const toEnvelope = envelopes.find(env => env.id === toId);
    if (!toEnvelope) {
        return res.status(404).json({ error: 'To envelope not found.' });
    }
    if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ error: 'Invalid transfer amount.' });
    }
    if (fromEnvelope.budget < amount) {
        return res.status(400).json({ error: 'Insufficient funds in source envelope.' });
    }
    fromEnvelope.budget -= amount;
    toEnvelope.budget += amount;

    //write to ledger from envelope
    const fromIdx = envelopes.findIndex(env => env.id === fromId);
    const toIdx = envelopes.findIndex(env => env.id === toId);
    const type = 'transfer';
    const description = `Transfer from ${fromEnvelope.title} to ${toEnvelope.title}`;
    const outfromEnvelope = envelopes[fromIdx];
    const intoEnvelope = envelopes[toIdx];
    ledgerUpdate(outfromEnvelope, intoEnvelope, amount, type, description);
    
    res.status(200).json({ fromEnvelope, toEnvelope });
});

//update envelope name and budget using params
app.put('/envelopes/:id/:title/:value', (req, res) => {
    const id = parseInt(req.params.id);//turns the string into an integer
    const value = parseFloat(req.params.value);//turns the string into a float
    const title = req.params.title;
    const index = envelopes.findIndex(env => env.id === id);
    if (index === -1) {
        return res.status(404).json({ error: 'Envelope not found.' });
    }
    
    if (typeof value !== 'number' || value < 0) {
        return res.status(400).json({ error: 'amount is Not a number.' });
    }
    envelopes[index].title = title;
    envelopes[index].budget = value;
    res.status(200).json(envelopes);

});



// POST endpoint to add an expense and update envelope budget using params
app.post('/envelopes/:id/expenses', (req, res) => {
    const id = parseInt(req.params.id);
    const { amount, detail } = req.body;
    if (!id || typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ error: 'Invalid expense data.' });
    }
    const envIndex = envelopes.findIndex(env => env.id === id);
    if (envIndex === -1) {
        return res.status(404).json({ error: 'Envelope not found.' });
    }
    envelopes[envIndex].budget = parseFloat(envelopes[envIndex].budget) - amount;
    // Optionally, store expense record here
    //write to ledger
    const type = 'expense';
    const outFromEnvelope = envelopes[envIndex];
    const description = `Expense from ${outFromEnvelope.title}: ${detail}`;
    ledgerUpdate(outFromEnvelope, null, amount, type, description);
    
    res.status(200).json({ envelope: envelopes[envIndex] });
});

// POST endpoint to add income and update envelope budget using params
app.post('/envelopes/:id/income', (req, res) => {
    const id = parseInt(req.params.id);
    const { amount, detail } = req.body;
    if (!id || typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ error: 'Invalid income data.' });
    }
    const envIndex = envelopes.findIndex(env => env.id === id);
    if (envIndex === -1) {
        return res.status(404).json({ error: 'Envelope not found.' });
    }
    envelopes[envIndex].budget = parseFloat(envelopes[envIndex].budget) + amount;

    // Optionally, store income record here
    const type = 'income';
    const inToEnvelope = envelopes[envIndex];
    const description = `Income to ${inToEnvelope.title}: ${detail}`;
    ledgerUpdate(null, inToEnvelope, amount, type, description);

    res.status(200).json({ envelope: envelopes[envIndex] });
});


// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});