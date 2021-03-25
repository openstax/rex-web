import pytest
from selenium.common.exceptions import NoSuchElementException

from pages.content import Content
from pages.accounts import Login
from pages.osweb import WebBase
from tests import markers


@markers.test_case("C477326", "C477327")
@markers.parametrize("page_slug", ["preface"])
@markers.nondestructive
def test_login_and_logout(selenium, base_url, book_slug, page_slug, email, password):
    """Test Accounts log in and log out from a content page."""
    # GIVEN: a content page is loaded
    content = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    user_nav = content.navbar
    page_url_before_login = selenium.current_url

    # WHEN: they click on the login link
    user_nav.click_login()

    # THEN: The page navigates to accounts/login
    expected_page_url = (
        f"{base_url}/accounts/i/login?r=%2Fbooks%2F"
        f"{book_slug}%2Fpages%2F{page_slug}"
    )
    assert expected_page_url in selenium.current_url, "not viewing the Accounts log in page"

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
    osweb.close_dialogs()

    # THEN: osweb is in logged-in state
    assert osweb.user_is_logged_in

    #  WHEN: click logout in osweb
    osweb.click_logout()
    osweb.wait_for_load()

    # THEN: REX tab goes to logged-out state immediately
    rex.switch_to_window(0)
    assert rex_nav.user_is_not_logged_in


@markers.test_case("C477328")
@markers.parametrize("page_slug", ["preface"])
@markers.nondestructive
def test_rex_login_state_when_redirected_from_osweb(
    selenium, base_url, book_slug, page_slug, email, password
):
    # GIVEN: Open osweb book details page
    osweb = WebBase(selenium, base_url, book_slug=book_slug).open()
    osweb.close_dialogs()
    osweb.click_login()

    # AND: Login as existing user
    accounts = Login(selenium)
    accounts.login(email, password)
    osweb.wait_for_load()

    # verify user is logged in and get the username
    assert osweb.user_is_logged_in
    osweb_username = osweb.osweb_username(osweb.user_nav)

    # WHEN: Click the view online link in osweb book detail page
    osweb.fix_view_online_url(base_url)
    osweb.click_view_online()

    # THEN: The book page is opened in REX with the same user as openstax.org
    rex = Content(selenium)
    rex.wait_for_page_to_load()
    rex_nav = rex.navbar
    assert rex_nav.user_is_logged_in
    rex_username = rex.username(rex_nav.user_nav_toggle)[3:]

    assert rex_username == osweb_username

    # AND: The user stays logged-in while navigating to other pages in REX
    rex.click_next_link()
    assert rex_nav.user_is_logged_in


@markers.test_case("C546508")
@markers.smoke_test
@markers.parametrize("page_slug", ["preface"])
@markers.nondestructive
def test_cookie_notice_accepted_in_rex_not_displayed_in_osweb(
    selenium, base_url, book_slug, page_slug, email, password
):
    # GIVEN: Rex book page is open
    rex = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    rex_nav = rex.navbar
    book_banner = rex.bookbanner

    # AND: Discard any non-cookie notice from the page
    while rex.notification_present:
        if rex.notification.title != "Privacy and cookies":
            rex.notification.got_it()

    # AND: Login Rex with email & password
    rex_nav.click_login()
    accounts = Login(selenium)
    accounts.login(email, password)

    # AND: Cookie notice is displayed
    assert rex.notification.title == "Privacy and cookies", "cookie notice is not displayed"

    # WHEN: Accept the cookie notice
    rex.notification.got_it()

    # AND: click on the book title to navigate to the osweb book page
    book_banner.book_title.click()

    # THEN: Cookie notice should not be displayed in the osweb page
    osweb = WebBase(selenium)
    osweb.wait_for_page_to_load()
    osweb.close_dialogs()

    assert not osweb.notification_dialog_displayed


@markers.test_case("C546509")
@markers.parametrize("page_slug", ["preface"])
@markers.nondestructive
def test_cookie_notice_not_accepted_in_rex_displayed_in_osweb(
    selenium, base_url, book_slug, page_slug, email, password
):
    # GIVEN: Rex book page is open
    rex = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    rex_nav = rex.navbar
    book_banner = rex.bookbanner

    # AND: Discard any non-cookie notice from the page
    while rex.notification_present:
        assert rex.notification.title != "Privacy and cookies"
        rex.notification.got_it()

    # WHEN: Login Rex with email & password
    rex_nav.click_login()
    accounts = Login(selenium)
    accounts.login(email, password)

    # AND: Cookie notice is displayed
    assert rex.notification.title == "Privacy and cookies", "cookie notice is not displayed"

    # WHEN: click on the book title to navigate to the osweb book page
    book_banner.book_title.click()

    # THEN: Cookie notice is displayed in the osweb page
    osweb = WebBase(selenium)
    osweb.wait_for_page_to_load()
    osweb.close_dialogs()

    assert osweb.notification_dialog_displayed


