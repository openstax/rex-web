from selenium.webdriver.common.by import By

from regions.base import Region

import re


class SearchSidebar(Region):
    _root_locator = (By.CSS_SELECTOR, '[data-testid="search-results-sidebar"]')
    _no_results_locator = (By.XPATH, "//*[contains(text(), 'Sorry, no results found for')]")
    _search_results_locator = (By.CSS_SELECTOR, "ol li a")
    _chapter_div_locator = (By.CSS_SELECTOR, "ol li summary")

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
            self.SearchPanelSection(self.page, section)
            for section in self.find_elements(*self._search_results_locator)
        ]

    @property
    def chapter_divider(self):
        return [
            self.SearchPanelChapter(self.page, chapter)
            for chapter in self.find_elements(*self._chapter_div_locator)
        ]

    @property
    def first_search_result(self):
        return self.search_results[0]

    class SearchPanelSection(Region):
        _section_locator = (By.XPATH, "./../*[1]//span[@class='os-text']")

        def click(self):
            self.page.click_and_wait_for_load(self.root)

        @property
        def section_title(self):
            return self.find_element(*self._section_locator).get_attribute("textContent")

    class SearchPanelChapter(Region):
        _chapter_locator = (By.XPATH, "./../details")

        def is_chapter_title_expanded(self):
            return self.find_element(*self._chapter_locator)

    def content_of_first_search_result_is_loaded(self):
        section_names = [self.first_search_result.section_title]
        page_title = self.page.page_title

        for section_name in section_names:
            if re.search(section_name, page_title):
                return True
            else:
                return False
