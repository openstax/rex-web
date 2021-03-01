"""A Reading Experience book content page."""
# flake8: noqa
from __future__ import annotations

from math import ceil as round_up
from random import randint
from time import sleep
from typing import List, Tuple, Union

from selenium.common.exceptions import NoSuchElementException, TimeoutException
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.by import By
from selenium.webdriver.common.touch_actions import TouchActions
from selenium.webdriver.remote.webelement import WebElement
from selenium.webdriver.support import expected_conditions as expected
from selenium.webdriver.support.ui import WebDriverWait

from pages.accounts import Login
from pages.base import Page
from regions.base import Region
from regions.my_highlights import MyHighlights
from regions.search_sidebar import SearchSidebar
from regions.toc import TableOfContents
from utils.utility import Color, Highlight, Utilities

BOUNDING_RECTANGLE = "return arguments[0].getBoundingClientRect();"
COMPUTED_STYLES = "return window.getComputedStyle(arguments[0]){field};"
ELEMENT_SELECT = "return document.querySelector('{selector}');"


class ContentError(Exception):

    pass


class Content(Page):

    URL_TEMPLATE = "/books/{book_slug}/pages/{page_slug}"

    _body_locator = (By.CSS_SELECTOR, "body")
    _book_section_content_locator = (By.CSS_SELECTOR, "[class*=MinPageHeight]")
    _error_modal_locator = (By.CSS_SELECTOR, ".error-modal")
    _main_content_locator = (By.CSS_SELECTOR, "h1")
    _modal_root_locator = (By.CSS_SELECTOR, "[class*=PopupWrapper]")
    _next_locator = (By.CSS_SELECTOR, "[aria-label='Next Page']")
    _notification_pop_up_locator = (By.CSS_SELECTOR, "[class*=ContentNotifications]")
    _previous_locator = (By.CSS_SELECTOR, "[aria-label='Previous Page']")
    _print_locator = (By.CSS_SELECTOR, "[data-testid=print]")
    _order_print_copy_locator = (By.CSS_SELECTOR, "[aria-label='Buy book']")
    _discard_modal_locator = (By.CSS_SELECTOR, "[class*='CardWrapper']")

    @property
    def loaded(self) -> bool:
        return bool(self.find_element(*self._body_locator).get_attribute("data-rex-loaded"))

    @property
    def attribution(self) -> Content.Attribution:
        return self.Attribution(self)

    @property
    def bookbanner(self) -> Content.BookBanner:
        return self.BookBanner(self)

    @property
    def content(self) -> Content.Content:
        """Access the main book content region.

        :return: the book section content
        :rtype: Content.Content
        :raises ContentError: if an error modal is present

        """
        if not self.error_shown():
            content_root = self.find_element(*self._book_section_content_locator)
            return self.Content(self, content_root)
        raise ContentError(f"Error modal displayed: {self.error.heading}")

    @property
    def error(self) -> Content.Error:
        """Access the error modal.

        :return: the error modal
        :rtype: Content.Error

        """
        error_modal = self.find_element(*self._error_modal_locator)
        return self.Error(self, error_modal)

    @property
    def mobile_search_toolbar(self) -> Content.MobileSearchToolbar:
        return self.MobileSearchToolbar(self)

    @property
    def my_highlights(self) -> Union[MyHighlights, None]:
        """Access the My Highlights and Notes modal.

        :return: the My Highlights and Notes modal or ``None`` if the modal is
            not available
        :rtype: :py:class:`~regions.my_highlights.MyHighlights`

        """
        if self.my_highlights_open:
            my_highlights_root = self.find_element(*self._modal_root_locator)
            return MyHighlights(self, my_highlights_root)
        return None

    @property
    def my_highlights_open(self) -> bool:
        """Return True if the My Highlights modal is open.

        :return: ``True`` if the My Highlights and Note modal is currently open
        :rtype: bool

        """
        return bool(self.find_elements(*self._modal_root_locator))

    @property
    def navbar(self) -> Content.NavBar:
        return self.NavBar(self)

    @property
    def next_link(self) -> WebElement:
        return self.find_element(*self._next_locator)

    @property
    def next_link_is_displayed(self) -> bool:
        try:
            return self.next_link.is_displayed()
        except NoSuchElementException:
            return False

    @property
    def notification(self) -> Content.Notification:
        """Access a content notification box."""
        if not self.error_shown():
            box_root = self.find_element(*self._notification_pop_up_locator)
            return self.Notification(self, box_root)
        raise ContentError(f"Error modal displayed: {self.error.heading}")

    @property
    def notification_present(self) -> bool:
        """Return True if a pop up content notification is found.

        :return: ``True`` when a pop up notification is found ("Privacy
            and cookies")
        :rtype: bool

        """
        sleep(0.25)
        return bool(self.find_elements(*self._notification_pop_up_locator))

    @property
    def discard_modal(self) -> Content.DiscardModal:
        """Access the unsaved notes discard modal.

        :return: the discard modal
        :rtype: Content.DiscardModal

        """
        discard_modal = self.find_element(*self._discard_modal_locator)
        return self.DiscardModal(self, discard_modal)

    @property
    def discard_changes_modal_displayed(self) -> bool:
        """Return True if unsaved notes discard modal is found.

        :return: ``True`` when a pop up unsaved notes discard modal
        :rtype: bool

        """
        return bool(self.find_elements(*self._discard_modal_locator))

    @property
    def previous_link(self) -> WebElement:
        return self.find_element(*self._previous_locator)

    @property
    def previous_link_is_displayed(self) -> bool:
        try:
            return self.previous_link.is_displayed()
        except NoSuchElementException:
            return False

    @property
    def print(self) -> WebElement:
        return self.find_element(*self._print_locator)

    @property
    def order_print_copy(self) -> WebElement:
        return self.find_element(*self._order_print_copy_locator)

    @property
    def search_sidebar(self) -> SearchSidebar:
        return SearchSidebar(self)

    @property
    def sidebar(self) -> Content.SideBar:
        return self.SideBar(self)

    @property
    def sidebar_height_offset(self) -> int:
        navbar_height = self.height(self.navbar.root)
        bookbanner_height = self.height(self.bookbanner.root)
        return int(navbar_height) + int(bookbanner_height)

    @property
    def sidebar_width_offset(self) -> int:
        sidebar_width = self.width(self.sidebar.root)
        sidebar_width_left_offset = self.sidebar.root.get_attribute("offsetLeft")
        return int(sidebar_width) + int(sidebar_width_left_offset)

    @property
    def toolbar(self) -> Content.ToolBar:
        return self.ToolBar(self)

    @property
    def window_height(self) -> int:
        return int(self.height(self.sidebar.root)) + self.sidebar_height_offset

    def click_content_overlay(self) -> WebElement:
        """Click anywhere in the content overlay

        x & y are random numbers computed from the sidebar/window width/height
        respectively. Using actionchains to click on this position.

        :return: the table of contents toggle button
        :rtype: WebElement
        :raises TimeoutException: if the toggle button is still visible after
            the ``wait`` period

        """
        x = randint(self.sidebar_width_offset, self.window_width)
        y = randint(self.sidebar_height_offset, self.window_height)

        (
            ActionChains(self.driver)
            .move_to_element_with_offset(self.driver.find_element(*self._body_locator), 0, 0)
            .move_by_offset(x, y)
            .click()
            .perform()
        )
        return self.wait.until(
            expected.invisibility_of_element_located(self.sidebar.header.toc_toggle_button)
        )

    def click_next_link(self):
        self.click_and_wait_for_load(self.next_link)

    def click_previous_link(self):
        self.click_and_wait_for_load(self.previous_link)

    def error_shown(self, repeat: int = 1) -> bool:
        """Return True when the error modal is present.

        .. note::
           We make multiple checks for the error modal because when an error
           state occurs it may be missed by the first check as the rest of the
           page is ready before the error modal displays. After the first
           check, the error overlay would appear and intercept subsequent
           actions on the page raising a ``TimeoutException`` instead of an
           error report.

        :param int repeat: (optional) an internal recursive counter managing
            the number of error modal check retries
            default: 1 - check for the modal twice over 0.25 seconds
        :return: ``True`` when the error modal exists within the content page
        :rtype: bool

        """
        try:
            return bool(self.error)
        except NoSuchElementException:
            if repeat <= 0:
                return False
            sleep(0.25)
            return self.error_shown(repeat - 1)

    def scroll_over_content_overlay(self):
        """Touch and scroll starting at on_element, moving by an offset.

        x & y are random numbers computed from the sidebar/window width/height
        respectively. Using touchactions to scroll from the print element.
        Selenium is not throwing any exception while scrolling over the content
        overlay using scroll(x,y). Hence using
        ``scroll_from_element(element, x, y)`` to capture and assert the
        exception in the test.

        """
        x = randint(self.sidebar_width_offset, self.window_width)
        y = randint(self.sidebar_height_offset, self.window_height)

        if self.driver == "chrome":
            touchActions = TouchActions(self.driver)
            touchActions.scroll_from_element(self.print, x, y).perform()

        # Touch actions are not working for Safari and Firefox. Scroll using
        # javascript instead.
        else:
            self.driver.execute_script(f"scrollBy({x}, {y});")

    scroll_through_page = scroll_over_content_overlay

    class Attribution(Region):

        _root_locator = (By.CSS_SELECTOR, "[data-testid='attribution-details']")

        _access_free_locator = (By.XPATH, "//*[contains(text(), 'Access for free at')]/a")
        _attribution_toggle_locator = (
            By.CSS_SELECTOR,
            '[data-testid="attribution-details"] summary',
        )
        _book_url_locator = (By.XPATH, "//*[contains(text(), 'Book URL')]/a")
        _section_url_locator = (By.XPATH, "//*[contains(text(), 'Section URL')]/a")

        @property
        def attribution_link(self) -> WebElement:
            return self.find_element(*self._attribution_toggle_locator)

        @property
        def is_open(self) -> bool:
            return bool(self.root.get_attribute("open"))

        @property
        def section_url_within_attribution(self) -> WebElement:
            return self.find_element(*self._section_url_locator)

        @property
        def section_url(self) -> str:
            return self.section_url_within_attribution.get_attribute("href")

        @property
        def book_url(self) -> str:
            return self.find_element(*self._book_url_locator).get_attribute("href")

        @property
        def access_free_url(self) -> str:
            return self.find_element(*self._access_free_locator).get_attribute("href")

        def click_attribution_link(self):
            self.offscreen_click(self.attribution_link)
            self.page.attribution.wait_for_region_to_display()

        def click_book_url(self):
            self.offscreen_click(self.find_element(*self._book_url_locator))

    class BookBanner(Region):

        _root_locator = (By.CSS_SELECTOR, '[data-testid="bookbanner"]')

        _book_title_locator = (By.CSS_SELECTOR, "div > a")
        _section_title_locator = (By.CSS_SELECTOR, "div > h1")

        @property
        def book_title(self) -> WebElement:
            return self.find_element(*self._book_title_locator)

        @property
        def section_title(self) -> str:
            return self.find_element(*self._section_title_locator).text

    class Content(Region):
        """The main content for the book section."""

        _caption_locator = (By.CSS_SELECTOR, ".os-caption-container")
        _figure_container_locator = (By.CSS_SELECTOR, ".os-figure")
        _figure_locator = (By.CSS_SELECTOR, "figure")
        _footnote_locator = (By.CSS_SELECTOR, "[data-type=footnote-ref]")
        _highlight_box_locator = (By.CSS_SELECTOR, "form[class*=EditCard], div[class*=DisplayNote]")
        _highlighted_element_locator = (By.CSS_SELECTOR, ".highlight")
        _highlight_note_locator = (By.CSS_SELECTOR, "div[class*=DisplayNote]")
        _image_locator = (By.CSS_SELECTOR, "img")
        _link_locator = (
            By.CSS_SELECTOR,
            ":not([class*=PrevNextBar])"
            ":not([class*=BuyBook])"
            ":not(sup):not([id*=footnote]) > a",
        )
        _list_locator = (
            By.CSS_SELECTOR,
            ":not([data-type*=footnote]) > ol, " ":not([data-type*=footnote]) > ul",
        )
        _math_equation_locator = (By.CSS_SELECTOR, "[id*=MathJax][id*=Frame] .math")
        _show_solution_toggle_locator = (
            By.CSS_SELECTOR,
            "[aria-label='show solution'] button, " "[data-type=solution]:not([aria-label]) button",
        )
        _table_locator = (By.CSS_SELECTOR, "table")
        _text_content_locator = (
            By.CSS_SELECTOR,
            "p[id^='fs-']:not([data-depth])"  # Intro Stats
            ":not([data-bullet-style]):not([type]), "
            "p[id^='eip'], p[id^='import-auto']",
        )  # Phys
        _page_error_locator = (By.CSS_SELECTOR, "[class*=PageNotFoundWrapper]")
        _page_error_toc_button_locator = (By.CSS_SELECTOR, "[data-testid = toc-button]")

        @property
        def page_error_displayed(self) -> bool:
            """Return true if rex 404 error is displayed"""
            try:
                return bool(self.wait.until(lambda _: self.find_element(*self._page_error_locator)))
            except TimeoutException:
                return False

        @property
        def page_error(self):
            """Return the rex 404 error text"""
            return self.find_element(*self._page_error_locator).get_attribute("textContent")

        @property
        def page_error_toc_button(self) -> WebElement:
            return self.find_element(*self._page_error_toc_button_locator)

        def click_page_error_toc_button(self):
            """Click the TOC icon in the rex 404 error page"""
            return Utilities.click_option(self.driver, element=self.page_error_toc_button)

        @property
        def captions(self) -> List[WebElement]:
            """Return the list of figure and table captions.

            .. note::
               We exclude any captions that contain a highlight to avoid
               collisions.

            :return: the list of parent elements for each page caption
            :rtype: list(WebElement)
            :raises ContentError: if no captions are found in the content

            """
            captions = [
                caption
                for caption in self.find_elements(*self._caption_locator)
                if not caption.find_elements(*self._highlighted_element_locator)
            ]
            if not captions:
                raise ContentError("no clean captions found")
            return captions

        @property
        def figures(self) -> List[WebElement]:
            """Return the list of figures in the current book section.

            :return: the list of parent elements for each page figure, which
                excludes their respective captions
            :rtype: list(WebElement)
            :raises ContentError: if no figures are found in the content

            """
            figures = [
                figure
                for figure in self.find_elements(*self._figure_locator)
                if not figure.find_elements(*self._highlighted_element_locator)
            ]
            if not figures:
                raise ContentError("no figures found")
            return figures

        @property
        def footnotes(self) -> List[WebElement]:
            """Return the list of section footnotes.

            :return: the list of parent elements for each page footnote
            :rtype: list(WebElement)
            :raises ContentError: if no footnotes are found for the book
                section

            """
            notes = [
                footnote
                for footnote in self.find_elements(*self._footnote_locator)
                if not footnote.find_elements(*self._highlighted_element_locator)
            ]
            if not notes:
                raise ContentError("no footnotes found")
            return notes

        @property
        def figures_and_captions(self) -> List[WebElement]:
            """Return the list of figures with their captions in the section.

            :return: the list of os-figure parent elements for each page
                figure, which includes their respective captions
            :rtype: list(WebElement)
            :raises ContentError: if no figures are found in the content

            """
            figs = [
                figure_and_caption
                for figure_and_caption in self.find_elements(*self._figure_container_locator)
                if not figure_and_caption.find_elements(*self._highlighted_element_locator)
            ]
            if not figs:
                raise ContentError("no figure groups found")
            return figs

        @property
        def highlights(self) -> List[WebElement]:
            """Return the list of highlighted elements in the section.

            :return: the list of highlighted elements
            :rtype: list(WebElement)

            """
            return self.find_elements(*self._highlighted_element_locator)

        @property
        def highlight_box(self) -> Content.Content.HighlightBox:
            """Access the highlight and annotation pop up box.

            Search for the open (displayed) highlight box.

            :return: the highlight control
            :rtype: Content.Content.HighlightBox
            :raises NoSuchElementException: when an open highlight box is not
                found

            """
            for _ in range(2):
                for box in self.highlight_boxes:
                    sleep(0.1)
                    display = self.driver.execute_script(
                        COMPUTED_STYLES.format(field=".display"), box
                    )
                    if display != "none":
                        return self.HighlightBox(self, box)
            raise NoSuchElementException("No open highlight boxes found")

        @property
        def highlight_boxes(self) -> List[WebElement]:
            """Return the list of highlight elements in the section.

            :return: the list of highlighted elements
            :rtype: list(WebElement)

            """
            return self.find_elements(*self._highlight_box_locator)

        @property
        def highlight_count(self) -> int:
            """Return the number of highlight elements found in the content.

            .. note::
               Highlights may be broken into pieces so the count will equal or
               exceed the number of highlights.

            :return: the number of highlight spans in the content
            :rtype: int

            """
            return len(self.highlights)

        @property
        def highlight_ids(self) -> List[str]:
            """Return the list of highlight ID numbers.

            :return: the unique list of highlight ``data-highlight-id``s for
                the current page
            :rtype: list(str)

            """
            return list(
                set([highlight.get_attribute("data-highlight-id") for highlight in self.highlights])
            )

        @property
        def images(self) -> List[WebElement]:
            """Return the content images.

            :return: the list of images within the section
            :rtype: list(WebElement)
            :raises ContentError: if no image is found in the content

            """
            images = [
                image
                for image in self.find_elements(*self._image_locator)
                if not image.find_elements(*self._highlighted_element_locator)
            ]
            if not images:
                raise ContentError("no images found")
            return images

        @property
        def links(self) -> List[WebElement]:
            """Return the list of internal and external links in the content.

            .. note::
               We exclude any links that contain a highlight to avoid
               collisions.

            :return: the list of both internal and external links within the
                current page content
            :rtype: list(WebElement)
            :raises ContentError: if no links are found in the content

            """
            links = [
                link
                for link in self.find_elements(*self._link_locator)
                if not link.find_elements(*self._highlighted_element_locator)
            ]
            if not links:
                raise ContentError("no clean links found")
            return links

        @property
        def lists(self) -> List[WebElement]:
            """Return the root elements for ordered and unordered lists.

            :return: the list of parent elements for each ordered and unordered
                list
            :rtype: list(WebElement)
            :raises ContentError: if no list is found in the content

            """
            lists = [
                list_group
                for list_group in self.find_elements(*self._list_locator)
                if not list_group.find_elements(*self._highlighted_element_locator)
            ]
            if not lists:
                raise ContentError("no list groups found")
            return lists

        @property
        def math(self) -> List[WebElement]:
            """Return the list of rendered MathML equations or text.

            .. note::
               If MathJax doesn't render the math equations on the page, we
               reque the render request.

            :return: the list of available MathML rendered equations
            :rtype: list(WebElement)list(WebElement)
            :raises UserWarning: if no Math is found on the page and we request
                MathJax to rerun the page search and render
            :raises ContentError: if no Math is found in the content

            """
            wait = WebDriverWait(self.driver, 1)
            try:
                wait.until(lambda _: self.find_elements(*self._math_equation_locator))
            except TimeoutException:
                from warnings import warn

                warn(
                    "Content request - "
                    "no math found or MathJax failed to load; "
                    "rerunning math search"
                )
                self.driver.execute_script("MathJax.Hub.Queue(['Typeset', MathJax.Hub]);")
                wait.until(lambda _: self.find_elements(*self._math_equation_locator))
            math = [
                equation
                for equation in self.find_elements(*self._math_equation_locator)
                if not equation.find_elements(*self._highlighted_element_locator)
            ]
            if not math:
                raise ContentError("no rendered math found")
            return math

        @property
        def notes(self) -> int:
            """Return the number of notes found on the page.

            :return: the number of highlights with notes found on the page
            :rtype: int

            """
            return len(self.find_elements(*self._highlight_note_locator))

        @property
        def paragraphs(self) -> List[WebElement]:
            """Return the standard text sections.

            .. note::
               Leaves out structured text, bullet lists and other specialized
               text "type"s.

            :return: the list of text content paragraphs
            :rtype: list(WebElement)
            :raises ContentError: if no non-structured content paragraphs are
                found in the content

            """
            paragraphs = [
                text
                for text in self.find_elements(*self._text_content_locator)
                if not text.find_elements(*self._highlighted_element_locator)
            ]
            if not paragraphs:
                raise ContentError("no standard paragraph content found")
            return paragraphs

        @property
        def solution_toggles(self) -> List[WebElement]:
            """Return the solution toggle buttons.

            .. note::
               Only closed toggles are returned so they may be opened before
               searching for content elements. Otherwise, a selected element,
               like a figure, may not be visible when trying to highlight it.

            :return: the list of closed solution toggle buttons
            :rtype: list(WebElement)

            """
            return [toggle for toggle in self.find_elements(*self._show_solution_toggle_locator)]

        @property
        def tables(self) -> List[WebElement]:
            """Return the root elements for each table.

            :return: the list of tables found within the main content
            :rtype: list(WebElement)list(WebElement)
            :raises ContentError: if no tables are found in the content

            """
            tables = [
                table
                for table in self.find_elements(*self._table_locator)
                if not table.find_elements(*self._highlighted_element_locator)
            ]
            if not tables:
                raise ContentError("no tables found")
            return tables

        def close_edit_note_box(self):
            """Click outside of the elements to close the edit note box.

            :return: None

            """
            (
                ActionChains(self.driver)
                .move_to_element_with_offset(self.root, 5, 0)
                .click()
                .perform()
            )

        def get_highlight(
            self, by_id: Union[int, str] = None, by_timestamp: Union[int, str] = None
        ) -> List[WebElement]:
            """Return the list of highlights for a given data ID or time stamp.

            .. note::
               a single highlight may be broken into several segments with
               matching ``data-timestamp``s and ``data-highlight-id``s

            :param _id: (optional) the data identification number for a given
                set of highlights
            :param by_timestamp: (optional) the data time stamp for a given set
                of highlights
            :type by_id: int or str
            :type by_timestamp: int or str
            :return: the list of highlights for a given number
            :rtype: list(WebElement)

            """
            data, attribute = (
                (str(by_id), "data-highlight-id")
                if by_id
                else (str(by_timestamp), "data-timestamp")
            )
            return [
                segment for segment in self.highlights if data == segment.get_attribute(attribute)
            ]

        def highlight(
            self,
            target: WebElement,
            offset: Union[Highlight.Offset, str] = Highlight.RANDOM,
            color: Union[Color, None] = Color.YELLOW,
            note: str = "",
            close_box: bool = True,
        ):
            """Highlight a page element.

            .. note::
               ActionChain's move by offset does not work as expected in Safari

            :param target: the specific element to highlight
            :param offset: (optional) what or how much of the element to
                highlight; may be an X/Y offset, a randomized quantity, or the
                entire element
                default: randomized
            :param color: (optional) the highlight color
                default: yellow
            :param note: (optional) the annotation text for the highlight
                default: no note
            :param close_box: (optional) close the edit highlight pop up box
                default: ``True``
            :type target: WebElement
            :type offset: tuple(int, int), int
            :type color: :py:class:`~utils.utility.Color` or None
            :type note: str
            :type: close_box: bool
            :return: None

            """
            # Scroll the page to bring the element into view then shift due to
            # the top bars
            self.driver.execute_script("arguments[0].scrollIntoView();", target)
            self.driver.execute_script("window.scrollBy(0, -150);")

            # Compute the start and end offsets for the mouse movement
            start, end = self._compute_offsets(target, offset)

            # Highlight the normal element or the rendered math equation
            if "math" not in target.get_attribute("class"):
                self._highlight_section(target, start, end)
            else:
                self._highlight_math(target)

            # Select the highlight color or interupt the highlight if a color
            # is not provided
            if not color:
                return
            self.highlight_box.toggle_color(color)

            # Enter the annotation text, if present
            if note:
                self.highlight_box.note = note
                self.highlight_box.save()

            if close_box:
                # Click outside of the box and highlight to close the box
                self.close_edit_note_box()

        def select(
            self, target: WebElement, offset: Union[Highlight.Offset, str] = Highlight.RANDOM
        ):
            """Select a page element.

            .. note::
               ActionChain's move by offset does not work as expected in Safari

            :param target: the specific element to select
            :param offset: (optional) what or how much of the element to
                highlight; may be an X/Y offset, a randomized quantity, or the
                entire element
                default: randomized
            :type target: WebElement
            :type offset: tuple(int, int), int
            :return: None

            """
            # Scroll the page to bring the element into view then shift due to
            # the top bars
            self.driver.execute_script("arguments[0].scrollIntoView();", target)
            self.driver.execute_script("window.scrollBy(0, -150);")

            # Compute the start and end offsets for the mouse movement
            start, end = self._compute_offsets(target, offset)

            # Select the element
            self._select_section(target, start, end)

        def show_solutions(self):
            """Open each closed solution then return to the top of the page."""
            for toggle in self.solution_toggles:
                self.driver.execute_script("arguments[0].scrollIntoView();", toggle)
                self.driver.execute_script("window.scrollBy(0, -130);")
                Utilities.click_option(self.driver, element=toggle)
            Utilities.scroll_top(self.driver)

        def _compute_offsets(
            self, target: WebElement, offset: Highlight.Offset
        ) -> Tuple[Highlight.Offset, Highlight.Offset]:
            """Compute the start and stop offsets.

            :param WebElement target: the element to be highlighted
            :param offset: (optional) what or how much of the element to
                highlight; may be an X/Y offset, a randomized quantity, or the
                entire element
                default: randomized
            :type offset: tuple(int, int), str
            :return: the start and stop offsets as (x, y) pairs
            :rtype: tuple((int, int), (int, int))
            :raises ValueError: when the offset value is not a tuple, or a
                registered value like Highlight.RANDOM or Highlight.ENTIRE

            """
            # Retrieve the element area information
            boundry = self.driver.execute_script(BOUNDING_RECTANGLE, target)

            # And round up the computed height and width values
            width = round_up(boundry.get("width"))
            height = round_up(boundry.get("height"))

            # Determine where to start and stop the hightlight
            # Normally begin at the top left except for images, which should
            # begin to the left of the picture, or tables, which should begin
            # within the first cell to ignore the table/cell borders.
            if target.tag_name == "img" or target.tag_name == "figure":
                start = (-10, 0)
            elif target.tag_name == "table":
                start = (3, 3)
            elif target.tag_name == "a":
                start = (-1, 1)
            else:
                start = (0, 0)

            if target.tag_name == "img" or target.tag_name == "figure":
                end = (width * 0.75, 3)
            elif offset == Highlight.ENTIRE:
                end = (width - 1, height - 1)
            elif offset == Highlight.RANDOM:
                end = (randint(10, max(10, width)), randint(20, max(20, height)))
            elif isinstance(offset, tuple) and len(offset) == 2:
                end = offset
            else:
                raise ValueError(f"{offset} not a valid offset or option")

            return (start, end)

        def _highlight_math(self, target: WebElement):
            """Highlight a rendered math element using a double click.

            When highlighting math, double click in the middle of the equation
            to avoid oddly formed renders failing a move by offset command.

            :param WebElement target: the math equation to highlight
            :return: None

            """
            (
                ActionChains(self.driver)
                .move_to_element_with_offset(target, 10, 10)
                .double_click(target)
                .perform()
            )

        def _highlight_section(
            self, target: WebElement, start: Highlight.Offset, stop: Highlight.Offset
        ):
            """Highlight an element using the mouse.

            If not a math highlight, highlight the section starting from the
            top left (0 x 0) to the chosen end point to the right and down
            (``10 <= x < width``, ``19 <= y < height``).

            Then click near the top left of the element because the ActionChain
            click and hold isn't always registered as a "click" by the
            highlighting listener (``retag``).

            :param target: the book content parent element to highlight
            :param start: the beginning of the click and drag (top left)
            :param stop: the end of the click and drag (bottom right)
            :type target: WebElement
            :type start: tuple(int, int)
            :type stop: tuple(int, int)
            :return: None

            """
            retag = tuple(sum(x) for x in zip(start, (1, 1)))

            actions = ActionChains(self.driver)

            if target.tag_name == "table":
                (
                    actions.move_to_element_with_offset(target, *start)
                    .click_and_hold()
                    .move_by_offset(*stop)
                    .release()
                    .move_to_element_with_offset(target, *retag)
                    .click()
                    .perform()
                )
                return
            (
                actions.move_to_element_with_offset(target, *start)
                .click_and_hold()
                .move_by_offset(*stop)
                .release()
                .perform()
            )
            try:
                self.highlight_box
            except NoSuchElementException:
                sleep(0.1)
                (actions.move_to_element_with_offset(target, *retag).click().perform())

        def _select_section(
            self, target: WebElement, start: Highlight.Offset, stop: Highlight.Offset
        ):
            """Select an element using the mouse.

            :param target: the book content parent element to select
            :param start: the beginning of the click and drag (top left)
            :param stop: the end of the click and drag (bottom right)
            :type target: WebElement
            :type start: tuple(int, int)
            :type stop: tuple(int, int)
            :return: None

            """
            actions = ActionChains(self.driver)
            (
                actions.move_to_element_with_offset(target, *start)
                .click_and_hold()
                .move_by_offset(*stop)
                .release()
                .perform()
            )

        class HighlightBox(Region):
            """The highlight color and annotation box."""

            _alter_menu_toggle_locator = (By.CSS_SELECTOR, "[class*=MenuToggle]")
            _annotation_textbox_locator = (By.CSS_SELECTOR, "textarea")
            _cancel_annotation_button_locator = (By.CSS_SELECTOR, "[data-testid=cancel]")
            _close_x_button_locator = (By.CSS_SELECTOR, "[class*=CloseIcon]")
            _confirm_delete_note_button_locator = (By.CSS_SELECTOR, "[data-testid=confirm]")
            _context_menu_dropdown_locator = (By.CSS_SELECTOR, "[class*=Dropdown__Tab]")
            _delete_confirmation_locator = (By.CSS_SELECTOR, "[class*=Confirmation]")
            _delete_confirmation_message_locator = (By.CSS_SELECTOR, "[class*=Confirmation] label")
            _delete_note_button_locator = (By.CSS_SELECTOR, "[class*=DropdownList] li:last-child a")
            _edit_note_button_locator = (By.CSS_SELECTOR, "[class*=DropdownList] li:first-child a")
            _highlight_blue_locator = (By.CSS_SELECTOR, "[name=blue]")
            _highlight_green_locator = (By.CSS_SELECTOR, "[name=green]")
            _highlight_login_overlay_locator = (
                By.CSS_SELECTOR,
                "[data-analytics-region=highlighting-login]",
            )
            _highlight_pink_locator = (By.CSS_SELECTOR, "[name=red], [name=pink]")
            _highlight_purple_locator = (By.CSS_SELECTOR, "[name=purple]")
            _highlight_yellow_locator = (By.CSS_SELECTOR, "[name=yellow]")
            _log_in_button_locator = (By.CSS_SELECTOR, "[href*=login]")
            _note_text_locator = (By.CSS_SELECTOR, "[class*=TruncatedText]")
            _save_annotation_button_locator = (By.CSS_SELECTOR, "[data-testid=save]")

            # --------------------------------------------------------------- #
            # Properties
            # --------------------------------------------------------------- #

            @property
            def blue(self) -> WebElement:
                """Return the blue highlight toggle input.

                :return: the blue circle highlight color toggle
                :rtype: WebElement

                """
                return self.find_element(*self._highlight_blue_locator)

            @property
            def cancel_button(self) -> WebElement:
                """Return the cancel annotation button.

                :return: the "Cancel" button
                :rtype: WebElement

                """
                return self.find_element(*self._cancel_annotation_button_locator)

            @property
            def confirm_delete_button(self) -> WebElement:
                """Return the confirm delete button.

                :return: the "Delete" confirmation button
                :rtype: WebElement

                """
                return self.find_element(*self._confirm_delete_note_button_locator)

            @property
            def content_menu_available(self) -> bool:
                """Return True if the context menu is displayed.

                :return: ``True`` if the context dropdown menu is displayed
                :rtype: bool

                """
                menu = self.find_element(*self._context_menu_dropdown_locator)
                return self.driver.execute_script(
                    COMPUTED_STYLES.format(field=".display != 'none';"), menu
                )

            @property
            def delete_button(self) -> WebElement:
                """Return the delete note button.

                :return: the "Delete" button
                :rtype: WebElement

                """
                return self.find_element(*self._delete_note_button_locator)

            @property
            def delete_confirmation_text(self) -> str:
                """Return the delete confirmation overlay text.

                :return: the delete confirmation overlay text content
                :rtype: str

                """
                return self.find_element(*self._delete_confirmation_message_locator).text

            @property
            def delete_confirmation_visible(self) -> bool:
                """Return True if the delete confirmation overlay is visible.

                :return: ``True`` if the delete note confirmation overlay and
                    buttons are visible
                :rtype: bool

                """
                return bool(self.find_elements(*self._delete_confirmation_locator))

            @property
            def display_note(self) -> WebElement:
                """Return the highlight note text box.

                :return: the highlight annotation text box
                :rtype: WebElement

                """
                return self.find_element(*self._note_text_locator)

            @property
            def edit_button(self) -> WebElement:
                """Return the edit note button.

                :return: the "Edit" button
                :rtype: WebElement

                """
                return self.find_element(*self._edit_note_button_locator)

            @property
            def green(self) -> WebElement:
                """Return the green highlight toggle input.

                :return: the green circle highlight color toggle
                :rtype: WebElement

                """
                return self.find_element(*self._highlight_green_locator)

            @property
            def is_display_box(self) -> bool:
                """Return True if the note box is a note display card.

                :return: ``True`` if the note box is a DisplayNote
                :rtype: bool

                """
                return "DisplayNote" in self.root.get_attribute("class")

            @property
            def is_edit_box(self) -> bool:
                """Return True if the note box is an edit card.

                :return: ``True`` if the note box is an EditCard
                :rtype: bool

                """
                return "EditCard" in self.root.get_attribute("class")

            @property
            def is_open(self) -> bool:
                """Return True if the highlight box is currently open.

                :return: ``True`` if this highlight box is currently open and
                    visible to the user
                :rtype: bool

                """
                display = self.driver.execute_script(
                    COMPUTED_STYLES.format(field=".display"), self.root
                )
                return display == "block"

            @property
            def login_overlay_present(self) -> bool:
                """Return True if the log in nudge is present.

                :return: ``True`` if the log in overlay and nudge are present
                :rtype: bool

                """
                return bool(self.find_elements(*self._highlight_login_overlay_locator))

            @property
            def note(self) -> str:
                """Return the highlight note.

                :return: the current highlight note text
                :rtype: str

                """
                try:
                    return self.display_note.text
                except NoSuchElementException:
                    return self.note_box.text

            @property
            def note_box(self) -> WebElement:
                """Return the highlight note text box.

                :return: the highlight annotation text box
                :rtype: WebElement

                """
                return self.find_element(*self._annotation_textbox_locator)

            @property
            def pink(self) -> WebElement:
                """Return the pink highlight toggle input.

                :return: the pink circle highlight color toggle
                :rtype: WebElement

                """
                return self.find_element(*self._highlight_pink_locator)

            @property
            def purple(self) -> WebElement:
                """Return the purple highlight toggle input.

                :return: the purple circle highlight color toggle
                :rtype: WebElement

                """
                return self.find_element(*self._highlight_purple_locator)

            @property
            def save_button(self) -> WebElement:
                """Return the save annotation button.

                :return: the "Save" button
                :rtype: WebElement

                """
                return self.find_element(*self._save_annotation_button_locator)

            @property
            def yellow(self) -> WebElement:
                """Return the yellow highlight toggle input.

                :return: the yellow circle highlight color toggle
                :rtype: WebElement

                """
                return self.find_element(*self._highlight_yellow_locator)

            # --------------------------------------------------------------- #
            # Functions
            # --------------------------------------------------------------- #

            def cancel(self) -> Content.Content.HighlightBox:
                """Click the cancel note button.

                :return: the highlight edit box

                """
                Utilities.click_option(self.driver, element=self.cancel_button)
                return self

            def close(self) -> Content.Content:
                """Click the close 'x' button to close the display note.

                :return: the page content
                :rtype: :py:class:`~Content.Content`
                :raises ContentError: if the close 'x' is not found

                """
                button = self.find_elements(*self._close_x_button_locator)
                if not button:
                    raise ContentError("x close button not found")
                Utilities.click_option(self.driver, element=button[0])
                return self.page

            def confirm_deletion(self):
                """Click the delete confirmation button."""
                sleep(0.25)
                Utilities.click_option(self.driver, element=self.confirm_delete_button)

            def delete(self) -> Content.Content:
                """Delete the highlight and note.

                :return: the page content
                :rtype: :py:class:`~Content.Content`

                """
                self.delete_note()
                self.confirm_deletion()
                self.wait.until(expected.staleness_of(self.root))
                return self.page

            def delete_note(self) -> Content.Content.HighlightBox:
                """Toggle the annotation delete menu option.

                :return: the delete highlight confirmation
                :rtype: :py:class:`~Content.Content.HighlightBox`

                """
                self.toggle_menu()
                Utilities.click_option(self.driver, element=self.delete_button)
                return self

            def edit_note(self) -> Content.Content.HighlightBox:
                """Toggle the annotation edit menu option.

                :return: the note edit box
                :rtype: :py:class:`~Content.Content.HighlightBox`

                """
                self.toggle_menu()
                Utilities.click_option(self.driver, element=self.edit_button)
                return self

            def is_checked(self, color: Color) -> bool:
                """Return True if the selected color is currently marked.

                :param color: the color option to test
                :type color: :py:class:`~utils.utility.Color`
                :return: ``True`` if the color is currently marked and active
                :rtype: bool

                """
                colors = {
                    Color.BLUE: self.blue,
                    Color.GREEN: self.green,
                    Color.PINK: self.pink,
                    Color.PURPLE: self.purple,
                    Color.YELLOW: self.yellow,
                }
                return self.driver.execute_script("return arguments[0].checked;", colors[color])

            def log_in(self) -> Union[None, Login]:
                """Click the 'Log in' overlay nudge button.

                :return: no return if the overlay is not presnt, the Accounts
                    log in page if the overlay is present
                :rtype: NoneType or :py:class:`~pages.accounts.Login`

                """
                if self.login_overlay_present:
                    button = self.find_element(*self._log_in_button_locator)
                    Utilities.click_option(self.driver, element=button)
                    destination = Login(self.driver)
                    destination.wait_for_page_to_load()
                    return destination

            @note.setter
            def note(self, note: str):
                """Set the annotation text for the highlight.

                :param str note: the annotation text for the selected highlight

                """
                if not note or self.note:
                    Utilities.clear_field(self.driver, self.note_box)
                self.note_box.send_keys(note)

            def resize(self, height: int) -> int:
                """Resize the annotation text box.

                .. note::
                   The height must equal or exceed the textarea's
                   ``min-height`` attribute for a change to occur; current
                   lower bound is ``56px``

                :param int height: the new height for the text box
                :return: the new textarea height or ``-1`` if no change is made
                :rtype: int

                """
                # Find the initial heights and sizes
                minimum_box_height = self.driver.execute_script(
                    COMPUTED_STYLES.format(field=".minHeight"), self.note
                )
                box_boundries = self.driver.execute_script(BOUNDING_RECTANGLE, self.note)
                current_box_height = box_boundries.get("height")

                # Find the vertical adjustment (negative moves up and shrinks
                # the box and positive moves down expanding the textarea)
                change = height - current_box_height
                if height < minimum_box_height or change == 0:
                    return -1
                resize_location_arrow = (box_boundries.get("width") - 3, current_box_height - 3)

                # Adjust the textarea
                ActionChains(self.driver).move_to_element_with_offset(
                    self.note, *resize_location_arrow
                ).click_and_hold().move_by_offset(0, change).release().perform()
                return self.driver.execute_script(BOUNDING_RECTANGLE, self.note).get("height")

            def save(self) -> Content.Content.HighlightBox:
                """Click the save note button.

                :return: the highlight display note box
                :rtype: :py:class:`~Content.Content.HighlightBox`

                """
                Utilities.click_option(self.driver, element=self.save_button)
                sleep(0.1)
                return self

            def toggle_color(self, color: Color) -> Content.Content.HighlightBox:
                """Toggle a highlight color.

                :param color: the color to toggle on or off
                :type color: :py:class:`~utils.utility.Color`
                :return: the highlight box
                :rtype: :py:class:`~Content.Content.HighlightBox`

                """
                colors = {
                    Color.BLUE: self.blue,
                    Color.GREEN: self.green,
                    Color.PINK: self.pink,
                    Color.PURPLE: self.purple,
                    Color.YELLOW: self.yellow,
                }
                Utilities.click_option(self.driver, element=colors[color])
                return self

            def toggle_menu(self) -> Content.Content.HighlightBox:
                """Toggle the edit/delete note menu open or close.

                :return: the highlight box
                :rtype: :py:class:`~Content.Content.HighlightBox`

                """
                toggle = self.find_elements(*self._alter_menu_toggle_locator)
                if not toggle:
                    raise ContentError("Edit/Delete menu toggle not found")
                Utilities.click_option(self.driver, element=toggle[0])
                return self

    class Error(Region):
        """An error pop up modal."""

        _clear_error_button_locator = (By.CSS_SELECTOR, "[class*=Footer] button")
        _content_text_locator = (By.CSS_SELECTOR, "[class*=BodyError]")
        _heading_text_locator = (By.CSS_SELECTOR, "[class*=BodyHeading]")
        _help_link_locator = (By.CSS_SELECTOR, "a")
        _title_text_locator = (By.CSS_SELECTOR, "[class*='_Heading']")

        @property
        def content(self) -> str:
            """Return the error content text.

            :return: the error modal body text
            :rtype: str

            """
            return (
                self.find_element(*self._content_text_locator).get_attribute("textContent").strip()
            )

        @property
        def heading(self) -> str:
            """Return the error heading text.

            :return: the error modal header
            :rtype: str

            """
            return self.find_element(*self._heading_text_locator).text

        @property
        def help_link(self) -> WebElement:
            """Return the Support Center link.

            :return: the support center help link
            :rtype: WebElement

            """
            return self.find_element(*self._help_link_locator)

        @property
        def title(self) -> str:
            """Return the modal title.

            :return: the modal title
            :rtype: str

            """
            return self.find_element(*self._title_text_locator).text

        def ok(self) -> Content:
            """Click the OK button to close the error modal.

            :return: the parent content page
            :rtype: Content

            """
            button = self.find_element(*self._clear_error_button_locator)
            Utilities.click_option(self.driver, element=button)
            self.wait.until(expected.staleness_of(self.root))
            return self.page

    class MobileSearchToolbar(Region):
        _search_textbox_mobile_locator = (By.CSS_SELECTOR, "[data-testid='mobile-search-input']")
        _back_to_results_locator = (By.CSS_SELECTOR, "[data-testid='back-to-search-results']")
        _close_search_results_locator = (By.CSS_SELECTOR, "[data-testid='close-search-results']")
        _search_textbox_x_locator = (By.CSS_SELECTOR, "[data-testid='mobile-clear-search']")

        @property
        def search_textbox(self) -> WebElement:
            """Return the search textbox in mobile view."""
            return self.find_element(*self._search_textbox_mobile_locator)

        @property
        def search_term_displayed_in_search_textbox(self):
            """Return the search term displayed in search textbox in mobile view."""
            return self.search_textbox.get_attribute("value")

        @property
        def back_to_results(self):
            """Return the back to search results link in mobile view."""
            return self.find_element(*self._back_to_results_locator)

        @property
        def close_search_results(self):
            """Return the close search results link in mobile view."""
            return self.find_element(*self._close_search_results_locator)

        @property
        def search_textbox_x(self):
            """Return the X in search textbox, mobile view."""
            return self.find_element(*self._search_textbox_x_locator)

        def click_back_to_search_results_button(self):
            """Clicks the back to search results link in mobile view."""
            Utilities.click_option(self.driver, element=self.back_to_results)

        def click_close_search_results_link(self):
            """Clicks the close search results link in mobile view."""
            Utilities.click_option(self.driver, element=self.close_search_results)

        def click_search_textbox_x(self):
            """Clicks the X in search textbox, mobile view."""
            Utilities.click_option(self.driver, element=self.search_textbox_x)

        def search_for(self, search_term: str) -> SearchSidebar:
            """Search for a term/query in mobile resolution.

            :param str search_term: search_term defined in the test
            :return: search sidebar region with the search results
            :rtype: :py:class:`~regions.search_sidebar.SearchSidebar`

            Click the search icon in the toolbar
            Enter the search term in the search textbox and hit Enter/Return
            Search results display in the search sidebar.

            """
            self.page.toolbar.click_search_icon()
            self.search_textbox.send_keys(search_term)
            self.offscreen_click(self.search_textbox)
            self.page.search_sidebar.wait_for_region_to_display()
            sleep(1.0)
            return self.page.search_sidebar

    class NavBar(Region):

        _root_locator = (By.CSS_SELECTOR, '[data-testid="navbar"]')

        _account_profile_locator = (By.XPATH, "//a[contains(text(), 'Account Profile')]")
        _login_locator = (By.CSS_SELECTOR, "[data-testid='nav-login']")
        _logout_locator = (By.XPATH, "//a[contains(text(), 'Log out')]")
        _openstax_logo_link_locator = (By.CSS_SELECTOR, "div > a")
        _user_nav_locator = (By.CSS_SELECTOR, "[data-testid='user-nav']")
        _user_nav_toggle_locator = (By.CSS_SELECTOR, "[data-testid='user-nav-toggle']")

        @property
        def openstax_logo_link(self) -> str:
            return self.find_element(*self._openstax_logo_link_locator).get_attribute("href")

        @property
        def user_nav(self) -> WebElement:
            return self.find_element(*self._user_nav_locator)

        @property
        def login(self) -> WebElement:
            return self.find_element(*self._login_locator)

        @property
        def user_nav_toggle(self):
            return self.find_element(*self._user_nav_toggle_locator)

        @property
        def user_is_not_logged_in(self) -> bool:
            try:
                self.wait.until(expected.visibility_of_element_located(self._login_locator))
                return True
            except TimeoutException:
                return False

        @property
        def user_is_logged_in(self) -> bool:
            try:
                self.wait.until(
                    expected.visibility_of_element_located(self._user_nav_toggle_locator)
                )
                return True
            except TimeoutException:
                return False

        @property
        def account_profile_is_displayed(self) -> bool:
            try:
                return self.find_element(*self._account_profile_locator).is_displayed()
            except NoSuchElementException:
                return False

        @property
        def logout_is_displayed(self) -> bool:
            return expected.visibility_of_element_located(self._logout_locator)

        @property
        def logout(self) -> WebElement:
            return self.find_element(*self._logout_locator)

        def click_login(self):
            self.wait.until(expected.visibility_of_element_located(self._login_locator))
            Utilities.click_option(self.driver, element=self.login)

        def click_logout(self):
            Utilities.click_option(self.driver, element=self.logout)

        def click_user_name(self):
            self.wait.until(expected.visibility_of_element_located(self._user_nav_locator))
            Utilities.click_option(self.driver, element=self.user_nav)

    class Notification(Region):
        """A pop up notification box."""

        _acknowledge_button_locator = (By.CSS_SELECTOR, "button")
        _content_text_locator = (By.CSS_SELECTOR, "p")
        _notification_title_locator = (By.CSS_SELECTOR, "[class*=Header]")

        @property
        def button(self) -> WebElement:
            """Return the pop up notification box button.

            :return: the notification confirmation button
            :rtype: WebElement

            """
            return self.find_element(*self._acknowledge_button_locator)

        @property
        def content(self) -> str:
            """Return the pop up box body text content.

            :return: the pop up notification body content text
            :rtype: str

            """
            return " ".join([body.text for body in self.find_elements(*self._content_text_locator)])

        @property
        def title(self) -> str:
            """Return the pop up box heading.

            :return: the pop up notification heading/title
            :rtype: str

            """
            return self.find_element(*self._notification_title_locator).text

        def click(self) -> Page:
            """Click on the pop up notification box button.

            :return: the parent page
            :rtype: Page

            """
            Utilities.click_option(self.driver, element=self.button)
            self.wait.until(expected.staleness_of(self.root))
            return self.page

        got_it = click

    class DiscardModal(Region):
        """Unsaved notes discard modal."""

        _content_text_locator = (By.CSS_SELECTOR, "[class*=BodyHeading]")
        _title_text_locator = (By.CSS_SELECTOR, "[class*=Heading]")
        _discard_button_locator = (By.CSS_SELECTOR, "[data-testid*='discard-changes']")
        _cancel_button_locator = (By.CSS_SELECTOR, "[data-testid*='cancel-discard']")

        @property
        def content(self) -> str:
            """Return the modal content text.

            :return: the modal body text
            :rtype: str

            """
            return (
                self.find_element(*self._content_text_locator).get_attribute("textContent").strip()
            )

        @property
        def title(self) -> str:
            """Return the modal title.

            :return: the modal title
            :rtype: str

            """
            return self.find_element(*self._title_text_locator).text

        @property
        def discard_button(self):
            return self.find_element(*self._discard_button_locator)

        def click_discard_changes(self):
            """Click the Discard Changes button & close the modal.

            :return: the parent content page
            :rtype: Content

            """
            Utilities.click_option(self.driver, element=self.discard_button)
            self.wait.until(expected.staleness_of(self.root))

        def click_cancel_changes(self):
            """Click the cancel button & close the modal.

            :return: the parent content page
            :rtype: Content

            """
            button = self.find_element(*self._cancel_button_locator)
            Utilities.click_option(self.driver, element=button)
            self.wait.until(expected.staleness_of(self.root))

    class SideBar(Region):

        _root_locator = (By.CSS_SELECTOR, "[aria-label='Table of Contents']")

        @property
        def header(self) -> Content.SideBar.Header:
            return self.Header(self.page)

        @property
        def toc(self) -> TableOfContents:
            return TableOfContents(self.page)

        class Header(Region):

            _root_locator = (By.CSS_SELECTOR, '[data-testid="tocheader"]')

            _toc_toggle_button_locator = (
                By.CSS_SELECTOR,
                "[aria-label*='close the Table of Contents']",
            )

            @property
            def toc_toggle_button(self) -> WebElement:
                return self.find_element(*self._toc_toggle_button_locator)

            def click_toc_toggle_button(self) -> WebElement:
                self.offscreen_click(self.toc_toggle_button)
                return self.wait.until(
                    expected.invisibility_of_element_located(self.toc_toggle_button)
                )

    class ToolBar(Region):

        _root_locator = (By.CSS_SELECTOR, "[data-testid='toolbar']")

        _my_highlights_button_locator = (By.CSS_SELECTOR, "[class*=MyHighlightsWrapper]")
        _search_button_desktop_locator = (By.CSS_SELECTOR, "button:nth-of-type(2)[value='Search']")
        _search_button_mobile_locator = (By.CSS_SELECTOR, "[data-testid='mobile-toggle']")
        _search_textbox_desktop_locator = (By.CSS_SELECTOR, "[data-testid='desktop-search-input']")
        _toc_toggle_button_locator = (By.CSS_SELECTOR, "[aria-label*='open the Table of Contents']")
        _search_textbox_x_locator = (By.CSS_SELECTOR, "[data-testid='desktop-clear-search']")

        _my_highlights_selector = "[data-testid=highlights-popup-wrapper]"

        @property
        def my_highlights_button(self) -> WebElement:
            return self.find_element(*self._my_highlights_button_locator)

        @property
        def search_button(self) -> WebElement:
            """Return the desktop view search icon within the search box."""
            return self.find_element(*self._search_button_desktop_locator)

        @property
        def search_button_mobile(self) -> WebElement:
            """Return the search icon in mobile view."""
            return self.find_element(*self._search_button_mobile_locator)

        @property
        def search_textbox(self) -> WebElement:
            """Return the search textbox in desktop view."""
            return self.find_element(*self._search_textbox_desktop_locator)

        @property
        def search_textbox_x(self) -> WebElement:
            """Return the search textbox X in desktop view."""
            return self.find_element(*self._search_textbox_x_locator)

        @property
        def search_term_displayed_in_search_textbox(self):
            """Return the search term in desktop view."""
            return self.search_textbox.get_attribute("value")

        @property
        def toc_toggle_button(self) -> WebElement:
            return self.find_element(*self._toc_toggle_button_locator)

        def click_search_icon(self) -> WebElement:
            """Clicks the search icon in mobile view."""
            self.offscreen_click(self.search_button_mobile)

        def click_search_textbox_x(self) -> WebElement:
            """Clicks the X in search textbox, desktop view."""
            return self.offscreen_click(self.search_textbox_x)

        def click_toc_toggle_button(self) -> Content.SideBar:
            """Clicks the TOC toggle button."""
            self.offscreen_click(self.toc_toggle_button)
            return self.page.sidebar.wait_for_region_to_display()

        def my_highlights(self) -> MyHighlights:
            """Click the My highlights toolbar button.

            :return: the My Highlights and Notes modal
            :rtype: :py:class:`~regions.my_highlights.MyHighlights`

            """
            Utilities.click_option(self.driver, element=self.my_highlights_button)
            sleep(0.1)
            my_highlights_root = self.driver.execute_script(
                ELEMENT_SELECT.format(selector=self._my_highlights_selector)
            )
            return MyHighlights(self.page, my_highlights_root)

        def search_for(self, search_term: str) -> Content.SideBar:
            """Search for a term/query in desktop resolution.

            :param str search_term: search_term defined in the test
            :return: search sidebar region with the search results
            :rtype: :py:class:`~regions.search_sidebar.SearchSidebar`

            Enter the search term in the search textbox and hit Enter/Return
            Search results display in the search sidebar.

            """
            self.search_textbox.send_keys(search_term)
            self.offscreen_click(self.search_button)
            self.page.search_sidebar.wait_for_region_to_display()
            sleep(1.0)
            return self.page.search_sidebar
