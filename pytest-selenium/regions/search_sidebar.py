import re
from typing import List
from selenium.webdriver.remote.webelement import WebElement

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
    _chapter_result_option_locator = (By.CSS_SELECTOR, "li a")
    _rkt_result_option_locator = (By.CSS_SELECTOR, "div > a")
    _search_result_locator = (By.CSS_SELECTOR, "[data-testid$=result]")
    _search_results_sidebar_locator = (
        By.XPATH,
        "//div[@data-testid = 'search-results-sidebar']/nav",
    )

    # fmt: off
    @property
    def no_results_message(self):
        results = self.find_elements(*self._no_results_locator)
        if results:
            return results[0].text
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

    @property
    def chapter_results(self) -> List[WebElement]:
        """Return the list of chapter search results.

        :return: the list of book pages containing some or all of the search
            terms
        :rtype: list(WebElement)

        """
        return self.find_elements(*self._chapter_result_option_locator)

    @property
    def chapter_search_result_total(self):
        return len(self.chapter_results)

    # fmt: on

    @property
    def is_displayed(self):
        try:
            return self.root.is_displayed()
        except NoSuchElementException:
            return False

    @property
    def rkt_results(self) -> List[WebElement]:
        """Return the list of related key term search results.

        :return: the list of book pages containing some or all of the related key term search
            terms
        :rtype: list(WebElement)

        """
        return self.find_elements(*self._rkt_result_option_locator)

    @property
    def rkt_search_result_total(self):
        return len(self.rkt_results)

    @property
    def search_results_sidebar(self):
        return self.find_element(*self._search_results_sidebar_locator)

    @property
    def search_results_present(self):
        return self.wait.until(
            expected.visibility_of_element_located(self._search_results_sidebar_locator)
        )

    @property
    def search_results_not_displayed(self):
        return self.wait.until(
            expected.invisibility_of_element_located(self.search_results_sidebar)
        )

    def search_results(self, term: str = "") -> List[WebElement]:
        """Return the search results from search sidebar.

        :param str term: search term defined in the test
        :return: search results displayed in search sidebar
        :rtype: list(WebElement)

        Search functionality works based on fuzzy search
        So split into single words when the search term has multiple words
        Return the search results if atleast one of the words in the search
        term is present in the search sidebar.

        """
        split_search_term = re.findall(r"\w+", term)
        for x in split_search_term:
            try:
                return [
                    result
                    for result in self.find_elements(*self._search_result_locator)
                    if x in result.get_attribute("textContent")
                ]
            except IndexError:
                continue
