"""The Practice Questions modal."""

from __future__ import annotations

from enum import Enum
from time import sleep
from typing import List, Tuple

from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webelement import WebElement

from pages.base import Page
from regions.base import Region
from utils.utility import Utilities

BACKGROUND_COLOR = (
    "return window.getComputedStyle(arguments[0]).backgroundColor;"
)

Locator = Tuple[str, str]


class AnswerColor(Enum):
    """Practice question answer color options."""

    BLUE = "rgb(13, 192, 220)"
    GREEN = "rgb(119, 175, 66)"
    RED = "rgb(194, 32, 50)"
    WHITE = "rgb(255, 255, 255)"

    def __str__(cls) -> str:
        """Return the color RGB string.

        :return: the RGB values for the color as a string
        :rtype: str

        """
        return cls.value


class TitleSection(Region):
    """A chapter or section number plus a title."""

    _chapter_section_number_locator = (
        By.CSS_SELECTOR, ".os-number")
    _chapter_section_title_locator = (
        By.CSS_SELECTOR, ".os-text")

    @property
    def number(self) -> str:
        """Return the chapter or section number.

        :return: the chapter or section number
        :rtype: str

        """
        return self.find_element(*self._chapter_section_number_locator).text

    @property
    def title(self) -> str:
        """Return the chapter or section title.

        :return: the chapter or section title
        :rtype: str

        """
        return self.find_element(*self._chapter_section_title_locator).text


