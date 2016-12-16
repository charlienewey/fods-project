import requests
import re
import json
from datetime import datetime
from pymongo import MongoClient
from operator import itemgetter

fields = ['date','temperature','humidity','precipitation','region']

file_path = 'weather/'
files = [
    'bordeaux_bordeaux.csv',
    'burgundy_dijon.csv',
    'rhone_lyon.csv'
    ]

RRR_NAN = [
    'Trace of precipitation',
    'No precipitation'
]

db_uri = 'mongodb://group:group@ds029635.mlab.com:29635/fods-seven'
client = MongoClient(db_uri)
db = client['fods-seven']
col = db['weather-rp5']
# results = []

def process_response(data,skip=0,region=''):
    index = 0
    for line in data:
        line = line.strip()
        index += 1
        if index <= skip:
            print 'skipped:' + line
            continue
        entry_fields = [ field.strip('""') for field in line.split(';')]
        # print entry_fields[0],entry_fields[1],entry_fields[5],entry_fields[23]

        indexes = [0,1,5,23]
        fields_needed = list(itemgetter(*indexes)(entry_fields))

        if fields_needed[3] in RRR_NAN:
            fields_needed[3] = 0.0

        try:
            fields_needed[3] = float(fields_needed[3])
            fields_needed[2] = int(fields_needed[2])
            fields_needed[1] = float(fields_needed[1])
            fields_needed[0] = datetime.strptime(fields_needed[0], "%d.%m.%Y %H:%M")
            fields_needed.append( region )
        except ValueError as VE:
            # print fields_needed, VE
            continue

        # print fields_needed
        # print dict(zip(fields, fields_needed))
        col.insert_one( dict(zip(fields, fields_needed)) )

for file_name in files:
    with open(file_path+file_name,'r') as f:
        # print f.readlines()
        # break
        process_response(f.readlines(),1,file_name.split('_')[0])
