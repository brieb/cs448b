#!/usr/bin/env python

from lxml import etree
#import MySQLdb as mql
import re
import httplib, json
#import couchdb

#con = MySQLdb.connect('localhost', 'root', 'root', 'cs448b', unix_socket="/Applications/MAMP/tmp/mysql/mysql.sock")
#cur = con.cursor()

#couch = couchdb.Server()
#db = couch['cs448b']


def get_filename(college_id, page):
  return '../data/college_board_dump/' + \
      'collegeId_' + str(college_id) + '_' +\
      'page_' + str(page) + \
      '.html'

for i in range (1, 4000):
  print "attempting to insert college_id: " + str(i)
  conn = httplib.HTTPConnection('localhost', '5984') 
  headers = {"Content-type": "application/json"}
  #i = 3387

  filename = get_filename(i, 0)
  try:
    f = open(filename)
    f_content = f.read()
    html = etree.HTML(f_content)

    college = dict()

    #college['_id'] = i

    college['main_address'] = ' '.join(
        [ x.strip() for x in html.xpath('//td[@id="main_address"]/text()')[1:3] ]
        ).strip()


    school_url_elem = html.xpath('//td[@id="main_address"]/a/text()')
    college['school_url'] = school_url_elem[0] if len(school_url_elem) > 0 else 'NULL'

    school_type = html.xpath('//td[@id="gen_info"]/ul/li/text()')
    college['school_type'] = []
    for attr in school_type:
      match = re.search('Percent applicants admitted: ([^%]*)', attr)
      if match == None:
        college['school_type'].append(attr)
      else:
        college['percent_admitted'] = match.groups()[0]

    div_cal = html.xpath('//td[@id="cal"]/div/text()')
    college['calendar'] = div_cal[1].strip() if len(div_cal) > 0 else 'NULL'
    college['degree'] = html.xpath('//td[@id="cal"]/ul/li/text()')
    college['setting'] = html.xpath('//td[@id="setting"]/ul/li/text()')

    size = html.xpath('//td[@id="size"]/ul/li/text()')

    college['size_num_undergrad'] = None
    college['faculty_to_student_ratio'] = None
    college['size_num_grad'] = None
    
    for attr in size:
      match = re.search('Total undergrads: (.*)', attr)
      if match != None:
        college['size_num_undergrad'] = match.groups()[0]

      match = re.search('Graduate enrollment: (.*)', attr)
      if match != None:
        college['size_num_grad'] = match.groups()[0]

      match = re.search('Student-to-faculty ratio: (.*)', attr)
      if match != None:
        college['faculty_to_student_ratio'] = match.groups()[0]

    college['demographics_first_year'] = [ x
        for x in html.xpath('//td[@id="col2"]//ul/li/text()')
        if x != '\n'
        ]


    doc = json.dumps(college)
    conn.request('PUT', '/cs448b/'+str(i), doc, headers)
    print conn.getresponse()
    #db.save(doc)

  except IOError:
    print 'ERROR: Does not exist ' + filename 
