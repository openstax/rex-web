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

    books = {
        "chemistry-2e": {"default_page": "1-introduction"},
        "chemistry-atoms-first-2e": {"default_page": "1-introduction"},
        "anatomy-and-physiology": {"default_page": "1-introduction"},
        "college-physics": {
            "default_page": "1-introduction-to-science-and-the-realm-of-physics-physical-quantities-and-units"
        },
        "astronomy": {"default_page": "1-introduction"},
        "biology-2e": {"default_page": "1-introduction"},
        "biology-ap-courses": {"default_page": "1-introduction"},
        "college-physics-ap-courses": {"default_page": "1-connection-for-ap-r-courses"},
        "concepts-biology": {"default_page": "1-introduction"},
        "microbiology": {"default_page": "1-introduction"},
    }

    def random_book_slug(self):
        random_book_slug = random.choice(list(self.books.keys()))
        return random_book_slug


def get_default_page(element):
    book_list = Library.books
    default_page = book_list[element]["default_page"]
    return default_page


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
