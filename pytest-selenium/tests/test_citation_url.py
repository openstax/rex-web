
import unittest
from time import sleep

from selenium import webdriver



class Citationtexturl(unittest.TestCase):
	def setUp(self):
		self.browser = webdriver.Chrome()
		self.browser.implicitly_wait(3)
	def teardown(self):
		self.browser.quit()

#c476302 - citation text shows url for current page
	def test_c476302_citation_url_matches_page_url(self):

		#open url - defaults to preface page
		page_url = "https://rex-web.herokuapp.com/books/college-physics/pages/preface"
		
		self.browser.get(page_url)
		preface_url = self.browser.current_url

		#click citation url in the preface page
		citation_xpath_locator = '//*[@id="root"]/div[2]/div[4]/div/div[2]/div/div/details'
		citation_element = self.browser.find_element_by_xpath(citation_xpath_locator)
		
		citation_element.click()
		sleep(2)
		preface_citation_url = self.browser.current_url
		
		#Verify citation url = current page url
		self.assertEqual(preface_citation_url, preface_url)
 


 		#Navigate to different page and verify new page url not equals citation url of preface page
		section4_xpath_locator = '//*[@id="root"]/div[2]/div[4]/div/div[1]/nav/ol/li[2]/nav/ol/li[5]/a'
		section4_link = self.browser.find_element_by_xpath(section4_xpath_locator)
		
		section4_link.click()
		sleep(2)
		section4_url = self.browser.current_url
		self.assertNotEqual(preface_citation_url, section4_url)



		#Verify new page citation url equals new page url
		section4_citation_xpath_locator = '//*[@id="root"]/div[2]/div[4]/div/div[2]/div/div/details'
		section4_citation_link = self.browser.find_element_by_xpath(section4_citation_xpath_locator)

		section4_citation_link.click()
		sleep(2)
		section4_citation_url = self.browser.current_url
		self.assertEqual(section4_citation_url, section4_url)



if __name__ == '__main__': 
	unittest.main() 

