from flask import Blueprint, jsonify, request, current_app

bp = Blueprint('settings', __name__, url_prefix='/api/v1/settings')

@bp.route('/', methods=['GET'])
def get_settings():
    if current_app.config['DATABASE_TYPE'] == 'mongodb':
        settings = current_app.mongo.db.settings.find_one()
    elif current_app.config['DATABASE_TYPE'] == 'mysql':
        settings = current_app.db.session.execute('SELECT * FROM settings').fetchone()
        settings = dict(settings) if settings else {}
    return jsonify(settings)

@bp.route('/', methods=['POST'])
def update_settings():
    data = request.get_json()
    if current_app.config['DATABASE_TYPE'] == 'mongodb':
        current_app.mongo.db.settings.update_one({}, {"$set": data}, upsert=True)
    elif current_app.config['DATABASE_TYPE'] == 'mysql':
        current_app.db.session.execute(
            'REPLACE INTO settings (key, value) VALUES (:key, :value)',
            {'key': 'some_key', 'value': data['value']}
        )
        current_app.db.session.commit()
    return jsonify({"message": "Settings updated.", "data": data})
