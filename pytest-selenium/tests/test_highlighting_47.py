import random
from time import sleep
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys

from pages.accounts import Signup
from pages.content import Content
from tests import markers
from utils.utility import Highlight, Color


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
    Highlight.force_highlight(
        book=book,
        by=random.choice,
        group=book.content.paragraphs,
        offset=Highlight.ENTIRE,
        color=Color.YELLOW
    )

    my_highlights = book.toolbar.my_highlights()

    # WHEN: Select None in Chapter filter
    filterbar = my_highlights.filter_bar
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
    filterbar = my_highlights.filter_bar
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
    filterbar = my_highlights.filter_bar

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
    Highlight.force_highlight(
        book=book,
        by=random.choice,
        group=book.content.paragraphs,
        offset=Highlight.ENTIRE,
        color=Color.YELLOW
    )

    my_highlights = book.toolbar.my_highlights()
    filterbar = my_highlights.filter_bar

    # WHEN: Remove the chapter tag
    x = filterbar.active_filter_tags
    x[0].remove_tag()

    # THEN: No results message is displayed
    assert (
        my_highlights.highlights.no_results_message
        == "No results.Try selecting different chapter or color filters to see different results."
    ), "message not displayed or incorrect message when chapter tag is removed"

    # WHEN: Remove the color tag
    selenium.refresh()
    my_highlights = book.toolbar.my_highlights()
    filterbar = my_highlights.filter_bar
    x = filterbar.active_filter_tags
    x[1].remove_tag()

    # THEN: No results message is displayed
    assert (
        my_highlights.highlights.no_results_message
        == "No results.Try selecting different chapter or color filters to see different results."
    ), "message not displayed or incorrect message when color tag is removed"

    # WHEN: Remove both tags
    selenium.refresh()
    my_highlights = book.toolbar.my_highlights()
    filterbar = my_highlights.filter_bar

    x = filterbar.active_filter_tags
    x[0].remove_tag()
    x[1].remove_tag()

    # THEN: No results message is displayed
    assert (
        my_highlights.highlights.no_results_message
        == "No results.Try selecting different chapter or color filters to see different results."
    ), "message not displayed or incorrect message when both tags are removed"


@markers.test_case("C594028")
@markers.smoke_test
@markers.desktop_only
@markers.parametrize("book_slug,page_slug", [("microbiology", "1-introduction")])
def test_filter_state_preserved_throughout_session(selenium, base_url, book_slug, page_slug):
    """Filter state preserved throughout the session irrespective of chapter/section navigation."""

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
        Highlight.force_highlight(
            book=book,
            by=random.choice,
            group=book.content.paragraphs,
            offset=Highlight.ENTIRE,
            color=Highlight.random_color()
        )

        content_highlight_ids = content_highlight_ids + list(
            set(book.content.highlight_ids) - set(content_highlight_ids)
        )

        my_highlights = book.toolbar.my_highlights()
        mh_highlight_ids = mh_highlight_ids + list(
            set(my_highlights.highlights.mh_highlight_ids) - set(mh_highlight_ids)
        )

    # THEN: MH page displays all the content highlights
    assert mh_highlight_ids == content_highlight_ids

    # WHEN: Change the MH chapter filters to remove 2 chapters
    my_highlights = book.toolbar.my_highlights()
    filterbar = my_highlights.filter_bar

    # Use chapter dropdown to remove one chapter
    filterbar.toggle_chapter_dropdown_menu()
    filterbar.chapter_filters.chapters[2].click()
    filterbar.toggle_chapter_dropdown_menu()

    # Use filter tag to remove one chapter
    x = filterbar.active_filter_tags
    x[1].remove_tag()

    my_highlights = book.toolbar.my_highlights()
    mh_filtered_list = my_highlights.highlights.mh_highlight_ids
    my_highlights.close()

    # AND: Open MH page from a chapter page that has highlights but removed via MH filter
    if book.is_mobile:
        toolbar.click_toc_toggle_button()
    toc.expand_chapter(2)
    toc.sections[14].click()
    my_highlights = book.toolbar.my_highlights()
    mh_list_from_chapter_with_highlights = my_highlights.highlights.mh_highlight_ids

    # THEN: Filter changes made earlier are retained
    assert set(mh_list_from_chapter_with_highlights) == set(mh_filtered_list)

    my_highlights.close()

    # WHEN: Open MH page from a chapter that does not have highlights
    if book.is_mobile:
        toolbar.click_toc_toggle_button()
    toc.expand_chapter(-3)
    toc.sections[-40].click()

    my_highlights = book.toolbar.my_highlights()
    mh_list_from_chapter_without_highlights = my_highlights.highlights.mh_highlight_ids

    # THEN: Filter changes made earlier are retained
    assert set(mh_list_from_chapter_without_highlights) == set(mh_filtered_list)

    # WHEN: Re-add one of the removed chapter
    filterbar = my_highlights.filter_bar
    filterbar.toggle_chapter_dropdown_menu()
    filterbar.chapter_filters.chapters[2].click()
    filterbar.toggle_chapter_dropdown_menu()

    mh_updated_filtered_list = my_highlights.highlights.mh_highlight_ids
    my_highlights.close()

    # AND: Navigate to another chapter
    if book.is_mobile:
        toolbar.click_toc_toggle_button()
    toc.expand_chapter(0)
    toc.sections[4].click()

    # THEN: The MH list is updated with the highlight from re-added chapter
    my_highlights = book.toolbar.my_highlights()
    mh_list_after_page_navigation = my_highlights.highlights.mh_highlight_ids

    assert set(mh_list_after_page_navigation) == set(mh_updated_filtered_list)

    # WHEN: Reload the page
    book.reload()

    # THEN: MH filters resets to display highlights from all the chapters
    my_highlights = book.toolbar.my_highlights()
    mh_list_after_reload = my_highlights.highlights.mh_highlight_ids
    assert set(mh_list_after_reload) == set(content_highlight_ids)


