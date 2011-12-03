#!/usr/bin/env python

from lxml import etree
import sqlite3
import re
import httplib, json

conn = sqlite3.connect('data.db')
c = conn.cursor()

def get_filename(college_id, page):
  return '../data/college_board_dump/' + \
      'collegeId_' + str(college_id) + '_' +\
      'page_' + str(page) + \
      '.html'

#for i in range (1, 4000):
i = 3387
print "attempting to insert college_id: " + str(i)

filename = get_filename(i, 0)
filename_majors = get_filename(i, 7)
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
    
  print "college:" 
  print college 
  print
  print "degrees:" 
  print degrees 
  print
  print "demographics_first_year:" 
  print demographics_first_year 
  print
  print "school_types:" 
  print school_types 
  print
  print "settings:" 
  print settings 
  print
  print "majors:" 
  print majors 
  print

except IOError:
  print 'ERROR: Does not exist ' + filename 
