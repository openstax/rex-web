"""OpenStax Accounts helper workflows for user log in and registration."""
# fmt: off
import string
from random import randint
from typing import Tuple, Union

from pypom import Page
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as expect
from selenium.webdriver.support.ui import Select, WebDriverWait

from utils.restmail import RestMail
from utils.utility import Utilities

Name = Tuple[str, str]
Password = str


class Login(Page):

    _login_submit_button_locator = (
        By.CSS_SELECTOR, "[type=submit]")
    _password_field_locator = (
        By.CSS_SELECTOR, "#login_password, #login_form_password")
    _user_field_locator = (
        By.CSS_SELECTOR, "#login_username_or_email, #login_form_email")

    @property
    def current_url(self) -> str:
        """Return the current page URL.

        :return: the current page URL
        :rtype: str

        """
        return self.driver.current_url

    @property
    def source(self) -> str:
        """Return the current page source.

        :return: the current page source
        :rtype: str

        """
        return self.driver.page_source

    @property
    def user_field(self):
        return self.wait.until(
            expect.presence_of_element_located(
                self._user_field_locator))

    @property
    def password_field(self):
        return self.find_element(*self._password_field_locator)

    def enter_user_email(self, username):
        """Enter username in the Accounts login screen.

        :param username: random user email from secure store -> str
        """

        self.wait.until(
            expect.visibility_of_element_located(
                self._user_field_locator))
        self.user_field.send_keys(username)

    def enter_password(self, password):
        """Enter password in the Accounts login screen.

        :param password: password from secure store -> str
        """
        self.password_field.send_keys(password)

    def click_continue(self):
        """Click Continue button"""

        self.find_element(*self._login_submit_button_locator) \
            .send_keys(Keys.ENTER)
        return self

    def login(self, email, password):
        """Login as existing user.

        :param email: random user email from secure store -> str
        :param password: random user password from secure store -> str

        """
        self.enter_user_email(email)
        self.enter_password(password)
        self.wait.until(
            expect.visibility_of_element_located(
                self._login_submit_button_locator))
        self.click_continue()
        self.wait.until(
            expect.invisibility_of_element_located(
                self._login_submit_button_locator))


class Signup(Page):
    """A student sign up process."""

    _signup_link_or_tab_locator = (
        By.CSS_SELECTOR, ".extra-info [href$=signup], .tab.signup")

    _new_accounts_flow_locator = (
        By.CSS_SELECTOR, "[id*=newflow]")

    _email_signup_input_locator = (
        By.CSS_SELECTOR, "#signup_email")
    _next_button_locator = (
        By.CSS_SELECTOR, "[type=submit]")
    _user_select_role_locator = (
        By.CSS_SELECTOR, "#signup_role")
    _as_a_student_button_locator = (
        By.CSS_SELECTOR, "[href$=student]")

    _confirm_button_locator = _next_button_locator
    _pin_entry_input_locator = (
        By.CSS_SELECTOR, "#pin_pin, #confirm_pin")

    _password_confirmation_input_locator = (
        By.CSS_SELECTOR, "#signup_password_confirmation")
    _password_select_input_locator = (
        By.CSS_SELECTOR, "#signup_password")
    _submit_button_locator = _next_button_locator

    _accept_policies_checkbox_locator = (
        By.CSS_SELECTOR, "#profile_i_agree, #signup_terms_accepted")
    _create_account_button_locator = _next_button_locator
    _first_name_input_locator = (
        By.CSS_SELECTOR, "#profile_first_name, #signup_first_name")
    _last_name_input_locator = (
        By.CSS_SELECTOR, "#profile_last_name, #signup_last_name")
    _school_name_input_locator = (
        By.CSS_SELECTOR, "#profile_school")

    _finish_button_locator = _next_button_locator

    @property
    def _use_new_accounts_flow(self) -> bool:
        """Return True if the new Accounts flow tag is found.

        :return: ``True`` if any elements have "newflow" in their ID
        :rtype: bool

        """
        WebDriverWait(self.driver, 1).until(
            expect.visibility_of_element_located(self._new_accounts_flow_locator))
        return bool(self.find_elements(*self._new_accounts_flow_locator))

    def complete(self):
        """Complete the new user account setup flow."""
        button = self.find_element(*self._finish_button_locator)
        Utilities.click_option(self.driver, element=button, scroll_to=-100)

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

    def enter_user_info(self, first_name: str, last_name: str,
                        school: str = "",
                        email: str = "", password: str = ""):
        """Enter the user's name and school and accept the terms of use.

        :param str first_name: the user's first name
        :param str last_name: the user's last name
        :param str school: (optional) the user's school name when using the old
            Accounts flow
        :param str email: (optional) the user's email address when using the
            new Accounts flow
        :param str password: (optional) the user's password when using the new
            Accounts flow

        """
        first_name_field = self.find_element(*self._first_name_input_locator)
        first_name_field.send_keys(first_name)
        last_name_field = self.find_element(*self._last_name_input_locator)
        last_name_field.send_keys(last_name)
        if self._use_new_accounts_flow:
            email_field = self.find_element(*self._email_signup_input_locator)
            email_field.send_keys(email)
            password_field = self.find_element(
                *self._password_select_input_locator)
            password_field.send_keys(password)
        else:
            school_name_field = self.find_element(
                *self._school_name_input_locator)
            school_name_field.send_keys(school)
        i_agree_checkbox = self.find_element(
            *self._accept_policies_checkbox_locator)
        Utilities.click_option(self.driver, element=i_agree_checkbox)
        create_account_button = self.find_element(
            *self._create_account_button_locator)
        Utilities.click_option(self.driver, element=create_account_button)

    def register(self, return_password: bool = False) \
            -> Union[Tuple[Name, RestMail], Tuple[Name, RestMail, Password]]:
        """Register a new student and return the name, email and/or password.

        :param bool return_password: (optional) include the generated password
            in the returned tuple
        :return: the new RestMail address
        :rtype: ((str, str), RestMail) or ((str, str), RestMail, str)

        """
        name, password, school, email = self.registration_setup()

        self.sign_up()
        self.select_role(email.address)
        if self._use_new_accounts_flow:
            self.enter_user_info(*name, school, email.address, password)
            self.confirm_email(email)
            self.complete()
        else:
            self.confirm_email(email)
            self.select_password(password)
            self.enter_user_info(*name, school, email.address, password)

        if return_password:
            return (name, email, password)
        return (name, email)

    def registration_setup(self) -> Tuple[str, str, str, RestMail]:
        """Generate registration values and a valid email.

        :return: the user's name, password, school name and an email address
        :rtype: (str, str, str, :py:class:`~utils.utility.RestMail`)

        """
        letters = string.ascii_letters + string.digits
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
        if self._use_new_accounts_flow:
            as_a_student_button = self.find_element(
                *self._as_a_student_button_locator)
            Utilities.click_option(self.driver, element=as_a_student_button)
            return
        # old flow
        role_menu = Select(self.find_element(*self._user_select_role_locator))
        role_menu.select_by_visible_text("Student")
        email_field = self.find_element(*self._email_signup_input_locator)
        email_field.send_keys(email)
        next_button = self.find_element(*self._next_button_locator)
        Utilities.click_option(self.driver, element=next_button)

    def sign_up(self):
        """Click the sign up link."""

        WebDriverWait(self.driver, 1).until(
            expect.visibility_of_element_located(self._signup_link_or_tab_locator))
        signup_link = self.find_element(*self._signup_link_or_tab_locator)
        Utilities.click_option(self.driver, element=signup_link)
# fmt: on
