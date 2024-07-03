from flask import Blueprint, jsonify, request, current_app
import json

bp = Blueprint('chat', __name__, url_prefix='/api/v1/chat')

@bp.route('/', methods=['GET'])
def get_chat():
    # request format:
    # {
    #     messages: 
    #     [{role: "system", content: [{type: "text", text: "You are a helpful assistant."}]},…]
    #     model: "gpt-4o"
    #     stream: true
    # }
    data = request.get_json()
    # input_text = data.get('input_text', "")
    # if not input_text:
    #     return jsonify({"error": "No input text provided"}), 400
    messages = data.get('messages', [])
    if not messages:
        return jsonify({"error": "No messages provided"}), 400
    # get latest message content text
    latest_message = messages[-1].get('content', "")
    input_text = latest_message[0].get('text', "")
    # prompt = "You are helpful assistant. If you don't know the answer, just say \"I don't know\"."
    # if prompt:
    #     messages.append({"role": "system", "content": prompt})
    if current_app.config['DATABASE_TYPE'] == 'mongodb':
        # get the collection
        collection = current_app.mongo.db[current_app.config['MONGO_COLLECTION']]
        # end get the collection

        # get the embedding
        embedding_response = current_app.openAIClient.embeddings.create(
            input=input_text,
            model=current_app.config['EMBEDDING_MODEL']
        )
        search_vector = embedding_response.data[0].embedding
        # end get the embedding

        # create prompting message
        pipeline = [
            {
                '$vectorSearch': {
                    'index': 'vector_index', 
                    'path': 'plot_embedding', 
                    'queryVector': search_vector, 
                    'numCandidates': 150, 
                    'limit': 1
                }
            }, {
                '$project': {
                    '_id': 0, 
                    'plot': 1, 
                    'title': 1, 
                    'header_column': 1,
                    'row_index': 1,
                    'column_count': 1,
                    'score': {
                        '$meta': 'vectorSearchScore'
                    }
                }
            }
        ]

        # run pipeline
        aggregate_result    = collection.aggregate(pipeline)
        full_plot           = ""
        header_column       = ""
        # prompt for message in aggregate_result, should be manage by tags
        messages.append({"role": "system", "content": "show me the server info bellow with table format, pick one of the server bellow:"})
        for message in aggregate_result:
            # title = message['title']
            index = 0
            for value in message['plot']:
                if value == "":
                    value = "N/A"

                if header_column == "":
                    header_column = "N/A"
                else:
                    header_column = message['header_column'][index]

                full_plot = full_plot + header_column + ":" + value + ", "
                index += 1

            messages.append({"role": "user", "content": full_plot })

        # messages.append({"role": "user", "content": input_text})
        # end create prompting message

        # clientAi create completions
        completion = current_app.openAIClient.chat.completions.create(
            model=current_app.config['OPENAI_MODEL'],
            messages= messages
        )
        # end clientAi create completions

        return completion.to_json()

    elif current_app.config['DATABASE_TYPE'] == 'mysql':
        messages = current_app.db.session.execute('SELECT * FROM chat').fetchall()
        return jsonify([dict(message) for message in messages])
    else:
        raise ValueError("Unsupported database type: " + current_app.config['DATABASE_TYPE'])
