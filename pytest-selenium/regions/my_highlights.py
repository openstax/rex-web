"""The My Highlights and Notes modal."""
# fmt: off
from __future__ import annotations

import re
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

ELEMENT_SELECT = "return document.querySelector('{selector}');"


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
        By.CSS_SELECTOR, ".content-excerpt ~ div")

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

    @property
    def close_icon(self):
        return self.find_element(*self._close_x_button_locator)

    def close(self) -> Page:
        """Click the close 'x' button.

        :return: the modal's parent page
        :rtype: :py:class:`~pypom.Page`

        """
        Utilities.click_option(self.driver, element=self.close_icon)
        self.wait.until(expect.staleness_of(self.root))
        return self.page

    @property
    def log_in_link(self):
        return self.find_element(*self._log_in_link_locator)

    def log_in(self) -> Login:
        """Click the 'Log in' link.

        :return: the Accounts log in page
        :rtype: :py:class:`~pages.accounts.Login`

        """
        Utilities.click_option(self.driver, element=self.log_in_link)
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

        @property
        def print(self):
            return self.find_element(*self._print_locator)

        def click_print(self):
            """Click the Print button."""
            Utilities.click_option(self.driver, element=self.print)

        @property
        def chapter_dropdown(self):
            return self.find_element(*self._chapter_dropdown_toggle_locator)

        def toggle_chapter_dropdown_menu(self):
            """Click the Chapter filter menu toggle."""
            Utilities.click_option(self.driver, element=self.chapter_dropdown)

        @property
        def color_dropdown(self):
            return self.find_element(*self._color_dropdown_toggle_locator)

        def toggle_color_dropdown_menu(self):
            """Click the Color filter menu toggle."""
            Utilities.click_option(self.driver, element=self.color_dropdown)

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

            @property
            def remove_tag_icon(self):
                return self.find_element(*self._remove_filter_tag_locator)

            def remove_tag(self) -> MyHighlights:
                """Click the remove filter 'x' button.

                :return: the My Highlights and Notes modal
                :rtype: :py:class:`~MyHighlights`

                """
                Utilities.click_option(self.driver, element=self.remove_tag_icon)
                return self.page.page

    class Highlights(Region):
        """The modal body containing the filtered list of highlights."""

        _chapter_locator = (By.XPATH, "//div[@data-testid='chapter-title']")
        _section_locator = (By.XPATH, "//div[@data-testid='section-title']")
        _no_results_message_locator = (By.CSS_SELECTOR, "[class*=GeneralTextWrapper]")
        _highlight_id_locator = (By.CSS_SELECTOR, "[class*=content-excerpt]")
        _highlight_locator = (By.CSS_SELECTOR, "[class*=HighlightOuterWrapper]")
        _empty_state_nudge_locator = (By.CSS_SELECTOR, "[class*=MyHighlightsWrapper]")
        _context_menu_locator = (By.XPATH, "//div[starts-with(@class, 'ContextMenu')]")

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

        logged_in_user_empty_state_message = no_results_message

        @property
        def logged_in_user_empty_state_nudge(self):
            try:
                return self.find_element(*self._empty_state_nudge_locator).get_attribute("textContent") \
                    if self.page.page.is_desktop else ""
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
            return list(set(self._split_html(highlight) for highlight in self.highlights))

        def _split_html(self, locator):
            """Break up the innerHTML string to retrieve highlight ID."""
            html = locator.get_attribute("innerHTML")
            split_html_highlight_id = re.findall(r"(.*? words|data-highlight-id.{38})", html)
            unlist_highlight_id = ', '.join(split_html_highlight_id)
            highlight_id = re.sub('data-highlight-id="', '', unlist_highlight_id)
            return highlight_id

        @property
        def edit_highlight(self) -> List[MyHighlights.Highlights.EditHighlight]:
            """Access the list of context menu's displayed in the MH modal.

            :return: the list of context menu's displayed in the MH modal
            :rtype: list(:py:class:`~MyHighlights.Highlights.EditHighlight`)

            """
            return [self.EditHighlight(self, option)
                    for option
                    in self.find_elements(*self._context_menu_locator)]

        class EditHighlight(Region):
            _alter_menu_toggle_locator = (By.CSS_SELECTOR, "[class*=MenuToggle]")
            _highlight_green_locator = (By.CSS_SELECTOR, "[name=green]")
            _highlight_blue_locator = (By.CSS_SELECTOR, "[name=blue]")
            _highlight_yellow_locator = (By.CSS_SELECTOR, "[name=yellow]")
            _highlight_purple_locator = (By.CSS_SELECTOR, "[name=purple]")
            _highlight_pink_locator = (By.CSS_SELECTOR, "[name=pink]")
            _add_or_edit_note_button_locator = (By.CSS_SELECTOR, "[class*=DropdownList] li:nth-child(1) a")
            _delete_button_locator = (By.CSS_SELECTOR, "[class*=DropdownList] li:nth-child(2) a")
            _highlight_id_locator = (By.XPATH, "./following::div[starts-with(@class, 'content-excerpt')]")
            _annotation_textbox_locator = (By.CSS_SELECTOR, "textarea")
            _cancel_annotation_button_locator = (By.CSS_SELECTOR, "[data-testid=cancel]")
            _save_annotation_button_locator = (By.CSS_SELECTOR, "[data-testid=save]")
            _note_indicator_locator = (By.XPATH, "./following::div[3]/span[contains(text(), 'Note:')]")

            @property
            def mh_highlight_id(self) -> str:
                """Return the highlight ID of the highlight being edited.

                :return: the unique ``data-highlight-id`` in MH page
                :rtype: str

                """
                return self.find_element(*self._highlight_id_locator).get_attribute("data-highlight-id")

            @property
            def edit_button(self) -> WebElement:
                """Return the edit highlight button.

                :return: the "Edit" button
                :rtype: WebElement

                """
                return self.find_element(*self._add_or_edit_note_button_locator)

            @property
            def note_present(self) -> bool:
                """Return True if the highlight has a note attached.

                :return: ``True`` if the highlight has a note attached
                :rtype: bool

                """
                try:
                    return bool(self.find_element(*self._note_indicator_locator))
                except NoSuchElementException:
                    return False

            @property
            def note(self) -> str:
                """Return the highlight note.

                :return: the current highlight note text
                :rtype: str

                """
                return self.note_box.text

            @property
            def note_box(self) -> WebElement:
                """Return the highlight note text box.

                :return: the highlight note text box
                :rtype: WebElement

                """
                note_box = self.driver.execute_script(ELEMENT_SELECT.format(
                    selector=self._annotation_textbox_locator[1]))
                return note_box

            @property
            def save_button(self) -> WebElement:
                """Return the save annotation button.

                :return: the "Save" button
                :rtype: WebElement

                """
                save = self.driver.execute_script(ELEMENT_SELECT.format(
                    selector=self._save_annotation_button_locator[1]))
                return save

            @property
            def cancel_button(self) -> WebElement:
                """Return the cancel annotation button.

                :return: the "Cancel" button
                :rtype: WebElement

                """
                return self.find_element(*self._cancel_annotation_button_locator)

            @property
            def delete_button(self) -> WebElement:
                """Return the delete highlight button.

                :return: the "Delete" button
                :rtype: WebElement

                """
                return self.find_element(*self._delete_button_locator)

            @property
            def pink(self) -> WebElement:
                """Return the pink highlight toggle input.

                :return: the pink circle highlight color toggle
                :rtype: WebElement

                """
                return self.find_element(*self._highlight_pink_locator)

            @property
            def green(self) -> WebElement:
                """Return the green highlight toggle input.

                :return: the green circle highlight color toggle
                :rtype: WebElement

                """
                return self.find_element(*self._highlight_green_locator)

            @property
            def blue(self) -> WebElement:
                """Return the blue highlight toggle input.

                :return: the blue circle highlight color toggle
                :rtype: WebElement

                """
                return self.find_element(*self._highlight_blue_locator)

            @property
            def yellow(self) -> WebElement:
                """Return the yellow highlight toggle input.

                :return: the yellow circle highlight color toggle
                :rtype: WebElement

                """
                return self.find_element(*self._highlight_yellow_locator)

            @property
            def purple(self) -> WebElement:
                """Return the purple highlight toggle input.

                :return: the purple circle highlight color toggle
                :rtype: WebElement

                """
                return self.find_element(*self._highlight_purple_locator)

            def toggle_menu(self) -> MyHighlights.Highlights.EditHighlight:
                """Toggle the highlight context menu open or close.

                :return: the edit highlight box
                :rtype: :py:class:`~MyHighlights.Highlights.EditHighlight`

                """
                toggle = self.find_element(*self._alter_menu_toggle_locator)

                Utilities.click_option(self.driver, element=toggle)
                return self

            def toggle_color(self, color: Color) -> MyHighlights.Highlights.EditHighlight:
                """Toggle a highlight color.

                :param color: the color to toggle on or off
                :type color: :py:class:`~utils.utility.Color`
                :return: the edit highlight box
                :rtype: :py:class:`~MyHighlights.Highlights.EditHighlight`

                """
                colors = {
                    Color.PINK: self.pink,
                    Color.GREEN: self.green,
                    Color.BLUE: self.blue,
                    Color.PURPLE: self.purple,
                    Color.YELLOW: self.yellow,
                }

                Utilities.click_option(self.driver, element=colors[color])
                return self

            def edit_note(self) -> MyHighlights.Highlights.EditHighlight:
                """Toggle the annotation edit menu option.

                :return: the note edit box
                :rtype: :py:class:`~MyHighlights.Highlights.EditHighlight`

                """

                self.toggle_menu()
                Utilities.click_option(self.driver, element=self.edit_button)
                return self

            add_note = edit_note

            @note.setter
            def note(self, note: str):
                """Set the annotation text for the highlight.

                :param str note: the annotation text for the selected highlight

                """
                self.note_box.send_keys(note)

            def cancel(self) -> MyHighlights:
                """Click the cancel note button.

                :return: the My Highlights and Notes modal
                :rtype: :py:class:`~MyHighlights`

                """
                Utilities.click_option(self.driver, element=self.cancel_button)
                return self.page

            def save(self) -> MyHighlights:
                """Click the save note button.

                :return: the My Highlights and Notes modal
                :rtype: :py:class:`~MyHighlights`

                """
                Utilities.click_option(self.driver, element=self.save_button)
                return self.page

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
