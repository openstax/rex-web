from pages.base import Page

from pypom import Region

from selenium.common.exceptions import TimeoutException, WebDriverException
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as expect

# from pages.accounts.base import AccountsBase


class Accounts(Page):
    _root_locator = (By.CSS_SELECTOR, "body")
    _user_field_locator = (By.ID, "login_username_or_email")
    _password_field_locator = (By.ID, "login_password")
    _login_submit_button_locator = (By.CSS_SELECTOR, "[type=submit]")

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

    def login(self, user, password):
        """Log into Accounts with a specific user."""
        self.service_login(user, password)
        try:
            self.wait.until(lambda _: self.logged_in)
        except TimeoutException:
            pass
        from pages.accounts.profile import Profile

        # return go_to_(Profile(self.driver, self.page.base_url))
