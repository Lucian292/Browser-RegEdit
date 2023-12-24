import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import IntegrityError

from config import basedir

app = Flask(__name__)
app.config.from_pyfile(os.path.join(basedir, 'config.py'))
db = SQLAlchemy(app)

from app import routes, models

# def init_db():
#     with app.app_context():
#         db.create_all()
#         print("Baza de date a fost inițializată cu succes.")
#
# # Adaugă aici operațiile CRUD pentru testare
#
# def create_test_records():
#     with app.app_context():
#         try:
#             # Creare înregistrări noi
#             new_key = models.Keys(key_name="TestKey")
#             new_value = models.Values(value_name="TestValue", value_type="string", value_data="TestData", key=new_key)
#
#             db.session.add(new_key)
#             db.session.add(new_value)
#             db.session.commit()
#             print("Înregistrările de test au fost create cu succes.")
#         except IntegrityError as e:
#             db.session.rollback()
#             print("Eroare la crearea înregistrărilor de test:", str(e))
#
# def edit_test_record():
#     with app.app_context():
#         test_record = db.session.query(models.Values).filter_by(value_name="TestValue").first()
#         if test_record:
#             try:
#                 # Editare înregistrare
#                 test_record.value_data = "NewTestData"
#                 db.session.commit()
#                 print("Înregistrarea de test a fost editată cu succes.")
#             except IntegrityError as e:
#                 db.session.rollback()
#                 print("Eroare la editarea înregistrării de test:", str(e))
#         else:
#             print("Înregistrarea de test nu a fost găsită.")
#
#
#
# def delete_test_record():
#     with app.app_context():
#         try:
#             test_record = db.session.query(models.Values).filter_by(value_name="TestValue").first()
#             if test_record:
#                 # Ștergere înregistrare
#                 db.session.delete(test_record)
#                 db.session.commit()
#                 print("Înregistrarea de test a fost ștearsă cu succes.")
#             else:
#                 print("Înregistrarea de test nu a fost găsită.")
#         except IntegrityError as e:
#             db.session.rollback()
#             print("Eroare la ștergerea înregistrării de test:", str(e))
#
#
# # Adaugă această verificare pentru a rula operațiile de test doar atunci când fișierul este rulat direct
# if __name__ == "__main__":
#     init_db()
#     create_test_records()
#     edit_test_record()
#     delete_test_record()