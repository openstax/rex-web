import random

from selenium.webdriver.common.keys import Keys
from selenium.webdriver.remote.webelement import WebElement


class WaitForTitleChange(object):
    def click_and_wait_for_load(self, element: WebElement = None) -> None:
        """Clicks an offscreen element and waits for title to load.
        Clicks the given element, even if it is offscreen, by sending the ENTER key.
        Returns after loading the last element (title) of the page).
        """
        title_before_click = self.page_title
        target = element if element else self.root
        target.send_keys(Keys.ENTER)
        return self.wait.until(lambda _: title_before_click != (self.page_title))


class Library(object):
    def __init__(self):
        self._book_slug_list = ["chemistry-2e", "chemistry-atoms-first-2e"]

    @property
    def books(self) -> [str]:
        return self._book_slug_list

    def random_book_slug(self):
        return random.choice(self.books)
