from pages.base import Page
from selenium.webdriver.common.by import By


class WebBase(Page):

    _async_hide_locator = (By.CSS_SELECTOR, '.async-hide')

    @property
    def loaded(self):
        """Return True when the page-loaded class is added to the body tag."""
        return not self.find_elements(*self._async_hide_locator)