class Practice(Region):
    """The Practice Questions pop up modal region."""

    _close_x_button_locator = (
        By.CSS_SELECTOR, "h3 button")
    _content_body_locator = (
        By.CSS_SELECTOR, "[data-testid*=show-practice] > [class*=Practice]")
    _filter_bar_locator = (
        By.CSS_SELECTOR, "[data-testid*=show-practice] > [class*=Filters]")
    _heading_locator = (
        By.CSS_SELECTOR, "h3")

    @property
    def close_x_button(self) -> WebElement:
        """Return the modal close 'x' button.

        :return: the close modal button
        :rtype: :py:class:`selenium.webdriver.remote.webelement.WebElement`

        """
        return self.find_element(*self._close_x_button_locator)

    @property
    def content(self) -> Practice.Content:
        """Access the content pane.

        :return: the Practice modal content region
        :rtype: :py:class:`~regions.practice.Practice.Content`

        """
        body_root = self.find_element(*self._content_body_locator)
        return self.Content(self, body_root)

    @property
    def filters(self) -> Practice.Filters:
        """Access the practice section selector.

        :return: the Practice modal chapter/section selector
        :rtype: :py:class:`~regions.practice.Practice.Filters`

        """
        filter_bar_root = self.find_element(*self._filter_bar_locator)
        return self.Filters(self, filter_bar_root)

    @property
    def heading(self) -> str:
        """Return the modal heading.

        :return: the modal heading text
        :rtype: str

        """
        return self.find_element(*self._heading_locator).text

    @property
    def loaded(self) -> bool:
        """Return True when the pop up header is displayed.

        :return: ``True`` when the pop up heading is displayed
        :rtype: bool

        """
        return self.find_element(*self._heading_locator).is_displayed()

    def close(self) -> Page:
        """Close the Practice modal.

        :return: the parent page
        :rtype: :py:class:`~pages.base.Page`

        """
        Utilities.click_option(self.driver, element=self.close_x_button)
        return self.page

    class Content(TitleSection):
        """The Practice modal main body."""

        _chapter_section_number_locator = (
            By.CSS_SELECTOR, "div[class*=SectionTitle] .os-number")
        _chapter_section_title_locator = (
            By.CSS_SELECTOR, "div[class*=SectionTitle] .os-text")
        _continue_button_locator = (
            By.CSS_SELECTOR, "[data-analytics-label^=Continue]")
        _link_to_section_locator = (
            By.CSS_SELECTOR, "[class^=LinkToSection]")
        _message_locator = (
            By.CSS_SELECTOR,
            "span[class^=Empty], span[class^=Intro], span[class^=Final]"
        )
        _next_button_locator = (
            By.CSS_SELECTOR, "[data-testid^=next]")
        _next_section_number_locator = (
            By.CSS_SELECTOR, "span[class^=Next] .os-number")
        _next_section_title_locator = (
            By.CSS_SELECTOR, "span[class^=Next] .os-text")
        _progress_bar_locator = (
            By.CSS_SELECTOR, "div[class^=ProgressBar]")
        _question_answer_locator = (
            By.CSS_SELECTOR, "[class*=AnswerWrapper]")
        _question_content_locator = (
            By.CSS_SELECTOR, "[class*=QuestionContent]")
        _question_id_locator = (
            By.CSS_SELECTOR, "input[name]")
        _show_answer_button_locator = (
            By.CSS_SELECTOR, "[data-testid=show-answer]")
        _skip_question_link_locator = (
            By.CSS_SELECTOR, "[data-analytics-label=Skip]")
        _start_now_button_locator = (
            By.CSS_SELECTOR, "[class^=Intro] button")
        _submit_answer_button_locator = (
            By.CSS_SELECTOR, "[data-analytics-label=Submit]")

        @property
        def answers(self) -> List[Practice.Content.Answer]:
            """Access the practice question answers.

            :return: the list of available answers
            :rtype: list(:py:class:`~regions.practice.Practice.Content.Answer`)

            """
            return [self.Answer(self, option)
                    for option
                    in self.find_elements(*self._question_answer_locator)]

        @property
        def has_message(self) -> bool:
            """Return True if an empty, intro, or completion message is found.

            :return: ``True`` if the empty section, introductory, or practice
                completion message is displayed
            :rtype: bool

            """
            return bool(self.find_elements(*self._message_locator))

        @property
        def message(self) -> str:
            """Return the empty, intro, or completion message is found.

            :return: the centered text content message
            :rtype: str
            :raises PracticeException: if a message is not found

            """
            if not self.has_message:
                raise PracticeException("message not found")
            return self.find_element(*self._message_locator).text

        @property
        def next_section_number(self) -> str:
            """Return the next practice section number.

            :return: the section number for the subsequent section with
                questions
            :rtype: str

            """
            return self.find_element(*self._next_section_number_locator).text

        @property
        def next_section_title(self) -> str:
            """Return the next practice section title.

            :return: the section title for the subsequent section with
                questions
            :rtype: str

            """
            return self.find_element(*self._next_section_title_locator).text

        @property
        def progress_bar(self) -> Practice.Content.ProgressBar:
            """Access the question progress bar.

            :return: the question progress bar
            :rtype: :py:class:`~regions.practice.Practice.Content.ProgressBar`

            """
            bar_root = self.find_element(*self._progress_bar_locator)
            return self.ProgressBar(self, bar_root)

        @property
        def question(self) -> str:
            """Return the question stem.

            :return: the practice question stem
            :rtype: str

            """
            question = self.find_element(*self._question_content_locator)
            return question.get_attribute("textContent")

        @property
        def questions(self) -> List[Practice.Content.ProgressBar.Breadcrumb]:
            r"""Access the question breadcrumbs.

            .. note:: this is a shorthand property to access the breadcrumbs

            :return: the list of question breadcrumbs
            :rtype: list(:py:class:`~regions.practice.Practice \
                                    .Content.ProgressBar.Breadcrumb`)

            """
            return self.progress_bar.questions

        @property
        def question_id(self) -> str:
            """Return the Exercises question ID and version.

            :return: the Exercises ID and version number for the assessment
            :rtype: str

            """
            id_tag = self.find_element(*self._question_id_locator)
            return id_tag.get_attribute("name")

        def read_section(self) -> Page:
            """Click the read section link.

            :return: the referenced book section page
            :rtype: :py:class:`~pages.base.Page`

            """
            base_url = Utilities.parent_page().base_url
            book = self.driver.current_url.split("/")[4]
            link = self.find_element(*self._link_to_section_locator)
            page = link.get_attribute("href")
            if "/" in page:
                page = page.split("/")[-1]
            Utilities.click_option(self.driver, element=link)
            from pages.content import Content
            new_page = Content(
                driver=self.driver,
                base_url=base_url,
                book_slug=book,
                page_slug=page
            )
            new_page.wait_for_page_to_load()
            return new_page

        def show_answer(self) -> Practice.Content:
            """Click the 'Show answer' button.

            :return: the practice content pane
            :rtype: :py:class:`~regions.practice.Practice.Content`

            """
            return self._click_helper(self._show_answer_button_locator)

        def skip(self) -> Practice.Content:
            """Click the 'Skip' question link.

            :return: the practice content pane
            :rtype: :py:class:`~regions.practice.Practice.Content`

            """
            return self._click_helper(self._skip_question_link_locator)

        def start_now(self) -> Practice.Content:
            """Click the 'Start now' button.

            :return: the practice content pane
            :rtype: :py:class:`~regions.practice.Practice.Content`

            """
            return self._click_helper(self._start_now_button_locator)

        def submit(self) -> Practice.Content:
            """Click the 'Submit' answer button.

            :return: the practice content pane
            :rtype: :py:class:`~regions.practice.Practice.Content`

            """
            return self._click_helper(self._submit_answer_button_locator)

        def _click_helper(self, locator: Locator) -> Practice.Content:
            """Click a link or button.

            :param locator: a By-style element selector
            :type locator: tuple(str, str)
            :return: the practice content pane
            :rtype: :py:class:`~regions.practice.Practice.Content`

            """
            button = self.find_element(*locator)
            Utilities.click_option(self.driver, element=button)
            return self

        def _continue(self) -> Practice.Content:
            """Click the 'Continue' to the next section button.

            :return: the practice content pane
            :rtype: :py:class:`~regions.practice.Practice.Content`

            """
            return self._click_helper(self._submit_answer_button_locator)

        def _next(self) -> Practice.Content:
            """Click the 'Next' question button.

            :return: the practice content pane
            :rtype: :py:class:`~regions.practice.Practice.Content`

            """
            return self._click_helper(self._submit_answer_button_locator)

        class Answer(Region):
            """A practice question answer option."""

            CORRECT = AnswerColor.GREEN
            INCORRECT = AnswerColor.RED
            NOT_SELECTED = AnswerColor.WHITE
            SELECTED = AnswerColor.BLUE

            _answer_content_locator = (
                By.CSS_SELECTOR, "[class*=Content]")
            _answer_letter_locator = (
                By.CSS_SELECTOR, "[class*=Indicator]")
            _answer_result_locator = (
                By.CSS_SELECTOR, "[class*=Result]")
            _radio_button_locator = (
                By.CSS_SELECTOR, "input")

            @property
            def answer(self) -> str:
                """Return the answer text content.

                :return: the answer's full text content
                :rtype: str

                """
                text = self.find_element(*self._answer_content_locator)
                return text.get_attribute("textContent")

            @property
            def choice(self) -> str:
                """Return the answer letter or number.

                :return: the answer letter or number
                :rtype: str

                """
                return self.indicator.text

            @property
            def indicator(self) -> WebElement:
                r"""Return the answer indicator.

                :return: the answer indicator element
                :rtype: :py:class:`selenium.webdriver.remote.webelement. \
                                   WebElement`

                """
                return self.find_element(*self._answer_letter_locator)

            @property
            def is_correct(self) -> bool:
                """Return True if the answer is graded as the correct answer.

                :return: ``True`` if the answer is graded and is correct
                :rtype: bool

                """
                return self._get_color(self.indicator) == self.CORRECT

            @property
            def is_incorrect(self) -> bool:
                """Return True if the answer is graded as the wrong answer.

                :return: ``True`` if the answer is graded and is incorrect
                :rtype: bool

                """
                return self._get_color(self.indicator) == self.INCORRECT

            @property
            def is_not_selected(self) -> bool:
                """Return True if the answer is not selected.

                :return: ``True`` if the answer option is not selected
                :rtype: bool

                """
                return self._get_color(self.indicator) == self.NOT_SELECTED

            @property
            def is_selected(self) -> bool:
                """Return True if the answer is selected and not graded.

                :return: ``True`` if the answer option is selected but has not
                    been graded
                :rtype: bool

                """
                return self._get_color(self.indicator) == self.SELECTED

            @property
            def result(self) -> str:
                """Return the answer result.

                .. note:: the result is available after the question is graded

                :return: the answer result if the question is graded
                :rtype: str

                """
                return self.find_element(*self._answer_result_locator).text

            def select(self):
                """Select this answer for the current question.

                :return: None

                """
                radio_button = self.find_element(*self._radio_button_locator)
                Utilities.click_option(self.driver, element=radio_button)

            def _get_color(self, answer: WebElement) -> str:
                r"""Return the background color for the selected element.

                :param answer: the answer button
                :type answer: :py:class:`selenium.webdriver.remote. \
                                         webelement.WebElement`
                :return: the background color as a javascript RGB string
                :rtype: str

                """
                return self.driver.execute_script(BACKGROUND_COLOR, answer)

        class ProgressBar(Region):
            """The question progress bar."""

            _question_breadcrumb_locator = (
                By.CSS_SELECTOR, "[class*=Wrapper]")

            @property
            def questions(self) \
                    -> List[Practice.Content.ProgressBar.Breadcrumb]:
                """Access the question breadcrumbs.

                :return: the question breadcrumbs
                :rtype: list(:py:class:`~regions.practice.Practice \
                                        .Content.ProgressBar.Breadcrumb`)

                """
                return [self.Breadcrumb(self, question)
                        for question
                        in self.find_elements(
                            *self._question_breadcrumb_locator)]

            class Breadcrumb(Region):
                """A practice question breadcrumb."""

                _question_active_locator = (
                    By.CSS_SELECTOR, "[class*=Active]")
                _question_disabled_locator = (
                    By.CSS_SELECTOR, "[class*=Disabled]")
                _question_number_locator = (
                    By.CSS_SELECTOR, "span")

                @property
                def is_active(self) -> bool:
                    """Return True if the breadcrumb's question is active.

                    :return: ``True`` if the breadcrumb's question is currently
                        active in the main content panel
                    :rtype: bool

                    """
                    return bool(
                        self.find_elements(*self._question_active_locator)
                    )

                @property
                def is_answered(self) -> bool:
                    """Return True if the breadcrumb's question is answered.

                    :return: ``True`` if the breadcrumb's question has been
                        answered (not active and not disabled)
                    :rtype: bool

                    """
                    return not (self.is_active or self.is_disabled)

                @property
                def is_disabled(self) -> bool:
                    """Return True if the breadcrumb's question is disabled.

                    :return: ``True`` if the breadcrumb's question is disabled
                        or it is later in the practice session
                    :rtype: bool

                    """
                    return bool(
                        self.find_elements(*self._question_disabled_locator)
                    )

                @property
                def number(self) -> str:
                    """Return the breadcrumb's number.

                    :return: the breadcrumbs question number / position in the
                        practice queue
                    :rtype: str

                    """
                    return (
                        self.find_element(*self._question_number_locator).text
                    )

    class Filters(Region):
        """The Practice modal chapter/section selector."""

        _chapter_filter_locator = (
            By.CSS_SELECTOR, "details")
        _menu_is_open_locator = (
            By.CSS_SELECTOR, "[class*=StyledChapterFilters]")

        @property
        def chapters(self) -> List[Practice.Filters.Chapter]:
            r"""Access the list of chapter filters.

            :return: the list of chapters with practice questions
            :rtype: list(:py:class:`~regions.practice. \
                                    Practice.Filters.Chapter`)

            """
            return [self.Chapter(self, chapter)
                    for chapter
                    in self.find_elements(*self._chapter_filter_locator)]

        @property
        def is_open(self) -> bool:
            """Return True if the filter menu is open.

            :return: ``True`` if the chapter/section selector menu is open and
                chapter filters are found
            :rtype: bool

            """
            return bool(self.find_elements(*self._menu_is_open_locator))

        def toggle(self) -> Practice.Filters:
            """Toggle the chapter/section selector menu.

            :return: the practice selector menu
            :rtype: :py:class:`~regions.practice.Practice.Filters`

            """
            Utilities.click_option(self.driver, element=self.root)
            sleep(0.1)
            return self

        class Chapter(TitleSection):
            """A chapter containing practice problems."""

            _chapter_section_number_locator = (
                By.CSS_SELECTOR, "summary .os-number")
            _chapter_section_title_locator = (
                By.CSS_SELECTOR, "summary .os-text")
            _section_filter_locator = (
                By.CSS_SELECTOR, "div > button")

            @property
            def is_open(self) -> bool:
                """Return True if the chapter is open.

                :return: ``True`` if the chapter is open
                :rtype: bool

                """
                chapter_is_open = 'return arguments[0].hasAttribute("open");'
                return self.driver.execute_script(chapter_is_open, self.root)

            @property
            def sections(self) -> List[Practice.Filters.Chapter.Section]:
                r"""Access the available practice sections in the chapter.

                :return: the list of sections available in this chapter
                :rtype: list(:py:class:`~regions.practice. \
                                        Practice.Filters.Chapter.Section`)
                :raises PracticeException: if the chapter submenu item is not
                    open

                """
                if not self.is_open:
                    raise PracticeException(
                        f"chapter {self.number} is not open")
                return [self.Section(self, section)
                        for section
                        in self.find_elements(*self._section_filter_locator)]

            def toggle(self) -> Practice.Filters:
                """Toggle the chapter/section selector menu.

                :return: the practice selector menu
                :rtype: :py:class:`~regions.practice.Practice.Filters`

                """
                Utilities.click_option(self.driver, element=self.root)
                sleep(0.1)
                return self.page

            class Section(TitleSection):
                """A chapter section containing practice problems."""

                def select(self) -> Practice:
                    """Select the section to practice.

                    :return: the practice modal
                    :rtype: :py:class:`~regions.practice.Practice`

                    """
                    Utilities.click_option(self.driver, element=self.root)
                    sleep(0.25)
                    return self.page.page.page


class PracticeException(NoSuchElementException):
    """A generic exception for practice failures."""

    pass
