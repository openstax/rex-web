import random

from pages.accounts import Signup
from pages.content import Content
from tests import markers
from utils.utility import Highlight


@markers.test_case("C593151")
@markers.parametrize("book_slug,page_slug", [("microbiology", "4-introduction")])
def test_no_results_message_in_MH_dropdown_filter(selenium, base_url, book_slug, page_slug):
    """No results message when selecting None in either or both chapter & color filters."""

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
@markers.parametrize("book_slug,page_slug", [("microbiology", "4-introduction")])
def test_no_results_message_in_MH_filter_tags(selenium, base_url, book_slug, page_slug):
    """No results message when removing filter tags."""

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


@markers.test_case("C594028")
@markers.parametrize("book_slug,page_slug", [("microbiology", "1-introduction")])
def test_filter_state_preserved_throughout_session(selenium, base_url, book_slug, page_slug):
    """Filter state is preserved throughout the session irrespective of chapter/section navigation."""

    # GIVEN: Login book page
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    toolbar = book.toolbar
    toc = book.sidebar.toc

    while book.notification_present:
        book.notification.got_it()
    book.navbar.click_login()
    name, email = Signup(selenium).register()

    book.wait_for_page_to_load()
    while book.notification_present:
        book.notification.got_it()
    book.content.show_solutions()

    content_highlight_ids = book.content.highlight_ids
    my_highlights = book.toolbar.my_highlights()
    mh_highlight_ids = my_highlights.highlights.mh_highlight_ids

    # AND: Highlights are present in different chapter pages
    page_slug = [
        "1-3-types-of-microorganisms",
        "2-4-staining-microscopic-specimens",
        "4-2-proteobacteria",
        "5-introduction",
    ]

    for page in page_slug:
        book = Content(selenium, base_url, book_slug=book_slug, page_slug=page).open()
        paragraphs = random.sample(book.content.paragraphs, 1)
        book.content.highlight(
            target=paragraphs[0], offset=Highlight.ENTIRE, color=Highlight.random_color()
        )

        content_highlight_ids = content_highlight_ids + list(
            set(book.content.highlight_ids) - set(content_highlight_ids)
        )

        my_highlights = book.toolbar.my_highlights()
        mh_highlight_ids = mh_highlight_ids + list(
            set(my_highlights.highlights.mh_highlight_ids) - set(mh_highlight_ids)
        )

    print("content", content_highlight_ids)
    print("MH", mh_highlight_ids)

    # THEN: MH page displays all the content highlights
    assert content_highlight_ids == mh_highlight_ids

    # WHEN: Change the MH chapter filters to remove 2 chapters
    my_highlights = book.toolbar.my_highlights()
    filterbar = my_highlights.filterbar

    # Use chapter dropdown to remove one chapter
    filterbar.toggle_chapter_dropdown_menu()
    filterbar.chapter_filters.chapters[2].click()
    filterbar.toggle_chapter_dropdown_menu()

    # Use filter tag to remove one chapter
    x = filterbar.active_filter_tags
    x[4].remove_tag()

    my_highlights = book.toolbar.my_highlights()
    mh_filtered_list = my_highlights.highlights.mh_highlight_ids

    print("mh_l2", mh_filtered_list)

    my_highlights.close()

    # AND: Open MH page from a chapter page that has highlights
    if book.is_mobile:
        toolbar.click_toc_toggle_button()

    toc.expand_chapter(2)
    toc.sections[14].click()
    my_highlights = book.toolbar.my_highlights()
    mh_list_from_chapter_with_highlights = my_highlights.highlights.mh_highlight_ids

    # THEN: Filter changes made earlier are retained
    assert mh_list_from_chapter_with_highlights == mh_filtered_list

    # WHEN: Open MH page from a chapter that does not have highlights
    if book.is_mobile:
        toolbar.click_toc_toggle_button()

    toc.expand_chapter(-3)
    toc.sections[-40].click()

    my_highlights = book.toolbar.my_highlights()
    mh_list_from_chapter_without_highlights = my_highlights.highlights.mh_highlight_ids

    # THEN: Filter changes made earlier are retained
    assert mh_list_from_chapter_without_highlights == mh_filtered_list

    print("mh_l3", mh_list_from_chapter_without_highlights)

    # WHEN: Reload the page
    book.reload()

    # THEN: MH filter resets to display highlights from all the chapters
    assert mh_highlight_ids == content_highlight_ids
