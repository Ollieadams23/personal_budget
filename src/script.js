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
    const envelopeName = document.getElementById('envelope-name').value.trim();
    const envelopeAmountInput = document.getElementById('envelope-amount');
    const envelopeAmount = envelopeAmountInput.value.trim();
    const errorSpan = document.querySelector('.amount-error');
    if (!envelopeName || !envelopeAmount || isNaN(envelopeAmount)) {
        if (errorSpan) errorSpan.style.display = 'inline';
        let flashes = 0;
        const flashRed = () => {
            envelopeAmountInput.style.backgroundColor = flashes % 2 === 0 ? 'red' : '';
            flashes++;
            if (flashes < 6) {
                setTimeout(flashRed, 150);
            }
        };
        flashRed();
        return;
    }
    if (errorSpan) errorSpan.style.display = 'none';
    envelopeAmountInput.style.backgroundColor = '';
    document.getElementById('envelope-name').value = '';
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



