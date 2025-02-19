from typing import List

from selenium.common.exceptions import TimeoutException
from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webelement import WebElement

from regions.base import Region
from utils.utility import Utilities


class TableOfContents(Region):

    _root_locator = (By.CSS_SELECTOR, "ol")

    _active_section_locator = (By.CSS_SELECTOR, "[aria-label='Current Page']")
    _preface_section_link_locator = (By.CSS_SELECTOR, "[href=preface]")
    _next_section_locator = (
        By.CSS_SELECTOR,
        "[aria-label='Current Page'] ~ li > a"
    )
    _section_link_locator = (By.CSS_SELECTOR, "ol li a")
    _active_section_locator = (By.CSS_SELECTOR, "[aria-label='Current Page']")

    _chapter_link_selector = "li a"

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
            "return document.querySelectorAll"
            f"('{self._chapter_link_selector}');"
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
            for section_link
            in self.find_elements(*self._section_link_locator)
        ]

    def expand_chapter(self, chapter: int):
        """Expand a chapter from TOC.

        :param int chapter: the chapter number to expand
        :return: None

        """
        chapters = self.driver.execute_script(
            "return document.querySelectorAll"
            f"('{self._chapter_link_selector}');"
        )
        self.driver.execute_script(
            "return arguments[0].setAttribute('open', '1');",
            chapters[chapter]
        )

    @property
    def first_section(self):
        return self.sections[0]

    @property
    def last_section(self):
        return self.sections[-1]

    @property
    def next_section_page_slug(self) -> str:
        """Return the next book section's page slug.

        :return: the next book section's page slug
        :rtype: str

        """
        next_sections = self.find_elements(*self._next_section_locator)
        return next_sections[0].get_attribute("href").split("/")[-1]

    def view_next_section(self):
        """Click on the next section in the current chapter."""
        next_sections = self.find_elements(*self._next_section_locator)
        Utilities.click_option(self.driver, element=next_sections[0])
        Utilities.parent_page(self).wait_for_page_to_load()

    class ContentPage(Region):

        _is_active_locator = (By.XPATH, "./..")

        _active_page_mark_selector = '[aria-label=\"Current Page\"]'

        WAIT = (
            "return document.querySelectorAll"
            f"('{_active_page_mark_selector}');"
        )

        def click(self):
            self.page.click_and_wait_for_load(self.root)

        @property
        def section_title(self):
            return self.root.get_attribute("textContent")

        @property
        def is_active(self) -> bool:
            """Return True if 'Current Page' found in the section's HTML.

            .. note:: We wait until a page is marked as being currently open.

            :return: ``True`` if 'Current Page' found in the section HTML
            :rtype: bool

            """
            try:
                self.wait.until(
                    lambda _: bool(self.driver.execute_script(self.WAIT))
                )
            except TimeoutException:
                return False
            parent = self.find_element(*self._is_active_locator)
            return "Current Page" in parent.get_attribute("outerHTML")
