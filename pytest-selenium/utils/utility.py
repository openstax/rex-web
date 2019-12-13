"""Utility functions and class helpers for rex-web automation."""

from __future__ import annotations

import re
import requests
from faker import Faker
from random import choice, randint
from requests.exceptions import Timeout
from time import sleep
from typing import List, Tuple, Union

from selenium.common.exceptions import (
    ElementClickInterceptedException,
    NoSuchElementException,
    StaleElementReferenceException,
    WebDriverException,
)


# Constant usage values for javascript and regular expression commands
ASYNC_DELETE = r"""
(async function delete_page_highlights() {
  const ids = __APP_STORE.getState().content.highlights.highlights.map(({id}) => id);
  for(id of ids) await __APP_SERVICES.highlightClient.deleteHighlight({id});
})()"""  # NOQA
HIGHLIGHTS = "return document.querySelectorAll('.highlight').length;"
PIN_MATCHER = re.compile(r"(PIN\:? \d{6})")
RELOAD = "location.reload();"
RESET_MATCHER = re.compile(
    r"(https:\/\/accounts([-\w]*)?\.openstax\.org"
    r"\/password\/reset\?token=\w{1,64})")
URL_MATCHER = re.compile(
    r"(https:\/\/accounts([-\w]*)?\.openstax\.org\/confirm\?code=\w{1,64})")


class EmailVerificationError(Exception):
    """General e-mail registration exception."""

    pass


class FontProperties:
    def is_bold(self, element):
        return element.value_of_css_property("font-weight") == "400"


class Highlight:
    """Supplimental resources for book highlighting."""

    Offset = Tuple[int, int]

    RANDOM, ENTIRE, YELLOW, GREEN, BLUE, PURPLE, PINK = range(0, 7)
    COLORS = [YELLOW, GREEN, BLUE, PURPLE, PINK]

    @classmethod
    def delete_highlights_on_page(cls, driver):
        """Purge the highlights for the current user on the current book page.

        Trigger a javascript command to clean up the current page and remove
        all highlights. Reload the page to see the updated UI.

        :param driver: the selenium webdriver object
        :returns: None

        """
        total_page_highlights = driver.execute_script(HIGHLIGHTS)
        driver.execute_script(ASYNC_DELETE)
        sleep(total_page_highlights * 0.05)
        driver.execute_script(RELOAD)

    @classmethod
    def random_color(cls) -> int:
        """Return a random color.

        :return: a random highlight color
        :rtype: int

        """
        return cls.COLORS[randint(0, len(cls.COLORS) - 1)]


class Library(object):

    books = {
        "anatomy-and-physiology": {
            "default_page":
                "1-introduction"},
        "astronomy": {
            "default_page":
                "1-introduction"},
        "biology-2e": {
            "default_page":
                "1-introduction"},
        "biology-ap-courses": {
            "default_page":
                "1-introduction"},
        "chemistry-2e": {
            "default_page":
                "1-introduction"},
        "chemistry-atoms-first-2e": {
            "default_page":
                "1-introduction"},
        "college-physics": {
            "default_page":
                "1-introduction-to-science-and-the-realm-of-"
                "physics-physical-quantities-and-units"},
        "college-physics-ap-courses": {
            "default_page":
                "1-connection-for-ap-r-courses"},
        "concepts-biology": {
            "default_page":
                "1-introduction"},
        "microbiology": {
            "default_page":
                "1-introduction"},
    }

    def random_book_slug(self):
        random_book_slug = choice(list(self.books.keys()))
        return random_book_slug


def get_default_page(element):
    book_list = Library.books
    default_page = book_list[element]["default_page"]
    return default_page


