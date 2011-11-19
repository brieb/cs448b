# Define here the models for your scraped items
#
# See documentation in:
# http://doc.scrapy.org/topics/items.html

from scrapy.item import Item, Field

class CollegeBoardSpiderItem(Item):
    # define the fields for your item here like:
    # name = Field()
    address
    url
    college_board_url
    type_of_school
    calendar
    degrees_offered
    setting
    size_total_undergrads
    size_grad_enrollment
    size_student_faculty_ratio
    student_body
    admission_office
    acceptance_rate
    percent_soph_return

