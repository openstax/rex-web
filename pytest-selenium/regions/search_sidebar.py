from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as expected

from regions.base import Region
from utils.utility import Utilities

VISIBILITY = "window.getComputedStyle(arguments[0]).visibility == 'visible';"


class SearchSidebar(Region):

    _root_locator = (By.CSS_SELECTOR, "[data-testid='search-results-sidebar']")

    _close_sidebar_locator = (By.CSS_SELECTOR, "[class*=CloseIconButton]")
    _no_results_locator = (By.CSS_SELECTOR, "[class*=SearchQueryAlignment]")
    _search_result_locator = (By.CSS_SELECTOR, "[data-testid$=result]")
    _search_results_sidebar_locator = (
        By.XPATH,
        "//div[@data-testid = 'search-results-sidebar']/ol",
    )

    # fmt: off
    @property
    def no_results_message(self):
        try:
            return (self.find_element(*self._no_results_locator)
                    .get_attribute("textContent"))
        except NoSuchElementException:
            return ""

    @property
    def close_search_sidebar_button(self):
        return self.find_element(*self._close_sidebar_locator)

    def close_search_sidebar(self):
        try:
            button = self.close_search_sidebar_button
        except NoSuchElementException:
            return
        Utilities.click_option(self.driver, element=button)
        self.wait.until(
            lambda _: not self.driver.execute_script(
                VISIBILITY, self.close_search_sidebar_button))

    def search_results(self, term: str = ""):
        return [result
                for result
                in self.find_elements(*self._search_result_locator)
                if term in result.get_attribute("textContent")]
    # fmt: on

    @property
    def is_displayed(self):
        try:
            return self.root.is_displayed()
        except NoSuchElementException:
            return False

    @property
    def search_results_sidebar(self):
        return self.find_element(*self._search_results_sidebar_locator)

    @property
    def search_results_present(self):
        return self.search_results_sidebar.is_displayed

    @property
    def search_results_not_displayed(self):
        return self.wait.until(
            expected.invisibility_of_element_located(self.search_results_sidebar)
        )
