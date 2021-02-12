from typing import List

from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webelement import WebElement

from regions.base import Region


class TableOfContents(Region):

    _root_locator = (By.CSS_SELECTOR, "ol")

    _preface_section_link_locator = (By.CSS_SELECTOR, "[href=preface]")
    _section_link_locator = (By.CSS_SELECTOR, "ol li a")
    _active_section_locator = (By.CSS_SELECTOR, "[aria-label='Current Page']")

    _chapter_link_selector = "li details"

    @property
    def active_section(self):
        return self.find_element(*self._active_section_locator)

    @property
    def chapters(self) -> List[WebElement]:
        """Return a list of chapters.

        :return: the list of available book chapters
        :rtype: list(WebElement)

        """
        return self.driver.execute_script(
            f"return document.querySelectorAll('{self._chapter_link_selector}');"
        )

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

    def expand_chapter(self, n: int):
        """Expand a chapter from TOC.

        :param int n: chapter number
        """
        self.driver.execute_script(
            "arguments[0].setAttribute('open', '1');", self.chapters[n]
        )

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
        def is_active(self) -> bool:
            """Return True if 'Current Page' found in the section's HTML.

            :return: ``True`` if 'Current Page' found in the section HTML
            :rtype: bool

            """
            parent = self.find_element(*self._is_active_locator)
            return "Current Page" in parent.get_attribute("outerHTML")
