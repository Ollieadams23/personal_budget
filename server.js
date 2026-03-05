const express = require('express');
const app = express();
const path = require('path');
const port = 3000;



// Serve static files from public
app.use(express.static(path.join(__dirname, 'public')));
// Serve static files from css
app.use('/css', express.static(path.join(__dirname, 'css')));
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


// DELETE endpoint to remove an envelope by id
app.delete('/envelopes/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = envelopes.findIndex(env => env.id === id);
    if (index === -1) {
        return res.status(404).json({ error: 'Envelope not found.' });
    }
    totalBudget -= envelopes[index].budget;
    envelopes.splice(index, 1);
    res.status(204).send();
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
    res.json(envelopes);
});


// GET endpoint to retrieve one envelope by category
app.get('/envelopes/:catagory', (req, res) => {
    if (req.params.catagory) {
        const catagory = req.params.catagory;
        const envelope = envelopes.find(env => env.title === catagory);
        res.json(envelope ? envelope : { error: 'Category not found.' });
    }
});

// POST endpoint to create a new envelope
app.post('/envelopes', (req, res) => {
    const { title, budget } = req.body;
    //see if title exists in envelopes array
    const existingEnvelope = envelopes.find(env => env.title.toLowerCase() === title.toLowerCase());
    if (existingEnvelope) {
        return res.status(400).json({ error: 'Envelope with this title already exists.' });
    }
    if (!title || typeof budget !== 'number' || budget < 0) {
        return res.status(400).json({ error: 'Invalid envelope data.' });
    }
    const id = envelopes.length ? envelopes[envelopes.length - 1].id + 1 : 1;
    const newEnvelope = { id, title, budget };
    envelopes.push(newEnvelope);
    totalBudget += budget;
    res.status(201).json(newEnvelope);
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
    res.status(200).json({ envelope: envelopes[envIndex] });
});


// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});