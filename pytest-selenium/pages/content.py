"""A Reading Experience book content page."""

from __future__ import annotations

from math import ceil as round_up
from random import randint
from typing import List, Union

from selenium.common.exceptions import NoSuchElementException, TimeoutException
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.by import By
from selenium.webdriver.common.touch_actions import TouchActions
from selenium.webdriver.remote.webelement import WebElement
from selenium.webdriver.support import expected_conditions as expected

from pages.base import Page
from regions.base import Region
from regions.search_sidebar import SearchSidebar
from regions.toc import TableOfContents
from utils.utility import Highlight, Utilities


BOUNDING_RECTANGLE = "return arguments[0].getBoundingClientRect();"
COMPUTED_STYLES = "return window.getComputedStyle(arguments[0]){field};"


class Content(Page):
    URL_TEMPLATE = "/books/{book_slug}/pages/{page_slug}"
    _body_locator = (By.TAG_NAME, "body")
    _main_content_locator = (By.CSS_SELECTOR, "h1")
    _next_locator = (By.CSS_SELECTOR, "[aria-label='Next Page']")
    _notification_pop_up_locator = (
        By.CSS_SELECTOR, "[class*=ContentNotifications]")
    _previous_locator = (By.CSS_SELECTOR, "[aria-label='Previous Page']")
    _print_locator = (By.CSS_SELECTOR, '[data-testid="print"]')

    @property
    def loaded(self):
        return self.find_element(*self._body_locator).get_attribute("data-rex-loaded")

    @property
    def print(self):
        return self.find_element(*self._print_locator)

    @property
    def previous_link(self):
        return self.find_element(*self._previous_locator)

    @property
    def next_link(self):
        return self.find_element(*self._next_locator)

    @property
    def previous_link_is_displayed(self):
        try:
            return self.previous_link.is_displayed()
        except NoSuchElementException:
            return False

    @property
    def next_link_is_displayed(self):
        try:
            return self.next_link.is_displayed()
        except NoSuchElementException:
            return False

    @property
    def navbar(self):
        return self.NavBar(self)

    @property
    def bookbanner(self):
        return self.BookBanner(self)

    @property
    def toolbar(self):
        return self.ToolBar(self)

    @property
    def mobile_search_toolbar(self):
        return self.MobileSearchToolbar(self)

    @property
    def search_sidebar(self):
        return SearchSidebar(self)

    @property
    def sidebar(self):
        return self.SideBar(self)

    @property
    def attribution(self):
        return self.Attribution(self)

    @property
    def content(self):
        """Access the main book content region."""
        return self.Content(self)

    @property
    def sidebar_width_offset(self):
        sidebar_width = self.width(self.sidebar.root)
        sidebar_width_left_offset = self.sidebar.root.get_attribute("offsetLeft")
        sidebar_width_offset = int(sidebar_width) + int(sidebar_width_left_offset)
        return sidebar_width_offset

    @property
    def sidebar_height_offset(self):
        navbar_height = self.height(self.navbar.root)
        bookbanner_height = self.height(self.bookbanner.root)
        sidebar_height_offset = int(navbar_height) + int(bookbanner_height)
        return sidebar_height_offset

    @property
    def window_height(self):
        window_height = int(self.height(self.sidebar.root)) + self.sidebar_height_offset
        return window_height

    def scroll_over_content_overlay(self):
        """Touch and scroll starting at on_element, moving by xoffset and yoffset.

        x & y are random numbers computed from the sidebar/window width/height respectively.
        Using touchactions to scroll from the print element.
        Selenium is not throwing any exception while scrolling over the content overlay using scroll(x,y).
        Hence using scroll_from_element(element, x, y) to capture & assert the exception in the test.
        """
        x = randint(self.sidebar_width_offset, self.window_width)
        y = randint(self.sidebar_height_offset, self.window_height)

        if self.driver == "chrome":
            touchActions = TouchActions(self.driver)
            touchActions.scroll_from_element(self.print, x, y).perform()

        # Touch actions is not working for safari & firefox. Hence scrolling using javascript
        else:
            self.driver.execute_script(f"scrollBy({x}, {y});")

    scroll_through_page = scroll_over_content_overlay

    def click_content_overlay(self):
        """Click anywhere in the content overlay

        x & y are random numbers computed from the sidebar/window width/height
        respectively. Using actionchains to click on this position.
        """
        x = randint(self.sidebar_width_offset, self.window_width)
        y = randint(self.sidebar_height_offset, self.window_height)

        (ActionChains(self.driver)
            .move_to_element_with_offset(
                self.driver.find_element_by_tag_name("body"), 0, 0)
            .move_by_offset(x, y)
            .click()
            .perform())
        return self.wait.until(
            expected.invisibility_of_element_located(
                self.sidebar.header.toc_toggle_button)
        )

    def click_next_link(self):
        self.click_and_wait_for_load(self.next_link)

    def click_previous_link(self):
        self.click_and_wait_for_load(self.previous_link)

    @property
    def notification(self) -> Content.Notification:
        """Access a content notification box."""
        box_root = self.find_element(*self._notification_pop_up_locator)
        return self.Notification(self, box_root)

    @property
    def notification_present(self) -> bool:
        """Return True if a pop up content notification is found.

        :return: ``True`` when a pop up notification is found ("Privacy
            and cookies")
        :rtype: bool

        """
        return bool(self.find_elements(*self._notification_pop_up_locator))

    class NavBar(Region):
        _root_locator = (By.CSS_SELECTOR, '[data-testid="navbar"]')
        _openstax_logo_link_locator = (By.CSS_SELECTOR, "div > a")
        _user_nav_locator = (By.CSS_SELECTOR, "[data-testid='user-nav']")
        _login_locator = (By.CSS_SELECTOR, "[data-testid='nav-login']")
        _user_nav_toggle_locator = (By.CSS_SELECTOR, "[data-testid='user-nav-toggle']")
        _account_profile_locator = (By.XPATH, "//a[contains(text(), 'Account Profile')]")
        _logout_locator = (By.XPATH, "//a[contains(text(), 'Log out')]")

        @property
        def openstax_logo_link(self):
            return self.find_element(*self._openstax_logo_link_locator).get_attribute("href")

        @property
        def user_nav(self):
            return self.find_element(*self._user_nav_locator)

        @property
        def login(self):
            return self.find_element(*self._login_locator)

        @property
        def user_is_not_logged_in(self):
            try:
                self.wait.until(expected.visibility_of_element_located(self._login_locator))
                return bool(self.find_element(*self._login_locator))
            except TimeoutException:
                return bool([])

        @property
        def user_is_logged_in(self):
            try:
                self.wait.until(
                    expected.visibility_of_element_located(self._user_nav_toggle_locator)
                )
                return bool(self.find_element(*self._user_nav_toggle_locator))
            except TimeoutException:
                return bool([])

        @property
        def account_profile_is_displayed(self):
            try:
                if self.find_element(*self._account_profile_locator).is_displayed():
                    return True
            except NoSuchElementException:
                return False

        @property
        def logout_is_displayed(self):
            return expected.visibility_of_element_located(self._logout_locator)

        @property
        def logout(self):
            return self.find_element(*self._logout_locator)

        def click_login(self):
            self.wait.until(expected.visibility_of_element_located(self._login_locator))
            Utilities.click_option(self.driver, element=self.login)

        def click_logout(self):
            Utilities.click_option(self.driver, element=self.logout)

        def click_user_name(self):
            self.wait.until(expected.visibility_of_element_located((self._user_nav_locator)))
            Utilities.click_option(self.driver, element=self.user_nav)

    class BookBanner(Region):
        _root_locator = (By.CSS_SELECTOR, '[data-testid="bookbanner"]')
        _book_title_locator = (By.CSS_SELECTOR, "div > a")
        _chapter_title_locator = (By.CSS_SELECTOR, "div > h1 > span.os-text")
        _chapter_section_locator = (By.CSS_SELECTOR, "div > h1 > span.os-number")

        @property
        def book_title(self):
            return self.find_element(*self._book_title_locator)

        @property
        def chapter_title(self):
            return self.find_element(*self._chapter_title_locator).text

        @property
        def chapter_section(self):
            # The section isn't always included on the page so we return None
            try:
                element = self.find_element(*self._chapter_section_locator)
                return element.text
            except NoSuchElementException:
                return None

    class ToolBar(Region):
        _root_locator = (By.CSS_SELECTOR, "[data-testid='toolbar']")
        _toc_toggle_button_locator = (
            By.CSS_SELECTOR,
            "[aria-label='Click to open the Table of Contents']",
        )
        _search_textbox_desktop_locator = (By.CSS_SELECTOR, "[data-testid='desktop-search-input']")
        _search_button_desktop_locator = (By.CSS_SELECTOR, "button:nth-of-type(2)[value='Search']")
        _search_button_mobile_locator = (By.CSS_SELECTOR, "[data-testid='mobile-toggle']")

        @property
        def toc_toggle_button(self):
            return self.find_element(*self._toc_toggle_button_locator)

        @property
        def search_textbox(self):
            return self.find_element(*self._search_textbox_desktop_locator)

        @property
        def search_button(self):
            """Return the desktop view search icon within the search text box."""

            return self.find_element(*self._search_button_desktop_locator)

        @property
        def search_button_mobile(self):
            return self.find_element(*self._search_button_mobile_locator)

        def click_toc_toggle_button(self):
            self.offscreen_click(self.toc_toggle_button)
            return self.page.sidebar.wait_for_region_to_display()

        def click_search_icon(self):
            """Clicks the search icon in mobile view."""

            self.offscreen_click(self.search_button_mobile)

        def search_for(self, element):
            """Search for a term/query in desktop resolution.

            :element: type -> str: search_term defined in the test
            :return: search sidebar region with the search results

            Enter the search term in the search textbox and hit Enter/Return
            Search results display in the search sidebar.

            """
            self.search_textbox.send_keys(element)
            self.offscreen_click(self.search_button)
            self.page.search_sidebar.wait_for_region_to_display()

    class MobileSearchToolbar(Region):
        _search_textbox_mobile_locator = (By.CSS_SELECTOR, "[data-testid='mobile-search-input']")

        @property
        def search_textbox(self):
            return self.find_element(*self._search_textbox_mobile_locator)

        def search_for(self, element):
            """Search for a term/query in mobile resolution.

            :element: type -> str: search_term defined in the test
            :return: search sidebar region with the search results

            Click the search icon in the toolbar
            Enter the search term in the search textbox and hit Enter/Return
            Search results display in the search sidebar.

            """
            self.page.toolbar.click_search_icon()
            self.search_textbox.send_keys(element)
            self.offscreen_click(self.search_textbox)
            self.page.search_sidebar.wait_for_region_to_display()

    class SideBar(Region):
        _root_locator = (By.CSS_SELECTOR, "[aria-label='Table of Contents']")

        @property
        def header(self):
            return self.Header(self.page)

        @property
        def toc(self):
            return TableOfContents(self.page)

        class Header(Region):
            _root_locator = (By.CSS_SELECTOR, '[data-testid="tocheader"]')
            _toc_toggle_button_locator = (
                By.CSS_SELECTOR,
                "[aria-label='Click to close the Table of Contents']",
            )

            @property
            def toc_toggle_button(self):
                return self.find_element(*self._toc_toggle_button_locator)

            def click_toc_toggle_button(self):
                self.offscreen_click(self.toc_toggle_button)
                return self.wait.until(
                    expected.invisibility_of_element_located(self.toc_toggle_button)
                )

    class Attribution(Region):
        _root_locator = (By.CSS_SELECTOR, '[data-testid="attribution-details"]')
        _attribution_toggle_locator = (
            By.CSS_SELECTOR,
            '[data-testid="attribution-details"] summary',
        )
        _section_url_locator = (By.XPATH, "//*[contains(text(), 'Section URL')]/a")
        _book_url_locator = (By.XPATH, "//*[contains(text(), 'Book URL')]/a")
        _access_free_locator = (By.XPATH, "//*[contains(text(), 'Access for free at')]/a")

        @property
        def attribution_link(self):
            return self.find_element(*self._attribution_toggle_locator)

        @property
        def is_open(self):
            return bool(self.root.get_attribute("open"))

        @property
        def section_url_within_attribution(self):
            return self.find_element(*self._section_url_locator)

        @property
        def section_url(self):
            return self.section_url_within_attribution.get_attribute("href")

        @property
        def book_url(self):
            return self.find_element(*self._book_url_locator).get_attribute("href")

        @property
        def access_free_url(self):
            return self.find_element(*self._access_free_locator).get_attribute("href")

        def click_attribution_link(self):
            self.offscreen_click(self.attribution_link)
            self.page.attribution.wait_for_region_to_display()

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
            return " ".join(
                [body.text
                 for body
                 in self.find_elements(*self._content_text_locator)])

        @property
        def title(self) -> str:
            """Return the pop up box heading.

            :return: the pop up notification heading/title
            :rtype: str

            """
            return (self.find_element(*self._notification_title_locator)
                    .text)

        def click(self) -> Page:
            """Click on the pop up notification box button.

            :return: the parent page
            :rtype: Page

            """
            Utilities.click_option(self.driver, element=self.button)
            self.wait.until(expected.staleness_of(self.root))
            return self.page

        got_it = click

    class Content(Region):
        """The main content for the book section."""

        _root_locator = (By.CSS_SELECTOR, "[class*=MinPageHeight]")

        _figure_container_locator = (
            By.CSS_SELECTOR, ".os-figure")
        _figure_locator = (
            By.CSS_SELECTOR, "figure")
        _highlight_box_locator = (
            By.CSS_SELECTOR, "form[class*=StyledCard]")
        _highlighted_element_locator = (
            By.CSS_SELECTOR, ".highlight")
        _list_locator = (
            By.CSS_SELECTOR, "ol, ul")
        _math_equation_locator = (
            By.CSS_SELECTOR, "[data-type=equation] .math, p .math")
        _show_solution_toggle_locator = (
            By.CSS_SELECTOR, "[aria-label='show solution'] button, "
                             "[data-type=solution]:not([aria-label]) button")
        _table_locator = (
            By.CSS_SELECTOR, "table")
        _text_content_locator = (
            By.CSS_SELECTOR, "p[id^='fs-']:not([data-depth])"
                             ":not([data-bullet-style]):not([type])")

        @property
        def figures(self) -> List[WebElement]:
            """Return the list of figures in the current book section.

            :return: the list of parent elements for each page figure, which
                excludes their respective captions
            :rtype: list(WebElement)

            """
            return [figure
                    for figure
                    in self.find_elements(*self._figure_locator)]

        @property
        def figures_and_captions(self) -> List[WebElement]:
            """Return the list of figures with their captions in the section.

            :return: the list of os-figure parent elements for each page
                figure, which includes their respective captions
            :rtype: list(WebElement)

            """
            return [figure_and_caption
                    for figure_and_caption
                    in self.find_elements(*self._figure_container_locator)]

        @property
        def highlight_box(self) -> Content.Content.HighlightBox:
            """Access the highlight and annotation pop up box.

            Search for the open (displayed) highlight box.

            :return: the highlight control
            :rtype: Content.Content.HighlightBox

            """
            highlights = self.find_elements(*self._highlight_box_locator)
            for box in highlights:
                display = self.driver.execute_script(
                    COMPUTED_STYLES.format(field=".display"), box)
                if display != "none":
                    return self.HighlightBox(self, box)
            raise NoSuchElementException("No open highlight boxes found")

        @property
        def highlight_count(self) -> int:
            """Return the number of highlight elements found in the content.

            .. note::
               Highlights may be broken into pieces so the count will equal or
               exceed the number of highlights.

            :return: the number of highlight spans in the content
            :rtype: int

            """
            return len(self.find_elements(*self._highlighted_element_locator))

        @property
        def lists(self) -> List[WebElement]:
            """Return the root elements for ordered and unordered lists.

            :return: the list of parent elements for each ordered and unordered
                list
            :rtype: list(WebElement)

            """
            return [list_group
                    for list_group
                    in self.find_elements(*self._list_locator)]

        @property
        def math(self) -> List[WebElement]:
            """Return the list of rendered MathML equations or text.

            :return: the list of available MathML rendered equations
            :rtype: list(WebElement)list(WebElement)

            """
            return [equation
                    for equation
                    in self.find_elements(*self._math_equation_locator)]

        @property
        def paragraphs(self) -> List[WebElement]:
            """Return the standard text sections.

            .. note::
               Leaves out structured text, bullet lists and other specialized
               text "type"s.

            :return: the list of text content paragraphs
            :rtype: list(WebElement)

            """
            return [text
                    for text
                    in self.find_elements(*self._text_content_locator)]

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
            return [toggle
                    for toggle
                    in self.find_elements(*self._show_solution_toggle_locator)]

        @property
        def tables(self) -> List[WebElement]:
            """Return the root elements for each table.

            :return: the list of tables found within the main content
            :rtype: list(WebElement)list(WebElement)

            """
            return [table
                    for table
                    in self.find_elements(*self._table_locator)]

        def highlight(self,
                      target: WebElement,
                      offset: Union[Highlight.Offset, int] = Highlight.RANDOM,
                      color: int = Highlight.YELLOW,
                      note: str = ""):
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
            :type target: WebElement
            :type offset: tuple(int, int), int
            :type color: int
            :type note: str
            :return: None
            :raises ValueError: when the offset value is not a tuple, or a
                registered value like Highlight.RANDOM or Highlight.ENTIRE

            """
            # Scroll the page to bring the element into view then shift due to
            # the top bars
            self.driver.execute_script(
                "arguments[0].scrollIntoView();", target)
            self.driver.execute_script(
                "window.scrollBy(0, -130);")

            # Retrieve the element area information
            boundry = self.driver.execute_script(BOUNDING_RECTANGLE, target)

            # And round up the computed height and width values
            width = round_up(boundry.get("width"))
            height = round_up(boundry.get("height"))

            # Determine where to start and stop the hightlight
            # Normally begin at the top left except for tables, which should
            # begin within the first cell (ignore the table/cell borders)
            start = (0, 0) if "table" not in target.tag_name else (3, 3)
            retag = tuple(sum(x) for x in zip(start, (1, 1)))
            if offset == Highlight.ENTIRE:
                end = (width - 1,
                       height - 1)
            elif offset == Highlight.RANDOM:
                end = (randint(10, max(10, width)),
                       randint(20, max(20, height)))
            elif isinstance(offset, tuple) and len(offset) == 2:
                end = offset
            else:
                raise ValueError(f"{offset} not a valid offset or option")

            # If not a math highlight, highlight the section starting from the
            # top left (0 x 0) to the chosen end point to the right and down
            # (10 <= x < width, 19 <= y < height)
            # then click near the top left of the element because the
            # ActionChain click and hold isn't always registered as a "click"
            # by the highlighting listener
            if "math" not in target.get_attribute("class"):
                (ActionChains(self.driver)
                    .move_to_element_with_offset(target, *start)
                    .click_and_hold()
                    .move_by_offset(*end)
                    .release()
                    .move_to_element_with_offset(target, *retag)
                    .click()
                    .perform())
            # If highlighting math, double click in the middle of the math
            else:
                (ActionChains(self.driver)
                    .move_to_element(target)
                    .double_click(target)
                    .perform())

            # Select the highlight color
            self.highlight_box.toggle(color)

            # Enter the annotation text, if present
            if note:
                # TODO: save the note and return the note display box
                # self.highlight_box.note = note
                # self.highlight_box.save()
                # return <Note Display Box>
                pass

            # Click outside of the box and highlight to close the box
            ActionChains(self.driver) \
                .move_to_element_with_offset(self.root, 5, 0) \
                .click() \
                .perform()

        def show_solutions(self):
            """Open each closed solution then return to the top of the page.

            :return: None

            """
            for toggle in self.solution_toggles:
                self.driver.execute_script(
                    "arguments[0].scrollIntoView();", toggle)
                self.driver.execute_script(
                    "window.scrollBy(0, -130);")
                Utilities.click_option(self.driver, element=toggle)
            Utilities.scroll_top(self.driver)

        class HighlightBox(Region):
            """The highlight color and annotation box."""

            _annotation_textbox_locator = (
                By.CSS_SELECTOR, "textarea")
            _cancel_annotation_button_locator = (
                By.CSS_SELECTOR, "[data-testid=cancel]")
            _highlight_blue_locator = (
                By.CSS_SELECTOR, "[name=blue]")
            _highlight_green_locator = (
                By.CSS_SELECTOR, "[name=green]")
            _highlight_pink_locator = (
                By.CSS_SELECTOR, "[name=red], [name=pink]")
            _highlight_purple_locator = (
                By.CSS_SELECTOR, "[name=purple]")
            _highlight_yellow_locator = (
                By.CSS_SELECTOR, "[name=yellow]")
            _save_annotation_button_locator = (
                By.CSS_SELECTOR, "[data-testid=save]")

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
                return self.find_element(
                    *self._cancel_annotation_button_locator)

            @property
            def green(self) -> WebElement:
                """Return the green highlight toggle input.

                :return: the green circle highlight color toggle
                :rtype: WebElement

                """
                return self.find_element(*self._highlight_green_locator)

            @property
            def note(self) -> WebElement:
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

            def cancel(self) -> Content.Content.HighlightBox:
                """Click the cancel note button.

                :return: the highlight edit box

                """
                Utilities.click_option(self.driver, element=self.cancel_button)
                return self

            @note.setter
            def note(self, note: str):
                """Set the annotation text for the highlight.

                :param str note: the annotation text for the selected highlight
                :return: None

                """
                if note:
                    self.note.send_keys(note)

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
                    COMPUTED_STYLES.format(field=".minHeight"), self.note)
                box_boundries = self.driver.execute_script(
                    BOUNDING_RECTANGLE, self.note)
                current_box_height = box_boundries.get("height")

                # Find the vertical adjustment (negative moves up and shrinks
                # the box and positive moves down expanding the textarea)
                change = height - current_box_height
                if height < minimum_box_height or change == 0:
                    return -1
                resize_location_arrow = (box_boundries.get("width") - 3,
                                         current_box_height - 3)

                # Adjust the textarea
                ActionChains(self.driver) \
                    .move_to_element_with_offset(self.note,
                                                 *resize_location_arrow) \
                    .click_and_hold() \
                    .move_by_offset(0, change) \
                    .release() \
                    .perform()
                return self.driver.execute_script(
                    BOUNDING_RECTANGLE, self.note).get("height")

            def save(self) -> Content.Content.HighlightBox:
                """Click the save note button.

                :return: the highlight display note box
                :rtype: Content.Content.HighlightBox

                """
                Utilities.click_option(self.driver, element=self.save_button)
                # TODO: return the display note box

            def toggle(self, color: int) -> Content.Content.HighlightBox:
                """Toggle a highlight color.

                :param int color: the color to toggle on or off
                :return: the highlight box
                :rtype: HighlightBox

                """
                colors = {Highlight.BLUE: self.blue,
                          Highlight.GREEN: self.green,
                          Highlight.PINK: self.pink,
                          Highlight.PURPLE: self.purple,
                          Highlight.YELLOW: self.yellow, }
                Utilities.click_option(self.driver, element=colors[color])
                return self
