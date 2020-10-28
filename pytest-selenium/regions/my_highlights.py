"""The My Highlights and Notes modal."""
# fmt: off
from __future__ import annotations

from time import sleep
from typing import List

from pypom import Page
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as expect
from selenium.webdriver.remote.webelement import WebElement

from pages.accounts import Login
from regions.base import Region
from utils.utility import Color, Utilities


class ChapterData(Region):
    """Shared resources for chapter attributes."""

    _number_locator = (
        By.CSS_SELECTOR, ".os-number")
    _title_locator = (
        By.CSS_SELECTOR, ".os-text")

    @property
    def number(self) -> str:
        """Return the chapter or section number, if available.

        :return: the chapter or section number, if found, otherwise an empty
            string for unnumbered sections
        :rtype: str

        """
        try:
            return self.find_element(*self._number_locator).text
        except NoSuchElementException:
            return ""

    @property
    def title(self) -> str:
        """Return the chapter or section title.

        :return: the chapter or section title
        :rtype: str

        """
        return self.find_element(*self._title_locator).text


class FilterSelection(Region):
    """Shared resources for filters."""

    _checkbox_locator = (
        By.CSS_SELECTOR, "label[class*=Checkbox]")
    _select_all_locator = (
        By.CSS_SELECTOR, "[class*=AllOrNone] button:first-child")
    _select_none_locator = (
        By.CSS_SELECTOR, "[class*=AllOrNone] button:last-child")

    def filter_options(self, Option: Region) -> List[Region]:
        """Return the list of filter options.

        :param Region Option: the filter type (Chapter or Color)
        :return: the list of available filters of ``Option`` type
        :rtype: list(:py:class:`MyHighlights.FilterBar.ChapterFilters.Chapter`)
            or list(:py:class:`MyHighlights.FilterBar.ColorFilters.Color`)

        """
        return [Option(self, checkbox)
                for checkbox
                in self.find_elements(*self._checkbox_locator)]

    def select_all(self) -> MyHighlights:
        """Click the select All link to select all filter options.

        :return: the My Highlights and Notes modal
        :rtype: :py:class:`~MyHighlights`

        """
        link = self.find_element(*self._select_all_locator)
        Utilities.click_option(self.driver, element=link)
        return self.page

    def select_none(self) -> MyHighlights:
        """Click the select None link to clear all filter options.

        :return: the My Highlights and Notes modal
        :rtype: :py:class:`~MyHighlights`

        """
        link = self.find_element(*self._select_none_locator)
        Utilities.click_option(self.driver, element=link)
        return self.page


class FilterToggle(Region):
    """The toggle box for a filter option."""

    _checkbox_locator = (By.CSS_SELECTOR, "input")

    @property
    def is_checked(self) -> bool:
        """Return True if the checkbox is checked.

        :return: ``True`` if the checkbox is currently checked
        :rtype: bool

        """
        return self.driver.execute_script(
            "return arguments[0].checked;",
            self.find_element(*self._checkbox_locator))

    def click(self):
        """Click the filter checkbox.

        Toggles between selected and unchecked.

        """
        checkbox = self.find_element(*self._checkbox_locator)
        Utilities.click_option(self.driver, element=checkbox)


class Highlight(Region):
    """An individual highlight with or without a note."""

    _highlight_color_locator = (By.XPATH, "./../..//div[@color]")
    _highlight_note_content_locator = (
        By.CSS_SELECTOR, ".summary-highlight-content ~ div")

    @property
    def color(self) -> Color:
        """Return the highlight color.

        :return: the highlight color
        :rtype: :py:class:`~utils.utility.Color`

        """
        color = self.find_element(*self._highlight_color_locator)
        return Color.from_color_string(color.get_attribute("color"))

    @property
    def content(self) -> str:
        """Return the highlight text content.

        :return: the text portion of a highlight
        :rtype: str

        """
        return self.root.get_attribute("textContent")

    @property
    def has_note(self) -> bool:
        """Return True if the highlight has a note.

        :return: ``True`` if the highlight has an accompanying note
        :rtype: bool

        """
        return bool(
            self.find_elements(*self._highlight_note_content_locator))

    @property
    def note(self) -> str:
        """Return the highlight's note.

        :return: the highlight's note, if present, or an empty string
        :rtype: str

        """
        note = self.find_elements(*self._highlight_note_content_locator)
        if note:
            notes = "".join([item.text for item in note])
            return notes[6:] if notes.startswith("Note:\n") else notes
        return ""


