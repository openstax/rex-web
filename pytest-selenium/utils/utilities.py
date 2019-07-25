# from selenium.webdriver.common.keys import Keys
# from selenium.webdriver.remote.webelement import WebElement


# class Utility(object):
#     """Helper functions for various Pages actions."""

#     @classmethod
#     def has_children(cls, element):
#         """Return True if a specific element has one or more children.
#         :param element: a webelement
#         :returns: True if the element has one or more child elements
#         """
#         return len(element.find_elements("xpath", "./*")) > 0


# class WaitForTitleChange(object):
#     def click_and_wait_for_load(self, element: WebElement = None) -> None:
#         """Clicks an offscreen element and waits for title to load.

#         Clicks the given element, even if it is offscreen, by sending the ENTER key.
#         Returns after loading the last element (title) of the page).
#         """
#         title_before_click = self.page_title
#         target = element if element else self.root
#         target.send_keys(Keys.ENTER)
#         return self.wait.until(lambda _: title_before_click != (self.page_title))
