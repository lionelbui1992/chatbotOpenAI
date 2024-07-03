from flask import Blueprint, jsonify, request, current_app

bp = Blueprint('admin', __name__, url_prefix='/api/v1/admin')

@bp.route('/', methods=['GET'])
def get_admin():
    if current_app.config['DATABASE_TYPE'] == 'mongodb':
        admins = current_app.mongo.db.admin.find()
        return jsonify([admin for admin in admins])
    elif current_app.config['DATABASE_TYPE'] == 'mysql':
        admins = current_app.db.session.execute('SELECT * FROM admin').fetchall()
        return jsonify([dict(admin) for admin in admins])

@bp.route('/', methods=['POST'])
def post_admin():
    data = request.get_json()
    if current_app.config['DATABASE_TYPE'] == 'mongodb':
        current_app.mongo.db.admin.insert_one(data)
    elif current_app.config['DATABASE_TYPE'] == 'mysql':
        current_app.db.session.execute(
            'INSERT INTO admin (data) VALUES (:data)',
            {'data': data['data']}
        )
        current_app.db.session.commit()
    return jsonify({"message": "Admin data received.", "data": data}), 201