@markers.test_case("C594029")
@markers.parametrize("book_slug,page_slug", [("microbiology", "1-introduction")])
def test_filter_state_not_preserved_for_MH_in_new_tab(selenium, base_url, book_slug, page_slug):
    """Filter state is not preserved if MH page is opened in a new tab."""

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
        Highlight.force_highlight(
            book=book,
            by=random.choice,
            group=book.content.paragraphs,
            offset=Highlight.ENTIRE,
            color=Highlight.random_color()
        )

        content_highlight_ids = content_highlight_ids + list(
            set(book.content.highlight_ids) - set(content_highlight_ids)
        )

        my_highlights = book.toolbar.my_highlights()
        mh_highlight_ids = mh_highlight_ids + list(
            set(my_highlights.highlights.mh_highlight_ids) - set(mh_highlight_ids)
        )

    # THEN: MH page displays all the content highlights
    assert mh_highlight_ids == content_highlight_ids

    # WHEN: Change the MH chapter filters to remove 2 chapters
    my_highlights = book.toolbar.my_highlights()
    filterbar = my_highlights.filter_bar

    # Use chapter dropdown to remove one chapter
    filterbar.toggle_chapter_dropdown_menu()
    filterbar.chapter_filters.chapters[2].click()
    filterbar.toggle_chapter_dropdown_menu()

    # Use filter tag to remove one chapter
    x = filterbar.active_filter_tags
    x[1].remove_tag()

    my_highlights = book.toolbar.my_highlights()
    mh_filtered_list = my_highlights.highlights.mh_highlight_ids
    my_highlights.close()

    # AND: Open MH page from a chapter that does not have highlights
    if book.is_mobile:
        toolbar.click_toc_toggle_button()
    toc.expand_chapter(-3)
    toc.sections[-40].click()

    my_highlights = book.toolbar.my_highlights()
    mh_list_from_chapter_without_highlights = my_highlights.highlights.mh_highlight_ids

    # THEN: Filter changes made earlier are retained
    assert set(mh_list_from_chapter_without_highlights) == set(mh_filtered_list)

    # WHEN: Open MH page in new tab
    book.open_new_tab()
    book.switch_to_window(1)
    page_slug = "2-4-staining-microscopic-specimens"
    book1 = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    my_highlights_1 = book1.toolbar.my_highlights()

    # THEN: MH page in the new tab displays highlights from all the chapters
    mh_list_in_new_tab = my_highlights_1.highlights.mh_highlight_ids
    assert set(mh_list_in_new_tab) == set(content_highlight_ids)


