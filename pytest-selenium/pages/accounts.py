from pypom import Page
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as expect


class Login(Page):
    _user_field_locator = (By.ID, "login_username_or_email")
    _password_field_locator = (By.ID, "login_password")
    _login_submit_button_locator = (By.CSS_SELECTOR, "[type=submit]")

    @property
    def user_field(self):
        """Return the user field."""
        return self.wait.until(expect.presence_of_element_located(self._user_field_locator))

    def enter_user_info(self, name_or_email):
        """Send the login email or username."""
        self.user_field.send_keys(name_or_email)

    def next_click(self):
        """Click the NEXT button."""
        self.find_element(*self._login_submit_button_locator).click()
        return self

    submit = next_click

    @property
    def password_field(self):
        """Return the password field."""
        return self.find_element(*self._password_field_locator)

    def password(self, password):
        """Send the password."""
        self.password_field.send_keys(password)
        return self
