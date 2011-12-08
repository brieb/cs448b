import pycurl
import sys
import urllib
import json
import StringIO
import sqlite3
import time

def get_data_for_address(lat, lng):
  c = pycurl.Curl()
  c.setopt(pycurl.URL, "http://maps.googleapis.com/maps/api/geocode/json?latlng="+str(lat)+","+str(lng)+"&sensor=false")

  b = StringIO.StringIO()
  c.setopt(pycurl.WRITEFUNCTION, b.write)
  c.setopt(pycurl.FOLLOWLOCATION, 1)
  c.setopt(pycurl.MAXREDIRS, 5)
  c.perform()

  data = json.loads(b.getvalue())
  if data['status'] != 'OK':
    print "fail for address query: {0:.3f},{0:.3f}".format(lat, lng) 
    return ""

  return data['results'][0]['formatted_address'][-3:]

conn = sqlite3.connect('data.db')
c = conn.cursor()
c2 = conn.cursor()
q = "select id, latitude, longitude from college where is_usa=0"
r = c.execute(q)
for e in r:
  print
  print e
  time.sleep(0.1)
  data = get_data_for_address(e[1], e[2])
  print data
  if data == 'USA':
    q = "update college set is_usa = 1 where id = " + str(e[0])
    print q
    c2.execute(q)
    conn.commit()

c.close()
conn.close()