@markers.test_case("C593145")
@markers.desktop_only
@markers.parametrize("book_slug,page_slug", [("microbiology", "6-introduction")])
def test_chapter_filter_collapses_on_clicking_color_filter(
    selenium, base_url, book_slug, page_slug
):
    """Clicking on a filter dropdown will close the other filter dropdown if open."""
    sections = [("4.2", "Proteobacteria"), ("", "Introduction")]

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

    my_highlights = book.toolbar.my_highlights()
    mh_highlight_ids = my_highlights.highlights.mh_highlight_ids

    # AND: Highlights are present in different chapter pages
    data = [
        ("1-3-types-of-microorganisms", Color.GREEN),
        ("2-4-staining-microscopic-specimens", Color.BLUE),
        ("4-2-proteobacteria", Color.YELLOW),
        ("5-introduction", Color.PINK),
    ]

    for page, color in data:
        book = Content(selenium, base_url, book_slug=book_slug, page_slug=page).open()
        Highlight.force_highlight(
            book=book,
            by=random.choice,
            group=book.content.paragraphs,
            offset=Highlight.ENTIRE,
            color=color
        )

        my_highlights = book.toolbar.my_highlights()
        mh_highlight_ids = mh_highlight_ids + list(
            set(my_highlights.highlights.mh_highlight_ids) - set(mh_highlight_ids)
        )

    filterbar = my_highlights.filter_bar
    last_two_highlights = (mh_highlight_ids[2], mh_highlight_ids[3])

    # AND: Open chapter dropdown to remove one chapter
    filterbar.toggle_chapter_dropdown_menu()
    filterbar.chapter_filters.chapters[2].click()

    # AND: Do not close the chapter dropdown
    assert filterbar.chapter_dropdown_open

    # WHEN: Open color dropdown
    filterbar.toggle_color_dropdown_menu()

    # THEN: Color dropdown is opened
    assert filterbar.color_dropdown_open

    # AND: Chapter dropdown is closed automatically
    assert not filterbar.chapter_dropdown_open

    # WHEN: Remove one color from color dropdown
    filterbar.color_filters.colors[1].click()
    sleep(0.25)

    # THEN: The selections made in the filters are applied to the highlight list immediately
    highlight_sections = [
        (section.number, section.title) for section in my_highlights.highlights.sections
    ]
    assert set(highlight_sections) == set(sections), "mismatched section numbers and/or names"
    assert len(my_highlights.all_highlights) == 2, (
        "unexpected number of highlights found on the summary page ("
        f"found {len(my_highlights.all_highlights)}"
    )
    assert set(my_highlights.highlights.mh_highlight_ids) == set(last_two_highlights)


@markers.test_case("C593152")
@markers.desktop_only
@markers.parametrize("book_slug,page_slug", [("psychology-2e", "2-introduction")])
def test_select_chapter_with_highlights_and_select_color_not_used_in_that_chapter(
    selenium, base_url, book_slug, page_slug
):
    """Select chapter with highlights and a color that is not used in that chapter in MH page filters dropdown."""  # NOQA
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

    # AND: Highlights are present in different chapter pages
    data = [
        ("1-1-what-is-psychology", Color.GREEN),
        ("1-4-careers-in-psychology", Color.BLUE),
        ("2-introduction", Color.PINK),
    ]

    for page, color in data:
        book = Content(selenium, base_url, book_slug=book_slug, page_slug=page).open()
        Highlight.force_highlight(
            book=book,
            by=random.choice,
            group=book.content.paragraphs,
            offset=Highlight.ENTIRE,
            color=color
        )

    # WHEN: Update chapter dropdown to include only one highlighted
    #       Chapter - ch 1 remains selected
    my_highlights = book.toolbar.my_highlights()
    filterbar = my_highlights.filter_bar
    filterbar.toggle_chapter_dropdown_menu()
    filterbar.chapter_filters.chapters[2].click()

    # AND: Select color not used in that chapter and unselect the remaining
    #      colors - pink remains selected
    filterbar.toggle_color_dropdown_menu()
    filterbar.color_filters.colors[1].click()
    filterbar.color_filters.colors[2].click()
    filterbar.toggle_color_dropdown_menu()

    # THEN: No results message is displayed
    assert (
        my_highlights.highlights.no_results_message
        == "No results.Try selecting different chapter or color filters to see different results."
    ), "message not displayed or incorrect message when both tags are removed"


