"""Reading Experience highlighting."""

import random

import pytest

from pages.accounts import Signup
from pages.content import Content
from tests import markers
from tests.conftest import DESKTOP
from utils.utility import Highlight, Utilities


@markers.test_case("C592636")
@pytest.mark.xfail()
@markers.parametrize(
    "book_slug,page_slug", [
        ("chemistry-2e",
         "1-introduction")])
def test_my_highlights_summary_shows_highlights_and_notes_on_current_page(
        selenium, base_url, book_slug, page_slug):
    """My Highlights and Notes summary shows page highlights and notes."""
    # SETUP:
    ONE, TWO, THREE, FOUR = range(4)
    color = Highlight.random_color
    highlight_ids = [""] * 4
    highlight_colors = [color(), color(), color(), color()]
    highlight_notes = [
        "", Utilities.random_string(), "", Utilities.random_string()]
    highlight_partial_text = [""] * 4

    # GIVEN: the Chemistry 2e book section 1.0 is displayed
    # AND:   a user is logged in
    # AND:   all content is visible
    # AND:   some content is highlighted without a note
    # AND:   some content is highlighted with a note
    # AND:   some content is highlighted in section 1.1 without a note
    # AND:   some content is highlighted in section 1.1 with a note
    book = Content(selenium, base_url,
                   book_slug=book_slug, page_slug=page_slug).open()

    while book.notification_present:
        book.notification.got_it()
    book.navbar.click_login()
    name, email, password = Signup(selenium).register(True)

    book.wait_for_page_to_load()
    while book.notification_present:
        book.notification.got_it()
    book.content.show_solutions()

    # making a highlight requires a non-mobile window width temporarily
    width, height = book.get_window_size()
    if width <= DESKTOP[0]:
        selenium.set_window_size(width=DESKTOP[0], height=height)

    paragraphs = random.sample(book.content.paragraphs, 2)
    book.content.highlight(target=paragraphs[0],
                           offset=Highlight.ENTIRE,
                           color=highlight_colors[ONE])
    highlight_ids[ONE] = book.content.highlight_ids[0]
    highlight_partial_text[ONE] = \
        book.content.get_highlight(by_id=highlight_ids[ONE])[0].text

    book.content.highlight(target=paragraphs[1],
                           offset=Highlight.ENTIRE,
                           color=highlight_colors[TWO],
                           note=highlight_notes[TWO])
    page_highlight_ids = book.content.highlight_ids
    highlight_ids[TWO] = page_highlight_ids[1] \
        if highlight_ids[ONE] == page_highlight_ids[0] \
        else page_highlight_ids[0]
    highlight_partial_text[TWO] = \
        book.content.get_highlight(by_id=highlight_ids[TWO])[0].text

    book.click_next_link()

    paragraphs = random.sample(book.content.paragraphs, 2)
    book.content.highlight(target=paragraphs[0],
                           offset=Highlight.ENTIRE,
                           color=highlight_colors[THREE])
    highlight_ids[THREE] = book.content.highlight_ids[0]
    highlight_partial_text[THREE] = \
        book.content.get_highlight(by_id=highlight_ids[THREE])[0].text

    book.content.highlight(target=paragraphs[1],
                           offset=Highlight.ENTIRE,
                           color=highlight_colors[FOUR],
                           note=highlight_notes[FOUR])
    page_highlight_ids = book.content.highlight_ids
    highlight_ids[FOUR] = page_highlight_ids[1] \
        if highlight_ids[THREE] == page_highlight_ids[0] \
        else page_highlight_ids[0]
    highlight_partial_text[FOUR] = \
        book.content.get_highlight(by_id=highlight_ids[FOUR])[0].text

    if width != DESKTOP[0]:
        # reset the window width for a mobile test
        selenium.set_window_size(width=width, height=height)

    # WHEN: they click on the My highlights button
    my_highlights = book.toolbar.my_highlights()

    # THEN: the My Highlights and Notes modal is displayed
    # AND:  sections without highlights are not included in the placeholders
    # AND:  all highlights for the chapter are displayed
    # AND:  each highlight color matches the corresponding page highlight color
    # AND:  each note matches the corresponding page highlight note
    assert(book.my_highlights_open), \
        "My Highlights modal not open"
    assert(my_highlights.root.is_displayed()), \
        "My Highlights modal not displayed"

    # TODO: placeholder section assertions

    assert(len(my_highlights.highlights) == len(highlight_ids)), (
        "unexpected number of highlights found on the summary page ("
        f"found {len(my_highlights.highlights)}, "
        f"expected {len(highlight_ids)})")

    for index, highlight in enumerate(my_highlights.highlights):
        assert(highlight_colors[index] == highlight.color), \
            f"highlight color for highlight {index + 1} does not match"

        assert(highlight_partial_text[index] in highlight.content), \
            f"partial note text not found in summary highlight {index + 1}"

        assert(highlight_notes[index] == highlight.note), \
            f"highlight note {index + 1} does not match content note"
