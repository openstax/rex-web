import random
from time import sleep

import pytest
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.common.action_chains import ActionChains

from pages.accounts import Signup
from pages.content import Content
from tests import markers
from utils.utility import Highlight, Color, Utilities


@markers.test_case("C597678")
@markers.desktop_only
@markers.highlighting
@markers.parametrize(
    "book_slug, page_slug", [("organizational-behavior", "1-1-the-nature-of-work")]
)
def change_color_from_MH_page(selenium, base_url, book_slug, page_slug):
    """Changing highlight color from MH page, updates the highlight in content page."""

    # GIVEN: Login book page
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()

    while book.notification_present:
        book.notification.got_it()
    book.navbar.click_login()
    name, email = Signup(selenium).register()

    book.wait_for_page_to_load()
    while book.notification_present:
        book.notification.got_it()

    # AND: Highlight 2 set of texts in the page
    paragraph = random.sample(book.content.paragraphs, 2)
    note = Utilities.random_string()
    content_highlight_ids = book.content.highlight_ids

    data = [(paragraph[0], Color.GREEN, note), (paragraph[1], Color.YELLOW, note == "")]

    for paragraphs, colors, note in data:
        book.content.highlight(target=paragraphs, offset=Highlight.RANDOM, color=colors, note=note)
        content_highlight_ids = content_highlight_ids + list(
            set(book.content.highlight_ids) - set(content_highlight_ids)
        )

    # WHEN: Change highlight color of the 2nd highlight from MH page
    my_highlights = book.toolbar.my_highlights()

    highlight = my_highlights.highlights.edit_highlight
    highlight_id_0 = highlight[0].mh_highlight_id
    highlight_id_1 = highlight[1].mh_highlight_id
    new_highlight_color = Color.PINK

    highlight[1].toggle_menu()
    highlight[1].toggle_color(new_highlight_color)
    highlight[1].toggle_menu()

    my_highlights.close()

    # Determine the current color of the highlights in the content page
    highlight_classes_0 = book.content.get_highlight(by_id=highlight_id_0)[0].get_attribute("class")
    highlight_0_color_after_MH_color_change = Color.from_html_class(highlight_classes_0)

    highlight_classes_1 = book.content.get_highlight(by_id=highlight_id_1)[0].get_attribute("class")
    highlight_1_color_after_MH_color_change = Color.from_html_class(highlight_classes_1)

    # THEN: The highlight color in the content page is changed correctly
    assert (
        highlight_1_color_after_MH_color_change == new_highlight_color
    ), "the current highlight color does not match the new color"

    assert (
        highlight_0_color_after_MH_color_change == data[0][1]
        if content_highlight_ids[0] == highlight_id_0
        else data[1][1]
    ), "highlight color changed for different highlight"