@markers.test_case("C593155")
@markers.parametrize("book_slug,page_slug", [("astronomy", "1-1-the-nature-of-astronomy")])
@markers.desktop_only
def test_keyboard_navigation_for_MH_dropdown_filters(selenium, base_url, book_slug, page_slug):
    """Keyboard navigation for the MH dropdown filters."""

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
    Highlight.force_highlight(
        book=book,
        by=random.choice,
        group=book.content.paragraphs,
        offset=Highlight.ENTIRE,
        color=Color.YELLOW
    )
    content_highlight_ids = list(book.content.highlight_ids)

    # AND: Open MH page
    my_highlights = book.toolbar.my_highlights()
    mh_highlight_ids = my_highlights.highlights.mh_highlight_ids
    filterbar = my_highlights.filter_bar

    # WHEN: Hit tab twice and hit the return key
    (ActionChains(selenium).send_keys(Keys.TAB * 2).send_keys(Keys.RETURN).perform())

    # THEN: Chapter dropdown is open
    assert filterbar.chapter_dropdown_open

    # WHEN: Tab to None in the chapter dropdown and hit Enter
    (ActionChains(selenium).send_keys(Keys.TAB * 2).send_keys(Keys.ENTER).perform())

    # THEN: No results message is displayed
    assert (
        my_highlights.highlights.no_results_message
        == "No results.Try selecting different chapter or color filters to see different results."
    ), "message not displayed or incorrect message when both tags are removed"

    # WHEN: Tab to All in chapter dropdown and hit Enter
    (
        ActionChains(selenium)
        .send_keys(Keys.SHIFT, Keys.TAB, Keys.SHIFT)
        .send_keys(Keys.ENTER)
        .perform()
    )

    # THEN: MH page displays the highlights made in content page
    assert mh_highlight_ids == content_highlight_ids

    # WHEN: Tab to a selected chapter and hit spacebar to remove the selection
    (ActionChains(selenium).send_keys(Keys.TAB * 2).send_keys(Keys.SPACE).perform())

    # THEN: No results message is displayed
    assert (
        my_highlights.highlights.no_results_message
        == "No results.Try selecting different chapter or color filters to see different results."
    ), "message not displayed or incorrect message when both tags are removed"

    # WHEN: Hit spacebar again to select the chapter
    (ActionChains(selenium).send_keys(Keys.SPACE).perform())

    # THEN: MH page displays the highlights made in content page
    assert mh_highlight_ids == content_highlight_ids

    # WHEN: Tab to color filter and hit Return
    (ActionChains(selenium).send_keys(Keys.TAB).send_keys(Keys.RETURN).perform())

    # THEN: Color dropdown is open
    assert filterbar.color_dropdown_open

    # AND: Chapter dropdown is closed
    assert not filterbar.chapter_dropdown_open

    # WHEN: Tab to None in color dropdown and hit Enter
    (ActionChains(selenium).send_keys(Keys.TAB * 2).send_keys(Keys.ENTER).perform())

    # THEN: No results message is displayed
    assert (
        my_highlights.highlights.no_results_message
        == "No results.Try selecting different chapter or color filters to see different results."
    ), "message not displayed or incorrect message when both tags are removed"

    # WHEN: Tab to All in Color dropdown and hit Enter
    (
        ActionChains(selenium)
        .send_keys(Keys.SHIFT, Keys.TAB, Keys.SHIFT)
        .send_keys(Keys.ENTER)
        .perform()
    )

    # THEN: MH page displays the highlights made in content page
    assert mh_highlight_ids == content_highlight_ids

    # WHEN: Tab to a selected color and hit spacebar to remove the selection
    (ActionChains(selenium).send_keys(Keys.TAB * 2).send_keys(Keys.SPACE).perform())

    # THEN: No results message is displayed
    assert (
        my_highlights.highlights.no_results_message
        == "No results.Try selecting different chapter or color filters to see different results."
    ), "message not displayed or incorrect message when both tags are removed"

    # WHEN: Hit spacebar again to select the color
    (ActionChains(selenium).send_keys(Keys.SPACE).perform())
    sleep(0.25)

    # THEN: MH page displays the highlights made in content page
    assert mh_highlight_ids == content_highlight_ids

    # WHEN: Hit Tab
    (ActionChains(selenium).send_keys(Keys.TAB).perform())

    # THEN: Print icon is focussed
    assert selenium.switch_to.active_element == filterbar.print

    # AND: Color dropdown is closed
    assert not filterbar.color_dropdown_open


@markers.test_case("C593156")
@markers.parametrize("book_slug,page_slug", [("astronomy", "1-1-the-nature-of-astronomy")])
@markers.desktop_only
def test_keyboard_navigation_for_MH_filter_tags(selenium, base_url, book_slug, page_slug):
    """Keyboard navigation for the MH filter tags."""

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
    Highlight.force_highlight(
        book=book,
        by=random.choice,
        group=book.content.paragraphs,
        offset=Highlight.ENTIRE,
        color=Color.YELLOW
    )

    # AND: Open MH page
    my_highlights = book.toolbar.my_highlights()
    filterbar = my_highlights.filter_bar

    # WHEN: Hit tab to focus the first filter tag and hit the return key - remove chapter tag
    (ActionChains(selenium).send_keys(Keys.TAB * 5).send_keys(Keys.RETURN).perform())

    # THEN: No results message is displayed
    assert (
        my_highlights.highlights.no_results_message
        == "No results.Try selecting different chapter or color filters to see different results."
    ), "message not displayed or incorrect message when both tags are removed"

    # WHEN: Hit Tab
    (ActionChains(selenium).send_keys(Keys.TAB).perform())

    # THEN: The 'x' button of color filter tag is focussed
    assert selenium.switch_to.active_element == filterbar.active_filter_tags[0].remove_tag_icon


