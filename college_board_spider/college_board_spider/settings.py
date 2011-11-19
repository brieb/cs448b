# Scrapy settings for college_board_spider project
#
# For simplicity, this file contains only the most important settings by
# default. All the other settings are documented here:
#
#     http://doc.scrapy.org/topics/settings.html
#

BOT_NAME = 'college_board_spider'
BOT_VERSION = '1.0'

SPIDER_MODULES = ['college_board_spider.spiders']
NEWSPIDER_MODULE = 'college_board_spider.spiders'
USER_AGENT = '%s/%s' % (BOT_NAME, BOT_VERSION)

