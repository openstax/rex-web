from pages.content import Content
from tests import markers
from pages.accounts import Login

from time import sleep


@markers.test_case("C477326")
@markers.parametrize("page_slug", ["preface"])
@markers.nondestructive
def test_login(selenium, base_url, book_slug, page_slug):
    content = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    selenium.implicitly_wait(1)
    page_url_before_login = selenium.current_url
    content.click_login()

    # THEN: The page navigates to accounts/login
    expected_page_url = base_url + "/accounts/login?r=/books/" + book_slug + "/pages/" + page_slug

    assert expected_page_url == selenium.current_url

    accounts = Login(selenium)
    accounts.enter_user_info(name_or_email="teacher01")
    accounts.next_click()
    accounts.password(password="staxly16")
    accounts.login_click()
    selenium.implicitly_wait(10)

    # AND after successful login, redirects back to the preface page
    assert page_url_before_login == selenium.current_url

    # AND the user menu displayed in the nav includes Account Profile and Logout
    user_nav = content.navbar
    user_nav.hover_over_username()
    selenium.implicitly_wait(10)
    assert user_nav.account_profile.is_displayed()
    assert user_nav.logout.is_displayed()
    sleep(5)

    # AND reloading does not reset the state back to logged out
    selenium.refresh()
    assert user_nav.user_is_logged_in