@markers.test_case("C592628")
@markers.parametrize("book_slug,page_slug", [("astronomy", "1-1-the-nature-of-astronomy")])
def test_MH_empty_state_logged_in_user(selenium, base_url, book_slug, page_slug):
    """Logged in user empty state for MH page."""

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

    # WHEN: Open MH page
    my_highlights = book.toolbar.my_highlights()
    filterbar = my_highlights.filter_bar

    # THEN: MH page Empty state message for logged in user is displayed
    assert (
        my_highlights.highlights.logged_in_user_empty_state_message
        == "You have no highlights in this book"
    ), "message not displayed or incorrect message"

    # AND: Empty state nudge is displayed in desktop
    if book.is_desktop:
        assert (
            my_highlights.highlights.logged_in_user_empty_state_nudge
            == "Make a highlight and add a noteThen use this page to create your own study guide"
        ), "nudge not displayed or incorrect message"

    # AND: No empty state nudge is displayed in mobile
    else:
        assert my_highlights.highlights.logged_in_user_empty_state_nudge == ""

    # AND: All chapter dropdown options are disabled
    filterbar.toggle_chapter_dropdown_menu()
    for chapter in filterbar.chapter_filters.chapters:
        assert not chapter.has_highlights, (
            f"Highlights present in chapter {chapter.number}," f"{chapter.title}"
        )

    # AND: All color dropdown options are disabled
    filterbar.toggle_color_dropdown_menu()
    for color in filterbar.color_filters.colors:
        assert not color.is_checked, f"Highlights present for the color {color.color},"

    # AND: Print button is displayed
    assert filterbar.print.is_displayed


@markers.test_case("C592644")
@markers.parametrize("book_slug,page_slug", [("astronomy", "1-1-the-nature-of-astronomy")])
@markers.desktop_only
def test_keyboard_navigation_MH_empty_state_logged_in_user(
    selenium, base_url, book_slug, page_slug
):
    """Keyboard navigation for logged in user empty state MH page."""

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

    # WHEN: Open MH page
    my_highlights = book.toolbar.my_highlights()
    filterbar = my_highlights.filter_bar

    # AND: Hit Tab
    (ActionChains(selenium).send_keys(Keys.TAB).perform())

    # THEN: Close icon is focussed
    assert selenium.switch_to.active_element == my_highlights.close_icon

    # WHEN: Hit Tab
    (ActionChains(selenium).send_keys(Keys.TAB).perform())

    # THEN: Chapter dropdown is focussed
    assert selenium.switch_to.active_element == filterbar.chapter_dropdown
    assert filterbar.chapter_dropdown.get_attribute("aria-label") == "Filter highlights by Chapter"

    # WHEN: Hit Tab
    (ActionChains(selenium).send_keys(Keys.TAB).perform())

    # THEN: Color dropdown is focussed
    assert selenium.switch_to.active_element == filterbar.color_dropdown
    assert filterbar.color_dropdown.get_attribute("aria-label") == "Filter highlights by Color"

    # WHEN: Hit Tab
    (ActionChains(selenium).send_keys(Keys.TAB).perform())

    # THEN: Print icon is focussed
    assert selenium.switch_to.active_element == filterbar.print


@markers.test_case("C592645")
@markers.parametrize("book_slug,page_slug", [("astronomy", "1-1-the-nature-of-astronomy")])
@markers.desktop_only
def test_keyboard_navigation_MH_empty_state_non_logged_in_user(
    selenium, base_url, book_slug, page_slug
):
    """Keyboard navigation for non-logged in user empty state MH page."""

    # GIVEN: Open book page
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()

    while book.notification_present:
        book.notification.got_it()
    book.content.show_solutions()

    # WHEN: Open MH page
    my_highlights = book.toolbar.my_highlights()

    # AND: Hit Tab
    (ActionChains(selenium).send_keys(Keys.TAB).perform())

    # THEN: Close icon is focussed
    assert selenium.switch_to.active_element == my_highlights.close_icon

    # WHEN: Hit Tab
    (ActionChains(selenium).send_keys(Keys.TAB).perform())

    # THEN: Log in link is focussed
    assert selenium.switch_to.active_element == my_highlights.log_in_link
