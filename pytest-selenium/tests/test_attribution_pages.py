import unittest
from time import sleep

from selenium import webdriver
from selenium.webdriver.common.keys import Keys


class TestAttributionpages(unittest.TestCase):
    def setUp(self):
        self.browser = webdriver.Chrome()
        self.browser.implicitly_wait(3)
    def teardown(self):
        self.browser.quit()


    def offscreen_click(self, element):
        """Clicks an offscreen element.
        Clicks the given element, even if it is offscreen, by sending the ENTER key.
        Returns the element.
        """
        # We actually navigate using the ENTER key because scrolling the page can be flaky
        # https://stackoverflow.com/a/39918249
        element.send_keys(Keys.ENTER)
        return element


#c476304 citation/attribution section collapses by default when you navigate to a new page
    
    def test_c476304_attribution_pages_navigation(self):
        #page_url = base_url + "/books/college-physics/pages/preface"
        page_url = "https://rex-web.herokuapp.com/books/college-physics/pages/preface"
        attribute_xpath_locator = "//details[contains(@class,'Attribution__Details')]"
        self.browser.get(page_url)
        attribute_element = self.browser.find_element_by_xpath(attribute_xpath_locator)

        #Expand attribution
        attribute_element.click()
        attribute = attribute_element.get_attribute("open")
        print(attribute)  #true


        #Navigate to Next page and verify attribution is closed by default
        Next_element_locator = self.browser.find_element_by_css_selector("a[aria-label='Next Page']")
        self.offscreen_click(Next_element_locator)
        sleep(1)
        attribute_element_nextpage_find = "//details[contains(@class,'Attribution__Details')]"
        attribute_element_nextpage_locator = "//summary[contains(@class,'Attribution__Summary')]"
        attribute_element_nextpage = self.browser.find_element_by_xpath(attribute_element_nextpage_locator)
        attribute_nextpage = self.browser.find_element_by_xpath(attribute_element_nextpage_find).get_attribute("open")
        sleep(2)

        #self.browser.refresh()
        print(attribute_nextpage) #None
        sleep(5)
        assert attribute_nextpage != "true"
        sleep(1)

        attribute_element_nextpage.click()

        attribute_nextpage_click = self.browser.find_element_by_xpath("//details[contains(@class,'Attribution__Details')]").get_attribute("open")
        print(attribute_nextpage_click) #true
        sleep(5)



        #Navigate to a TOC link and verify attribution is closed by default in the new page
        TOC_element_locator = "//div[@aria-label='Table of Contents']/nav/ol/li[3]/nav/ol/li[1]/a"
        TOC_element = self.browser.find_element_by_xpath(TOC_element_locator)
        self.offscreen_click(TOC_element)
        attribute_toc_link_page = attribute_element_nextpage.get_attribute("open")
        print(attribute_toc_link_page) #none
        assert attribute_toc_link_page != "true"
        sleep(2)

        attribute_element.click()

        attribute_toc_open = self.browser.find_element_by_xpath("//details[contains(@class,'Attribution__Details')]").get_attribute("open")
        print(attribute_toc_open) #true
 
        #Navigate to Previous page and verify attribution is closed by default in the new page
        Previous_element_locator = self.browser.find_element_by_css_selector("a[aria-label='Previous Page']")
        self.offscreen_click(Previous_element_locator)
        sleep(1)
        attribute_element_previouspage_find = "//details[contains(@class,'Attribution__Details')]"
        attribute_element_previouspage_locator = "//summary[contains(@class,'Attribution__Summary')]"
        attribute_element_previouspage = self.browser.find_element_by_xpath(attribute_element_previouspage_locator)
        attribute_previouspage = self.browser.find_element_by_xpath(attribute_element_previouspage_find).get_attribute("open")
        sleep(1)

        #self.browser.refresh()
        print(attribute_previouspage) #None
        sleep(5)
        assert attribute_previouspage != "true"
        sleep(1)

        attribute_element_previouspage.click()

        attribute_previouspage_click = self.browser.find_element_by_xpath("//details[contains(@class,'Attribution__Details')]").get_attribute("open")
        print(attribute_previouspage_click) #true

if __name__ == '__main__': 
    unittest.main() 
