# Scrapy settings for scrape_college_board project
#
# For simplicity, this file contains only the most important settings by
# default. All the other settings are documented here:
#
#     http://doc.scrapy.org/topics/settings.html
#

BOT_NAME = 'scrape_college_board'
BOT_VERSION = '1.0'

SPIDER_MODULES = ['scrape_college_board.spiders']
NEWSPIDER_MODULE = 'scrape_college_board.spiders'
USER_AGENT = '%s/%s' % (BOT_NAME, BOT_VERSION)