@markers.test_case("C546506")
@markers.parametrize("page_slug", ["preface"])
@markers.nondestructive
def test_cookie_notice_not_accepted_in_osweb_displayed_in_rex(
    selenium, base_url, book_slug, page_slug, email, password
):
    # GIVEN: Open osweb book details page
    osweb = WebBase(selenium, base_url, book_slug=book_slug).open()
    osweb.wait_for_load()
    osweb.close_dialogs()
    osweb.click_login()

    # AND: Login as existing user
    accounts = Login(selenium)
    accounts.login(email, password)
    osweb.wait_for_load()
    osweb.close_dialogs()

    # WHEN: Click the view online link in osweb book detail page
    osweb.fix_view_online_url(base_url)
    osweb.click_view_online()

    # THEN: The book page is opened in REX
    # AND: Discard any non-cookie notice from the page
    # AND: Cookie notice is displayed
    rex = Content(selenium)
    assert rex.notification_present, "cookie notice not displayed"

    try:
        assert rex.notification.title == "Privacy and cookies"
    except AssertionError:
        rex.notification.got_it()
        try:
            assert (
                rex.notification.title == "Privacy and cookies"
            ), f"Additional {rex.notification.title} message present"
        except NoSuchElementException:
            pytest.fail("cookie notice not displayed")


@markers.test_case("C546505")
@markers.parametrize("page_slug", ["preface"])
@markers.nondestructive
def test_cookie_notice_accepted_in_osweb_not_displayed_in_rex(
    selenium, base_url, book_slug, page_slug, email, password
):
    # GIVEN: Open osweb book details page
    osweb = WebBase(selenium, base_url, book_slug=book_slug).open()
    osweb.wait_for_load()
    osweb.click_login()

    # AND: Login as existing user
    accounts = Login(selenium)
    accounts.login(email, password)
    osweb.wait_for_load()

    # AND: Accept the cookie notice
    assert osweb.notification_dialog_displayed
    osweb.click_notification_got_it()

    # WHEN: Click the view online link in osweb book detail page
    osweb.fix_view_online_url(base_url)
    osweb.click_view_online()

    # THEN: The book page is opened in REX
    # AND: Discard any non-cookie notice from the page
    # AND: Cookie notice is not displayed
    rex = Content(selenium)
    try:
        assert not rex.notification_present
    except AssertionError:
        assert rex.notification.title != "Privacy and cookies", "cookie notice displayed"
        rex.notification.got_it()
        assert not rex.notification_present, f"Additional {rex.notification.title} message present"


@markers.test_case("C546507")
@markers.parametrize("page_slug", ["preface"])
@markers.nondestructive
def test_accepted_cookie_notice_not_displayed_in_another_session(
    selenium, base_url, book_slug, page_slug, email, password
):
    # GIVEN: Rex book page is open
    rex = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    rex_nav = rex.navbar
    user_nav = rex.navbar

    # AND: Discard any non-cookie notice from the page
    while rex.notification_present:
        if rex.notification.title != "Privacy and cookies":
            rex.notification.got_it()

    # AND: Login Rex with email & password
    rex_nav.click_login()
    accounts = Login(selenium)
    accounts.login(email, password)

    # AND: Cookie notice is displayed
    assert rex.notification.title == "Privacy and cookies", "cookie notice is not displayed"

    # AND: Accept the cookie notice
    rex.notification.got_it()

    # WHEN: they logout and login
    user_nav.click_user_name()
    user_nav.click_logout()

    rex_nav.click_login()
    accounts.login(email, password)

    # THEN: cookie notice is not displayed
    try:
        assert not rex.notification_present
    except AssertionError:
        assert rex.notification.title != "Privacy and cookies", "cookie notice displayed"
        rex.notification.got_it()
        assert not rex.notification_present, f"Additional {rex.notification.title} message present"
