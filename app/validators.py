import re

from app.models import Keys


def validate_data_type(value_type, value_data):
    try:
        if value_type == "REG_BINARY":
            if not re.match(r'^[0-1]+$', value_data):
                raise ValueError("Invalid REG_BINARY data")
        elif value_type == "REG_DWORD":
            value_data = int(value_data)
            if not (0 <= value_data <= 0xFFFFFFFF):
                raise ValueError("Invalid REG_DWORD data")
        elif value_type == "REG_QWORD":
            value_data = int(value_data)
            if not (0 <= value_data <= 0xFFFFFFFFFFFFFFFF):
                raise ValueError("Invalid REG_QWORD data")
        elif value_type == "REG_EXPAND_SZ":
            if not isinstance(value_data, str):
                raise ValueError("Invalid REG_EXPAND_SZ data")
        elif value_type == "REG_MULTI_SZ":
            if not isinstance(value_data, str):
                raise ValueError("Invalid REG_MULTI_SZ data")
            if not re.match(r'^(.+\\0)+.+\\0?$', value_data):
                raise ValueError("Invalid REG_MULTI_SZ data format")
        elif value_type == "REG_SZ":
            if not isinstance(value_data, str):
                raise ValueError("Invalid REG_SZ data")
        else:
            raise ValueError("Invalid value type")

        return True
    except ValueError as e:
        print(f"Error: {str(e)}")
        return False

def is_unique_key_name(key_name, parent_key_id):
    # Verifică dacă există deja o cheie cu același nume în cadrul aceluiași părinte
    existing_key = Keys.query.filter_by(key_name=key_name, parent_key_id=parent_key_id).first()
    return existing_key is None