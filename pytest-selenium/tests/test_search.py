"""Test REx search."""

from math import isclose
from random import choice
from string import digits, ascii_letters

from pages.content import Content
from tests import markers


@markers.test_case("C543235")
@markers.parametrize("page_slug", ["preface"])
@markers.nondestructive
def test_message_when_search_yields_no_results(
        selenium, base_url, book_slug, page_slug):
    """Verify default message is displayed when no search results are found."""
    # GIVEN: a book page is loaded
    content = Content(selenium, base_url,
                      book_slug=book_slug, page_slug=page_slug).open()
    page_url_before_search = content.current_url
    # Using a random search term not found in the content
    search_term = "".join(choice(digits + ascii_letters) for i in range(25))

    # WHEN: they search for a term that yields no results
    if content.is_desktop:
        content.toolbar.search_for(search_term)
    else:
        content.mobile_search_toolbar.search_for(search_term)

    # THEN: the search sidebar displays the no results message
    # AND:  they remain on the same page as before they executed the search
    assert(content.search_sidebar.no_results_message ==
           f"Sorry, no results found for   ‘{search_term}’"), \
        "search sidebar no results message not found or incorrect"

    assert(content.current_url == page_url_before_search), \
        "page URL different after search"

    # WHEN: they close the search results
    # For mobile resolution, click on the search icon to close the search
    # sidebar/navigate back to content page
    if content.is_mobile:
        content.toolbar.click_search_icon()
    # For desktop, close search sidebar
    else:
        content.search_sidebar.close_search_sidebar()

    # THEN: the scroll position of the content is not changed during the search
    assert(content.page_not_scrolled), "page scroll position is different"


@markers.test_case("C568506")
@markers.parametrize("page_slug", ["preface"])
@markers.nondestructive
def test_scroll_position_when_search_yields_no_results(
        selenium, base_url, book_slug, page_slug):
    # GIVEN: Book page is loaded
    content = Content(selenium, base_url,
                      book_slug=book_slug, page_slug=page_slug).open()

    # WHEN: they scroll the page down
    # AND:  trigger a search for a term that yields no results
    content.scroll_through_page()
    scroll_position_before_search = content.scroll_position
    # use a random search term not found in the content
    search_term = "".join(choice(digits + ascii_letters) for i in range(25))

    if content.is_desktop:
        content.toolbar.search_for(search_term)
    else:
        content.mobile_search_toolbar.search_for(search_term)
        # For mobile resolution, click on the search icon to close the search
        # sidebar/navigate back to content page
        content.toolbar.click_search_icon()

    # THEN: Scroll position of content is not changed after search
    scroll_position_after_search = content.scroll_position
    within = scroll_position_before_search * 0.01
    assert(isclose(scroll_position_before_search,
                   scroll_position_after_search,
                   rel_tol=within)), (
        r"vertical position after search not within 1% of position "
        "before search ({low} <= {target} <= {high})".format(
            low=scroll_position_before_search - within,
            high=scroll_position_before_search + within,
            target=scroll_position_after_search))

    if content.is_desktop:
        # WHEN: they close the search sidebar
        content.search_sidebar.close_search_sidebar()

        # THEN: the content scroll position is unchanged
        scroll_position_after_closing_search = content.scroll_position
        assert(isclose(scroll_position_before_search,
                       scroll_position_after_closing_search,
                       rel_tol=within)), (
            r"vertical position after search not within 1% of position "
            "before search ({low} <= {target} <= {high})".format(
                low=scroll_position_before_search - within,
                high=scroll_position_before_search + within,
                target=scroll_position_after_closing_search))
