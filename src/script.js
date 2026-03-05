// Fetch and display envelopes from API
window.addEventListener('DOMContentLoaded', function() {
    function fetchAndRenderEnvelopes() {
        fetch('/envelopes')
            .then(response => response.json())
            .then(data => {
                const list = document.getElementById('envelope-list');
                if (list) {
                    list.innerHTML = '';
                    data.forEach(env => {
                        const item = document.createElement('li');
                        item.textContent = `${env.title}: $${env.budget} `;
                        // Add delete button
                        const deleteBtn = document.createElement('button');
                        deleteBtn.textContent = 'Delete';
                        deleteBtn.onclick = function() {
                            fetch(`/envelopes/${env.id}`, { method: 'DELETE' })
                                .then(response => {
                                    if (response.ok) {
                                        fetchAndRenderEnvelopes();
                                    } else {
                                        alert('Failed to delete envelope');
                                    }
                                });
                        };
                        item.appendChild(deleteBtn);
                        list.appendChild(item);
                    });
                }
            });
    }
    fetchAndRenderEnvelopes();
});
// Custom tooltip for envelope-name input
window.addEventListener('DOMContentLoaded', function() {
    const envelopeInput = document.getElementById('envelope-name');
    const amountInput = document.getElementById('envelope-amount');
    const tooltip = document.getElementById('custom-tooltip');
    if (envelopeInput && tooltip) {
        envelopeInput.addEventListener('mouseover', function(e) {
            tooltip.textContent = "Enter a unique envelope name";
            tooltip.style.left = (e.pageX + 10) + 'px';
            tooltip.style.top = (e.pageY + 10) + 'px';
            tooltip.style.display = 'block';
        });
        envelopeInput.addEventListener('mouseout', function() {
            tooltip.style.display = 'none';
        });
    }
    if (amountInput && tooltip) {
        amountInput.addEventListener('mouseover', function(e) {
            tooltip.textContent = "Enter a valid amount";
            tooltip.style.left = (e.pageX + 10) + 'px';
            tooltip.style.top = (e.pageY + 10) + 'px';
            tooltip.style.display = 'block';
        });
        amountInput.addEventListener('mouseout', function() {
            tooltip.style.display = 'none';
        });
    }
});


// envelopes object to hold the budget for each category
const envelopes = {
    "groceries": 0,
    "transport": 0,
    "entertainment": 0,
    "bills": 0,
    "savings": 0
};


function addEnvelopeToList(name, amount) {
    const listItem = document.createElement('li');
    listItem.textContent = name + ': $' + amount;
    listItem.id = 'envelope-' + name;

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.onclick = function() {
        delete envelopes[name];
        listItem.remove();
        console.log(envelopes);
    };

    listItem.appendChild(deleteButton);
    document.getElementById('envelope-list').appendChild(listItem);
}


function addEnvelope() {
    const envelopeNameInput = document.getElementById('envelope-name');
    const envelopeName = envelopeNameInput.value.trim();
    const envelopeAmountInput = document.getElementById('envelope-amount');
    const envelopeAmount = envelopeAmountInput.value.trim();
    const errorSpan = document.querySelector('.amounterror');
    let flashesName = 0;
    let flashesAmount = 0;
    if (!envelopeName || !envelopeAmount || isNaN(envelopeAmount)) {// Show error message
        if (errorSpan) errorSpan.style.display = 'inline';// Highlight empty fields
        // Flash envelope name if empty
        if (!envelopeName) {// Flashing logic for envelope name input
            const flashName = () => {// Alternate background color to red
                envelopeNameInput.style.backgroundColor = flashesName % 2 === 0 ? 'red' : '';// Increment flash count
                flashesName++;// Continue flashing for a few cycles
                if (flashesName < 6) {// Schedule next flash
                    setTimeout(flashName, 150);// Reset background color after flashing
                } else {//
                    envelopeNameInput.style.backgroundColor = '';// Reset background color after flashing
                }
            };
            flashName();
        }
        // Flash amount if invalid
        if (!envelopeAmount || isNaN(envelopeAmount)) {
            const flashAmount = () => {
                envelopeAmountInput.style.backgroundColor = flashesAmount % 2 === 0 ? 'red' : '';
                flashesAmount++;
                if (flashesAmount < 6) {
                    setTimeout(flashAmount, 150);
                } else {
                    envelopeAmountInput.style.backgroundColor = '';
                }
            };
            flashAmount();
        }
        return;
    }
    if (errorSpan) errorSpan.style.display = 'none';
    envelopeNameInput.style.backgroundColor = '';
    envelopeAmountInput.style.backgroundColor = '';
    envelopeNameInput.value = '';
    envelopeAmountInput.value = '';
    addEnvelopeToAPI(envelopeName, parseFloat(envelopeAmount));
}



// Add envelope using API
function addEnvelopeToAPI(title, budget) {
    fetch('/envelopes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, budget })
    })
    .then(response => {
        if (response.ok) {
            fetchAndRenderEnvelopes();
        } else {
            response.json().then(data => alert(data.error || 'Failed to add envelope'));
        }
    });
}

function fetchAndRenderEnvelopes() {
    fetch('/envelopes')
        .then(response => response.json())
        .then(data => {
            const list = document.getElementById('envelope-list');
            if (list) {
                list.innerHTML = '';
                data.forEach(env => {
                    const item = document.createElement('li');
                    item.textContent = `${env.title}: $${env.budget} `;
                
                    list.appendChild(item);
                });
            }
        });
}

window.addEventListener('DOMContentLoaded', fetchAndRenderEnvelopes);

// Handle expense form submission and update envelope using /envelopes/:id/expenses endpoint
document.addEventListener('DOMContentLoaded', function() {
    const expenseForm = document.getElementById('expense-form');
    if (expenseForm) {
        expenseForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const detail = document.getElementById('expense-detail').value.trim();
            const amount = parseFloat(document.getElementById('expense-amount').value);
            const envelopeId = document.getElementById('expense-envelope').value;
            if (!detail || isNaN(amount) || !envelopeId) {
                alert('Please fill out all fields with valid values.');
                return;
            }
            // Use new /envelopes/:id/expenses endpoint
            fetch(`/envelopes/${envelopeId}/expenses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, detail })
            })
            .then(res => {
                if (res.ok) {
                    $('#addExpenseModal').modal('hide');
                    if (window.fetchAndRenderEnvelopes) window.fetchAndRenderEnvelopes();
                } else {
                    res.json().then(data => alert(data.error || 'Failed to add expense.'));
                }
            });
        });
    }
});

// Handle income form submission and update envelope using /envelopes/:id/income endpoint
document.addEventListener('DOMContentLoaded', function() {
    const incomeForm = document.getElementById('income-form');
    if (incomeForm) {
        incomeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const detail = document.getElementById('income-detail').value.trim();
            const amount = parseFloat(document.getElementById('income-amount').value);
            const envelopeId = document.getElementById('income-envelope').value;
            if (!detail || isNaN(amount) || !envelopeId) {
                alert('Please fill out all fields with valid values.');
                return;
            }
            // Use new /envelopes/:id/income endpoint
            fetch(`/envelopes/${envelopeId}/income`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, detail })
            })
            .then(res => {
                if (res.ok) {
                    $('#addIncomeModal').modal('hide');
                    if (window.fetchAndRenderEnvelopes) window.fetchAndRenderEnvelopes();
                } else {
                    res.json().then(data => alert(data.error || 'Failed to add income.'));
                }
            });
        });
    }
});



