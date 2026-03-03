

// envelopes object to hold the budget for each category
const envelopes = {
    "groceries": 0,
    "transport": 0,
    "entertainment": 0,
    "bills": 0,
    "savings": 0
};


function addEnvelope() {
    const envelopeName = document.getElementById('envelope-name').value;
    const envelopeAmount = document.getElementById('envelope-amount').value;
    envelopes[envelopeName] = parseFloat(envelopeAmount); // add the new envelope to the envelopes object
    document.getElementById('envelope-name').value = ''; // clear the input field
    document.getElementById('envelope-amount').value = ''; // clear the amount field
    const listItem = document.createElement('li');
    listItem.textContent = envelopeName + ': $' + envelopes[envelopeName];
    document.getElementById('envelopes').appendChild(listItem);
    console.log(envelopes);
}



function envelopeList() {
    // loop through the envelopes object
    for (const envelope in envelopes) {
        const listItem = document.createElement('li');
        listItem.textContent = envelope + ': $' + envelopes[envelope];
        document.getElementById('envelopes').appendChild(listItem);
    }
};


window.onload = envelopeList;