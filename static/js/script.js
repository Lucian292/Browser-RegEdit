    function toggleNode(event, node) {
        var childUl = node.querySelector('ul');
        var keyId = node.getAttribute('data-key-id');

        if (childUl) {
            childUl.style.display = (childUl.style.display === 'none') ? 'block' : 'none';
            getValues(keyId);
            event.stopPropagation();
        } else {
            getValues(keyId);
            event.stopPropagation();
        }
    }

    function getValues(keyId) {
        // Folosește AJAX pentru a obține valorile asociate unui nod
        fetch('/get_values/' + keyId)
            .then(response => response.json())
            .then(data => displayValues(keyId, data));
    }

    function displayValues(keyId, values) {
        var valuesContainer = document.getElementById('values-container');
        valuesContainer.innerHTML = ''; // Curăță conținutul anterior

        // Setează atributul data-key-id pentru values-container
        valuesContainer.setAttribute('data-key-id', keyId);

        // Crează tabelul
        var table = document.createElement('table');
        table.border = '1';

        // Crează antetele tabelului
        var thead = document.createElement('thead');
        var headerRow = document.createElement('tr');
        var headers = ['Name', 'Type', 'Data', 'Actions'];

        headers.forEach(function(headerText) {
            var th = document.createElement('th');
            th.appendChild(document.createTextNode(headerText));
            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Adaugă rânduri pentru fiecare valoare
        var tbody = document.createElement('tbody');
        values.forEach(function(value) {
            var tr = document.createElement('tr');

            // Adaugă celule cu datele valorii
            tr.innerHTML = '<td>' + value.name + '</td>' +
                           '<td>' + value.type + '</td>' +
                           '<td>' + value.data + '</td>' +
                           '<td><button onclick="editValue(' + value.valueId + ', \'' + value.name + '\', \'' + value.type + '\', \'' + value.data + '\')">Edit</button>' +
                           '<button onclick="deleteValue(' + value.valueId + ')">Delete</button></td>';

            tbody.appendChild(tr);
        });

        table.appendChild(tbody);
        valuesContainer.appendChild(table);

        // Afișează formularul de creare a noii valori
        document.getElementById('create-form').style.display = 'block';
        // Ascunde formularul de editare
        document.getElementById('edit-form').style.display = 'none';
    }


    function editNode(event, keyId, parentKeyId) {
        event.stopPropagation();
        var nodeName = prompt('Enter the new name for the node:');
        if (nodeName !== null) {
            // Trimite datele actualizate la server, inclusiv ID-ul nodului părinte
            fetch('/update_node/' + keyId, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: nodeName, parent_key_id: parentKeyId }),
            })
            .then(response => response.json())
            .then(result => {
                if (result.error) {
                    // Afișează mesajul de eroare numai dacă există o eroare
                    alert('Error: ' + result.error);
                } else {
                    // Afișează mesajul de succes sau altă acțiune dorită
                    alert(result.message);
                    // Reafișează arborele după actualizarea numelui
                    location.reload();
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        }
    }

    function deleteNode(event, keyId) {
        event.stopPropagation();
        var confirmDelete = confirm('Are you sure you want to delete this node and its children?');
        if (confirmDelete) {
            // Trimite cererea de ștergere la server
            fetch('/delete_node/' + keyId, {
                method: 'DELETE',
            })
            .then(response => response.json())
            .then(result => {
                alert(result.message);
                // Reafișează arborele după ștergerea nodului
                location.reload();
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        }
    }

    function editValue(valueId, name, type, data) {
        // Afiseaza formularul de editare a valorii
        document.getElementById('edit-form').style.display = 'block';

        // Completeaza campurile din formular cu datele valorii existente
        document.getElementById('edit-value-id').value = valueId;
        document.getElementById('edit-value-name').value = name;
        document.getElementById('edit-value-type').value = type;
        document.getElementById('edit-value-data').value = data;

        // Adauga event listener pentru formularul de editare
        document.getElementById('edit-value-form').onsubmit = function (event) {
            event.preventDefault();
            var id = document.getElementById('edit-value-id').value;
            var newName = document.getElementById('edit-value-name').value;
            var newType = document.getElementById('edit-value-type').value;
            var newData = document.getElementById('edit-value-data').value;

            // Trimite datele actualizate la server
            fetch('/update_value/' + id, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: newName, type: newType, data: newData }),
            })
                .then(response => response.json())
                .then(result => {
                    if (result.error) {
                        // Afișează mesajul de eroare în loc să folosești alert
                        alert('Error: ' + result.error);
                    } else {
                        // Afișează mesajul de succes sau altă acțiune dorită
                        alert(result.message);
                        // Reafișează valorile după actualizarea valorii
                        getValues(result.keyId);
                        // Ascunde formularul de editare
                        document.getElementById('edit-form').style.display = 'none';
                    }
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        };
    }

    function deleteValue(valueId) {
        var confirmDelete = confirm('Are you sure you want to delete this value?');
        if (confirmDelete) {
            // Trimite cererea de ștergere la server
            fetch('/delete_value/' + valueId, {
                method: 'DELETE',
            })
            .then(response => response.json())
            .then(result => {
                alert(result.message);
                // Elimină valoarea din pagina web după ștergerea acesteia
                document.querySelector(`[data-value-id="${valueId}"]`).remove();
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        }
    }

function createValue() {
    var keyId = document.getElementById('values-container').getAttribute('data-key-id');
    var newName = document.getElementById('new-value-name').value;
    var newType = document.getElementById('new-value-type').value;
    var newData = document.getElementById('new-value-data').value;

    // Trimite datele pentru crearea valorii la server
    fetch('/create_value/' + keyId, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName, type: newType, data: newData }),
    })
    .then(response => response.json())
    .then(result => {
        if (result.error) {
            // Afișează mesajul de eroare în loc să folosești alert
            alert('Error: ' + result.error);
        } else {
            // Afișează mesajul de succes sau altă acțiune dorită
            alert(result.message);
            // Reafișează valorile după adăugarea noii valori
            getValues(keyId);
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}


    function createChild(event, keyId) {
        event.stopPropagation();
        var childName = prompt('Enter the name for the new child node:');
        if (childName !== null) {
            // Trimite datele pentru crearea unui nou copil la server
            fetch('/create_key', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: childName, parent_key_id: keyId }),
            })
            .then(response => response.json())
            .then(result => {
                if (result.error) {
                    // Afișează mesajul de eroare numai dacă există o eroare
                    alert('Error: ' + result.error);
                } else {
                    // Afișează mesajul de succes sau altă acțiune dorită
                    alert(result.message);
                    // Reafișează arborele după actualizarea numelui
                    location.reload();
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        }
    }

    function searchRegistry() {
        var searchInput = document.getElementById('search-input').value.toLowerCase();
        var treeNodes = document.querySelectorAll('[data-key-id]');
        var valuesContainer = document.getElementById('values-container');

        treeNodes.forEach(function(node) {
            var nodeName = node.textContent.toLowerCase();
            var displayStyle = nodeName.includes(searchInput) ? 'block' : 'none';
            node.style.display = displayStyle;
        });

        // Afisează sau ascunde lista de valori în funcție de rezultatul căutării
        var displayValues = searchInput === '' ? 'none' : 'block';
        valuesContainer.style.display = displayValues;

        // Dacă căutarea este goală, reafișează toate nodurile
        if (searchInput === '') {
            treeNodes.forEach(function(node) {
                node.style.display = 'block';
            });
        }
    }

    function searchValues() {
        var searchValuesInput = document.getElementById('search-values-input').value.toLowerCase();
        var valuesContainer = document.getElementById('values-container');

        // Verifică dacă bara de căutare a valorilor este goală
        if (searchValuesInput.trim() === '') {
            // Dacă este goală, curăță containerul de valori și ascunde formularul de editare
            valuesContainer.innerHTML = '';
            document.getElementById('edit-form').style.display = 'none';
            return;
        }

        // Dacă nu este goală, folosește AJAX pentru a obține toate valorile
        fetch('/get_all_values')
            .then(response => response.json())
            .then(data => {
                var values = data.filter(value => value.name.toLowerCase().includes(searchValuesInput));
                displayValues(valuesContainer.getAttribute('data-key-id'), values);
            });
    }