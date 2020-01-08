"""Reading Experience highlighting."""

import random
from string import digits, ascii_letters

import pytest
from selenium.common.exceptions import NoSuchElementException

from pages.accounts import Signup
from pages.content import Content
from tests import markers
from utils.utility import Color, Highlight


def random_string(length: int = 100):
    """Return a random string of a specified length for use in notes.

    .. note::
       beginning and ending white space are stripped from the final string so
       the return length may not equal ``length``

    """
    characters = ascii_letters + digits + " " * 6 + "\n" * 2
    return "".join(random.choices(population=characters, k=length)).strip()


@markers.test_case("C591999")
@markers.parametrize(
    "book_slug,page_slug", [
        ("astronomy",
         "1-introduction")])
@markers.desktop_only
def test_highlight_is_not_created_until_a_color_is_selected(
        selenium, base_url, book_slug, page_slug):
    """A highlight is not created until the highlight color is selected."""
    # GIVEN: the Astronomy book section 1.0 introduction is displayed
    # AND:   a user is logged in
    # AND:   all content is visible
    book = Content(selenium, base_url,
                   book_slug=book_slug, page_slug=page_slug).open()

    book.navbar.click_login()
    Signup(selenium).register()

    book.wait_for_page_to_load()
    if book.notification_present:
        book.notification.got_it()
    book.content.show_solutions()

    total_highlight_count = book.content.highlight_count

    # WHEN: they select some text content
    paragraph = random.choice(book.content.paragraphs)
    book.content.highlight(target=paragraph,
                           offset=Highlight.RANDOM,
                           color=None)
    new_highlight_count = book.content.highlight_count

    # THEN: the create note box is displayed
    # AND:  the selected text is not a saved highlight
    try:
        book.content.highlight_box
    except NoSuchElementException:
        pytest.fail("the create note box is not open")

    assert(new_highlight_count == total_highlight_count), \
        "a new highlight was found"

    total_highlight_count = book.content.highlight_count

    # WHEN: they select a highlight color
    book.content.highlight_box.toggle_color(Highlight.random_color())
    new_highlight_count = book.content.highlight_count

    # THEN: the highlight is created
    assert(new_highlight_count > total_highlight_count), \
        "the new highlight was not found"


@markers.test_case("C592001")
@markers.parametrize(
    "book_slug,page_slug", [
        ("astronomy",
         "1-introduction")])
@markers.desktop_only
def test_color_auto_selected_if_a_note_is_added(
        selenium, base_url, book_slug, page_slug):
    """The first highlight color is auto-selected if a note is typed."""
    # GIVEN: the Astronomy book section 1.0 introduction is displayed
    # AND:   a user is logged in
    # AND:   all content is visible
    # AND:   some content is selected
    book = Content(selenium, base_url,
                   book_slug=book_slug, page_slug=page_slug).open()

    book.navbar.click_login()
    Signup(selenium).register()

    book.wait_for_page_to_load()
    if book.notification_present:
        book.notification.got_it()
    book.content.show_solutions()

    paragraph = random.choice(book.content.paragraphs)
    book.content.highlight(target=paragraph,
                           offset=Highlight.RANDOM,
                           color=None)

    expected_color = Color.YELLOW

    # WHEN: they type a note in the create note box
    book.content.highlight_box.note = random_string()
    highlight_ids = book.content.highlight_ids

    # THEN: the first hightlight color is automatically selected (yellow)
    # AND:  the selected color in the color picker is checked
    assert(highlight_ids), "no highlights found"
    highlight_classes = (book.content
                         .get_highlight(by_id=highlight_ids[0])[0]
                         .get_attribute("class"))
    current_color = Color.from_html_class(highlight_classes)
    assert(current_color == expected_color), \
        "the current highlight color does not match the default color"

    assert(book.content.highlight_box.is_checked(expected_color)), \
        "highlight color yellow is not currently selected"
