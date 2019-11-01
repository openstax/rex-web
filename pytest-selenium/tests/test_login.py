from pages.content import Content
from pages.accounts import Login
from pages.osweb import WebBase
from tests import markers
from time import sleep


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
    expected_page_url = base_url + "/accounts/login?r=/books/" + book_slug + "/pages/" + page_slug
    assert expected_page_url == selenium.current_url

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


@markers.test_case("C477329")
@markers.parametrize("page_slug", ["preface"])
@markers.nondestructive
def test_logout_in_osweb_logsout_rex(selenium, base_url, book_slug, page_slug, email, password):
    # GIVEN: Rex page is open
    rex = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    rex_nav = rex.navbar

    # WHEN: Login Rex with email & password
    rex_nav.click_login()

    accounts = Login(selenium)
    accounts.login(email, password)

    # AND: Open osweb url in a new tab
    rex.open_new_tab()
    rex.switch_to_window(1)

    osweb = WebBase(selenium, base_url, book_slug=book_slug).open()
    osweb.wait_for_load()
    sleep(1)

    # THEN: osweb is in logged-in state
    assert osweb.user_is_logged_in
    sleep(2)

    #  WHEN: click logout in osweb
    osweb.click_logout()

    # THEN: REX tab will stay in logged-in state
    rex.switch_to_window(0)
    assert rex_nav.user_is_logged_in

    # AND: REX tab goes to logged-out state on a reload
    selenium.refresh()
    assert rex_nav.user_is_not_logged_in


@markers.test_case("C477328")
@markers.parametrize("page_slug", ["preface"])
@markers.nondestructive
def test_rex_login_state_when_redirected_from_osweb(
    selenium, base_url, book_slug, page_slug, email, password
):
    # GIVEN: Open osweb book details page
    osweb = WebBase(selenium, base_url, book_slug=book_slug).open()
    osweb.wait_for_load()

    # AND: Login as existing user
    accounts = Login(selenium)
    sleep(1)
    osweb.click_login()
    accounts.login(email, password)

    sleep(1)
    # verify user is logged in and get the username
    assert osweb.user_is_logged_in
    osweb_username = osweb.osweb_username(osweb.user_nav)

    sleep(2)

    # WHEN: Click the view online link in osweb
    osweb.click_view_online()

    osweb.switch_to_window(1)
    sleep(1)

    # THEN: The book page is opened in REX with the same user as openstax.org
    rex = Content(selenium)
    rex_nav = rex.navbar
    assert rex_nav.user_is_logged_in
    rex_username = rex.username(rex_nav.user_nav_toggle)

    assert rex_username == osweb_username

    # AND: The user stays logged-in while navigating to other pages in REX
    rex.click_next_link()
    assert rex_nav.user_is_logged_in
