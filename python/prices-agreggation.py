from pymongo import MongoClient
import json

db_uri = 'mongodb://group:group@ds029635.mlab.com:29635/fods-seven'

client = MongoClient(db_uri)
db = client['fods-seven']
col = db['prices']
col_new = db['prices-monthly']
def getPrices():
    pipeline = [
        {
        '$project': {
            'year': { '$year': '$date' },
            'month': { '$month': '$date' },
            'vintage': 1,
            'name': 1,
            'price': 1
        }
        },
        {
        '$group':{
            '_id': {
                    'name': '$name',
                    'vintage': '$vintage',
                    'year': '$year',
                    'month': '$month'
            },
            'avg': { '$avg': '$price' }
        }
        },
        {
        '$project': {
            'year': '$_id.year',
            'month': '$_id.month',
            'vintage': '$_id.vintage',
            'name': '$_id.name',
            'price': '$avg',
            '_id':0
        }
        }
    ]

    for doc in col.aggregate(pipeline):
        print(doc)
        # col_new.insert_one(doc)

# print col.find()

getPrices()
