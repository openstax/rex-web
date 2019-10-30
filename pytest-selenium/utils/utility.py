import random

from selenium.common.exceptions import (
    ElementClickInterceptedException,
    NoSuchElementException,
    StaleElementReferenceException,
    TimeoutException,
    WebDriverException,
)  # NOQA

from time import sleep


class Library(object):
    def __init__(self):
        self._book_slug_list = [
            "chemistry-2e",
            "chemistry-atoms-first-2e",
            "anatomy-and-physiology",
            "college-physics",
            "astronomy",
            "biology-2e",
            "biology-ap-courses",
            "college-physics-ap-courses",
            "concepts-biology",
            "microbiology",
        ]

    @property
    def books(self) -> [str]:
        return self._book_slug_list

    def random_book_slug(self):
        return random.choice(self.books)


class FontProperties(object):
    def is_bold(self, element):
        return element.value_of_css_property("font-weight") == "400"


class Utilities(object):
    """Helper functions for various Pages actions."""

    @classmethod
    def click_option(cls, driver, locator=None, element=None):
        """Click on elements which cause Safari 500 errors."""
        element = element if element else driver.find_element(*locator)
        try:
            if driver.capabilities.get("browserName").lower() == "safari":
                raise WebDriverException("Bypassing the driver-defined click")
            element.click()
        except WebDriverException:
            for _ in range(10):
                try:
                    driver.execute_script("arguments[0].click()", element)
                    break
                except ElementClickInterceptedException:  # Firefox issues
                    sleep(1)
                except NoSuchElementException:  # Safari issues
                    if locator:
                        element = driver.find_element(*locator)
                except StaleElementReferenceException:  # Chrome and Firefox
                    if locator:
                        element = driver.find_element(*locator)
