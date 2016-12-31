import datetime
import json
import os.path
import time

from pymongo import MongoClient
import tornado.web

db_uri = 'mongodb://group:group@ds029635.mlab.com:29635/fods-seven'

client = MongoClient(db_uri)
db = client['fods-seven']
collection = {
    'weather': db['weather_data'],
    'prices': db['prices'],
    'reviews': db['reviews'],
    'market': db['market']
}

class MainHandler(tornado.web.RequestHandler):
    PAGE_SIZE = 8
    def _wine_list(self, page_num=1):
        skip = (page_num - 1) * self.PAGE_SIZE
        limit = self.PAGE_SIZE
        pipeline = [
            {
                '$group': {
                    '_id': {
                        'name': '$name',
                        'region': '$region'
                    },
                    'price': { '$avg': '$price' }
                }
            },
            {
                '$sort': {
                    '_id.name': 1,
                }
            },
            {
                '$skip': skip
            },
            {
                '$limit': limit
            }
        ]

        return collection['prices'].aggregate(pipeline)

    def get(self, page_num=1):
        print "GET / request from", self.request.remote_ip
        try:
            page_num = int(page_num)
        except ValueError:
            page_num = 1

        self.render(
            'index.html',
            wines=self._wine_list(page_num),
            page_num=page_num,
            next_page=page_num+1
        )


class TestHandler(tornado.web.RequestHandler):
    def get(self):
        data = []
        for doc in collection['prices'].find():
            new_doc = {}
            new_doc['name'] = doc['name']
            new_doc['vintage'] = doc['vintage']
            new_doc['region'] = doc['region']
            new_doc['date'] = doc['date'].isoformat()
            new_doc['lwin'] = doc['lwin']
            new_doc['price'] = doc['price']
            data.append(new_doc)
            self.write( json.dumps(data) )


class WeatherHandler(tornado.web.RequestHandler):
    def get(self):
        print "GET /weather request from", self.request.remote_ip
        data = {'data':[]}
        for doc in collection['weather'].find().limit(10):
            new_doc = {}
            new_doc['temperature'] = doc['temperature']
            new_doc['precipitation'] = doc['precipitation_mm']
            new_doc['humidity'] = doc['relative_humidity']
            new_doc['date'] = doc['date'].isoformat()
            data['data'].append(new_doc)
        self.write( data )


class ReviewsHandler(tornado.web.RequestHandler):
    def get(self):
        print "GET /reviews request from", self.request.remote_ip
        data = {'data':[]}
        for doc in collection['reviews'].find():
            new_doc = {}
            new_doc['rating'] = doc['rating']
            new_doc['region'] = doc['region']
            new_doc['price'] = doc['price']
            new_doc['year'] = doc['year']
            new_doc['name'] = doc['name']
            data['data'].append(new_doc)
        self.write( data )


class MarketHandler(tornado.web.RequestHandler):
    def get(self):
        print "GET /market request from", self.request.remote_ip
        data = {'data':[]}
        for doc in collection['market'].find():
            new_doc = {}
            dt = datetime.datetime.strptime(doc['date'], '%Y-%m-%d')
            new_doc['date'] = dt.isoformat()
            new_doc['price'] = doc['price']
            data['data'].append(new_doc)
        self.write( data )


class PricesHandler(tornado.web.RequestHandler):
    pipeline = [
        { '$project': {
            'year': { '$year': '$date' },
            'month': { '$month': '$date' },
            'date': '$date',
            'region': '$region',
            'price': '$price'
        }},
        { '$group': { '_id': {
            'date': '$date',
            'region': '$region',
            'year': '$year',
            'month': '$month' },
            'price': { '$avg': '$price' }
        }},
        { '$sort': { '_id.date': 1 }}
    ]

    def get(self, name=None):
        print "GET /prices request from", self.request.remote_ip
        data = {'data':[]}
        if name is None:
            iterator = collection['prices'].aggregate(self.pipeline)
            for doc in iterator:
                new_doc = {}
                new_doc['price'] = doc['price']
                new_doc['region'] = doc['_id']['region']
                new_doc['date'] = doc['_id']['date'].isoformat()
                data['data'].append(new_doc)
        else:
            iterator = collection['prices'].find({'name': name})
            for doc in iterator:
                new_doc = {}
                new_doc['price'] = doc['price']
                new_doc['region'] = doc['region']
                new_doc['date'] = doc['date'].isoformat()
                data['data'].append(new_doc)

        for doc in iterator:
            print(doc)
            new_doc = {}
            new_doc['price'] = doc['price']
            try:
                new_doc['region'] = doc['region']
                new_doc['date'] = doc['date'].isoformat()
            except KeyError:
                new_doc['region'] = doc['_id']['region']
                new_doc['date'] = doc['_id']['date'].isoformat()
            data['data'].append(new_doc)

        self.write( data )


settings = {
    'template_path': os.path.join(os.path.dirname(__file__), 'templates'),
    'static_path' : os.path.join(os.path.dirname(__file__), 'static'),
    # 'xsrf_cookies': True,
}

application = tornado.web.Application([
    (r'/', MainHandler),
    (r'/(?P<page_num>\d+)?', MainHandler),
    (r'/test', TestHandler),
    (r'/market', MarketHandler),
    (r'/prices', PricesHandler),
    (r'/prices/(?P<name>[^/]+)?', PricesHandler),
    (r'/reviews', ReviewsHandler),
    (r'/weather', WeatherHandler),
], **settings)

application.listen(7654, '127.0.0.1')
# application.listen(7654, '0.0.0.0')

print 'Server is running...'
tornado.ioloop.IOLoop.instance().start()
