from pages.content import Content
from tests import markers


@markers.test_case("C477326")
@markers.parametrize("page_slug", ["preface"])
@markers.nondestructive
def test_login(selenium, base_url, book_slug, page_slug):
    content = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    content.click_login()

    # the browser redirects to accounts/login
    # AND after successful login, redirects back to the preface page
    # AND the user menu displayed in the nav includes Account Profile and Logout
    # AND reloading does not reset the state back to logged out

    # THEN: The page navigates to accounts/login
    expected_page_url = base_url + "/accounts/login?r=/books/" + book_slug + "/pages/" + page_slug
    print(expected_page_url)

    assert expected_page_url == selenium.current_url
