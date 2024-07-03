from flask import Blueprint, jsonify, request

bp = Blueprint('chat', __name__, url_prefix='/api/v1/chat')

@bp.route('/', methods=['GET'])
def get_chat():
    return jsonify({"message": "This is the chat endpoint."})

@bp.route('/', methods=['POST'])
def post_chat():
    data = request.get_json()
    return jsonify({"message": "Chat message received.", "data": data})
