from pypom import Page
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as expected
from utils import utility
from selenium.webdriver.common.keys import Keys


class Login(Page):
    _user_field_locator = (By.ID, "login_username_or_email")
    _password_field_locator = (By.ID, "login_password")
    _login_submit_button_locator = (By.CSS_SELECTOR, "[type=submit]")

    @property
    def user_field(self):
        return self.wait.until(expected.presence_of_element_located(self._user_field_locator))

    @property
    def password_field(self):
        return self.find_element(*self._password_field_locator)

    def enter_user_email(self, username):
        self.wait.until(expected.visibility_of_element_located(self._user_field_locator))
        self.user_field.send_keys(username)

    def enter_password(self, password):
        self.wait.until(expected.visibility_of_element_located(self._password_field_locator))
        self.password_field.send_keys(password)
        return self

    def click_next(self):
        self.find_element(*self._login_submit_button_locator).send_keys(Keys.ENTER)
        return self

    click_login = click_next

    def login(self, email, password):
        self.enter_user_email(email)
        self.click_next()
        self.enter_password(password)
        self.wait.until(expected.visibility_of_element_located(self._login_submit_button_locator))
        self.click_login()
        self.wait.until(expected.invisibility_of_element_located(self._login_submit_button_locator))
