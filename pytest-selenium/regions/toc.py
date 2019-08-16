from selenium.webdriver.common.by import By

from regions.base import Region


class TableOfContents(Region):
    _root_locator = (By.CSS_SELECTOR, "ol")
    _section_link_locator = (By.CSS_SELECTOR, "ol li a")
    _active_section_locator = (By.CSS_SELECTOR, "[aria-label='Current Page']")
    _default_page_locator = (By.CSS_SELECTOR, "li:nth-child(2) li:nth-of-type(1) a")

    @property
    def active_section(self):
        return self.find_element(*self._active_section_locator)

    @property
    def default_page_slug(self):
        default_page_url = self.find_element(*self._default_page_locator).get_attribute("href")
        return default_page_url.split("/")[-1]

    @property
    def sections(self):
        return [
            self.ContentPage(self.page, section_link)
            for section_link in self.find_elements(*self._section_link_locator)
        ]

    @property
    def first_section(self):
        return self.sections[0]

    @property
    def last_section(self):
        return self.sections[-1]

    class ContentPage(Region):
        _is_active_locator = (By.XPATH, "./..")

        def click(self):
            self.page.click_and_wait_for_load(self.root)

        @property
        def section_title(self):
            return self.root.get_attribute("textContent")

        @property
        def is_active(self):
            html = self.find_element(*self._is_active_locator).get_attribute("outerHTML")
            try:
                assert "Current Page" in html
            except AssertionError:
                return False
            else:
                return True
