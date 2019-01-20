from time import sleep

import pypom
from selenium.webdriver.common.keys import Keys


class Page(pypom.Page):
    def __init__(self, driver, base_url=None, timeout=30, **url_kwargs):
        super().__init__(driver, base_url, timeout, **url_kwargs)

    @property
    def current_url(self):
        return self.driver.current_url

    @property
    def active_element(self):
        return self.driver.switch_to.active_element

    def wait_for_region_to_display(self, region):
        self.wait.until(lambda _: region.is_displayed)
        return self

    def wait_for_element_to_display(self, element):
        self.wait.until(lambda _: element.is_displayed())
        return self

    def scroll_down(self):
        """Scrolls using page down once. Returns the active element."""
        active_element = self.active_element
        active_element.send_keys(Keys.PAGE_DOWN)
        return active_element

    def scroll_up(self):
        """Scrolls using page up once. Returns the active element."""
        active_element = self.active_element
        active_element.send_keys(Keys.PAGE_UP)
        return active_element

    def scroll_to(self, element=None):
        """Scrolls to the given element. Returns the element."""
        from selenium.webdriver.common.action_chains import ActionChains

        ActionChains(self.driver).move_to_element(element).perform()
        return element

    def offscreen_click(self, element):
        """Clicks an offscreen element.

        Clicks the given element, even if it is offscreen, by sending the ENTER key.
        Returns the element.
        """
        # We actually navigate using the ENTER key because scrolling the page can be flaky
        # https://stackoverflow.com/a/39918249
        element.send_keys(Keys.ENTER)
        return element

    def get_window_size(self, dimension=None):
        """Return the current window dimensions."""
        get_size = self.driver.get_window_size()
        if not dimension:
            return get_size
        if dimension not in get_size:
            raise IndexError("Unknown dimension: {}".format(dimension))
        return get_size[dimension]

    def set_window_size(self, width=0, height=0):
        """Attempt to change the browser window size."""
        if width >= 1 and height >= 1:
            self.driver.set_window_size(width, height)
            sleep(1.0)

    def set_window_position(self, x=0, y=0):
        """Move the browser window anchor."""
        if x >= 0 and y >= 0:
            self.driver.set_window_position(x, y)
            sleep(1.0)

    def refresh(self):
        """Refresh the current page"""
        self.driver.refresh()

    def back(self):
        """Go to the previous page"""
        self.driver.back()
