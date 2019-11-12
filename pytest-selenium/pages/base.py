from tests.conftest import DESKTOP, MOBILE

import pypom

from selenium.webdriver.remote.webelement import WebElement
from selenium.common.exceptions import ElementNotInteractableException
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By


class Page(pypom.Page):
    def __init__(self, driver, base_url=None, timeout=30, **url_kwargs):
        super().__init__(driver, base_url, timeout, **url_kwargs)

    _title_locator = (By.TAG_NAME, "title")

    @property
    def page_title(self):
        return self.find_element(*self._title_locator).get_attribute("innerHTML")

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
        """Clicks an offscreen element and waits for title to load.
        Clicks the given element, even if it is offscreen, by sending the ENTER key.
        Returns after loading the last element (title) of the page).
        """
        title_before_click = self.page_title
        element.send_keys(Keys.ENTER)
        return self.wait.until(lambda _: title_before_click != (self.page_title))

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

    def offscreen_click(self, element=None):
        """Clicks an offscreen element (or the region's root).

        Clicks the given element, even if it is offscreen, by sending the ENTER key.
        Returns the element.
        """
        # We actually navigate using the ENTER key because scrolling the page can be flaky
        # https://stackoverflow.com/a/39918249
        # return self.page.offscreen_click(element or self.root)
        element.send_keys(Keys.ENTER)
        return element

    def username(self, element):
        return element.get_attribute("textContent")

    def open_new_tab(self):
        self.driver.execute_script("""window.open("","_blank");""")
        self.wait.until(lambda b: len(b.window_handles) != 1)

    def switch_to_window(self, n):
        self.driver.switch_to_window(self.driver.window_handles[n])
        self.wait.until(lambda b: (b.current_window_handle == n))
