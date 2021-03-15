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

        .. note:: We actually navigate using the Enter key because scrolling
                  the page can be flaky
                  (`StackOverflow <https://stackoverflow.com/a/39918249>`)

        :return: the selected element
        :rtype: WebElement

        Clicks the given element, even if it is offscreen, by sending the ENTER
        key.

        """
        element.send_keys(Keys.ENTER)
        return element