class RestMail(object):
    """RestMail API for non-interactive e-mail testing."""

    MAIL_URL = "http://restmail.net/mail/{username}"

    def __init__(self, username: str):
        """Initialize a mailbox.

        :param str username: the selected email username

        """
        self._inbox = []
        self._username = username
        self._address = f"{username}@restmail.net"

    @property
    def address(self) -> str:
        """Return the full email address.

        :return: the full email address
        :rtype: str

        """
        return self._address

    @property
    def inbox(self) -> List[RestMail.Email]:
        """Return the e-mail messages.

        :returns: the object list representing the inbox that may be empty if
            get_mail or wait_for_mail has not been called.
        :rtype: list(:py:class:`~RestMail.Email`)

        """
        return self._inbox

    @property
    def size(self) -> int:
        """Return the number of messages in the inbox.

        :return: the number of messages found in the email inbox
        :rtype: int

        """
        return self._inbox.__len__

    @property
    def user(self) -> str:
        """Return the box username.

        :return: the RestMail username
        :rtype: str

        """
        return self._username

    def empty(self):
        """Delete all message in the inbox.

        :return: None

        """
        requests.delete(self.MAIL_URL.format(username=self._username))

    def get_mail(self):
        """Get email for a dynamic user.

        :return: a list of Emails received for a particular user
        :rtype: list(:py:class:`~RestMail.Email`)

        """
        messages = requests.get(self.MAIL_URL.format(username=self._username))
        self._inbox = [self.Email(message) for message in messages.json()]
        return self._inbox

    def wait_for_mail(self, max_time: float = 60.0, pause_time: float = 0.25) \
            -> List[RestMail.Email]:
        """Poll until mail is received but doesn't exceed max_time seconds.

        :param float max_time: (optional) the maximum time to wait for emails
        :param float pause_time: (optional) time to wait between polling
            requests
        :return: a list of emails received for a particular user
        :rtype: list(:py:class:`~RestMail.Email`)
        :raises :py:class:`~requests.exceptions.Timeout`: if after waiting the
            maximum time, no emails were received

        """
        timer = 0.0
        while timer <= (max_time / pause_time):
            self.get_mail()
            if self._inbox:
                return self._inbox
            timer = timer + pause_time
            sleep(pause_time)
        raise Timeout(f"Mail not received in {max_time} seconds")

    class Email(object):
        """E-mail message structure.

        Attributes:
            _html: HTML-formatted message body
            _text: plain text message body
            _headers: dict of email message headers
            _subject: email message subject
            _references: a list of additional message references
            _id: an internal message ID code
            _reply: a list of expected reply to email addresses
            _priority: message priority as indicated by the sender
            _from: a list of email message senders
            _to: a list of email message recipients
            _date: string-formed date and time when sent
            _received: string-formed date and time when received
            _received_at: string-formed date and time when received
            _excerpt: a blurb using the message body or the subject

        """

        def __init__(self, package):
            """Read possible RestMail fields.

            :param package: the JSON for a single RestMail email message
            :type package: json

            """
            self._html = self._pull_data("html", package, "")
            self._text = self._pull_data("text", package, "")
            self._headers = self._pull_data("headers", package, {})
            self._subject = self._pull_data("subject", package, "")
            self._references = self._pull_data("references", package, [])
            self._id = self._pull_data("messageId", package, "")
            self._reply = self._pull_data("inReplyTo", package, [])
            self._priority = self._pull_data("priority", package, "")
            self._from = self._pull_data("from", package, [])
            self._to = self._pull_data("to", package, [])
            self._date = self._pull_data("date", package, "")
            self._received = self._pull_data("receivedDate", package, "")
            self._received_at = self._pull_data("receivedAt", package, "")
            self._excerpt = self._text if self._text else self._subject

        @property
        def excerpt(self) -> str:
            """Return an excerpt from the HTML, text, or subject fields.

            :return: the email message body excerpt
            :rtype: str

            """
            return self._excerpt

        @property
        def has_pin(self) -> bool:
            """Return True if a pin string is in the body excerpt.

            :return: ``True`` if the email verification pin is found within the
                message excerpt
            :rtype: bool

            """
            return bool(PIN_MATCHER.search(self._excerpt))

        @property
        def pin(self) -> str:
            """Return the numeric pin.

            :return: the email verification numeric pin number
            :rtype: str
            :raises EmailVerificationError: if the verification pin number is
                not found in the excerpt

            """
            if self.has_pin:
                return (PIN_MATCHER.search(self._excerpt).group())[-6:]
            raise EmailVerificationError("No pin found")

        def _pull_data(self,
                       field: str,
                       package,
                       default: Union[List, str]) -> str:
            """Pull data from the JSON package.

            :param str field: the message field
            :param package: the JSON package for the email message
            :param default: the default value to use when the requested field
                is not found
            :type package: json
            :type default: list or str
            :return: the field value
            :rtype: str

            """
            return package[field] if field in package else default


class Utilities(object):
    """Helper functions for various Pages actions."""

    @classmethod
    def click_option(cls, driver, locator=None, element=None):
        """Click on elements which cause Safari 500 errors."""
        element = element if element else driver.find_element(*locator)
        try:
            if driver.capabilities.get("browserName").lower() == "safari":
                raise WebDriverException("Bypassing the driver-defined click")
            element.click()
        except WebDriverException:
            for _ in range(10):
                try:
                    driver.execute_script("arguments[0].click()", element)
                    break
                except ElementClickInterceptedException:  # Firefox issues
                    sleep(1)
                except NoSuchElementException:  # Safari issues
                    if locator:
                        element = driver.find_element(*locator)
                except StaleElementReferenceException:  # Chrome and Firefox
                    if locator:
                        element = driver.find_element(*locator)

    @classmethod
    def random_name(cls) -> Tuple(str, str):
        """Generate a random name for an Accounts user.

        :return: the first and last name
        :rtype: tuple(str, str)

        """
        fake = Faker()
        use_male_functions = randint(0, 1) == 0
        return (fake.first_name_male() if use_male_functions else
                fake.first_name_female(),
                fake.last_name())

    @classmethod
    def scroll_top(cls, driver):
        """Scroll to the top of the browser screen.

        :param driver: the selenium webdriver object
        :returns: None

        """
        driver.execute_script("window.scrollTo(0, 0);")
        sleep(0.75)
