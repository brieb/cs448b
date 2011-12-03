#!/usr/bin/env python

from lxml import etree
import sqlite3
import re
import httplib, json

def get_filename(college_id, page):
  return '../data/college_board_dump/' + \
      'collegeId_' + str(college_id) + '_' +\
      'page_' + str(page) + \
      '.html'

def parse_data(college_id):
  print "attempting to insert college_id: " + str(college_id)

  filename = get_filename(college_id, 0)
  filename_majors = get_filename(college_id, 7)
  try:
    f = open(filename)
    f_content = f.read()
    html = etree.HTML(f_content)

    f_maj = open(filename_majors)
    f_maj_content = f_maj.read()
    html_maj = etree.HTML(f_maj_content)

    college = dict()
    degrees = []
    demographics_first_year = []
    school_types = []
    settings = []
    majors = []


    college['id'] = college_id
    
    college['name'] = html.xpath('//div[@id="profile_hdr"]/h1/text()')[0]
    
    college['address'] = ' '.join(
        [ x.strip() for x in html.xpath('//td[@id="main_address"]/text()')[1:3] ]
        ).strip()

    school_url_elem = html.xpath('//td[@id="main_address"]/a/text()')
    college['url'] = school_url_elem[0] if len(school_url_elem) > 0 else 'NULL'

    school_type_elem = html.xpath('//td[@id="gen_info"]/ul/li/text()')
    for attr in school_type_elem:
      match = re.search('Percent applicants admitted: ([^%]*)', attr)
      if match == None:
        school_types.append(attr)
      else:
        college['percent_admitted'] = match.groups()[0]

    div_cal = html.xpath('//td[@id="cal"]/div/text()')
    college['calendar'] = div_cal[1].strip() if len(div_cal) > 0 else 'NULL'

    degrees = html.xpath('//td[@id="cal"]/ul/li/text()')
    settings = html.xpath('//td[@id="setting"]/ul/li/text()')

    size = html.xpath('//td[@id="size"]/ul/li/text()')
    college['num_undergrad'] = None
    college['faculty_to_student_ratio'] = None
    college['num_grad'] = None
    for attr in size:
      match = re.search('Total undergrads: (.*)', attr)
      if match != None:
        college['num_undergrad'] = match.groups()[0]

      match = re.search('Graduate enrollment: (.*)', attr)
      if match != None:
        college['num_grad'] = match.groups()[0]

      match = re.search('Student-to-faculty ratio: (.*)', attr)
      if match != None:
        college['faculty_to_student_ratio'] = match.groups()[0]

    demographics_first_year_elem = [ x
        for x in html.xpath('//td[@id="col2"]//ul/li/text()')
        if x != '\n'
        ]
    for x in demographics_first_year_elem:
      m = re.search('(\d+)% (.*)', x)
      if m != None:
        demographics_first_year.append(m.groups())

    maj_cat = html_maj.xpath('//div[@class="profile_detail"]/h4/text()')[1:]
    maj_uls = html_maj.xpath('//div[@class="profile_detail"]/ul[@class="none"]')[1:]
    for i in range(0,len(maj_uls)):
      maj_ul = maj_uls[i]
      maj_ul_name = maj_ul.xpath('li/a/text()')
      maj_ul_level = maj_ul.xpath('li/em/text()')
      
      for j in range(0, len(maj_ul_name)):
        major = dict()
        major['category'] = maj_cat[i]
        major['name'] = maj_ul_name[j]
        major['degree_type'] = maj_ul_level[j]
        majors.append(major)
      

    data = dict()
    data['college'] = college
    data['degrees'] = degrees
    data['demographics_first_year'] = demographics_first_year
    data['school_types'] = school_types
    data['settings'] = settings
    data['majors'] = majors
    return data

  except IOError:
    print 'ERROR: Does not exist ' + filename 
    return None

def to_str(elem):
  if elem == None:
    return ""

  if type(elem) == unicode:
    return str(elem.encode("utf8","ignore"))
  
  return str(elem)

def store_data(data):
  conn = sqlite3.connect('data.db')
  c = conn.cursor()

  college_id = to_str(data['college']['id'])

  #for k in data['college'].keys():
    #if data['college'][k] == None:
      #data['college'][k] = ""
    

  print data['college']

  q = "insert or ignore into \
      college(\
        id,\
        name,\
        url,\
        address,\
        faculty_to_student_ratio,\
        num_grad,\
        num_undergrad,\
        percent_admitted,\
        calendar\
      ) \
      values("+ \
                to_str(data['college']['id']) +\
          ",\"" + to_str(data['college']['name']) +\
        "\",\"" + to_str(data['college']['url']) +\
        "\",\"" + to_str(data['college']['address']) +\
        "\",\"" + to_str(data['college']['faculty_to_student_ratio']) +\
        "\",\"" + to_str(data['college']['num_grad']).replace(',','') +\
        "\",\"" + to_str(data['college']['num_undergrad']).replace(',','') +\
        "\",\"" + to_str(data['college']['percent_admitted']) +\
        "\",\"" + to_str(data['college']['calendar']) + "\"" +\
      ")"
  print q
  c.execute(q)

  for d in data['degrees']:
    q = "insert or ignore into degree(value) values(\""+d+"\")"
    c.execute(q)

    q = "insert or ignore into college_degree(college_id, degree_id) \
        select "+college_id+", \
        (select id from degree where value=\""+d+"\")"
    c.execute(q)

  for d in data['demographics_first_year']:
    q = "insert or ignore into demographics_first_year(value) values(\""+d[1]+"\")"
    c.execute(q)

    q = "insert or ignore into college_demographics_first_year\
        (college_id, demographics_first_year_id, percentage)\
        values("+college_id+", \
        (select id from demographics_first_year where value = \""+d[1]+"\"), \
        "+d[0]+")"
    c.execute(q)

  for t in data['school_types']:
    q = "insert or ignore into school_type(value) values(\""+t+"\")"
    c.execute(q)

    q = "insert or ignore into college_school_type(college_id, school_type_id)\
        values("+college_id+", (select id from school_type where value = \""+t+"\"))"
    c.execute(q)

  for s in data['settings']:
    q = "insert or ignore into setting(value) values(\""+s+"\")"
    c.execute(q)

    q = "insert or ignore into college_setting(college_id, setting_id)\
        values("+college_id+", (select id from setting where value = \""+s+"\"))"
    c.execute(q)

  
  for m in data['majors']:
    q = "insert or ignore into major(degree_type, category, name)\
        values(\""+m['degree_type']+"\", \""+m['category']+"\", \""+m['name']+"\")"
    c.execute(q)

    q = "insert or ignore into college_major(college_id, major_id)\
        values("+college_id+",\
        (select id from major where\
        degree_type = \""+m['degree_type']+"\" and\
        category = \""+m['category']+"\" and\
        name = \""+m['name']+"\"))"
    c.execute(q)

  conn.commit()
  c.close()
  conn.close()
  

for i in range (1, 4000):
#i = 3387
  data = parse_data(i)
  if data != None:
    store_data(data)
