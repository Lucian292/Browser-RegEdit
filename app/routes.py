from flask import Blueprint, render_template, request
from .models import db, Key, Value

main = Blueprint('main', __name__)


@main.route('/')
def index():
    root_keys = Key.query.filter_by(parent_key_id=None).all()

    def get_children(parent_key):
        children = Key.query.filter_by(parent_key_id=parent_key.key_id).all()
        for child in children:
            child.children = get_children(child)
        return children

    for root_key in root_keys:
        root_key.children = get_children(root_key)

    # Afișare în consolă pentru a verifica conținutul
    print("Root Keys:")
    for root_key in root_keys:
        print(f"- {root_key.key_name}")
        for child_key in root_key.children:
            print(f"  - {child_key.key_name}")

    return render_template('index.html', keys=root_keys)
