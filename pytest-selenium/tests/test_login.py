from pages.content import Content
from pages.accounts import Login
from pages.osweb import WebBase
from tests import markers
from selenium import webdriver
from selenium.webdriver.common.action_chains import ActionChains

from selenium.webdriver.common.keys import Keys


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
    if content.is_mobile:
        user_nav.click_user_name()
    user_nav.hover_over_user_name()

    assert user_nav.account_profile.is_displayed()
    assert user_nav.logout.is_displayed()

    # AND: Reloading does not reset the state to logged out
    selenium.refresh()
    assert user_nav.user_is_logged_in

    # WHEN: Click the logout link
    if content.is_mobile:
        user_nav.click_user_name()
    user_nav.hover_over_user_name()

    user_nav.logout.click()

    # THEN: The user is logged out
    assert user_nav.user_is_not_logged_in

    # AND: Reloading does not reset the state back to logged in
    selenium.refresh()
    assert user_nav.user_is_not_logged_in


@markers.test_case("C477329")
@markers.parametrize("page_slug", ["preface"])
@markers.nondestructive
def test_logout_in_osweb_logsout_rex(selenium, base_url, book_slug, page_slug, email, password):

    # Openstax.org and REX are open in different tabs in logged - in state

    content = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    user_nav = content.navbar

    user_nav.click_login()
    accounts = Login(selenium)
    accounts.login(email, password)

    # open osweb url in a new tab
    selenium.execute_script("""window.open("","_blank");""")
    selenium.switch_to_window(selenium.window_handles[1])
    osweb = WebBase(selenium, base_url).open()

    osweb.user_nav.click()

    # osweb.hover_over_user_name()

    osweb.click_logout()

    from time import sleep

    sleep(3)


# click the logout link in openstax.org

# REX tab will stay the same logged-in state
# AND REX tab goes to logged-out state on a reload or navigating to a feature that requires a login
