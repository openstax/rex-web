import random

from pages.accounts import Signup
from pages.content import Content
from tests import markers
from utils.utility import Highlight


@markers.test_case("C593151")
@markers.desktop_only
@markers.parametrize("book_slug,page_slug", [("microbiology", "4-introduction")])
def test_no_results_message_in_MH_dropdown_filter(selenium, base_url, book_slug, page_slug):
    """No results message when selecting None in either or both chapter & color filters or removing filter tags."""

    # GIVEN: Login book page
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()

    while book.notification_present:
        book.notification.got_it()
    book.navbar.click_login()
    name, email = Signup(selenium).register()

    book.wait_for_page_to_load()
    while book.notification_present:
        book.notification.got_it()
    book.content.show_solutions()

    # AND: Highlight 1 paragraph
    paragraphs = random.sample(book.content.paragraphs, 1)
    book.content.highlight(target=paragraphs[0], offset=Highlight.ENTIRE)

    my_highlights = book.toolbar.my_highlights()

    # WHEN: Select None in Chapter filter
    filterbar = my_highlights.filterbar
    filterbar.toggle_chapter_dropdown_menu()
    filterbar.chapter_filters.select_none()
    filterbar.toggle_chapter_dropdown_menu()

    # THEN: No results message is displayed
    assert (
        my_highlights.highlights.no_results_message
        == "No results.Try selecting different chapter or color filters to see different results."
    ), "message not displayed or incorrect message when None is selected in chapter filter"

    # WHEN: Select None in Color filter
    selenium.refresh()
    my_highlights = book.toolbar.my_highlights()
    filterbar.toggle_color_dropdown_menu()
    filterbar.color_filters.select_none()
    filterbar.toggle_color_dropdown_menu()

    # THEN: No results message is displayed
    assert (
        my_highlights.highlights.no_results_message
        == "No results.Try selecting different chapter or color filters to see different results."
    ), "message not displayed or incorrect message when None is selected in Color filter"

    # WHEN: Select None in both filters
    selenium.refresh()
    my_highlights = book.toolbar.my_highlights()

    filterbar.toggle_chapter_dropdown_menu()
    filterbar.chapter_filters.select_none()
    filterbar.toggle_chapter_dropdown_menu()

    filterbar.toggle_color_dropdown_menu()
    filterbar.color_filters.select_none()
    filterbar.toggle_color_dropdown_menu()

    # THEN: No results message is displayed
    assert (
        my_highlights.highlights.no_results_message
        == "No results.Try selecting different chapter or color filters to see different results."
    ), "message not displayed or incorrect message when None is selected in both filters"


@markers.test_case("C593153")
@markers.desktop_only
@markers.parametrize("book_slug,page_slug", [("microbiology", "4-introduction")])
def test_no_results_message_in_MH_filter_tags(selenium, base_url, book_slug, page_slug):
    """No results message when selecting None in either or both chapter & color filters or removing filter tags."""

    # GIVEN: Login book page
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()

    while book.notification_present:
        book.notification.got_it()
    book.navbar.click_login()
    name, email = Signup(selenium).register()

    book.wait_for_page_to_load()
    while book.notification_present:
        book.notification.got_it()
    book.content.show_solutions()

    # AND: Highlight 1 paragraph
    paragraphs = random.sample(book.content.paragraphs, 1)
    book.content.highlight(target=paragraphs[0], offset=Highlight.ENTIRE)

    my_highlights = book.toolbar.my_highlights()
    filterbar = my_highlights.filterbar

    # WHEN: Remove the chapter tag
    x = filterbar.active_filter_tags
    x[2].remove_tag()

    # THEN: No results message is displayed
    assert (
        my_highlights.highlights.no_results_message
        == "No results.Try selecting different chapter or color filters to see different results."
    ), "message not displayed or incorrect message when chapter tag is removed"

    # WHEN: Remove the color tag
    selenium.refresh()
    my_highlights = book.toolbar.my_highlights()
    x = filterbar.active_filter_tags
    x[3].remove_tag()

    # THEN: No results message is displayed
    assert (
        my_highlights.highlights.no_results_message
        == "No results.Try selecting different chapter or color filters to see different results."
    ), "message not displayed or incorrect message when color tag is removed"

    # WHEN: Remove both tags
    selenium.refresh()
    my_highlights = book.toolbar.my_highlights()

    x = filterbar.active_filter_tags
    x[2].remove_tag()
    x[3].remove_tag()

    # THEN: No results message is displayed
    assert (
        my_highlights.highlights.no_results_message
        == "No results.Try selecting different chapter or color filters to see different results."
    ), "message not displayed or incorrect message when both tags are removed"
