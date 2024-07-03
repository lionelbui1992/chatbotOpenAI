from flask import Blueprint, jsonify
import time

# Create a blueprint for the v1/models API
bp = Blueprint('models', __name__, url_prefix='/api/v1/models')

# Define a route for getting all models
@bp.route('/', methods=['GET'])
def get_all_models():
    models = [
        {
            "id": "main-domain",
            "object": "model",
            "created": int(time.time()),
            "owned_by": "openai-internal"
        },
    ]
    return jsonify(models)