@markers.test_case("C598222")
@markers.desktop_only
@markers.highlighting
@markers.parametrize(
    "book_slug, page_slug", [("organizational-behavior", "1-1-the-nature-of-work")]
)
def add_note_from_MH_page(selenium, base_url, book_slug, page_slug):
    """Adding note from MH page, updates the highlight in content page."""

    # GIVEN: Login book page
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()

    while book.notification_present:
        book.notification.got_it()
    book.navbar.click_login()
    name, email = Signup(selenium).register()

    book.wait_for_page_to_load()
    while book.notification_present:
        book.notification.got_it()

    # AND: Highlight 2 set of texts in the page
    paragraph = random.sample(book.content.paragraphs, 2)
    note = Utilities.random_string()
    content_highlight_ids = book.content.highlight_ids

    data = [(paragraph[0], Color.GREEN, note), (paragraph[1], Color.YELLOW, note == "")]

    for paragraphs, colors, note in data:
        book.content.highlight(target=paragraphs, offset=Highlight.RANDOM, color=colors, note=note)
        content_highlight_ids = content_highlight_ids + list(
            set(book.content.highlight_ids) - set(content_highlight_ids)
        )

    my_highlights = book.toolbar.my_highlights()
    highlights = my_highlights.highlights.edit_highlight
    note_added = Utilities.random_string()

    for highlight in highlights:
        # WHEN: From MH page, add a note for the highlight that does not have a note
        if not highlight.note_present:
            highlight_id = highlight.mh_highlight_id

            highlight.add_note()
            (ActionChains(selenium).send_keys(note_added).perform())
            highlight.save()

            my_highlights.close()

            # THEN: The corresponding highlight in the content page is updated with the note added in MH page
            Utilities.click_option(
                driver=selenium,
                element=book.content.get_highlight(by_id=highlight_id)[0],
                scroll_to=-130,
            )

            assert (
                book.content.highlight_box.note == note_added
            ), "the note text does not match the note added or note added to incorrect highlight"

            highlight_id_1 = (
                content_highlight_ids[0]
                if content_highlight_ids[0] != highlight_id
                else content_highlight_ids[1]
            )
            Utilities.click_option(
                driver=selenium,
                element=book.content.get_highlight(by_id=highlight_id_1)[0],
                scroll_to=-130,
            )

            # AND: The highlight with note that was not updated in MH page is not affected
            assert (
                book.content.highlight_box.note == data[0][2]
            ), "the note is added to incorrect highlight"
            break
        else:
            continue


@markers.test_case("C598223")
@markers.desktop_only
@markers.highlighting
@markers.parametrize(
    "book_slug, page_slug", [("organizational-behavior", "1-1-the-nature-of-work")]
)
def edit_note_from_MH_page(selenium, base_url, book_slug, page_slug):
    """Editing note from MH page, updates the highlight in content page."""

    # GIVEN: Login book page
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()

    while book.notification_present:
        book.notification.got_it()
    book.navbar.click_login()
    name, email = Signup(selenium).register()

    book.wait_for_page_to_load()
    while book.notification_present:
        book.notification.got_it()

    # AND: Highlight 2 set of texts in the page
    paragraph = random.sample(book.content.paragraphs, 2)
    note = Utilities.random_string(length=50)
    content_highlight_ids = book.content.highlight_ids
    data = [(paragraph[0], Color.GREEN, note), (paragraph[1], Color.YELLOW, note == "")]

    for paragraphs, colors, note in data:
        book.content.highlight(target=paragraphs, offset=Highlight.RANDOM, color=colors, note=note)
        content_highlight_ids = content_highlight_ids + list(
            set(book.content.highlight_ids) - set(content_highlight_ids)
        )

    my_highlights = book.toolbar.my_highlights()
    highlights = my_highlights.highlights.edit_highlight
    note_append = Utilities.random_string(20)

    for highlight in highlights:
        # WHEN: From MH page, update the highlight note
        if highlight.note_present:
            highlight_id = highlight.mh_highlight_id

            highlight.edit_note()
            (ActionChains(selenium).send_keys(note_append).perform())

            # AND: Hit Cancel in the note edit textbox
            highlight.cancel()

            my_highlights.close()

            # THEN: The corresponding highlight in the content page is not updated with the note edited in MH page
            Utilities.click_option(
                driver=selenium,
                element=book.content.get_highlight(by_id=highlight_id)[0],
                scroll_to=-130,
            )

            assert (
                book.content.highlight_box.note == data[0][2]
            ), "the note text is modified even on clicking Cancel"

            highlight_id_1 = (
                content_highlight_ids[0]
                if content_highlight_ids[0] != highlight_id
                else content_highlight_ids[1]
            )

            Utilities.scroll_top(selenium)
            Utilities.click_option(
                driver=selenium,
                element=book.content.get_highlight(by_id=highlight_id_1)[0],
                scroll_to=-130,
            )

            # AND: The highlight that was not updated in MH page is also not affected
            assert book.content.highlight_box.note == "", "the unaltered note text is modified"
            break
        else:
            continue

    my_highlights = book.toolbar.my_highlights()
    highlights = my_highlights.highlights.edit_highlight

    for highlight in highlights:
        # WHEN: From MH page, update the highlight note
        if highlight.note_present:
            highlight_id = highlight.mh_highlight_id

            highlight.edit_note()
            (ActionChains(selenium).send_keys(note_append).perform())

            # AND: Hit Save in the note edit textbox
            highlight.save()

            my_highlights.close()

            # THEN: The corresponding highlight in the content page is updated with the note edited in MH page
            Utilities.click_option(
                driver=selenium,
                element=book.content.get_highlight(by_id=highlight_id)[0],
                scroll_to=-130,
            )

            assert (
                book.content.highlight_box.note == note_append + data[0][2]
            ), "the note text does not match the note edited or note is edited on incorrect highlight"

            highlight_id_1 = (
                content_highlight_ids[0]
                if content_highlight_ids[0] != highlight_id
                else content_highlight_ids[1]
            )

            Utilities.scroll_top(selenium)
            Utilities.click_option(
                driver=selenium,
                element=book.content.get_highlight(by_id=highlight_id_1)[0],
                scroll_to=-130,
            )

            # AND: The highlight that was not updated in MH page is not affected
            assert book.content.highlight_box.note == "", "the unaltered note text is modified"
            break
        else:
            continue


