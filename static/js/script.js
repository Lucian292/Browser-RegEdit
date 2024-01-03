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
        fetch('/get_values/' + keyId)
            .then(response => response.json())
            .then(data => displayValues(keyId, data));
    }

    function displayValues(keyId, values) {
        var valuesContainer = document.getElementById('values-container');
        valuesContainer.innerHTML = '';

        valuesContainer.setAttribute('data-key-id', keyId);

        var table = document.createElement('table');
        table.border = '1';

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

        var tbody = document.createElement('tbody');
        values.forEach(function(value) {
            var tr = document.createElement('tr');

            tr.innerHTML = '<td>' + value.name + '</td>' +
                           '<td>' + value.type + '</td>' +
                           '<td>' + value.data + '</td>' +
                           '<td><button onclick="editValue(' + value.valueId + ', \'' + value.name + '\', \'' + value.type + '\', \'' + value.data + '\')">Edit</button>' +
                           '<button onclick="deleteValue(' + value.valueId + ')">Delete</button></td>';

            tbody.appendChild(tr);
        });

        table.appendChild(tbody);
        valuesContainer.appendChild(table);

        document.getElementById('create-form').style.display = 'block';
        document.getElementById('edit-form').style.display = 'none';
    }

    function editNode(event, keyId, parentKeyId) {
        event.stopPropagation();
        var nodeName = prompt('Enter the new name for the node:');
        if (nodeName !== null) {
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
                    alert('Error: ' + result.error);
                } else {
                    alert(result.message);
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
            fetch('/delete_node/' + keyId, {
                method: 'DELETE',
            })
            .then(response => response.json())
            .then(result => {
                alert(result.message);
                location.reload();
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        }
    }

    function editValue(valueId, name, type, data) {
        document.getElementById('edit-form').style.display = 'block';

        document.getElementById('edit-value-id').value = valueId;
        document.getElementById('edit-value-name').value = name;
        document.getElementById('edit-value-type').value = type;
        document.getElementById('edit-value-data').value = data;

        document.getElementById('edit-value-form').onsubmit = function (event) {
            event.preventDefault();
            var id = document.getElementById('edit-value-id').value;
            var newName = document.getElementById('edit-value-name').value;
            var newType = document.getElementById('edit-value-type').value;
            var newData = document.getElementById('edit-value-data').value;

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
                        alert('Error: ' + result.error);
                    } else {
                        alert(result.message);
                        getValues(result.keyId);
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
            fetch('/delete_value/' + valueId, {
                method: 'DELETE',
            })
            .then(response => response.json())
            .then(result => {
                alert(result.message);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
            document.querySelector(`[data-value-id="${valueId}"]`).remove();
        }
    }

    function createValue() {
    var keyId = document.getElementById('values-container').getAttribute('data-key-id');
    var newName = document.getElementById('new-value-name').value;
    var newType = document.getElementById('new-value-type').value;
    var newData = document.getElementById('new-value-data').value;

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
            alert('Error: ' + result.error);
        } else {
            alert(result.message);
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
                    alert('Error: ' + result.error);
                } else {
                    alert(result.message);
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

        var displayValues = searchInput === '' ? 'none' : 'block';
        valuesContainer.style.display = displayValues;

        if (searchInput === '') {
            treeNodes.forEach(function(node) {
                node.style.display = 'block';
            });
        }
    }

    function searchValues() {
        var searchValuesInput = document.getElementById('search-values-input').value.toLowerCase();
        var valuesContainer = document.getElementById('values-container');

        if (searchValuesInput.trim() === '') {
            valuesContainer.innerHTML = '';
            document.getElementById('edit-form').style.display = 'none';
            return;
        }

        fetch('/get_all_values')
            .then(response => response.json())
            .then(data => {
                var values = data.filter(value => value.name.toLowerCase().includes(searchValuesInput));
                displayValues(valuesContainer.getAttribute('data-key-id'), values);
            });
    }