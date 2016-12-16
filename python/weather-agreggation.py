from pymongo import MongoClient
import json

db_uri = 'mongodb://group:group@ds029635.mlab.com:29635/fods-seven'

client = MongoClient(db_uri)
db = client['fods-seven']
col = db['weather-rp5']
col_new = db['weather-monthly']

def getWeather():
    pipeline = [
        {
        '$project': {
            'year': { '$year': '$date' },
            'month': { '$month': '$date' },
            'precipitation': 1,
            'temperature': 1,
            'humidity': 1,
            'region': 1,
        }
        },
        {
        '$group':{
            '_id': {
                    'year': '$year',
                    'month': '$month',
                    'region': '$region'
            },
            'avg_temp': { '$avg': '$temperature' },
            'avg_pre': { '$avg': '$precipitation' },
            'avg_hum': { '$avg': '$humidity' }
        }
        },
        {
        '$project': {
            'year': '$_id.year',
            'month': '$_id.month',
            'precipitation': '$avg_pre',
            'temperature': '$avg_temp',
            'humidity': '$avg_hum',
            'region': '$_id.region',
            '_id':0
        }
        }
    ]

    count = 0
    for doc in col.aggregate(pipeline):
        print(doc)
        count += 1
        col_new.insert_one(doc)

    print count
# print col.find()

getWeather()
