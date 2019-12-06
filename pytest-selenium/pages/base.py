
from __future__ import annotations

import pypom
from selenium.webdriver.remote.webelement import WebElement
from selenium.common.exceptions import (ElementNotInteractableException,  # NOQA
                                        StaleElementReferenceException)  # NOQA
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By

from tests.conftest import DESKTOP, MOBILE


class Page(pypom.Page):
    def __init__(self, driver, base_url=None, timeout=30, **url_kwargs):
        super().__init__(driver, base_url, timeout, **url_kwargs)

    _title_locator = (By.TAG_NAME, "title")

    @property
    def page_title(self):
        return (self.find_element(*self._title_locator)
                .get_attribute("innerHTML"))

    @property
    def window_width(self):
        return self.driver.get_window_size()["width"]

    @property
    def window_height(self):
        return self.driver.get_window_size()["height"]

    @property
    def is_mobile(self):
        # fuzzy match because scrollbars
        return abs(self.window_width - MOBILE[0]) < 10

    @property
    def is_desktop(self):
        # fuzzy match because scrollbars
        return abs(self.window_width - DESKTOP[0]) < 10

    @property
    def current_url(self):
        return self.driver.current_url

    def wait_for_region_to_display(self, region):
        self.wait.until(lambda _: region.is_displayed)
        return self

    def click_and_wait_for_load(self, element: WebElement):
        """Click an offscreen element and wait for title to load.

        Clicks the given element, even if it is offscreen, by sending the ENTER
        key. Returns after loading the last element (title) of the page).

        """
        title_before_click = self.page_title
        element.send_keys(Keys.ENTER)
        return self.wait.until(
            lambda _: title_before_click != (self.page_title))

    def element_is_not_interactable(self, element):
        try:
            element.send_keys(Keys.ENTER)
        except ElementNotInteractableException:
            return True

        return False

    def width(self, element):
        return (
            self.driver.execute_script(
                "return window.getComputedStyle(arguments[0]).width;", element
            )
        ).strip("px")

    def height(self, element):
        return (
            self.driver.execute_script(
                "return window.getComputedStyle(arguments[0]).height;", element
            )
        ).strip("px")

    @property
    def scroll_position(self):
        return self.driver.execute_script("return window.pageYOffset;")

    @property
    def page_not_scrolled(self):
        return self.driver.execute_script("return window.pageYOffset;") == 0

    def offscreen_click(self, element=None):
        """Clicks an offscreen element (or the region's root).

        Clicks the given element, even if it is offscreen, by sending the ENTER
        key. Returns the element.

        .. note::
           We actually navigate using the ENTER key because scrolling the page
           can be flaky; see https://stackoverflow.com/a/39918249

        """
        # return self.page.offscreen_click(element or self.root)
        element.send_keys(Keys.ENTER)
        return element

    def reload(self) -> Page:
        """Reload the current page.

        Ignore stale element issues because we're reloading the page;
        everything is going to be stale if accessed too quickly
        (multi-process Firefox issue).

        :return: the current page
        :rtype:

        """
        try:
            self.driver.execute_script('location.reload();')
            self.wait_for_page_to_load()
        except StaleElementReferenceException:
            pass
        return self
