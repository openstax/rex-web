import random

from pages.accounts import Signup
from pages.content import Content
from tests import markers
from utils.utility import Highlight


@markers.test_case("C593151")
@markers.desktop_only
@markers.parametrize("book_slug,page_slug", [("microbiology", "4-introduction")])
def test_no_results_message_in_MH(selenium, base_url, book_slug, page_slug):
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
    # id_1 = list(set(book.content.highlight_ids))[0]

    my_highlights = book.toolbar.my_highlights()

    # WHEN: Select None in Chapter filter
    filterbar = my_highlights.filterbar
    filterbar.toggle_chapter_dropdown_menu()

    filterbar.chapter_filters.select_none()
    filterbar.toggle_chapter_dropdown_menu()

    assert (
        my_highlights.highlights.no_results_message
        == "No results.Try selecting different chapter or color filters to see different results."
    ), "message not displayed or incorrect message"

    # THEN: No results messsage is displayed

    # WHEN: Select None in Color filter

    selenium.refresh()
    my_highlights = book.toolbar.my_highlights()
    filterbar.toggle_color_dropdown_menu()

    filterbar.color_filters.select_none()
    filterbar.toggle_color_dropdown_menu()

    assert (
        my_highlights.highlights.no_results_message
        == "No results.Try selecting different chapter or color filters to see different results."
    ), "message not displayed or incorrect message"

    # WHEN: Select None in both filters
    selenium.refresh()
    my_highlights = book.toolbar.my_highlights()

    filterbar.toggle_chapter_dropdown_menu()

    filterbar.chapter_filters.select_none()
    filterbar.toggle_chapter_dropdown_menu()

    filterbar.toggle_color_dropdown_menu()

    filterbar.color_filters.select_none()
    filterbar.toggle_color_dropdown_menu()

    assert (
        my_highlights.highlights.no_results_message
        == "No results.Try selecting different chapter or color filters to see different results."
    ), "message not displayed or incorrect message"

    # WHEN: Remove the chapter tag
    selenium.refresh()
    my_highlights = book.toolbar.my_highlights()

    x = filterbar.active_filter_tags
    print(x)
    print(x[0])
    # print(x[0].get_attribute("aria-label"))
    x[0].remove_tag()

    from time import sleep

    sleep(2)

    # WHEN: Remove the color tag

    # WHEN: Remove both tags