class MyHighlights(Region):
    """The 'My Highlights and Notes' modal."""

    _close_x_button_locator = (
        By.CSS_SELECTOR, "[data-testid=close-highlights-popup]")
    _content_header_locator = (
        By.CSS_SELECTOR, "[class*=Body] h3")
    _back_to_top_button_locator = (
        By.CSS_SELECTOR, "[data-testid=back-to-top-highlights]")
    _filter_bar_locator = (
        By.CSS_SELECTOR, "div[class*=Filters]")
    _loading_animation_locator = (
        By.CSS_SELECTOR, "[data-testid=loader]")
    _log_in_link_locator = (
        By.CSS_SELECTOR, "[href*=accounts]")
    _modal_title_locator = (
        By.CSS_SELECTOR, "[class*=Modal] > h3")
    _my_highlights_body_locator = (
        By.CSS_SELECTOR, "[data-testid=show-myhighlights-body]")
    _my_highlights_data_locator = (
        By.CSS_SELECTOR, "[data-testid=show-myhighlights-body]"
                         " > div:nth-child(2)")

    @property
    def loaded(self) -> bool:
        """Return True when the loader is not found.

        :return: ``True`` when the loading animation is not found in the modal
        :rtype: bool

        """
        return not bool(self.find_elements(*self._loading_animation_locator))

    @property
    def all_highlights(self) -> List[Highlight]:
        """Access the page highlights.

        :return: the list of available highlights
        :rtype: list(:py:class:`~regions.my_highlights.Highlight`)

        """
        highlights = []
        for section in self.highlights.sections:
            highlights = highlights + section.highlights
        return highlights

    @property
    def back_to_top_available(self) -> bool:
        """Return True if the back to top arrow button exists in the modal.

        :return: ``True`` if the back to top arrow button is found
        :rtype: bool

        """
        return bool(self.find_elements(*self._back_to_top_button_locator))

    @property
    def filter_bar(self) -> MyHighlights.FilterBar:
        """Access the My Highlights filter navigation bar.

        :return: the filter bar
        :rtype: :py:class:`~MyHighlights.FilterBar`

        """
        bar = self.find_element(*self._filter_bar_locator)
        return self.FilterBar(self, bar)

    @property
    def heading(self) -> str:
        """Return the modal heading text.

        :return: the modal heading text found within the modal body
        :rtype: str

        """
        return self.find_element(*self._content_header_locator).text

    @property
    def highlights(self) -> MyHighlights.Highlights:
        """Access the main My Highlights and Notes body.

        :return: the main body containing the list of filtered highlights
        :rtype: :py:class:`~MyHighlights.Highlights`

        """
        body_root = self.find_element(*self._my_highlights_data_locator)
        return self.Highlights(self, body_root)

    @property
    def log_in_available(self) -> bool:
        """Return True if the log in link is available.

        :return: ``True`` if the log in link is found
        :rtype: bool

        """
        return bool(self.find_elements(*self._log_in_link_locator))

    @property
    def scroll_position(self) -> int:
        """Return the My Highlights and Notes body scroll position.

        :return: the number of pixels the My Highlights scroll position is from
            the top
        :rtype: int

        """
        return self.driver.execute_script(
            "return arguments[0].scrollTop;",
            self.find_element(*self._my_highlights_body_locator))

    @property
    def title(self) -> str:
        """Return the modal title text.

        :return: the modal title
        :rtype: str

        """
        return self.find_element(*self._modal_title_locator).text

    def back_to_top(self) -> MyHighlights:
        """Click the back to top arrow button.

        :return: the My Highlights and Notes modal scrolled to the top
        :rtype: :py:class:`~regions.my_highlights.MyHighlights`

        """
        if self.back_to_top_available:
            button = self.find_element(*self._back_to_top_button_locator)
            Utilities.click_option(self.driver, element=button)
            sleep(0.33)
            return self

    def close(self) -> Page:
        """Click the close 'x' button.

        :return: the modal's parent page
        :rtype: :py:class:`~pypom.Page`

        """
        button = self.find_element(*self._close_x_button_locator)
        Utilities.click_option(self.driver, element=button)
        self.wait.until(expect.staleness_of(self.root))
        return self.page

    def log_in(self) -> Login:
        """Click the 'Log in' link.

        :return: the Accounts log in page
        :rtype: :py:class:`~pages.accounts.Login`

        """
        link = self.find_element(*self._log_in_link_locator)
        Utilities.click_option(self.driver, element=link)
        page = Login(self.driver)
        page.wait_for_page_to_load()
        return page

    class FilterBar(Region):
        """The filter selection and control for My Highlights and Notes."""

        _active_filter_tag_locator = (
            By.CSS_SELECTOR, "ul li")
        _chapter_dropdown_locator = (
            By.CSS_SELECTOR, "[class*=Toggle] ~ [class*=ChapterFilter]")
        _chapter_dropdown_toggle_locator = (
            By.CSS_SELECTOR, ":first-child button[class*=Dropdown]")
        _color_dropdown_locator = (
            By.CSS_SELECTOR, "[class*=Toggle] ~ [class*=ColorFilter]")
        _color_dropdown_toggle_locator = (By.CSS_SELECTOR, "button[aria-label*=Color]")
        _print_locator = (
            By.CSS_SELECTOR, "[aria-label=print]")

        @property
        def active_filter_tags(self) -> List[MyHighlights.FilterBar.Filter]:
            """Access the list of active highlight filter tags.

            :return: the list of filters currently active on the My Highlights
                and Notes modal
            :rtype: list(:py:class:`~MyHighlights.FilterBar.Filter`)

            """
            return [self.Filter(self, selection)
                    for selection
                    in self.find_elements(*self._active_filter_tag_locator)]

        @property
        def chapter_filters(self) -> MyHighlights.FilterBar.ChapterFilters:
            """Access the chapter filter pane.

            :return: the chapter filter pane
            :rtype: :py:class:`~MyHighlights.FilterBar.ChapterFilters`

            """
            filter_menu_root = self.find_element(
                *self._chapter_dropdown_locator)
            return self.ChapterFilters(self, filter_menu_root)

        @property
        def chapter_dropdown_open(self) -> bool:
            """Return True if the filter by chapter pane is open.

            :return: ``True`` if the chapter filter pane is found
            :rtype: bool

            """
            try:
                return bool(self.chapter_filters)
            except NoSuchElementException:
                return False

        @property
        def color_filters(self) -> MyHighlights.FilterBar.ColorFilters:
            """Access the highlight color filter pane.

            :return: the highlight color filter pane
            :rtype: :py:class:`~MyHighlights.FilterBar.ColorFilters`

            """
            filter_menu_root = self.find_element(
                *self._color_dropdown_locator)
            return self.ColorFilters(self, filter_menu_root)

        @property
        def color_dropdown_open(self) -> bool:
            """Return True if the filter by highlight color pane is open.

            :return: ``True`` if the highlight color filter pane is found
            :rtype: bool

            """
            try:
                return bool(self.color_filters)
            except NoSuchElementException:
                return False

        def print(self):
            """Click the Print button."""
            button = self.find_element(*self._print_locator)
            Utilities.click_option(self.driver, element=button)

        def toggle_chapter_dropdown_menu(self):
            """Click the Chapter filter menu toggle."""
            button = self.find_element(*self._chapter_dropdown_toggle_locator)
            Utilities.click_option(self.driver, element=button)

        def toggle_color_dropdown_menu(self):
            """Click the Color filter menu toggle."""
            button = self.find_element(*self._color_dropdown_toggle_locator)
            Utilities.click_option(self.driver, element=button)

        class ChapterFilters(FilterSelection):
            """Filter displayed highlights by one or more book chapters."""

            @property
            def chapters(self) \
                    -> List[MyHighlights.FilterBar.ChapterFilters.Chapter]:
                r"""Access the book chapter filters.

                :return: the list of available book chapters and other
                    sections to filter displayed highlights
                :rtype: list(:py:class:`~MyHighlights.FilterBar \
                             .ChapterFilters.Chapter`)

                """
                return self.filter_options(self.Chapter)

            class Chapter(ChapterData, FilterToggle):
                """A chapter filter option."""

                _has_highlights_locator = (
                    By.CSS_SELECTOR, "input:not([disabled])")

                @property
                def has_highlights(self) -> bool:
                    """Return True if the chapter has highlights.

                    :return: ``True`` if the chapter has available highlights
                        to display
                    :rtype: bool

                    """
                    return bool(
                        self.find_elements(*self._has_highlights_locator))

        class ColorFilters(FilterSelection):
            """Filter displayed highlights by one or more highlight colors."""

            @property
            def colors(self) \
                    -> List[MyHighlights.FilterBar.ColorFilters.Color]:
                r"""Access the color filters.

                :return: the list of available colors to filter displayed
                    highlights
                :rtype: list(:py:class:`~MyHighlights.FilterBar
                             .ColorFilters.Color`)

                """
                return self.filter_options(self.Color)

            class Color(FilterToggle):
                """A highlight color filter option."""

                @property
                def color(self) -> str:
                    """Return the color name.

                    :return: the color name
                    :rtype: str

                    """
                    return self.root.text

        class Filter(ChapterData):
            """An active My Highlights and Notes filter option."""

            _color_locator = (
                By.CSS_SELECTOR, "span")
            _remove_filter_tag_locator = (
                By.CSS_SELECTOR, "button")

            @property
            def color(self) -> str:
                """Return the filter color.

                :return: the filter color name for highlight color filters or
                    an empty string for book chapters
                :rtype: str

                """
                if self.is_a_color_tag:
                    return self.find_element(*self._color_locator).text
                return ""

            @property
            def is_a_chapter_tag(self) -> bool:
                """Return True if the filter is for a book chapter.

                :return: ``True`` if the filter affects a book chapter, not a
                    highlight color
                :rtype: bool

                """
                return bool(self.find_elements(*self._title_locator))

            @property
            def is_a_color_tag(self) -> bool:
                """Return True if the filter is for a highlight color.

                :return: ``True`` if the filter affects a highlight color, not
                    a book chapter
                :rtype: bool

                """
                return not self.is_a_chapter_tag

            def remove_tag(self) -> MyHighlights:
                """Click the remove filter 'x' button.

                :return: the My Highlights and Notes modal
                :rtype: :py:class:`~MyHighlights`

                """
                button = self.find_element(*self._remove_filter_tag_locator)
                Utilities.click_option(self.driver, element=button)
                return self.page.page

    class Highlights(Region):
        """The modal body containing the filtered list of highlights."""

        _chapter_locator = (By.XPATH, "//div[@data-testid='chapter-title']")
        _section_locator = (By.XPATH, "//div[@data-testid='section-title']")
        _no_results_message_locator = (By.CSS_SELECTOR, "[class*=GeneralTextWrapper]")
        _highlight_locator = (By.CSS_SELECTOR, "[class*=summary-highlight]")

        @property
        def chapters(self) -> List[MyHighlights.Highlights.Chapter]:
            """Access the list of chapters currently displayed.

            :return: the list of chapters with highlights currently being
                displayed after applying the filter options
            :rtype: list(:py:class:`~MyHighlights.Highlights.Chapter`)

            """
            return [self.Chapter(self, option)
                    for option
                    in self.find_elements(*self._chapter_locator)]

        @property
        def sections(self) -> List[MyHighlights.Highlights.Section]:
            """Access the list of book sections currently displayed.

            :return: the list of book sections with highlights currently being
                displayed after applying the filter options
            :rtype: list(:py:class:`~MyHighlights.Highlights.Section`)

            """
            return [self.Section(self, option)
                    for option
                    in self.find_elements(*self._section_locator)]

        @property
        def no_results_message(self):
            try:
                return self.find_element(*self._no_results_message_locator).get_attribute("textContent")
            except NoSuchElementException:
                return ""

        @property
        def highlights(self) -> List[WebElement]:
            return list(set(self.find_elements(*self._highlight_locator)))

        @property
        def mh_highlight_ids(self) -> List[str]:
            """Return the list of highlight ID numbers.

            :return: the unique list of highlight ``data-highlight-id``s in MH page
            :rtype: list(str)

            """
            return list(
                set([highlight.get_attribute("data-highlight-id") for highlight in self.highlights]))

        class Chapter(ChapterData):
            """A book chapter with highlights.

            .. note::
               These are just the chapter markers; the highlights are found
               within the respective Sections.

            """

        class Section(ChapterData):
            """A chapter section with highlights."""

            _number_locator = (
                By.CSS_SELECTOR, "div:first-child .os-number")
            _highlight_locator = (
                By.XPATH, "./following-sibling::div//div[@data-highlight-id]")
            _title_locator = (
                By.CSS_SELECTOR, "div:first-child .os-text")

            @property
            def highlights(self) -> List[Highlight]:
                """Access the displayed highlights.

                :return: the list of highlights found within this book section
                :rtype: list(:py:class:`~Highlight`)

                """
                return [Highlight(self, highlight)
                        for highlight
                        in self.find_elements(*self._highlight_locator)]

# fmt: on
