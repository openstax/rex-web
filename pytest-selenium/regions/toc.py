from typing import List

from selenium.common.exceptions import ElementNotInteractableException, TimeoutException
from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webelement import WebElement

from regions.base import Region
from utils.utility import Utilities, units, eob, eoc


class TableOfContents(Region):

    _root_locator = (By.CSS_SELECTOR, "ol")
    _active_section_locator = (By.CSS_SELECTOR, "[aria-label='Current Page']")
    _preface_section_link_locator = (By.CSS_SELECTOR, "[href=preface]")
    _next_section_locator = (By.CSS_SELECTOR, "[aria-label='Current Page'] ~ li > a")
    _section_link_locator = (By.CSS_SELECTOR, "ol li a")
    _unit_link_locator = (By.CSS_SELECTOR, "[data-type='unit']")
    _chapter_link_locator = (By.CSS_SELECTOR, "[data-type='chapter']")
    _eoc_link_locator = (By.CSS_SELECTOR, "[data-type='eoc-dropdown']")
    _eob_link_locator = (By.CSS_SELECTOR, "[data-type='eob-dropdown']")

    @property
    def active_section(self):
        return self.find_element(*self._active_section_locator)

    @property
    def chapters(self) -> List[WebElement]:
        """Return the list of chapters in TOC.

        :return: the list of available book chapters
        :rtype: list(WebElement)

        """
        return self.find_elements(*self._chapter_link_locator)

    @property
    def eob_link(self):
        return self.find_elements(*self._eob_link_locator)

    @property
    def eoc_link(self) -> List[WebElement]:
        return self.find_elements(*self._eoc_link_locator)

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
    def total_eoc(self) -> int:
        return len(self.eoc_link)

    @property
    def total_chapters(self) -> int:
        return len(self.chapters)

    @property
    def units(self) -> List[WebElement]:
        return self.find_elements(*self._unit_link_locator)

    @property
    def total_units(self) -> int:
        return len(self.units)

    def collapse_chapter(self, chapter: int):
        """Collapse a chapter from TOC.

        :param int chapter: the chapter number to collapse
        :return: None

        """
        # chapters = self.driver.execute_script(
        #     "return document.querySelectorAll" f"('{self._chapter_link_selector}');"
        # )
        self.driver.execute_script(
            "return arguments[0].removeAttribute('open');", self.chapters[chapter]
        )

    def collapse_eob(self):
        """Collapse end of book link from TOC."""

        self.driver.execute_script("return arguments[0].removeAttribute('open');", self.eob_link)

    def collapse_eoc(self, eoc):
        """Collapse an end of chapter link from TOC.

        :param int eoc: the unit number to collapse
        :return: None

        """

        self.driver.execute_script(
            "return arguments[0].removeAttribute('open');", self.eoc_link[eoc]
        )

    def collapse_unit(self, unit: int):
        """Collapse an unit from TOC.

        :param int unit: the unit number to collapse
        :return: None

        """

        self.driver.execute_script("return arguments[0].removeAttribute('open');", self.units[unit])

    def expand_chapter(self, chapter: int):
        """Expand a chapter from TOC.

        :param int chapter: the chapter number to expand
        :return: None

        """
        # chapters = self.driver.execute_script(
        #     "return document.querySelectorAll" f"('{self._chapter_link_selector}');"
        # )
        self.driver.execute_script(
            "return arguments[0].setAttribute('open', '1');", self.chapters[chapter]
        )

    def expand_eob(self):
        """Expand end of book link from TOC."""

        self.driver.execute_script("return arguments[0].setAttribute('open', '1');", self.eob_link)

    def expand_eoc(self, eoc):
        """Expand an end of chapter link from TOC.

        :param int eoc: the eoc number to expand
        :return: None

        """

        self.driver.execute_script(
            "return arguments[0].setAttribute('open', '1');", self.eoc_link[eoc]
        )

    def expand_unit(self, unit: int):
        """Expand a unit from TOC.

        :param int unit: the unit number to expand
        :return: None

        """

        self.driver.execute_script(
            "return arguments[0].setAttribute('open', '1');", self.units[unit]
        )

    def click_units(self, n: int, book_slug):
        for unit in range(self.total_units):
            self.expand_unit(unit)
            for chapter in range(self.total_chapters):
                self.expand_chapter(chapter)
                try:
                    self.sections[n].click()
                    return
                except ElementNotInteractableException:
                    if eoc(book_slug) is False:
                        self.collapse_chapter(chapter)
            self.collapse_unit(unit)
            continue
        return

    def click_eob(self, n: int):
        self.expand_eob()
        try:
            self.sections[n].click()
        except ElementNotInteractableException:
            self.collapse_eob()

    def click_chapter(self, n: int, book_slug):
        for chapter in range(self.total_chapters):
            self.expand_chapter(chapter)
            try:
                self.sections[n].click()
                return
            except ElementNotInteractableException:
                if eoc(book_slug) is False:
                    self.collapse_chapter(chapter)
        return

    def click_section(self, book_slug, n: int):
        try:
            self.sections[n].click()
        except ElementNotInteractableException:
            if units(book_slug) is True:
                self.click_units(n, book_slug)
            elif units(book_slug) is False:
                self.click_chapter(n, book_slug)
            elif eob(book_slug) is True:
                self.click_eob(n)
            else:
                print("book might have some other nest")

    def view_next_section(self):
        """Click on the next section in the current chapter."""
        next_sections = self.find_elements(*self._next_section_locator)
        Utilities.click_option(self.driver, element=next_sections[0])
        Utilities.parent_page(self).wait_for_page_to_load()

    class ContentPage(Region):

        _is_active_locator = (By.XPATH, "./..")

        _active_page_mark_selector = '[aria-label="Current Page"]'

        WAIT = "return document.querySelectorAll" f"('{_active_page_mark_selector}');"

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
                self.wait.until(lambda _: bool(self.driver.execute_script(self.WAIT)))
            except TimeoutException:
                return False
            parent = self.find_element(*self._is_active_locator)
            return "Current Page" in parent.get_attribute("outerHTML")
