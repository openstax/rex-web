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

    # _unit_link_selector = (By.XPATH, "//ol/li[1] / details /../../..")
    _unit_link_selector = (By.XPATH, "// li[1] / a /../../../../../..")
    # _chapter_link_selector = "li details ol li details"
    _chapter_link_selector = (By.XPATH, "// li[1] / a /../../..")
    _chapter_with_units_link_selector = (By.XPATH, "/li/details | //li/details/ol/li/details")
    _eoc_link_selector = (By.CSS_SELECTOR, "li details ol li details")
    _eob_link_locator = (By.CSS_SELECTOR, "ol li details")

    @property
    def eob_link(self):
        return self.find_elements(*self._eob_link_locator)[-1]

    def expand_eob(self):
        """Expand a eob link from TOC.

        :param int eob: the eob number to expand
        :return: None

        """

        self.driver.execute_script("return arguments[0].setAttribute('open', '1');", self.eob_link)

    def collapse_eob(self):
        """Collapse an eob link from TOC.

        :param int eob: the unit number to collapse
        :return: None

        """

        self.driver.execute_script("return arguments[0].removeAttribute('open');", self.eob_link)

    @property
    def units(self) -> List[WebElement]:
        return self.find_elements(*self._unit_link_selector)

    @property
    def total_units(self) -> int:
        return len(self.units)

    @property
    def eoc_link(self) -> List[WebElement]:
        return self.find_elements(*self._eoc_link_selector)

    @property
    def total_eoc(self) -> int:
        return len(self.eoc_link)

    def expand_eoc(self):
        """Expand a eoc link from TOC.

        :param int eoc: the eoc number to expand
        :return: None

        """

        self.driver.execute_script(
            "return arguments[0].setAttribute('open', '1');", self.eoc_link[eoc]
        )

    def collapse_eoc(self):
        """Collapse an eoc link from TOC.

        :param int eoc: the unit number to collapse
        :return: None

        """

        self.driver.execute_script(
            "return arguments[0].removeAttribute('open');", self.eoc_link[eoc]
        )

    def expand_unit(self, unit: int):
        """Expand a unit from TOC.

        :param int unit: the unit number to expand
        :return: None

        """

        self.driver.execute_script(
            "return arguments[0].setAttribute('open', '1');", self.units[unit]
        )

    def collapse_unit(self, unit: int):
        """Collapse an unit from TOC.

        :param int unit: the unit number to collapse
        :return: None

        """

        self.driver.execute_script("return arguments[0].removeAttribute('open');", self.units[unit])

    @property
    def active_section(self):
        return self.find_element(*self._active_section_locator)

    @property
    def chapters(self) -> List[WebElement]:
        """Return a list of chapters.

        :return: the list of available book chapters
        :rtype: list(WebElement)

        """
        # return self.driver.execute_script(
        #     "return document.querySelectorAll" f"('{self._chapter_link_selector}');")

        return self.find_elements(*self._chapter_link_selector)

    @property
    def total_chapters(self) -> int:
        return len(self.chapters)

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

    def click_units(self, n: int):
        try:
            self.sections[n].click()
        except ElementNotInteractableException:
            for unit in range(self.total_units):
                self.expand_unit(unit)
                for chapter in range(0, self.total_chapters):
                    self.expand_chapter(chapter)
                    try:
                        self.sections[n].click()
                        return
                    except ElementNotInteractableException:
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
            return

    def click_chapter(self, n: int):
        for chapter in range(0, self.total_chapters):
            self.expand_chapter(chapter)
            try:
                self.sections[n].click()
                return
            except ElementNotInteractableException:
                self.collapse_chapter(chapter)

    def click_eoc(self, n: int):
        self.expand_eoc()
        try:
            self.sections[n].click()
        except ElementNotInteractableException:
            self.collapse_eoc()
            return

    # def step_value(self):

    def click_section(self, book_slug, n: int):
        try:
            self.sections[n].click()
        except ElementNotInteractableException:
            if eob(book_slug) is True:
                self.click_eob(n)
            elif units(book_slug) is True:
                self.click_units(n)
            elif eoc(book_slug) is True:
                self.click_eoc(n)
            elif units(book_slug) is False:
                self.click_chapter(n)
            else:
                print("book might have eoc")

    def click_sections(self, n: int):
        try:
            self.sections[n].click()
        except ElementNotInteractableException:
            # If book has unit, expand unit & then expand chapter and then try section click
            if self.units:
                for unit in range(self.total_units):
                    self.expand_unit(unit)
                    for chapter in range(0, self.total_chapters, 2):
                        self.expand_chapter(chapter)
                        try:
                            self.sections[n].click()
                            return
                        # If book has nested EOC, expand EOC & try section click
                        except ElementNotInteractableException:
                            if self.eoc_link:
                                for eocs in range(chapter + 1, self.total_eoc):
                                    self.expand_eoc(eocs)
                                    try:
                                        self.sections[n].click()
                                        return
                                    except ElementNotInteractableException:
                                        # If book has nested EOB, expand EOB & try section click
                                        if self.eob_link:
                                            self.expand_eob()
                                            try:
                                                self.sections[n].click()
                                            except ElementNotInteractableException:
                                                self.collapse_eob()

                                        self.collapse_eoc(eocs)
                                        break
                            self.collapse_chapter(chapter)
                            continue
                    self.collapse_unit(unit)
                    continue
                return

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

        # def click_section(self):
        #     try:
        #         self.click()
        #     except ElementNotInteractableException:
        #         # expand previous details tag
        #         # Xpath_section_link = self.find_elements(By.XPATH, "//ol/li/a/../../../../../..")
        #         # expand_previous_dropdown = self.root/..
        #         open_chapter = "return arguments[0].setAttribute('open', '1');"
        #         self.driver.execute_script(open_chapter, self.units[1])
        #
        #         # try:
        #         #     self.click()
        #         # except ElementNotInteractableException:
        #         #         # expand previous details tag
        #         #     try:
        #         #         self.click()
        #         #     except NoSuchElementException:
        #         #             # do something else
        #         #
        #
        # #     chapter_is_open = 'return arguments[0].hasAttribute("open");'
        # #         return self.driver.execute_script(chapter_is_open, self.root)
        # #
        # # XPATH_SEARCH = (
        # #     "//span[contains(text(),'{term}') and contains(@class,'highlight')]")
        # #
        # # phrase_searched = book.content.find_elements(
        # #     By.XPATH, XPATH_SEARCH.format(term=phrase))