@markers.test_case("C598225")
@markers.desktop_only
@markers.highlighting
@markers.parametrize(
    "book_slug, page_slug", [("organizational-behavior", "1-1-the-nature-of-work")]
)
def delete_highlight_from_MH_page(selenium, base_url, book_slug, page_slug):
    """Deleting highlight from MH page, removes the highlight in content page."""

    # GIVEN: Login book page
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()

    while book.notification_present:
        book.notification.got_it()
    book.navbar.click_login()
    name, email = Signup(selenium).register()

    book.wait_for_page_to_load()
    while book.notification_present:
        book.notification.got_it()

    # AND: Highlight 2 set of texts in the page
    paragraph = random.sample(book.content.paragraphs, 2)
    note = Utilities.random_string(length=50)
    data = [(paragraph[0], Color.GREEN, note), (paragraph[1], Color.YELLOW, note == "")]

    for paragraphs, colors, note in data:
        book.content.highlight(target=paragraphs, offset=Highlight.RANDOM, color=colors, note=note)

        my_highlights = book.toolbar.my_highlights()
        highlights = my_highlights.highlights.edit_highlight

        # WHEN: Click delete option from the highlight's context menu
        highlights[0].click_delete()

        # THEN: Delete confirmation message is displayed
        assert (
            highlights[0].confirm_delete_message
            == "Are you sure you want to delete this note and highlight?"
            if highlights[0].note_present
            else "Are you sure you want to delete this highlight?"
        ), (
            "delete confirmation message is incorrect"
            f"message displayed: {highlights[0].confirm_delete_message}"
        )

        # WHEN: Hit Cancel in the delete confirmation dialog
        highlights[0].cancel()

        # THEN: The highlight is not removed from MH page
        assert (
            len(my_highlights.all_highlights) == 1
        ), "Highlight is removed from MH page even on hitting Cancel in delete confirmation dialog"

        # WHEN: Click delete option from the highlight's context menu
        # AND: Hit save in the delete confirmation dialog
        highlights[0].delete()

        # THEN: The highlight is removed from the MH page
        assert (
            len(my_highlights.all_highlights) == 0
        ), "Highlight is not removed from MH page even on hitting Save in delete confirmation dialog"

        my_highlights.close()

        # AND: The highlight deleted in MH page is removed from the content page
        assert book.content.highlight_count == 0, (
            "Highlight deleted in MH page is not removed from content page: "
            f"found {book.content.highlight_count}, expected {0}"
        )

        with pytest.raises(NoSuchElementException) as ex:
            book.content.highlight_box
        assert "No open highlight boxes found" in str(ex.value)


