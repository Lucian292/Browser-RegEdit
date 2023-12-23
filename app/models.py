from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class Key(db.Model):
    __tablename__ = 'keys'
    key_id = db.Column(db.Integer, primary_key=True)
    parent_key_id = db.Column(db.Integer, db.ForeignKey('keys.key_id', ondelete='CASCADE'))
    key_name = db.Column(db.String(255), nullable=False)
    values = db.relationship('Value', backref='key', lazy=True)


class Value(db.Model):
    __tablename__ = 'values'
    value_id = db.Column(db.Integer, primary_key=True)
    key_id = db.Column(db.Integer, db.ForeignKey('keys.key_id', ondelete='CASCADE'), nullable=False)
    value_name = db.Column(db.String(255), nullable=False)
    value_type = db.Column(db.String(20), nullable=False)
    value_data = db.Column(db.Text)
