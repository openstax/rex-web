import random

from pages.accounts import Signup
from pages.content import Content
from tests import markers
from utils.utility import Highlight, Color, Utilities


@markers.test_case("C597678")
@markers.desktop_only
@markers.parametrize("book_slug,page_slug", [("organizational-behavior", "1-1-the-nature-of-work")])
def test_change_color_from_MH_page(selenium, base_url, book_slug, page_slug):
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
@markers.parametrize("book_slug,page_slug", [("organizational-behavior", "1-1-the-nature-of-work")])
def test_add_note_from_MH_page(selenium, base_url, book_slug, page_slug):
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
            highlight.note = note_added
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
@markers.parametrize("book_slug,page_slug", [("organizational-behavior", "1-1-the-nature-of-work")])
def test_edit_note_from_MH_page(selenium, base_url, book_slug, page_slug):
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
            highlight.note = note_append

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
            highlight.note = note_append

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
