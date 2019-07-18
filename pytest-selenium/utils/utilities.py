from selenium.webdriver.common.keys import Keys
from selenium.webdriver.remote.webelement import WebElement


class Utility(object):
    """Helper functions for various Pages actions."""

    @classmethod
    def has_children(cls, element):
        """Return True if a specific element has one or more children.
        :param element: a webelement
        :returns: True if the element has one or more child elements
        """
        return len(element.find_elements("xpath", "./*")) > 0


class WaitForTitleChange(object):
    """."""

    def click_and_wait_for_load(self, element: WebElement = None) -> None:
        """."""
        title_before_click = self.page_title
        target = element if element else self.root
        target.send_keys(Keys.ENTER)
        return self.wait.until(lambda _: title_before_click != (self.page_title))
