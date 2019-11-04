from random import choice
from string import digits, ascii_letters

from pages.content import Content
from tests import markers


@markers.test_case("C543235")
@markers.parametrize("page_slug", ["preface"])
@markers.nondestructive
def test_message_when_search_yields_no_results(selenium, base_url, book_slug, page_slug):
    # GIVEN: Book page is loaded
    content = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    toolbar = content.toolbar
    mobile = content.mobile_search_toolbar
    search_sidebar = content.search_sidebar
    page_url_before_search = content.current_url

    # Using regex to create a random search term
    search_term = "".join(choice(digits + ascii_letters) for i in range(25))

    # WHEN: Search is triggered for a term which yields no results
    if content.is_desktop:
        toolbar.search_for(search_term)

    if content.is_mobile:
        mobile.search_for(search_term)

    # THEN: Search sidebar displays no results message
    assert (
        search_sidebar.no_results_message == "Sorry, no results found for   ‘"
        "{}"
        "’".format(search_term)
    )

    # AND: User stays in the same page as before executing the search
    assert content.current_url == page_url_before_search

    # AND: Scroll position of the content is not changed during the search

    # For mobile resolution, click on the search icon to close the search sidebar/navigate back to content page
    if content.is_mobile:
        toolbar.click_search_icon()

    # For desktop, close search sidebar
    if content.is_desktop:
        search_sidebar.close_search_sidebar()

    assert content.page_not_scrolled


@markers.test_case("C568506")
@markers.parametrize("page_slug", ["preface"])
@markers.nondestructive
def test_scroll_position_when_search_yields_no_results(selenium, base_url, book_slug, page_slug):
    # GIVEN: Book page is loaded
    content = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    toolbar = content.toolbar
    mobile = content.mobile_search_toolbar
    search_sidebar = content.search_sidebar

    # WHEN: Scroll the page down
    content.scroll_through_page()

    scroll_position_before_search = content.scroll_position

    # AND: Search is triggered for a term which yields no results

    # Using regex to create a random search term
    search_term = "".join(choice(digits + ascii_letters) for i in range(25))

    if content.is_desktop:
        toolbar.search_for(search_term)

    if content.is_mobile:
        mobile.search_for(search_term)
        # For mobile resolution, click on the search icon to close the search sidebar/navigate back to content page
        toolbar.click_search_icon()

    scroll_position_after_search = content.scroll_position

    # THEN: Scroll position of content is not changed after search
    assert scroll_position_before_search == scroll_position_after_search

    # WHEN: Close search sidebar for desktop
    if content.is_desktop:
        search_sidebar.close_search_sidebar()

        scroll_position_after_closing_search = content.scroll_position

        # THEN: Scroll position of content is not changed after closing search sidebar
        assert scroll_position_before_search == scroll_position_after_closing_search