@markers.test_case("C598226")
@markers.highlighting
@markers.mobile_only
@markers.parametrize(
    "book_slug, page_slug", [("organizational-behavior", "1-1-the-nature-of-work")]
)
def no_context_menu_in_mobile_MH_page(selenium, base_url, book_slug, page_slug):
    """Mobile MH page does not have context menu."""

    # GIVEN: Login book page
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()

    while book.notification_present:
        book.notification.got_it()
    book.navbar.click_login()
    name, email = Signup(selenium).register()

    book.wait_for_page_to_load()
    while book.notification_present:
        book.notification.got_it()

    # AND: Highlight some text in the page
    paragraph = random.sample(book.content.paragraphs, 1)
    book.content.highlight(target=paragraph[0], offset=Highlight.RANDOM)

    my_highlights = book.toolbar.my_highlights()
    highlight = my_highlights.highlights.edit_highlight

    assert not highlight[0].toggle_menu_visible()


@markers.test_case("C597679")
@markers.desktop_only
@markers.parametrize("book_slug,page_slug", [("organizational-behavior", "1-1-the-nature-of-work")])
def MH_color_filters_reflect_highlight_color_change(selenium, base_url, book_slug, page_slug):
    """Highlight color change in MH page is reflected in MH filters."""

    # GIVEN: Login book page
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()

    while book.notification_present:
        book.notification.got_it()
    book.navbar.click_login()
    name, email = Signup(selenium).register()

    book.wait_for_page_to_load()
    while book.notification_present:
        book.notification.got_it()

    # AND: Highlight 2 set of texts in the page with pink & blue
    paragraph = random.sample(book.content.paragraphs, 2)
    note = Utilities.random_string()
    data = [(paragraph[0], Color.PINK, note), (paragraph[1], Color.BLUE, note == "")]

    for paragraphs, colors, note in data:
        book.content.highlight(target=paragraphs, offset=Highlight.RANDOM, color=colors, note=note)

    # WHEN: Uncheck blue color from color filter in MH page
    my_highlights = book.toolbar.my_highlights()
    filterbar = my_highlights.filter_bar
    sleep(0.25)
    filterbar.toggle_color_dropdown_menu()
    filterbar.color_filters.colors[2].click()
    assert not filterbar.color_filters.colors[2].is_checked
    assert not filterbar.color_filters.colors[2].is_disabled
    assert not filterbar.color_filters.colors[4].is_disabled

    # AND: Change pink highlight to blue
    highlight = my_highlights.highlights.edit_highlight
    new_highlight_color = Color.BLUE
    highlight[0].toggle_menu()
    highlight[0].toggle_color(new_highlight_color)

    # THEN: The highlight is removed from the modal and no results message is displayed
    assert my_highlights.highlights.no_results_message

    # AND: Pink color is disabled in the color filter
    filterbar.toggle_color_dropdown_menu()
    assert filterbar.color_filters.colors[4].is_disabled
    assert filterbar.color_filters.colors[0].is_disabled

    # WHEN: Blue color is checked in the color filter
    filterbar.color_filters.colors[2].click()
    filterbar.toggle_color_dropdown_menu()
    sleep(0.25)

    # THEN: MH modal displays both highlights in blue
    highlight = my_highlights.highlights.edit_highlight
    assert highlight[0].highlight_color == "blue"
    assert highlight[1].highlight_color == "blue"

    # WHEN: Change the first highlight color to yellow
    new_highlight_color = Color.YELLOW
    highlight[0].toggle_menu()
    highlight[0].toggle_color(new_highlight_color)

    # THEN: Yellow color is checked and enabled in color filter dropdown
    filterbar.toggle_color_dropdown_menu()
    assert filterbar.color_filters.colors[0].is_checked
    assert not filterbar.color_filters.colors[0].is_disabled
    filterbar.toggle_color_dropdown_menu()

    # AND: Blue and yellow are shown as active filter tags
    x = filterbar.active_filter_tags
    assert x[1].color == "Blue"
    assert x[2].color == "Yellow"
