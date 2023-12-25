import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import IntegrityError

from config import basedir

app = Flask(__name__)
app.config.from_pyfile(os.path.join(basedir, 'config.py'))
db = SQLAlchemy(app)

from app import routes, models, validators