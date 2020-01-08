"""Reading Experience highlighting."""

import random

import pytest
from selenium.common.exceptions import NoSuchElementException

from pages.accounts import Signup
from pages.content import Content
from tests import markers
from utils.utility import Highlight


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
