"""The Study Guides modal."""

from __future__ import annotations

from time import sleep
from typing import List, Union

from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webelement import WebElement
from selenium.webdriver.support import expected_conditions as expect

from pages.base import Page
from regions.base import Region
from utils.utility import Color, Utilities


class StudyGuide(Region):
    """The Study Guides pop up modal region."""

    _content_body_locator = (
        By.CSS_SELECTOR, "[data-testid*=guides-body] > [class*=StudyGuides]")
    _go_to_top_button_locator = (
        By.CSS_SELECTOR, "[class*=GoToTop]")
    _header_bar_locator = (
        By.CSS_SELECTOR, "h3")
    _toolbar_locator = (
        By.CSS_SELECTOR, "[data-testid*=guides-body] > [class*=Filters]")

    @property
    def loaded(self) -> bool:
        """Return True when the pop up header is displayed.

        :return: ``True`` when the pop up heading is displayed
        :rtype: bool

        """
        return self.find_element(*self._header_bar_locator).is_displayed()

    @property
    def content(self) -> StudyGuide.Content:
        """Access the study guide content body.

        :return: the study guide content region
        :rtype: :py:class:`~regions.study_guides.StudyGuide.Content`

        """
        content_root = self.find_element(*self._content_body_locator)
        return self.Content(self, content_root)

    @property
    def go_to_top_available(self) -> bool:
        """Return True if the 'Go back to top' button is available.

        :return: ``True`` if the 'Go back to top' button is found
        :rtype: bool

        """
        return bool(self.find_elements(*self._go_to_top_button_locator))

    @property
    def go_to_top_button(self) -> WebElement:
        """Return the 'Go to top' button.

        :return: the 'Go back to top' button
        :rtype: :py:class:`selenium.webdriver.remote.webelement.WebElement`

        """
        return self.find_element(*self._go_to_top_button_locator)

    @property
    def header(self) -> StudyGuide.Header:
        """Access the study guide title bar.

        :return: the study guide title bar
        :rtype: :py:class:`~regions.study_guides.StudyGuide.Header`

        """
        header_root = self.find_element(*self._header_bar_locator)
        return self.Header(self, header_root)

    @property
    def toolbar(self) -> StudyGuide.Toolbar:
        """Access the study guide toolbar.

        :return: the study guide toolbar
        :rtype: :py:class:`~regions.study_guides.StudyGuide.Toolbar`

        """
        toolbar_root = self.find_element(*self._toolbar_locator)
        return self.Toolbar(self, toolbar_root)

    def go_back_to_top(self) -> StudyGuide:
        """Click the 'Go back to top' arrow button.

        :return: the study guide
        :rtype: :py:class:`~regions.study_guides.StudyGuide`

        """
        if self.go_to_top_available:
            Utilities.click_option(self.driver, element=self.go_to_top_button)
            sleep(1.0)
        return self

    class Content(Region):
        """The study guide main body."""

        _chapter_locator = (
            By.CSS_SELECTOR, "[class*=ChapterWrapper]")
        _no_results_text_locator = (
            By.CSS_SELECTOR, "[class*=GeneralText]")
        _section_locator = (
            By.CSS_SELECTOR, "[class*=HighlightWrapper]")

        _parent_div_selector = (
            "[class*=StudyGuides] > [class*=HighlightsWrapper]"
        )

        HEIGHT = (
            f'return document.querySelectorAll("{_parent_div_selector}")'
            ".getBoundingClientRect().height;"
        )

        @property
        def chapters(self) -> List[StudyGuide.Content.Chapter]:
            r"""Access the chapter headings available due to current filters.

            .. note:: We make use of :py:func:`~StudyGuide.Content.sections` to
                      load all possible currently filtered chapters.

            :return: the chapter headings currently displayed
            :rtype: list(:py:class:`~regions.study_guides. \
                                     StudyGuide.Content.Chapter`)

            """
            self.sections
            return [self.Chapter(self, chapter)
                    for chapter
                    in self.find_elements(*self._chapter_locator)]

        @property
        def sections(self) -> List[StudyGuide.Content.Section]:
            r"""Access the sections available due to current filters.

            .. note:: Sections load dynamically so we scroll to the last
                      currently loaded one, wait a bit, then check for more. We
                      repeat this until the parent DIV stops growing.

            :return: the sections currently displayed
            :rtype: list(:py:class:`~regions.study_guides. \
                                     StudyGuide.Content.Section`)

            """
            if self.no_results:
                return []
            while True:
                start_height = self.driver.execute_script(self.HEIGHT)
                sections = [self.Section(self, section)
                            for section
                            in self.find_elements(*self._section_locator)]
                Utilities.scroll_to(self.driver, element=sections[-1])
                sleep(0.5)
                new_height = self.driver.execute_script(self.HEIGHT)
                if new_height <= start_height:
                    self.page.go_back_to_top()
                    break
            return sections

        @property
        def no_results(self) -> str:
            """Return the no results text content from the main pane.

            :return: the 'No results' text content, if found
            :rtype: str

            """
            no_results = self.find_elements(
                *self._no_results_text_locator
            )
            if no_results:
                return no_results[0].get_attribute("textContent")
            return ""

        class Chapter(Region):
            """A filtered chapter heading."""

            _chapter_name_locator = (
                By.CSS_SELECTOR, ".os-text")
            _chapter_number_locator = (
                By.CSS_SELECTOR, ".os-number")
            _chapter_title_locator = (
                By.CSS_SELECTOR, "[data-testid=chapter-title]")

            @property
            def name(self) -> str:
                """Return the chapter name.

                :return: the chapter name
                :rtype: str

                """
                return self.find_element(*self._chapter_name_locator).text

            @property
            def number(self) -> str:
                """Return the chapter number.

                :return: the chapter number
                :rtype: str

                """
                return self.find_element(*self._chapter_number_locator).text

            @property
            def title(self) -> str:
                """Return the entire chapter title.

                :return: the chapter title, which is the chapter number and
                    name
                :rtype: str

                """
                title = self.find_element(*self._chapter_title_locator)
                return title.get_attribute("textContent")

        class Section(Region):
            """A filtered section."""

            _highlight_locator = (
                By.CSS_SELECTOR, "[class*=ListElement]")
            _section_name_locator = (
                By.CSS_SELECTOR, ".os-text")
            _section_number_locator = (
                By.CSS_SELECTOR, ".os-number")
            _section_title_locator = (
                By.CSS_SELECTOR, "[data-testid=section-title]")

            @property
            def highlights(self) -> List[StudyGuide.Content.Section.Highlight]:
                r"""Access the list of section highlights.

                :return: the list of highlights found within this section
                :rtype: list(:py:class:`~regions.study_guides. \
                                         StudyGuide.Content.Section.Highlight`)

                """
                return [self.Highlight(self, highlight)
                        for highlight
                        in self.find_elements(*self._highlight_locator)]

            @property
            def name(self) -> str:
                """Return the section name.

                :return: the section name
                :rtype: str

                """
                return self.find_element(*self._section_name_locator).text

            @property
            def number(self) -> str:
                """Return the section number.

                :return: the section number
                :rtype: str

                """
                return self.find_element(*self._section_number_locator).text

            @property
            def title(self) -> str:
                """Return the entire section title.

                :return: the section title, which is the section number and
                    name
                :rtype: str

                """
                title = self.find_element(*self._section_title_locator)
                return title.get_attribute("textContent")

            class Highlight(Region):
                """A study guide annotation and excerpt."""

                _annotation_locator = (
                    By.CSS_SELECTOR, "[class*=Annotation]")
                _color_locator = (
                    By.CSS_SELECTOR, "[color]")
                _excerpt_locator = (
                    By.CSS_SELECTOR, ".content-excerpt")

                @property
                def annotation(self) -> str:
                    """Return the highlight annotation text.

                    :return: the highlight annotation
                    :rtype: str

                    """
                    annotation = self.find_element(*self._annotation_locator)
                    return annotation.get_attribute("textContent")

                @property
                def color(self) -> Color:
                    """Return the highlight Color.

                    :return: the highlight's color
                    :rtype: :py:class:`~utils.utility.Color`

                    """
                    highlight = self.find_element(*self._color_locator)
                    return Color.from_color_string(
                        highlight.get_attribute("color")
                    )

                @property
                def excerpt(self) -> str:
                    """Return the highlight content excerpt text.

                    :return: the highlight content excerpt
                    :rtype: str

                    """
                    excerpt = self.find_element(*self._excerpt_locator)
                    return excerpt.get_attribute("textContent")

                @property
                def highlight_id(self) -> str:
                    """Return the highlight's ID string.

                    :return: the highlight's identification UUID
                    :rtype: str

                    """
                    highlight = self.find_element(*self._excerpt_locator)
                    return highlight.get_attribute("data-highlight-id")

    class Header(Region):
        """The study guide title bar."""

        _close_x_button_locator = (
            By.CSS_SELECTOR, "button")

        @property
        def close_x_button(self) -> WebElement:
            """Return the modal close 'x' button element.

            :return: the modal close button
            :rtype: :py:class:`selenium.webdriver.remote.webelement.WebElement`

            """
            return self.find_element(*self._close_x_button_locator)

        @property
        def title(self) -> str:
            """Return the modal title.

            :return: the modal title
            :rtype: str

            """
            return self.root.text

        def close(self) -> Page:
            """Click the 'x' close button.

            :return: the modal's parent page
            :rtype: :py:class:`~pages.base.Page`

            """
            page = Utilities.parent_page(self)
            Utilities.click_option(self.driver, element=self.close_x_button)
            self.wait.until(expect.staleness_of(self.root))
            return page

    class Toolbar(Region):
        """The study guide toolbar."""

        _active_filters_locator = (
            By.CSS_SELECTOR, "ul li")
        _chapter_filters_menu_locator = (
            By.CSS_SELECTOR,
            "[class*=Filters] > [class*=Dropdown]:first-child"
        )
        _color_filters_menu_locator = (
            By.CSS_SELECTOR,
            "[class*=Filters] > [class*=Dropdown]:nth-child(2)"
        )
        _help_banner_locator = (
            By.CSS_SELECTOR, "[class*=BannerWrapper]")
        _print_page_button_locator = (
            By.CSS_SELECTOR, "[aria-label=print]")
        _using_this_guide_button_locator = (
            By.CSS_SELECTOR, "[aria-label='Using This Guide']")

        @property
        def active_filters(self) -> List[StudyGuide.Toolbar.ActiveFilter]:
            r"""Access the list of currently active guide filters.

            :return: the list of active study guide filters
            :rtype: list(:py:class:`~regions.study_guides. \
                                     StudyGuide.Toolbar.ActiveFilter`)

            """
            return [self.ActiveFilter(self, guide_filter)
                    for guide_filter
                    in self.find_elements(*self._active_filters_locator)]

        @property
        def chapter(self) -> StudyGuide.Toolbar.Menu:
            """Access the Chapter filter menu.

            :return: the chapter filter menu
            :rtype: :py:class:`~regions.study_guides.StudyGuide.Toolbar.Menu`

            """
            menu_root = self.find_element(*self._chapter_filters_menu_locator)
            return self.Menu(self, menu_root)

        @property
        def color(self) -> StudyGuide.Toolbar.Menu:
            """Access the Color (topic) filter menu.

            :return: the color/topic filter menu
            :rtype: :py:class:`~regions.study_guides.StudyGuide.Toolbar.Menu`

            """
            menu_root = self.find_element(*self._color_filters_menu_locator)
            return self.Menu(self, menu_root)

        @property
        def guide_is_open(self) -> bool:
            """Return True if the help guide subbar is open.

            :return: ``True`` if the 'Using This Guide' help bar is open
            :rtype: bool

            """
            return bool(self.find_elements(*self._help_banner_locator))

        @property
        def help_guide(self) -> StudyGuide.Toolbar.UsingThisGuide:
            r"""Access the 'Using This Guide' subbar.

            :return: the 'Using This Guide' help if the help guide is open
            :rtype: :py:class:`~regions.study_guides. \
                                StudyGuide.Toolbar.UsingThisGuide`
            :raises ContentError: if the help guide is closed (not found)

            """
            if self.guide_is_open:
                banner_root = self.find_element(*self._help_banner_locator)
                return self.UsingThisGuide(self, banner_root)
            from pages.content import ContentError
            raise ContentError("Help guide not open")

        @property
        def print_button(self) -> WebElement:
            """Return the 'Print' button.

            :return: the 'Print' button
            :rtype: :py:class:`selenium.webdriver.remote.webelement.WebElement`

            """
            return self.find_element(*self._print_page_button_locator)

        @property
        def using_this_guide_button(self) -> WebElement:
            """Return the 'Using This Guide' button.

            :return: the 'Using This Guide' button
            :rtype: :py:class:`selenium.webdriver.remote.webelement.WebElement`

            """
            return self.find_element(*self._using_this_guide_button_locator)

        def print(self):
            """Click the 'Print' button.

            :return: None

            """
            Utilities.click_option(self.driver, element=self.print_button)

        def using_this_guide(self) \
                -> Union[StudyGuide.Toolbar.UsingThisGuide, None]:
            r"""Click the 'Using This Guide' button.

            .. note:: the toolbar button acts as a toggle opening and closing
                      the help bar

            :return: the Study Guides help bar or ``None`` if the guide was
                open and will now be closed
            :rtype: :py:class:`~regions.study_guides. \
                                StudyGuide.Toolbar.UsingThisGuide` or None

            """
            Utilities.click_option(
                self.driver,
                element=self.using_this_guide_button
            )
            sleep(0.33)
            if self.guide_is_open:
                return self.help_guide

        class ActiveFilter(Region):
            """An active study guide filter."""

            _clear_filter_button_locator = (
                By.CSS_SELECTOR, "button")
            _filter_name_locator = (
                By.CSS_SELECTOR, ".os-text")
            _filter_number_locator = (
                By.CSS_SELECTOR, ".os-number")

            @property
            def clear_filter_button(self) -> WebElement:
                r"""Return the remove filter button.

                :return: the clear/remove filter button
                :rtype: :py:class:`selenium.webdriver.remote. \
                                   webelement.WebElement`

                """
                return self.find_element(*self._clear_filter_button_locator)

            @property
            def label(self) -> str:
                """Return the filter label.

                :return: the filter label
                :rtype: str

                """
                return self.root.get_attribute("aria-label")

            @property
            def name(self) -> str:
                """Return the filter name.

                :return: the filter name
                :rtype: str

                """
                return self.find_element(*self._filter_name_locator).text

            @property
            def number(self) -> str:
                """Return the filter chapter/section number.

                :return: the chapter or section number
                :rtype: str

                """
                return self.find_element(*self._filter_number_locator).text

            def remove_filter(self):
                """Clear the filter.

                :return: None

                """
                Utilities.click_option(
                    self.driver,
                    element=self.clear_filter_button
                )

        class Menu(Region):
            """A study guide filter menu."""

            _menu_options_locator = (
                By.CSS_SELECTOR, "label")
            _menu_toggle_locator = (
                By.CSS_SELECTOR, "[class*=Toggle]")
            _select_all_button_locator = (
                By.CSS_SELECTOR, "[class*=AllOrNone] button:first-child")
            _select_none_button_locator = (
                By.CSS_SELECTOR, "[class*=AllOrNone] button:last-child")

            @property
            def all_button(self) -> WebElement:
                r"""Return the select 'all' filters button.

                :return: the menu's select 'all' filters button
                :rtype: :py:class:`selenium.webdriver.remote. \
                                   webelement.WebElement`

                """
                return self.find_element(*self._select_all_button_locator)

            @property
            def menu_toggle_button(self) -> WebElement:
                r"""Return the menu open/close toggle button.

                :return: the menu's open and close button toggle
                :rtype: :py:class:`selenium.webdriver.remote. \
                                   webelement.WebElement`

                """
                return self.find_element(*self._menu_toggle_locator)

            @property
            def none_button(self) -> WebElement:
                r"""Return the select 'none' of the filters button.

                :return: the menu's select 'none' of the filters button
                :rtype: :py:class:`selenium.webdriver.remote. \
                                   webelement.WebElement`

                """
                return self.find_element(*self._select_none_button_locator)

            @property
            def options(self) -> List[StudyGuide.Toolbar.Menu.Filter]:
                r"""Access the list of available filter options.

                :return: the list of available filter options
                :rtype: list(:py:class:`~regions.study_guides. \
                                    StudyGuide.Toolbar.Menu.Filter`)

                """
                return [self.Filter(self, option)
                        for option
                        in self.find_elements(*self._menu_options_locator)]

            def all(self) -> StudyGuide.Toolbar.Menu:
                r"""Click the activate 'all' filters button.

                :return: the filter menu
                :rtype: :py:class:`~regions.study_guides. \
                                    StudyGuide.Toolbar.Menu`

                """
                Utilities.click_option(
                    self.driver,
                    element=self.all_button
                )
                return self

            def click(self) -> StudyGuide.Toolbar.Menu:
                r"""Click the menu toggle button.

                :return: the filter menu
                :rtype: :py:class:`~regions.study_guides. \
                                    StudyGuide.Toolbar.Menu`

                """
                Utilities.click_option(
                    self.driver,
                    element=self.menu_toggle_button
                )
                return self

            def none(self) -> StudyGuide.Toolbar.Menu:
                r"""Click the deactivate all ('none') filters button.

                :return: the filter menu
                :rtype: :py:class:`~regions.study_guides. \
                                    StudyGuide.Toolbar.Menu`

                """
                Utilities.click_option(
                    self.driver,
                    element=self.none_button
                )
                return self

            class Filter(Region):
                """A filter option."""

                _checkbox_locator = (
                    By.CSS_SELECTOR, "input")
                _filter_name_locator = (
                    By.CSS_SELECTOR, ".os-text, [class*=ColorLabel]")
                _filter_number_locator = (
                    By.CSS_SELECTOR, ".os-number")
                _is_checked_locator = (
                    By.CSS_SELECTOR, "input[checked]")
                _is_disabled_locator = (
                    By.CSS_SELECTOR, "input[disabled]")

                @property
                def checkbox(self) -> WebElement:
                    """Return the checkbox.

                    :return: the filter checkbox
                    :rtype: :py:class:`selenium.webdriver.remote. \
                                       webelement.WebElement`

                    """
                    return self.find_element(*self._checkbox_locator)

                @property
                def is_checked(self) -> bool:
                    """Return True if the checkbox is checked.

                    :return: ``True`` if the filter checkbox is checked
                    :rtype: bool

                    """
                    return bool(self.find_elements(*self._is_checked_locator))

                @property
                def is_disabled(self) -> bool:
                    """Return True if the filter option is disabled.

                    :return: ``True`` if the filter option is disabled
                    :rtype: bool

                    """
                    return bool(self.find_elements(*self._is_disabled_locator))

                @property
                def name(self) -> str:
                    """Return the filter label or name.

                    :return: the filter label or name
                    :rtype: str

                    """
                    return self.find_element(*self._filter_name_locator).text

                @property
                def number(self) -> str:
                    """Return the filter chapter number.

                    :return: the filter chapter number, if found.
                    :rtype: str

                    """
                    chapter = self.find_elements(*self._filter_number_locator)
                    if chapter:
                        return chapter.text
                    return ""

        class UsingThisGuide(Region):
            """The Study Guide help screen."""

            _close_x_button_locator = (
                By.CSS_SELECTOR, "button")
            _heading_locator = (
                By.CSS_SELECTOR, "h2")
            _using_this_guide_picture_locator = (
                By.CSS_SELECTOR, "picture img")

            @property
            def close_x_button(self) -> WebElement:
                r"""Return the close help 'x' button.

                :return: the close help 'x' button
                :rtype: :py:class:`selenium.webdriver.remote. \
                                   webelement.WebElement`

                """
                return self.find_element(*self._close_x_button_locator)

            @property
            def heading(self) -> str:
                """Return the help bar heading.

                :return: the help bar heading
                :rtype: str

                """
                return self.find_element(*self._heading_locator).text

            @property
            def using_this_guide(self) -> WebElement:
                r"""Return the 'Using This Guide' help image.

                :return: the 'Using This Guide' help image
                :rtype: :py:class:`selenium.webdriver.remote. \
                                   webelement.WebElement`

                """
                return self.find_element(
                    *self._using_this_guide_picture_locator
                )

            def close(self) -> StudyGuide.Toolbar:
                """Click the close 'x' button.

                :return: the study guide toolbar
                :rtype: :py:class:`~regions.study_guides.StudyGuide.Toolbar`

                """
                Utilities.click_option(
                    self.driver,
                    element=self.close_x_button
                )
                return self.page
