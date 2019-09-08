from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys

from pages import content
from pages.base import Page
from regions.base import Region


class SearchSidebar(Region):
    _root_locator = (By.CSS_SELECTOR, '[data-testid="search-results-sidebar"]')
    _no_results_locator = (By.XPATH, "//*[contains(text(), 'Sorry, no results found for ')]")

    @property
    def no_results(self):
        if self.find_element(*self._no_results_locator).is_displayed:
            return True

    # @property
    # def has_no_results(self):
    #     if self.is_element_present(self.no_results):
    #         return True
    #     else:
    #         return False

    @property
    def has_no_results(self):
        if self.is_element_present(*self._no_results_locator):
            return True
        else:
            return False
