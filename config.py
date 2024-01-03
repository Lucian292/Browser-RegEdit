import os
from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError

basedir = os.path.abspath(os.path.dirname(__file__))

SQLALCHEMY_DATABASE_URI = 'postgresql://postgres:1234@localhost:5432/RegEdit'
SQLALCHEMY_TRACK_MODIFICATIONS = False

try:
    engine = create_engine(SQLALCHEMY_DATABASE_URI)
    engine.connect()
    print("Conexiunea la baza de date a fost stabilită cu succes.")
except OperationalError as e:
    print("Eroare la stabilirea conexiunii la baza de date:", str(e))
