from pypom import Page
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as expect
from utils import utility


class Login(Page):
    _user_field_locator = (By.ID, "login_username_or_email")
    _password_field_locator = (By.ID, "login_password")
    _login_submit_button_locator = (By.CSS_SELECTOR, "[type=submit]")

    @property
    def user_field(self):
        return self.wait.until(expect.presence_of_element_located(self._user_field_locator))

    @property
    def password_field(self):
        return self.find_element(*self._password_field_locator)

    def enter_user_email(self, emails=utility.Library().random_user_email):
        self.user_field.send_keys(emails)

    def enter_password(self, password=utility.Library().password):
        self.password_field.send_keys(password)
        return self

    def click_next(self):
        self.find_element(*self._login_submit_button_locator).click()
        return self

    click_login = click_next

    def login(self, email, password):
        self.enter_user_email()
        self.click_next()
        self.enter_password()
        self.click_login()
