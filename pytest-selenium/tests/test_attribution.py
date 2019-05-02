
import unittest
from time import sleep

from selenium import webdriver
from selenium.common.exceptions import StaleElementReferenceException

class Citationtexturl(unittest.TestCase):
    def setUp(self):
        self.browser = webdriver.Chrome()
        self.browser.implicitly_wait(3)
    def teardown(self):
        self.browser.quit()



#c476303 attribution section is initially collapsed, expands when clicked
    def test_c476303_attribution_initial_status(self):

        page_url = "https://rex-web.herokuapp.com/books/college-physics/pages/preface"
        attribute_xpath_locator = '//*[@id="root"]/div[2]/div[4]/div/div[2]/div/div/details'

        self.browser.get(page_url)

        
        attribute_element = self.browser.find_element_by_xpath(attribute_xpath_locator)

        #verify attribution is closed by default
        is_attribute_closed = attribute_element.get_attribute("open")
        #print(is_attribute_closed)
        self.assertNotEqual(is_attribute_closed,"true")


        #click on attribution and verify it expands
        attribute_element.click()
        is_attribute_open = attribute_element.get_attribute("open")
        #print(is_attribute_open)
        self.assertEqual(is_attribute_open,"true")

                
        #attribute_xpath_after_click = '//*[@id="root"]/div[2]/div[4]/div/div[2]/div/div/details'
        #attribute_element_after_click = self.browser.find_element_by_xpath(attribute_xpath_after_click)
        #attribute_element_after_click.click()
        #is_attribute_closed = attribute_element_after_click.get_attribute("open")
        #print(is_attribute_closed)

        
    

if __name__ == '__main__': 
    unittest.main() 
