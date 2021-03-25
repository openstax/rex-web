# flake8: noqa
from selenium.webdriver.common.by import By
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.support import expected_conditions as expected
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys
from time import sleep

from pages.base import Page
from utils.utility import Utilities

HAS_HEIGHT = "return window.getComputedStyle(arguments[0]).height != 'auto';"
SET_HREF = "arguments[0].href = '{0}';"


class WebBase(Page):

    DESKTOP = "//div[@class='bigger-view']"
    MOBILE = "//div[@class='phone-view']"
    PRINT_COPY = "//a[span[contains(text(), 'Order a print copy')]]"
    URL_TEMPLATE = "/details/books/{book_slug}"
    VIEW_ONLINE = "//a[span[text()='View online']]"

    _body_data_init_locator = (
        By.CSS_SELECTOR, "body[data-abr=init]")
    _call_out_put_away_button_locator = (
        By.CSS_SELECTOR, ".callout .put-away")
    _close_locator = (
        By.CSS_SELECTOR, '[class="put-away"]')
    _desktop_user_menu_locator = (
        By.CSS_SELECTOR, ".desktop .login-menu")
    _dialog_locator = (
        By.CSS_SELECTOR, '[aria-labelledby="dialog-title"]')
    _dialog_title_locator = (
        By.CSS_SELECTOR, "#dialog-title")
    _got_it_button_locator = (
        By.CSS_SELECTOR, ".cookie-notice button")
    _individual_copy_locator = (
        By.CSS_SELECTOR, ".phone-version > a.box:first-child")
    _logout_locator = (
        By.CSS_SELECTOR, "[href*=signout]")
    _log_in_locator = (
        By.CSS_SELECTOR, '[class="pardotTrackClick"]')
    _mobile_user_menu_locator = (
        By.CSS_SELECTOR, ".mobile .login-menu")
    _mobile_user_nav_loaded_locator = (
        By.CSS_SELECTOR, '[class="page-header active"]')
    _mobile_user_nav_locator = (
        By.CSS_SELECTOR, '[aria-label="Toggle Meta Navigation Menu"]')
    _pi_close_button_locator = (
        By.CSS_SELECTOR, "._pi_closeButton")
    _print_copy_locator = (
        By.XPATH, f"{DESKTOP}{PRINT_COPY}")
    _print_copy_mobile_locator = (
        By.XPATH, f"{MOBILE}{PRINT_COPY}")
    _order_a_personal_copy_locator = (
        By.CSS_SELECTOR, ".larger-version [class='btn primary'][data-track=Print]")
    _osweb_404_locator = (
        By.CSS_SELECTOR, '[class*="not-found"]')
    _sticky_note_put_away_button_locator = (
        By.CSS_SELECTOR, "#lower-sticky-note .put-away")
    _user_nav_locator = (
        By.CSS_SELECTOR, '.login-menu')
    _view_online_desktop_locator = (
        By.XPATH, f"{DESKTOP}{VIEW_ONLINE}")
    _view_online_links_locator = (
        By.XPATH, "//a[span[contains(text(),'View online')]]")
    _view_online_mobile_locator = (
        By.XPATH, f"{MOBILE}{VIEW_ONLINE}")

    @property
    def loaded(self):
        """Return when the page is loaded.

        Fires the 'load' event when the whole webpage (HTML) has loaded fully,
        including all dependent resources such as CSS files, and images.
        Or
        Return when the async event is hidden.

        """
        script = r'window.addEventListener("load", function(event) {});'
        self.driver.execute_script(script)
        sleep(1.0)
        return bool(self.find_elements(*self._body_data_init_locator))

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
        return self.find_element(*self._log_in_locator)

    @property
    def user_nav(self):
        return self.find_element(*self._user_nav_locator)

    @property
    def mobile_user_nav(self):
        return self.find_element(*self._mobile_user_nav_locator)

    @property
    def mobile_user_nav_loaded(self):
        user_nav = self.find_elements(*self._mobile_user_nav_loaded_locator)
        if not user_nav:
            return False
        return user_nav[0].is_displayed()

    @property
    def logout(self):
        return self.find_element(*self._logout_locator)

    @property
    def notification_dialog(self):
        return self.find_element(*self._dialog_locator)

    @property
    def user_is_logged_in(self):
        if self.is_desktop:
            user_menu = self.find_element(*self._desktop_user_menu_locator)
        else:
            user_menu = self.find_element(*self._mobile_user_menu_locator)
        return 'dropdown' in user_menu.get_attribute("class")

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
        Utilities.click_option(self.driver, element=self.view_online)

    def click_mobile_user_nav(self):
        self.offscreen_click(self.mobile_user_nav)
        sleep(1.0)

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
        return bool(self.find_elements(*self._dialog_locator))

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
            print_locator = (
                self._print_copy_mobile_locator if self.is_mobile else
                self._print_copy_locator
            )
            individual_locator = (
                self._individual_copy_locator if self.is_mobile else
                self._order_a_personal_copy_locator
            )
            Utilities.click_option(self.driver, locator=print_locator)
            individual = self.find_elements(*individual_locator)
            if individual:
                Utilities.switch_to(self.driver, element=individual[0])
                sleep(1)
                amazon_link = self.current_url
                self.driver.close()
                self.driver.switch_to.window(self.driver.window_handles[0])
                return amazon_link
        except NoSuchElementException:
            return None

    def close_modal(self):
        (ActionChains(self.driver).send_keys(Keys.ESCAPE).perform())

    def close_dialogs(self):
        """Close OSWeb dialog and survey boxes.

        :return: None

        """
        # Pulse Insights survey
        pi_close_button = self.find_elements(
            *self._pi_close_button_locator)
        if pi_close_button:
            Utilities.click_option(
                self.driver, element=pi_close_button[0])

        # Sticky note alert or donation bar
        sticky_note_close_button = self.find_elements(
            *self._sticky_note_put_away_button_locator)
        if sticky_note_close_button:
            Utilities.click_option(
                self.driver, element=sticky_note_close_button[0])

        # In-line call out modal for phone or full view
        call_out_put_away_button = [
            button
            for button
            in self.find_elements(*self._call_out_put_away_button_locator)
            if self.driver.execute_script(HAS_HEIGHT, button)]
        if call_out_put_away_button:
            Utilities.click_option(
                self.driver, element=call_out_put_away_button[0])

    def fix_view_online_url(self, base_url: str):
        """Fix a non-staging/prod View online link.

        :param str base_url: the expected instance base URL
        :return: None

        """
        base = base_url.split("/")[2]
        for link in self.find_elements(*self._view_online_links_locator):
            url = link.get_attribute("href")
            split_url = url.split("/")
            split_url[2] = base
            new_url = "/".join(split_url)
            self.driver.execute_script(SET_HREF.format(new_url), link)
