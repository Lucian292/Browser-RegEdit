from flask import render_template, request, jsonify
from app import app, db
from app.models import Keys, Values
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
    values_data = [{'name': value.value_name, 'type': value.value_type, 'data': value.value_data} for value in values]
    print("sa efectuat get_values cu id-ul ", {key_id}, "s-au returnat valorile ", values_data)
    return jsonify(values_data)

@app.route('/create_value/<int:key_id>', methods=['POST'])
def create_value(key_id):
    data = request.get_json()
    value_name = data['name']
    value_type = data['type']
    value_data = data['data']

    new_value = Values(key_id=key_id, value_name=value_name, value_type=value_type, value_data=value_data)
    db.session.add(new_value)
    db.session.commit()

    return jsonify({"message": "Value created successfully"})