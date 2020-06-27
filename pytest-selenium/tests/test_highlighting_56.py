import random

from pages.accounts import Signup
from tests import markers
from pages.content import Content
from utils.utility import Highlight, Utilities


@markers.test_case("C602210")
@markers.desktop_only
@markers.parametrize("book_slug,page_slug", [("microbiology", "4-introduction")])
def test_modal_for_unsaved_notes_appears_on_clicking_another_highlight(
    selenium, base_url, book_slug, page_slug
):
    """Discard modal appears when unsaved notes are present & clicking another highlight."""
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

    # AND: Highlight 2 paragraphs
    paragraphs = random.sample(book.content.paragraphs, 2)
    book.content.highlight(target=paragraphs[0], offset=Highlight.ENTIRE)
    id_1 = list(set(book.content.highlight_ids))[0]

    book.content.highlight(target=paragraphs[1], offset=Highlight.ENTIRE, close_box=False)
    _ids = book.content.highlight_ids
    id_2 = _ids[0] if _ids[0] != id_1 else _ids[1]

    # AND: Add note to the 2nd highlight and do not save
    note = Utilities.random_string()
    book.content.highlight_box.note = note

    # WHEN: click the first highlight
    highlight = book.content.get_highlight(by_id=id_1)
    Utilities.click_option(driver=selenium, element=highlight[0], scroll_to=-150)

    # THEN: Discard modal is displayed
    assert book.discard_changes_modal_displayed
    assert book.discard_modal.content == "You have an unsaved note on this page."
    assert book.discard_modal.title == "Discard unsaved changes?"

    # AND: Clicking Cancel closes the modal and the unsaved note is retained in the page
    book.discard_modal.click_cancel_changes()

    assert book.content.highlight_box.is_open, "Highlight box not open"
    assert book.content.highlight_box.is_edit_box
    highlight = book.content.get_highlight(by_id=id_2)[0]
    assert "focus" in highlight.get_attribute("class"), "highlight is not in focus"
    assert book.content.highlight_box.note == note

    # WHEN: click the 1st highlight again
    highlight = book.content.get_highlight(by_id=id_1)
    Utilities.click_option(driver=selenium, element=highlight[0], scroll_to=-150)

    # AND: click Discard changes  in the modal
    book.discard_modal.click_discard_changes()

    # THEN: Unsaved note is abandoned and the highlight box is opened for the 1st highlight
    assert book.content.highlight_box.is_open, "Highlight box not open"
    highlight = book.content.get_highlight(by_id=id_1)[0]
    assert "focus" in highlight.get_attribute("class"), "highlight is not in focus"
    assert book.content.highlight_box.note == ""
