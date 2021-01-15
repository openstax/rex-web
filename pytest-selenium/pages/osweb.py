# flake8: noqa
from selenium.webdriver.common.by import By
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.support import expected_conditions as expected
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys
from time import sleep

from pages.base import Page
from utils.utility import Utilities


class WebBase(Page):
    URL_TEMPLATE = "/details/books/{book_slug}"
    _async_hide_locator = (By.CSS_SELECTOR, ".async-hide")
    _user_nav_locator = (By.CSS_SELECTOR, '[class*="login-menu"]')
    _login_locator = (By.CSS_SELECTOR, '[class="pardotTrackClick"]')
    _logout_locator = (By.CSS_SELECTOR, "[href*=signout]")
    _mobile_user_nav_locator = (By.CSS_SELECTOR, '[aria-label="Toggle Meta Navigation Menu"]')
    _mobile_user_nav_loaded_locator = (By.CSS_SELECTOR, '[aria-expanded="true"]')
    _view_online_desktop_locator = (
        By.XPATH,
        "//div[@class='bigger-view']//span[text()='View online']/..",
    )
    _view_online_mobile_locator = (
        By.XPATH,
        "//div[@class='phone-view']//span[text()='View online']/..",
    )
    _dialog_locator = (By.CSS_SELECTOR, '[aria-labelledby="dialog-title"]')
    _dialog_title_locator = (By.CSS_SELECTOR, "#dialog-title")
    _got_it_button_locator = (By.CSS_SELECTOR, ".cookie-notice button")
    _print_copy_locator = (By.XPATH, "//*[contains(text(), 'Order a print copy')]/..")
    _order_on_amazon_locator = (By.CSS_SELECTOR, '[class="btn primary"]')
    _close_locator = (By.CSS_SELECTOR, '[class="put-away"]')
    _osweb_404_locator = (By.CSS_SELECTOR, '[class*="not-found"]')

    @property
    def loaded(self):
        """Return when the page is loaded.

        Fires the 'load' event when the whole webpage (HTML) has loaded fully,
        including all dependent resources such as CSS files, and images.
        Or
        Return when the async event is hidden.

        """
        script = r'document.addEventListener("load", function(event) {});'
        sleep(0.5)
        async_hide = bool(self.find_elements(*self._async_hide_locator))
        return (self.driver.execute_script(script)) or (not async_hide)

    def wait_for_load(self):
        return self.wait.until(lambda _: self.loaded)

    def osweb_404_displayed(self) -> bool:
        """Return true if osweb 404 error is displayed"""
        return bool(self.wait.until(lambda _: self.find_element(*self._osweb_404_locator)))

    @property
    def osweb_404_error(self):
        """Return the 404 error text"""
        return self.find_element(*self._osweb_404_locator).get_attribute("textContent")

    @property
    def login(self):
        return self.find_element(*self._login_locator)

    @property
    def user_nav(self):
        return self.find_element(*self._user_nav_locator)

    @property
    def mobile_user_nav(self):
        return self.find_element(*self._mobile_user_nav_locator)

    @property
    def mobile_user_nav_loaded(self):
        return self.find_element(*self._mobile_user_nav_loaded_locator).is_displayed()

    @property
    def logout(self):
        return self.find_element(*self._logout_locator)

    @property
    def notification_dialog(self):
        return self.find_element(*self._dialog_locator)

    @property
    def user_is_logged_in(self):
        if self.is_desktop:
            if self.is_element_present(*self._user_nav_locator):
                return True
        elif self.is_mobile:
            self.mobile_user_nav.click()
            if self.is_element_present(*self._mobile_user_nav_locator):
                self.mobile_user_nav.click()
                self.wait.until(
                    expected.invisibility_of_element_located(self._mobile_user_nav_loaded_locator)
                )
                return True

    @property
    def view_online(self):
        if self.is_desktop:
            return self.find_element(*self._view_online_desktop_locator)
        return self.find_element(*self._view_online_mobile_locator)

    def open_toggle(self):
        """Click the toggle to open the menu."""
        toggle = self.find_element(*self._user_nav_locator)
        Utilities.click_option(self.driver, element=toggle)

    def _selection_helper(self, locator):
        """Menu option helper for duplicated actions."""
        target = self.find_element(*locator)
        Utilities.click_option(self.driver, element=target)

    def click_login(self):
        if self.is_mobile:
            self.click_mobile_user_nav()
        self.login.click()

    def click_logout(self):
        if self.is_desktop:
            self.open_toggle()
            return self.open()._selection_helper(self._logout_locator)
        elif self.is_mobile:
            Utilities.click_option(self.driver, element=self.mobile_user_nav)
            Utilities.click_option(self.driver, element=self.user_nav)
            Utilities.click_option(self.driver, element=self.logout)
        self.wait_for_load()

    def click_view_online(self):
        self.offscreen_click(self.view_online)

    def click_mobile_user_nav(self):
        self.offscreen_click(self.mobile_user_nav)

    def osweb_username(self, element):
        """Get the username of the logged in user."""
        element1 = self.username(element)
        return " ".join(element1.split()[:2])

    @property
    def notification_dialog_displayed(self) -> bool:
        """Return True if the dialog box is displayed.
        :return: ``True`` if the dialog box is displayed
        :rtype: bool
        """
        try:
            return bool(self.find_element(*self._dialog_locator))
        except NoSuchElementException:
            return False

    def click_notification_got_it(self):
        """Click the 'Got it!' button.
        :return: the home page
        :rtype: :py:class:`~pages.web.home.WebHome`
        """
        button = self.find_element(*self._got_it_button_locator)
        Utilities.click_option(self.driver, element=button)
        self.wait.until(lambda _: not self.notification_dialog_displayed)

    @property
    def title(self) -> str:
        """Return the dialog box title.
        :return: the Privacy and Cookies dialog box title
        :rtype: str
        """
        return self.find_element(*self._dialog_title_locator).text

    def book_status_on_amazon(self):
        """Open the Book Order modal."""
        try:
            Utilities.click_option(self.driver, locator=self._print_copy_locator)
            if self.find_element(*self._order_on_amazon_locator):
                Utilities.click_option(self.driver, locator=self._order_on_amazon_locator)
                self.switch_to_window(1)
                amazon_link = self.current_url
                self.driver.close()
                self.driver.switch_to.window(self.driver.window_handles[0])
                return amazon_link
        except NoSuchElementException:
            return None

    def close_modal(self):
        (ActionChains(self.driver).send_keys(Keys.ESCAPE).perform())
