from openai import OpenAI

def init_openai(app):
    app.openAIClient = OpenAI(
        api_key=app.config['OPENAI_API_KEY'],
    )
