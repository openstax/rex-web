from tests.conftest import DESKTOP, MOBILE

import pypom
from selenium.webdriver.common.keys import Keys


class Page(pypom.Page):
    def __init__(self, driver, base_url=None, timeout=30, **url_kwargs):
        super().__init__(driver, base_url, timeout, **url_kwargs)

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

    def offscreen_click(self, element=None):
        """Clicks an offscreen element (or the region's root).

        Clicks the given element, even if it is offscreen, by sending the ENTER key.
        Returns the element.
        """
        # We actually navigate using the ENTER key because scrolling the page can be flaky
        # https://stackoverflow.com/a/39918249
        element.send_keys(Keys.ENTER)
        return element

    def click_and_check_reference_object_has_changed(self, click_element, ref_object, ref_property):
        """Clicks an offscreen element and waits for previous element to change.

        Clicks the given element, even if it is offscreen, by sending the ENTER key.
        Gets a property value from a reference object to save as a previous value.

        Returns after waiting until property of the reference object changes.

        :param click_element: the element that needs to be clicked
        :param ref_object: the reference object that needs to be checked
        :param ref_property: the property on the reference object that should change
        """
        previous_value = getattr(ref_object, ref_property)

        self.offscreen_click(click_element)

        return self.wait.until(
            lambda _: previous_value != (getattr(ref_object, ref_property) or "")
        )
