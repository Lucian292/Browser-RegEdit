from flask import request
from flask import render_template
from app import app, db
from app.models import Keys, Values

def get_keys_recursively(parent_key):
    """Funcție recursivă pentru a obține toate cheile și subcheilele în format JSON."""
    keys = []
    for key in parent_key:
        key_data = {
            'key_id': key.key_id,
            'key_name': key.key_name,
            'subkeys': get_keys_recursively(Keys.query.filter_by(parent_key_id=key.key_id).all())
        }
        keys.append(key_data)
    return keys

def get_children_recursive(parent_key):
    children = Keys.query.filter_by(parent_key_id=parent_key.key_id).all()
    for child in children:
        child.children = get_children_recursive(child)
    return children

@app.route('/')
def index():
    root_keys = Keys.query.filter_by(parent_key_id=None).all()

    for root_key in root_keys:
        root_key.children = get_children_recursive(root_key)
    # Afișare în consolă pentru a verifica conținutul
    for root_key in root_keys:
        print(f"- {root_key.key_name}")
        for child_key in root_key.children:
            print_children_recursive(child_key, indent=1)  # Adăugat o funcție de afișare recursivă

    return render_template('index.html', keys=root_keys)


def print_children_recursive(key, indent=0):
    """Funcție pentru a afișa cheile și subcheilele în mod recursiv."""
    print(f"{'  ' * indent}- {key.key_name}")
    for child_key in key.children:
        print_children_recursive(child_key, indent + 1)


from flask import jsonify

@app.route('/get_values/<int:key_id>', methods=['GET'])
def get_values(key_id):
    values = Values.query.filter_by(key_id=key_id).all()
    values_data = [{
        'name': value.value_name,
        'type': value.value_type,
        'data': value.value_data,
        'valueId': value.value_id} for value in values]
    #print("sa efectuat get_values cu id-ul ", {key_id}, "s-au returnat valorile ", values_data)
    return jsonify(values_data)

@app.route('/create_key', methods=['POST'])
def create_key():
    if request.method == 'POST':
        # Obține datele din request
        data = request.get_json()
        key_name = data.get('name')
        parent_key_id = data.get('parent_key_id')  # Asigură-te că adaugi și în request parametrul pentru părinte

        # Creează o nouă cheie
        new_key = Keys(key_name=key_name, parent_key_id=parent_key_id)

        # Adaugă cheia în baza de date
        db.session.add(new_key)
        db.session.commit()

        # Returnează un răspuns JSON
        return jsonify({'message': 'Key created successfully', 'key_id': new_key.key_id})

@app.route('/update_node/<int:key_id>', methods=['POST'])
def update_key(key_id):
    if request.method == 'POST':
        # Obține datele din request
        data = request.get_json()
        new_name = data.get('name')

        # Găsește cheia în baza de date după ID
        key_to_update = Keys.query.get_or_404(key_id)

        # Actualizează numele cheii
        key_to_update.key_name = new_name

        # Salvează schimbările în baza de date
        db.session.commit()

        # Returnează un răspuns JSON
        return jsonify({'message': 'Key updated successfully'})

@app.route('/delete_node/<int:key_id>', methods=['DELETE'])
def delete_key(key_id):
    # Găsește cheia în baza de date după ID
    key_to_delete = Keys.query.get_or_404(key_id)

    # Șterge cheia și relațiile sale cu valorile asociate
    db.session.delete(key_to_delete)
    db.session.commit()

    # Returnează un răspuns JSON
    return jsonify({'message': 'Key and associated values deleted successfully'})

# Ruta pentru crearea unei noi valori
@app.route('/create_value/<int:key_id>', methods=['POST'])
def create_value(key_id):
    try:
        data = request.get_json()
        value_name = data['name']
        value_type = data['type']
        value_data = data['data']

        # Crează o nouă valoare pentru nodul specificat
        new_value = Values(value_name=value_name, value_type=value_type, value_data=value_data, key_id=key_id)
        db.session.add(new_value)
        db.session.commit()

        return jsonify({'message': 'Value created successfully'}), 200
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500

# Ruta pentru editarea unei valori
@app.route('/update_value/<int:value_id>', methods=['PUT'])
def update_value(value_id):
    try:
        data = request.get_json()
        new_name = data['name']
        new_type = data['type']
        new_data = data['data']

        # Găsește valoarea și actualizează informațiile
        value_to_update = Values.query.get(value_id)
        value_to_update.value_name = new_name
        value_to_update.value_type = new_type
        value_to_update.value_data = new_data
        db.session.commit()

        return jsonify({'message': 'Value updated successfully', 'keyId': value_to_update.key_id}), 200
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500

# Ruta pentru ștergerea unei valori
@app.route('/delete_value/<int:value_id>', methods=['DELETE'])
def delete_value(value_id):
    try:
        # Găsește valoarea și o șterge
        value_to_delete = Values.query.get(value_id)
        db.session.delete(value_to_delete)
        db.session.commit()

        return jsonify({'message': 'Value deleted successfully', 'keyId': value_to_delete.key_id}), 200
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500