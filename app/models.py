from app import db

class Keys(db.Model):
    key_id = db.Column(db.Integer, primary_key=True)
    parent_key_id = db.Column(db.Integer)
    key_name = db.Column(db.String(255), nullable=False)
    values = db.relationship('Values', backref='key', cascade='all, delete-orphan')

class Values(db.Model):
    value_id = db.Column(db.Integer, primary_key=True)
    key_id = db.Column(db.Integer, db.ForeignKey('keys.key_id', ondelete='CASCADE'), nullable=False)
    value_name = db.Column(db.String(255), nullable=False)
    value_type = db.Column(db.String(20), nullable=False)
    value_data = db.Column(db.Text)
