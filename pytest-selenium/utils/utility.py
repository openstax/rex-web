"""Utility functions and class helpers for rex-web automation."""

from __future__ import annotations

from enum import Enum
from random import choice, randint
from time import sleep
from typing import Tuple

from faker import Faker
from selenium.common.exceptions import (
    ElementClickInterceptedException,
    NoSuchElementException,
    StaleElementReferenceException,
    WebDriverException,
)

# Constant usage values for javascript and regular expression commands
ASYNC_DELETE = r"""
(async function delete_page_highlights() {
  const ids = __APP_STORE.getState().content.highlights.highlights.map(({id}) => id);
  for(id of ids) await __APP_SERVICES.highlightClient.deleteHighlight({id});
})()"""  # NOQA
HIGHLIGHTS = "return document.querySelectorAll('.highlight').length;"
RELOAD = "location.reload();"


class Color(Enum):
    """Highlight color options."""

    BLUE = "blue"
    GREEN = "green"
    PINK = "pink"
    PURPLE = "purple"
    YELLOW = "yellow"


class FontProperties:
    def is_bold(self, element):
        return element.value_of_css_property("font-weight") == "400"


class Highlight:
    """Supplimental resources for book highlighting."""

    Offset = Tuple[int, int]

    COLORS = list(Color)
    RANDOM = "randomize"
    ENTIRE = "highlight all"

    @classmethod
    def delete_highlights_on_page(cls, driver):
        """Purge the highlights for the current user on the current book page.

        Trigger a javascript command to clean up the current page and remove
        all highlights. Reload the page to see the updated UI.

        :param driver: the selenium webdriver object
        :returns: None

        """
        total_page_highlights = driver.execute_script(HIGHLIGHTS)
        driver.execute_script(ASYNC_DELETE)
        sleep(total_page_highlights * 0.05)
        driver.execute_script(RELOAD)

    @classmethod
    def random_color(cls) -> int:
        """Return a random color.

        :return: a random highlight color
        :rtype: int

        """
        return cls.COLORS[randint(0, len(cls.COLORS) - 1)]


class Library(object):

    books = {
        "anatomy-and-physiology": {
            "default_page":
                "1-introduction"},
        "astronomy": {
            "default_page":
                "1-introduction"},
        "biology-2e": {
            "default_page":
                "1-introduction"},
        "biology-ap-courses": {
            "default_page":
                "1-introduction"},
        "chemistry-2e": {
            "default_page":
                "1-introduction"},
        "chemistry-atoms-first-2e": {
            "default_page":
                "1-introduction"},
        "college-physics": {
            "default_page":
                "1-introduction-to-science-and-the-realm-of-"
                "physics-physical-quantities-and-units"},
        "college-physics-ap-courses": {
            "default_page":
                "1-connection-for-ap-r-courses"},
        "concepts-biology": {
            "default_page":
                "1-introduction"},
        "microbiology": {
            "default_page":
                "1-introduction"},
    }

    def random_book_slug(self):
        random_book_slug = choice(list(self.books.keys()))
        return random_book_slug


def get_default_page(element):
    book_list = Library.books
    default_page = book_list[element]["default_page"]
    return default_page


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

    @classmethod
    def random_name(cls) -> Tuple(str, str):
        """Generate a random name for an Accounts user.

        :return: the first and last name
        :rtype: tuple(str, str)

        """
        fake = Faker()
        use_male_functions = randint(0, 1) == 0
        return (fake.first_name_male() if use_male_functions else
                fake.first_name_female(),
                fake.last_name())

    @classmethod
    def scroll_top(cls, driver):
        """Scroll to the top of the browser screen.

        :param driver: the selenium webdriver object
        :returns: None

        """
        driver.execute_script("window.scrollTo(0, 0);")
        sleep(0.75)
