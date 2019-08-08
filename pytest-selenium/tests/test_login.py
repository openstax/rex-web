from pages.content import Content
from tests import markers
from pages.accounts import Login

from time import sleep


@markers.test_case("C477326")
@markers.parametrize("page_slug", ["preface"])
@markers.nondestructive
def test_login(selenium, base_url, book_slug, page_slug):
    content = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    sleep(4)
    content.click_login()

    # the browser redirects to accounts/login
    # AND after successful login, redirects back to the preface page
    # AND the user menu displayed in the nav includes Account Profile and Logout
    # AND reloading does not reset the state back to logged out

    # THEN: The page navigates to accounts/login
    expected_page_url = base_url + "/accounts/login?r=/books/" + book_slug + "/pages/" + page_slug
    print(expected_page_url)

    assert expected_page_url == selenium.current_url

    # accounts = Login(page=Content(selenium, base_url='base_url + "/accounts/login?r=/books/"'))
    accounts = Login()
    accounts.enter_user_info(name_or_email="teacher01")
    accounts.next_click()
    accounts.password(password="nope")
    accounts.next_click()
    sleep(5)
