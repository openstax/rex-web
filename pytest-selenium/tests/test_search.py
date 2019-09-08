from random import choice
from string import digits, ascii_letters

from pages.content import Content
from tests import markers
from regions.search_sidebar import SearchSidebar
from regions import base

from time import sleep


@markers.test_case("C543235")
@markers.parametrize("page_slug", ["preface"])
@markers.nondestructive
def test_message_when_search_yields_no_results(selenium, base_url, book_slug, page_slug):
    # GIVEN: book page is loaded
    content = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    query = "".join(choice(digits + ascii_letters) for i in range(25))

    toolbar = content.toolbar
    # WHEN: search is triggered for a string (eg. hdsgfjhsdhbj) which yields no results

    toolbar.search_textbox.send_keys(query)

    toolbar.search_button.click()
    print(SearchSidebar.no_results)
    assert SearchSidebar.no_results

    sleep(1)

    # THEN: show search sidebar with the message "Sorry, no results found for ‘hdsgfjhsdhbj’"
    # AND: user stays in the same page and location as before executing the search
