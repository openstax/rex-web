from pages.content import Content
from pages.accounts import Login
from tests import markers


@markers.test_case("C477326", "C477327")
@markers.parametrize("page_slug", ["preface"])
@markers.nondestructive
def test_login_and_logout(selenium, base_url, book_slug, page_slug, email, password):

    # GIVEN: Page is loaded
    content = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    user_nav = content.navbar
    page_url_before_login = selenium.current_url

    # WHEN: Click on the login link
    user_nav.click_login()

    # THEN: The page navigates to accounts/login
    expected_page_url = f"{base_url}/accounts/login?r=/books/{book_slug}/pages/{page_slug}"
    assert expected_page_url in selenium.current_url

    # Login as an existing user
    accounts = Login(selenium)

    accounts.login(email, password)

    # AND: After successful login, redirects back to the preface page
    assert page_url_before_login == selenium.current_url

    # AND: The user menu displayed in the nav includes Account Profile and Logout
    user_nav.click_user_name()

    assert user_nav.account_profile_is_displayed
    assert user_nav.logout_is_displayed

    # AND: Reloading does not reset the state to logged out
    selenium.refresh()
    assert user_nav.user_is_logged_in

    # WHEN: Click the logout link
    user_nav.click_user_name()
    user_nav.click_logout()

    # THEN: The user is logged out
    assert user_nav.user_is_not_logged_in

    # AND: Reloading does not reset the state back to logged in
    selenium.refresh()
    assert user_nav.user_is_not_logged_in
