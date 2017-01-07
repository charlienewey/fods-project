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
    'weather': db['weather_monthly'],
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
                    '_id.region': 1
                }
            },
            {
                '$skip': skip
            },
            {
                '$limit': limit
            }
        ]

        return list(collection['prices'].aggregate(pipeline))

    def get(self, page_num=1):
        print "GET / request from", self.request.remote_ip

        try:
            page_num = int(page_num)
        except ValueError:
            page_num = 1

        self.render(
            'index.html',
            page='overview',
            page_num=page_num,
            page_size=self.PAGE_SIZE,
            wines=self._wine_list(page_num)
        )


class MSCIAndPriceHandler(tornado.web.RequestHandler):
    def get(self):
        pipeline = [
            {
                '$project': {
                    'date': {
                        '$dateToString': {
                            'format': '%Y-%m-01',
                            'date': '$date'
                        }
                    },
                    'region': '$region',
                    'price': '$price'
                }
            },
            {
                '$group': {
                    '_id': {
                        'region': '$region',
                        'date': '$date'
                    },
                    'price': {
                        '$avg': '$price'
                    },
                    'date': {
                        '$first': '$date'
                    },
                    'region': {
                        '$first': '$region'
                    }
                }
            },
            {
                '$lookup': {
                    'from': 'market',
                    'localField': 'date',
                    'foreignField': 'date',
                    'as': 'market_data'
                }
            },
            {
                '$sort': {
                    'date': 1
                }
            }
        ]

        data = {'data':[]}
        for doc in collection['prices'].aggregate(pipeline):
            new_doc = {}
            new_doc['price'] = doc['price']
            new_doc['date'] = doc['date']
            new_doc['region'] = doc['region']
            try:
                new_doc['market_data'] = doc['market_data'][0]
                del new_doc['market_data']['_id']
            except IndexError:
                continue
            data['data'].append(new_doc)

        self.write( data )


class WeatherDataHandler(tornado.web.RequestHandler):
    def get(self):
        print "GET /weather request from", self.request.remote_ip
        data = {'data':[]}
        sort_order = [
            ("year", 1),
            ("month", 1)
        ]
        for doc in collection['weather'].find().sort(sort_order):
            new_doc = {}
            new_doc['temperature'] = doc['temperature']
            new_doc['precipitation'] = doc['precipitation']
            new_doc['humidity'] = doc['humidity']
            new_doc['month'] = doc['month']
            new_doc['year'] = doc['year']
            new_doc['region'] = doc['region']
            data['data'].append(new_doc)
        self.write( data )


class ReviewsDataHandler(tornado.web.RequestHandler):
    def get(self):
        print "GET /reviews request from", self.request.remote_ip
        data = {'data':[]}
        for doc in collection['reviews'].find():
            new_doc = {}
            new_doc['rating'] = doc['avg_rating']
            new_doc['region'] = doc['region']
            new_doc['price'] = doc['price']
            new_doc['year'] = doc['year']
            new_doc['name'] = doc['name']
            data['data'].append(new_doc)
        self.write( data )


class PricesDataHandler(tornado.web.RequestHandler):
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


class PricesHandler(tornado.web.RequestHandler):
    def get(self):
        self.render('prices.html', page='prices')


class ReviewsHandler(tornado.web.RequestHandler):
    def get(self):
        self.render('reviews.html', page='reviews')


class WeatherHandler(tornado.web.RequestHandler):
    def get(self):
        self.render('weather.html', page='weather')


settings = {
    'template_path': os.path.join(os.path.dirname(__file__), 'templates'),
    'static_path' : os.path.join(os.path.dirname(__file__), 'static'),
    # 'xsrf_cookies': True,
}

application = tornado.web.Application([
    # web pages
    (r'/', MainHandler),
    (r'/(?P<page_num>\d+)?', MainHandler),
    (r'/prices', PricesHandler),
    (r'/reviews', ReviewsHandler),
    (r'/weather', WeatherHandler),

    # API (e.g. /data/<stuff>)
    (r'/data/msci-and-prices', MSCIAndPriceHandler),
    (r'/data/prices', PricesDataHandler),
    (r'/data/prices/(?P<name>[^/]+)?', PricesDataHandler),
    (r'/data/reviews', ReviewsDataHandler),
    (r'/data/weather', WeatherDataHandler),
], **settings)

application.listen(7654, '127.0.0.1')
# application.listen(7654, '0.0.0.0')

print 'Server is running...'
tornado.ioloop.IOLoop.instance().start()
