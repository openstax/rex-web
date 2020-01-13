"""The My Highlights and Notes modal."""

from __future__ import annotations

from time import sleep
from typing import List

from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as expect

from pages.accounts import Login
from pages.base import Page
from regions.base import Region
from utils.utility import Color, Utilities


class MyHighlights(Region):
    """The 'My Highlights and Notes' modal."""

    _close_x_button_locator = (
        By.CSS_SELECTOR, "[data-testid='close-highlights-popup']")
    _content_header_locator = (
        By.CSS_SELECTOR, "[class*=Body] h3")
    _back_to_top_button_locator = (
        By.CSS_SELECTOR, ".back-to-top-highlights")
    _highlight_locator = (
        By.CSS_SELECTOR,
        "[data-testid=show-myhighlights-body] > div:not([data-testid]) > div")
    _log_in_link_locator = (
        By.CSS_SELECTOR, "[href*=accounts]")
    _modal_title_locator = (
        By.CSS_SELECTOR, "[class*=Modal] > h3")

    @property
    def back_to_top_available(self) -> bool:
        """Return True if the back to top arrow button exists in the modal.

        :return: ``True`` if the back to top arrow button is found
        :rtype: bool

        """
        return bool(self.find_elements(*self._back_to_top_button_locator))

    @property
    def heading(self) -> str:
        """Return the modal heading text.

        :return: the modal heading text found within the modal body
        :rtype: str

        """
        return self.find_element(*self._content_header_locator).text

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
            sleep(0.15)
            return self

    def close(self) -> Page:
        """Click the close 'x' button.

        :return: the modal's parent page
        :rtype: :py:class:`~pages.base.Page`

        """
        button = self.find_element(*self._close_x_button_locator)
        Utilities.click_option(self.driver, element=button)
        self.wait.until(expect.staleness_of(self.root))
        return self.page

    def highlights(self) -> List[MyHighlights.Highlight]:
        """Access the page highlights.

        :return: the list of available highlights
        :rtype: list(:py:class:`~regions.my_highlights.MyHighlights.Highlight`)

        """
        return [self.Highlight(self, highlight)
                for highlight
                in self.find_elements(*self._highlight_locator)]

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

    class Highlight(Region):
        """An individual highlight with or without a note."""

        _highlight_color_locator = (
            By.CSS_SELECTOR, "div[color]")
        _highlight_content_locator = (
            By.CSS_SELECTOR, ".summary-highlight-content")
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
            return (self.find_element(*self._highlight_content_locator)
                    .get_attribute("textContent"))

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
                return "".join([item.text for item in note])
            return ""
