import pycurl
import sys
import urllib
import json
import StringIO
import sqlite3
import time

def get_data_for_address(address):
  params = dict()
  params['sensor'] = 'true'
  params['address'] = address.encode('utf-8')
  q = urllib.urlencode(params)
  print q

  c = pycurl.Curl()
  c.setopt(pycurl.URL, "http://maps.googleapis.com/maps/api/geocode/json?"+q)

  b = StringIO.StringIO()
  c.setopt(pycurl.WRITEFUNCTION, b.write)
  c.setopt(pycurl.FOLLOWLOCATION, 1)
  #c.setopt(pycurl.TIMEOUT, 100)
  c.setopt(pycurl.MAXREDIRS, 5)
  c.perform()

  data = json.loads(b.getvalue())
  if data['status'] != 'OK':
    print "fail for address query: " + params['address']
    return {
        'gmap_lat_long_address': '',
        'latitude': 'NULL',
        'longitude': 'NULL'
        }

  return {
      'gmap_lat_long_address': data['results'][0]['formatted_address'],
      'latitude': data['results'][0]['geometry']['location']['lat'],
      'longitude': data['results'][0]['geometry']['location']['lng']
      }

conn = sqlite3.connect('data.db')
c = conn.cursor()
c2 = conn.cursor()
q = "select id, address from college where latitude isnull"
r = c.execute(q)
for e in r:
  #print e
  time.sleep(0.1)
  data = get_data_for_address(e[1])
  q = "update college set"+\
      " latitude = " + str(data['latitude']) +\
      ", longitude = " + str(data['longitude']) +\
      ", gmap_lat_long_address = \"" + data['gmap_lat_long_address'] + "\"" +\
      " where id = " + str(e[0])
  #print q
  c2.execute(q)
  conn.commit()

c.close()
conn.close()

