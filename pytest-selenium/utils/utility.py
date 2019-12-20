"""Utility functions and class helpers for rex-web automation."""

from __future__ import annotations

from enum import Enum
from platform import system
from random import choice, randint
from time import sleep
from typing import List, Tuple

from faker import Faker
from selenium.common.exceptions import (
    ElementClickInterceptedException,
    NoSuchElementException,
    StaleElementReferenceException,
    WebDriverException,
)
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys

# Constant usage values for javascript and regular expression commands
ASYNC_DELETE = r"""
(async function delete_page_highlights() {
  const ids = __APP_STORE.getState().content.highlights.highlights.map(({id}) => id);
  for(id of ids) await __APP_SERVICES.highlightClient.deleteHighlight({id});
})()"""  # NOQA
HIGHLIGHTS = "return document.querySelectorAll('.highlight').length;"
RELOAD = "location.reload();"
SCROLL_INTO_VIEW = 'arguments[0].scrollIntoView();'
SHIFT_VIEW_BY = 'window.scrollBy(0, arguments[0])'


class Color(Enum):
    """Highlight color options."""

    BLUE = "blue"
    GREEN = "green"
    PINK = "pink"
    PURPLE = "purple"
    YELLOW = "yellow"

    def __str__(self):
        return self.value

    @classmethod
    def from_html_class(cls, classes: str) -> Color:
        """Get the Color enum from the HTML class string.

        :param str classes: the HTML element class attribute string
        :return: the enum identity for the color found in the string
        :rtype: Color
        :raises ValueError: if a color is not found in the HTML attribute

        """
        class_list = set(classes.split())
        color_list = set([color.value for color in cls.options()])
        return cls.from_color_string(list(class_list & color_list)[0])

    @classmethod
    def from_color_string(cls, color: str) -> Color:
        """Get the Color enum from the color value string.

        :param str color: the Color value
        :return: the enum identity for that color string
        :rtype: Color
        :raises ValueError: if the color is not a valid Color

        """
        for option in cls.options():
            if option.value == color:
                return option
        raise ValueError(f"{color} not an available Color")

    @classmethod
    def options(cls) -> List[Color]:
        return [color for _, color in cls.__members__.items()]


class FontProperties:
    def is_bold(self, element):
        return element.value_of_css_property("font-weight") == "400"


class Highlight:
    """Supplimental resources for book highlighting."""

    Offset = Tuple[int, int]

    COLORS = Color.options()
    RANDOM = "randomize"
    ENTIRE = "all"

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
        return choice(cls.COLORS)


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
    def clear_field(cls, driver, field):
        """Clear the contents of text-type fields.

        :param driver: a selenium webdriver
        :param field: an input field to interact with
        :type driver: Webdriver
        :type field: WebElement
        :returns: None
        """
        sleep(0.1)
        if driver.name == 'firefox':
            special = Keys.COMMAND if system() == 'Darwin' else Keys.CONTROL
            ActionChains(driver) \
                .click(field) \
                .key_down(special) \
                .send_keys('a') \
                .key_up(special) \
                .send_keys(Keys.DELETE) \
                .perform()
            return
        clear = []
        for _ in range(len(field.get_attribute('value'))):
            clear.append(Keys.DELETE)
            clear.append(Keys.BACKSPACE)
        field.send_keys(clear)

    @classmethod
    def click_option(cls, driver, locator=None, element=None, scroll_to=False):
        """Click on elements which cause Safari 500 errors."""
        element = element if element else driver.find_element(*locator)
        if scroll_to or type(scroll_to) in (int, float):
            shift = int(scroll_to) if int(scroll_to) != 1 else 0
            Utilities.scroll_to(driver=driver, element=element, shift=shift)
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
                    sleep(1.0)
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
    def scroll_to(
            cls, driver, element_locator=None, element=None, shift=0):
        """Scroll the screen to the element.

        :param driver: the selenium webdriver browser object
        :param element_locator: a By selector and locator tuple (str, str)
        :param element: a specific webelement
        :param shift: adjust the page vertically by a set number of pixels
                > 0 scrolls down, < 0 scrolls up
        :returns: None
        """
        target = element if element else driver.find_element(*element_locator)
        driver.execute_script(SCROLL_INTO_VIEW, target)
        if shift != 0:
            driver.execute_script(SHIFT_VIEW_BY, shift)

    @classmethod
    def scroll_top(cls, driver):
        """Scroll to the top of the browser screen.

        :param driver: the selenium webdriver object
        :returns: None

        """
        driver.execute_script("window.scrollTo(0, 0);")
        sleep(0.75)
