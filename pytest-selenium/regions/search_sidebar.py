from selenium.webdriver.common.by import By

from regions.base import Region


class SearchSidebar(Region):
    _root_locator = (By.CSS_SELECTOR, '[data-testid="search-results-sidebar"]')
    _no_results_locator = (By.XPATH, "//*[contains(text(), 'Sorry, no results found for')]")
    _search_results_locator = (By.CSS_SELECTOR, "ol li a")

    @property
    def has_no_results(self):
        if self.is_element_present(*self._no_results_locator):
            return True

    @property
    def no_results_message(self):
        return self.find_element(*self._no_results_locator).get_attribute("textContent")

    @property
    def search_results(self):
        return [
            self.ContentPage(self.page, section)
            for section in self.find_elements(*self._search_results_locator)
        ]

    @property
    def first_search_result(self):
        return self.search_results[0]

    class ContentPage(Region):
        _section_locator = (By.XPATH, "./../*[1]")

        def click(self):
            self.page.click_and_wait_for_load(self.root)

        @property
        def section_title(self):
            return self.find_element(*self._section_locator).get_attribute("textContent")
