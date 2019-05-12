
import unittest
from time import sleep

import pytest
from selenium import webdriver

from pages.content import Content
from tests import markers
#from selenium.common.exceptions import StaleElementReferenceException


class TestCitationtexturl():
    #def setUp(self):
        #self.browser = webdriver.Chrome()
        #self.browser.implicitly_wait(3)
    #def teardown(self):
       # self.browser.quit()

    @markers.test_case("C476303")
    @markers.parametrize("book_slug,page_slug", [("college-physics", "preface")])
    @markers.nondestructive

#c476303 attribution section is initially collapsed, expands when clicked
    def test_c476303_attribution_initial_status(self, selenium, base_url, book_slug, page_slug):
        page_url = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
        
        #page_url = base_url + "/books/college-physics/pages/preface"
        #page_url = "https://rex-web.herokuapp.com/books/college-physics/pages/preface"
        
        attribute_xpath_locator = "//details[contains(@class,'Attribution__Details')]"
        
        #selenium.get(page_url)

        
        attribute_element = selenium.find_element_by_xpath(attribute_xpath_locator)

        #verify attribution is closed by default
        is_attribute_closed = attribute_element.get_attribute("open")
        print(is_attribute_closed)
        # self.assertNotEqual(is_attribute_closed,"true")

        assert is_attribute_closed != "true"
        sleep(1)

        #click on attribution and verify it expands
        attribute_element.click()
        is_attribute_open = attribute_element.get_attribute("open")
        sleep(1)
        print(is_attribute_open)
        # self.assertEqual(is_attribute_open,"true")

        assert is_attribute_open == "true"

                
        #click on attribution and verify it closes
        attribute_open_xpath_locator = "//summary[contains(@class,'Attribution__Summary')]"
        attribute_open_element = selenium.find_element_by_xpath(attribute_open_xpath_locator)
        sleep(1)
        attribute_open_element.click()
        is_attribute_closed_again = attribute_open_element.get_attribute("open")
        print(is_attribute_closed_again)
        #self.assertNotEqual(is_attribute_closed_again,"true")
        assert is_attribute_closed_again != "true"

        
    

#if __name__ == '__main__': 
    #unittest.main() 
