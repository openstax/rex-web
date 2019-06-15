import pypom

from selenium.webdriver.common.keys import Keys


class Region(pypom.Region):
    @property
    def is_displayed(self):
        return self.root.is_displayed()

    def wait_for_region_to_display(self):
        self.page.wait_for_region_to_display(self)
        return self

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

    def TOC_page_offscreen_click_and_wait_for_new_title_to_load(self, element):
        """Clicks a page link in TOC and waits for title to load.

        Clicks the given element for a page link in TOC, even if it is offscreen, by sending the ENTER key.
        Returns after loading the last element (title) of the page).
        """

        title_before_click = self.page.title_before_click
        self.offscreen_click(element)
        return self.wait.until(
            lambda _: title_before_click != (self.page.title.get_attribute("innerHTML") or "")
        )
