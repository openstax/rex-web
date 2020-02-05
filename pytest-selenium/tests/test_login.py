from pages.content import Content
from pages.accounts import Login
from tests import markers


@markers.test_case("C477326", "C477327")
@markers.parametrize("page_slug", ["preface"])
@markers.nondestructive
def test_login_and_logout(
        selenium, base_url, book_slug, page_slug, email, password):
    """Test Accounts log in and log out from a content page."""
    # GIVEN: a content page is loaded
    content = Content(selenium, base_url,
                      book_slug=book_slug, page_slug=page_slug).open()
    user_nav = content.navbar
    page_url_before_login = selenium.current_url

    # WHEN: they click on the login link
    user_nav.click_login()

    # THEN: The page navigates to accounts/login
    expected_page_url_old = (
        f"{base_url}/accounts/login?r=/books/"
        f"{book_slug}/pages/{page_slug}")
    expected_page_url_new = (
        f"{base_url}/accounts/i/login?r=%2Fbooks%2F"
        f"{book_slug}%2Fpages%2F{page_slug}")
    assert(expected_page_url_old in selenium.current_url or
           expected_page_url_new in selenium.current_url), \
        "not viewing the Accounts log in page"

    # WHEN: they log in as an existing user
    Login(selenium).login(email, password)

    # THEN: they are redirected back to the preface page after logging in
    assert page_url_before_login == selenium.current_url

    # WHEN: they click on their name in the nav bar
    user_nav.click_user_name()

    # THEN: the user menu in the nav displays Account Profile and Log out
    assert user_nav.account_profile_is_displayed
    assert user_nav.logout_is_displayed

    # WHEN: they reload the page
    selenium.refresh()

    # THEN: the system does not reset the state to logged out
    assert user_nav.user_is_logged_in

    # WHEN: they click the Log out link
    user_nav.click_user_name()
    user_nav.click_logout()

    # THEN: they are logged out
    assert user_nav.user_is_not_logged_in

    # WHEN: they reload the page
    selenium.refresh()

    # THEN: the system does not reset the state back to logged in
    assert user_nav.user_is_not_logged_in
