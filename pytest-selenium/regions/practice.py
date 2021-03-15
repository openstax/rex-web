"""The Practice Questions modal."""

from __future__ import annotations

from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webelement import WebElement

from regions.base import Region
from utils.utility import Utilities


class Practice(Region):
    """The Practice Questions pop up modal region."""

    _heading_locator = (
        By.CSS_SELECTOR, "h3[class*=headings]")
    _start_now_button_locator = (
        By.CSS_SELECTOR, "[data-analytics-label='Start now']")

    @property
    def loaded(self) -> bool:
        """Return True when the pop up header is displayed.

        :return: ``True`` when the pop up heading is displayed
        :rtype: bool

        """
        return bool(self.find_elements(*self._heading_locator))

    @property
    def start_now_button(self) -> WebElement:
        """Return the 'Start now' button.

        :return: the 'Start now' button element
        :rtype: :py:class:``

        """
        return self.find_element(*self._start_now_button_locator)

    def start_now(self) -> Practice:
        """Click the 'Start now' button to begin the practice session.

        :return: the practice modal
        :rtype: :py:class:`~Practice`

        """
        Utilities.click_option(self.driver, element=self.start_now_button)
        return self
