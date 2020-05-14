from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as expected
from time import sleep

from pages.base import Page
from utils.utility import Utilities


class WebBase(Page):
    URL_TEMPLATE = "/details/books/{book_slug}"
    _async_hide_locator = (By.CSS_SELECTOR, ".async-hide")
    _user_nav_locator = (By.CSS_SELECTOR, '[class*="login-menu"]')
    _login_locator = (By.CSS_SELECTOR, '[class="pardotTrackClick"]')
    _logout_locator = (By.CSS_SELECTOR, "[href*=logout]")
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
