from selenium.webdriver.common.by import By

from regions.base import Region


class SearchSidebar(Region):
    _root_locator = (By.CSS_SELECTOR, 'div [data-testid="search-results-sidebar"]')
    _no_results_locator = (By.XPATH, "//*[contains(text(), 'Sorry, no results found for')]")

    @property
    def no_results_message(self):
        return self.find_element(*self._no_results_locator).get_attribute("textContent")
