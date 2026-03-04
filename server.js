
const express = require('express');
const app = express();
const path = require('path');
const port = 3000;


// Serve static files from public
app.use(express.static(path.join(__dirname, 'public')));
// Serve static files from src
app.use('/src', express.static(path.join(__dirname, 'src')));



// Global variables for envelopes and total budget
let envelopes = [
    { id: 1, title: "groceries", budget: 0 },
    { id: 2, title: "transport", budget: 0 },
    { id: 3, title: "entertainment", budget: 0 },
    { id: 4, title: "bills", budget: 0 },
    { id: 5, title: "savings", budget: 0 }
];
let totalBudget = 0;

app.use(express.json()); // for parsing application/json

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});


// GET endpoint to retrieve all envelopes
app.get('/envelopes', (req, res) => {
    res.json(envelopes);
});

// POST endpoint to create a new envelope
app.post('/envelopes', (req, res) => {
    const { title, budget } = req.body;
    if (!title || typeof budget !== 'number' || budget < 0) {
        return res.status(400).json({ error: 'Invalid envelope data.' });
    }
    const id = envelopes.length ? envelopes[envelopes.length - 1].id + 1 : 1;
    const newEnvelope = { id, title, budget };
    envelopes.push(newEnvelope);
    totalBudget += budget;
    res.status(201).json(newEnvelope);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});