from selenium import webdriver
import unittest
from time import sleep

from selenium.common.exceptions import StaleElementReferenceException


class Citationtexturl(unittest.TestCase):
    def setUp(self):
        self.browser = webdriver.Chrome()
        self.browser.implicitly_wait(3)

    def teardown(self):
        self.browser.quit()

    # c476303 attribution section is initially collapsed, expands when clicked
    def test_c476303_attribution_initial_status(self):
        self.browser.get("https://rex-web.herokuapp.com/books/college-physics/pages/preface")
        sleep(2)
        self.browser.find_element_by_xpath(
            '//*[@id="root"]/div[2]/div[4]/div/div[2]/div/div/details'
        ).click()
        # y = self.browser.get_attribute(x)
        # print(y)

        # self.assertEqual(self.browser.get_attribute(details),open)

        # url = 'http://localhost:8000/analyse/'

        org = self.browser.find_element_by_xpath(
            '//*[@id="root"]/div[2]/div[4]/div/div[2]/div/div/details'
        )
        # Find the value of org?
        # val = org.get_attribute("class")
        y = org.is_selected()

        # class="Attribution__Details-sc-11isnv6-4 fPeJdR"
        # is_open = "open" in org.get_attribute("class")
        print(y)
