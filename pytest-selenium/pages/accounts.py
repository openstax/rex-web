"""Home page objects."""

from time import sleep

from pypom import Region
from selenium.common.exceptions import ElementNotInteractableException  # NOQA
from selenium.common.exceptions import TimeoutException, WebDriverException
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as expect


class AccountsHome(Region):
    """Home page base."""

    URL_TEMPLATE = ""

    @property
    def login(self):
        """Return the login pane."""
        return self.Login(self)

    def log_in(self, user, password):
        """Log into the site with a specific user."""
        return self.login.login(user, password)

    @property
    def logged_in(self):
        """Return user log in status."""
        return self.Login(self).logged_in

    @property
    def location(self):
        """Return the current URL."""
        return self.driver.current_url

    class Login(Region):
        """User login pane."""

        _user_field_locator = (By.ID, "login_username_or_email")
        _password_field_locator = (By.ID, "login_password")
        _login_submit_button_locator = (By.CSS_SELECTOR, "[type=submit]")

        @property
        def logged_in(self):
            """Return True if a user is logged in."""
            return "profile" in self.driver.current_url

        @property
        def user(self):
            """Return the user field."""
            return self.wait.until(expect.presence_of_element_located(self._user_field_locator))

        @user.setter
        def user(self, login):
            """Send the login email or username."""
            self.user.send_keys(login)
            return self

        def next(self):
            """Click the NEXT button."""
            self.find_element(*self._login_submit_button_locator).click()
            sleep(1.0)
            return self

        def reset(self):
            """Click the reset password link."""
            self.find_element(*self._password_reset_locator).click()
            sleep(1.0)
            return self

        @property
        def password(self):
            """Return the password field."""
            return self.find_element(*self._password_field_locator)

        @password.setter
        def password(self, password):
            """Send the password."""
            self.password.send_keys(password)
            return self

        @property
        def agreement_checkbox(self):
            """Return the terms of use agreement checkbox."""
            return self.find_element(*self._terms_agreement)

        def login(self, user, password):
            """Log into Accounts with a specific user."""
            self.service_login(user, password)
            try:
                self.wait.until(lambda _: self.logged_in)
            except TimeoutException:
                pass
