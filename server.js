
const express = require('express');
const app = express();
const path = require('path');
const port = 3000;


// Serve static files from public
app.use(express.static(path.join(__dirname, 'public')));
// Serve static files from src
app.use('/src', express.static(path.join(__dirname, 'src')));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});