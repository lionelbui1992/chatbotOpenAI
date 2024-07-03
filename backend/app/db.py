from pymongo import MongoClient

def init_db(app):
    if app.config['DATABASE_TYPE'] == 'mongodb':
        connection_string = app.config['MONGO_URI']
        mongo = MongoClient(connection_string, socketTimeoutMS=120000, connectTimeoutMS=120000)
        db = mongo[app.config['DB_NAME']]
        mongo.db = db
        app.mongo = mongo
    elif app.config['DATABASE_TYPE'] == 'mysql':
        pass
        # app.config['SQLALCHEMY_DATABASE_URI'] = (
        #     f"mysql+pymysql://{app.config['MYSQL_USER']}:"
        #     f"{app.config['MYSQL_PASSWORD']}@"
        #     f"{app.config['MYSQL_HOST']}/"
        #     f"{app.config['MYSQL_DB']}"
        # )
        # db.init_app(app)
        # app.db = db
    else:
        raise ValueError("Unsupported database type: " + app.config['DATABASE_TYPE'])
    
# get collection
def get_collection(app):
    if app.config['DATABASE_TYPE'] == 'mongodb':
        return app.mongo.db[app.config['DB_NAME']]
    elif app.config['DATABASE_TYPE'] == 'mysql':
        pass
    else:
        raise ValueError("Unsupported database type: " + app.config['DATABASE_TYPE'])
    
