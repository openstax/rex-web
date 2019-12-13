"""OpenStax Accounts helper workflows for user log in and registration."""

import string
from random import randint
from typing import Tuple

from pypom import Page
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as expect
from selenium.webdriver.support.ui import Select

from utils.restmail import RestMail
from utils.utility import Utilities

Name = Tuple[str, str]


class Login(Page):
    _user_field_locator = (By.ID, "login_username_or_email")
    _password_field_locator = (By.ID, "login_password")
    _login_submit_button_locator = (By.CSS_SELECTOR, "[type=submit]")

    @property
    def user_field(self):
        return self.wait.until(
            expect.presence_of_element_located(
                self._user_field_locator))

    @property
    def password_field(self):
        return self.find_element(*self._password_field_locator)

    def enter_user_email(self, username):
        self.wait.until(
            expect.visibility_of_element_located(
                self._user_field_locator))
        self.user_field.send_keys(username)

    def enter_password(self, password):
        self.wait.until(
            expect.visibility_of_element_located(
                self._password_field_locator))
        self.password_field.send_keys(password)
        return self

    def click_next(self):
        self.find_element(*self._login_submit_button_locator) \
            .send_keys(Keys.ENTER)
        return self

    click_login = click_next

    def login(self, email, password):
        self.enter_user_email(email)
        self.click_next()
        self.enter_password(password)
        self.wait.until(
            expect.visibility_of_element_located(
                self._login_submit_button_locator))
        self.click_login()
        self.wait.until(
            expect.invisibility_of_element_located(
                self._login_submit_button_locator))


class Signup(Page):
    """A student sign up process."""

    _signup_link_locator = (
        By.CSS_SELECTOR, "[href$=signup]")

    _email_signup_input_locator = (
        By.CSS_SELECTOR, "#signup_email")
    _next_button_locator = (
        By.CSS_SELECTOR, "[type=submit]")
    _user_select_role_locator = (
        By.CSS_SELECTOR, "#signup_role")

    _confirm_button_locator = _next_button_locator
    _pin_entry_input_locator = (
        By.CSS_SELECTOR, "#pin_pin")

    _password_confirmation_input_locator = (
        By.CSS_SELECTOR, "#signup_password_confirmation")
    _password_select_input_locator = (
        By.CSS_SELECTOR, "#signup_password")
    _submit_button_locator = _next_button_locator

    _accept_policies_checkbox_locator = (
        By.CSS_SELECTOR, "#profile_i_agree")
    _create_account_button_locator = _next_button_locator
    _first_name_input_locator = (
        By.CSS_SELECTOR, "#profile_first_name")
    _last_name_input_locator = (
        By.CSS_SELECTOR, "#profile_last_name")
    _school_name_input_locator = (
        By.CSS_SELECTOR, "#profile_school")

    def confirm_email(self, email: RestMail):
        """Confirm the user's email address.

        :param email: the user's RestMail instance
        :type email: :py:class:`~utils.utility.RestMail`

        """
        inbox = email.wait_for_mail()
        verification_pin = inbox[-1].pin
        pin_field = self.find_element(*self._pin_entry_input_locator)
        pin_field.send_keys(verification_pin)
        confirm_button = self.find_element(*self._confirm_button_locator)
        Utilities.click_option(self.driver, element=confirm_button)

    def enter_user_info(self, first_name: str, last_name: str, school: str):
        """Enter the user's name and school and accept the terms of use.

        :param str first_name: the user's first name
        :param str last_name: the user's last name
        :param str school: the user's school name

        """
        first_name_field = self.find_element(*self._first_name_input_locator)
        first_name_field.send_keys(first_name)
        last_name_field = self.find_element(*self._last_name_input_locator)
        last_name_field.send_keys(last_name)
        school_name_field = self.find_element(*self._school_name_input_locator)
        school_name_field.send_keys(school)
        i_agree_checkbox = self.find_element(
            *self._accept_policies_checkbox_locator)
        Utilities.click_option(self.driver, element=i_agree_checkbox)
        create_account_button = self.find_element(
            *self._create_account_button_locator)
        Utilities.click_option(self.driver, element=create_account_button)

    def register(self) -> Tuple[Name, RestMail]:
        """Register a new student and return the email and password.

        :return: the new RestMail address
        :rtype: ((str, str), RestMail)

        """
        name, password, school, email = self.registration_setup()

        self.sign_up()
        self.select_role(email.address)
        self.confirm_email(email)
        self.select_password(password)
        self.enter_user_info(*name, school)

        return (name, email)

    def registration_setup(self) -> Tuple[str, str, str, RestMail]:
        """Generate registration values and a valid email.

        :return: the user's name, password, school name and an email address
        :rtype: (str, str, str, :py:class:`~utils.utility.RestMail`)

        """
        letters = (
            string.ascii_lowercase + string.ascii_uppercase + string.digits)
        name = Utilities.random_name()
        password = "".join(
            [letters[randint(0, len(letters) - 1)] for _ in range(20)])
        school = "Automation"
        extra_length = randint(3, 8)
        extra_string = "".join(
            [string.hexdigits[randint(0, 0xF)] for _ in range(extra_length)])
        email = RestMail(f"{name[0]}.{name[1]}.{extra_string}".lower())
        email.empty()
        return (name, password, school, email)

    def select_password(self, password: str):
        """Select and confirm the user's password.

        :param str password: the user's password

        """
        password_field = self.find_element(
            *self._password_select_input_locator)
        password_field.send_keys(password)
        password_confirmation_field = self.find_element(
            *self._password_confirmation_input_locator)
        password_confirmation_field.send_keys(password)
        submit_button = self.find_element(*self._submit_button_locator)
        Utilities.click_option(self.driver, element=submit_button)

    def select_role(self, email: str):
        """Select the user's role and enter their email address.

        :param str email: the user's email address

        """
        role_menu = Select(self.find_element(*self._user_select_role_locator))
        role_menu.select_by_visible_text("Student")
        email_field = self.find_element(*self._email_signup_input_locator)
        email_field.send_keys(email)
        next_button = self.find_element(*self._next_button_locator)
        Utilities.click_option(self.driver, element=next_button)

    def sign_up(self):
        """Click the sign up link."""
        signup_link = self.find_element(*self._signup_link_locator)
        Utilities.click_option(self.driver, element=signup_link)
