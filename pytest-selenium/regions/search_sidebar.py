from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as expected

from regions.base import Region
from utils.utility import Utilities


class SearchSidebar(Region):
    _root_locator = (By.CSS_SELECTOR, 'div [data-testid="search-results-sidebar"]')
    _no_results_locator = (By.XPATH, "//*[contains(text(), 'Sorry, no results found for')]")
    _close_sidebar_locator = (By.CSS_SELECTOR, 'button[class*="CloseIconButton"]')

    @property
    def no_results_message(self):
        return self.find_element(*self._no_results_locator).get_attribute("textContent")

    @property
    def close_search_sidebar_button(self):
        return self.find_element(*self._close_sidebar_locator)

    def close_search_sidebar(self):
        Utilities.click_option(self.driver, element=self.close_search_sidebar_button)
        return self.wait.until(expected.invisibility_of_element(self.close_search_sidebar_button))
