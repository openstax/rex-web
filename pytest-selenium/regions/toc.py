from selenium.webdriver.common.by import By

from regions.base import Region

TEST = "return document.querySelector('{selector}').setAttribute('open', '1');"


class TableOfContents(Region):

    _root_locator = (By.CSS_SELECTOR, "ol")

    _preface_section_link_locator = (By.CSS_SELECTOR, "[href=preface]")
    _section_link_locator = (By.CSS_SELECTOR, "li a")
    _chapter_link_locator = (By.CSS_SELECTOR, "li")
    _active_section_locator = (By.CSS_SELECTOR, "[aria-label='Current Page']")

    @property
    def active_section(self):
        return self.find_element(*self._active_section_locator)

    @property
    def preface(self):
        """Return the book preface section."""
        preface_link = self.find_element(*self._preface_section_link_locator)
        return self.ContentPage(self.page, preface_link)

    @property
    def sections(self):
        return [
            self.ContentPage(self.page, section_link)
            for section_link in self.find_elements(*self._section_link_locator)
        ]

    @property
    def chapters(self):
        return [
            self.ContentPage(self.page, chapter_link)
            for chapter_link in self.find_elements(*self._chapter_link_locator)
        ]

    @property
    def first_section(self):
        return self.sections[0]

    @property
    def last_section(self):
        return self.sections[-1]

    class ContentPage(Region):
        _is_active_locator = (By.XPATH, "./..")
        _expand_locator = (By.CSS_SELECTOR, "details")

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

        def expand_chapter(self):
            self.driver.execute_script(TEST.format(selector=self._expand_locator[1]))
