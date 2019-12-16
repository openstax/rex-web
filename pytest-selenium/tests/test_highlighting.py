"""Reading Experience highlighting."""

import random
import re

import pytest
from selenium.common.exceptions import NoSuchElementException

from pages.accounts import Signup
from pages.content import Content
from tests import markers
from tests.conftest import DESKTOP
from utils.utility import Highlight, Utilities


@markers.test_case("C591511")
@markers.parametrize(
    "book_slug,page_slug", [
        ("introductory-statistics",
         "2-2-histograms-frequency-polygons-and-time-series-graphs")])
@markers.desktop_only
def test_highlighting_different_content(
        selenium, base_url, book_slug, page_slug):
    """Highlighting is available when content is selected with the mouse.

    .. note::
       figures do not currently show highlights, but their captions do

    """
    # GIVEN: the Introductory Statistics book section 2.2 is displayed
    # AND: a user is logged in
    # AND: all content is visible
    book = Content(selenium, base_url,
                   book_slug=book_slug, page_slug=page_slug).open()

    book.navbar.click_login()
    Signup(selenium).register()

    book.wait_for_page_to_load()
    if book.notification_present:
        book.notification.got_it()
    book.content.show_solutions()
    Highlight.delete_highlights_on_page(selenium)

    initial_highlight_count = book.content.highlight_count
    total_highlight_count = initial_highlight_count

    # WHEN: any text content is selected with the mouse
    # AND: a highlight color button is clicked
    options = book.content.paragraphs
    paragraph = options[random.randint(0, len(options) - 1)]
    book.content.highlight(paragraph, Highlight.RANDOM)
    new_highlight_count = book.content.highlight_count

    # THEN: the text is highlighted
    assert(new_highlight_count > total_highlight_count), \
        "No new highlight(s) found (text)"
    total_highlight_count = new_highlight_count

    # WHEN: any figure, or figure and caption, is selected with the mouse
    # AND: a highlight color button is clicked
    options = book.content.figures + book.content.figures_and_captions
    figure = options[random.randint(0, len(options) - 1)]
    book.content.highlight(figure, Highlight.ENTIRE)
    new_highlight_count = book.content.highlight_count

    # THEN: the figure or the figure and caption is/are highlighted
    assert(new_highlight_count > total_highlight_count), \
        "No new highlight(s) found (figure)"
    total_highlight_count = new_highlight_count

    # WHEN: any table is selected with the mouse
    # AND: a highlight color button is clicked
    options = book.content.tables
    table = options[random.randint(0, len(options) - 1)]
    book.content.highlight(table, (100, 200))
    new_highlight_count = book.content.highlight_count

    # THEN: the table is highlighted
    assert(new_highlight_count > total_highlight_count), \
        "No new highlight(s) found (table)"
    total_highlight_count = new_highlight_count

    # WHEN: any bulleted or numbered list is selected with the mouse
    # AND: a highlight color button is clicked
    options = book.content.lists
    _list = options[random.randint(0, len(options) - 1)]
    book.content.highlight(_list, Highlight.ENTIRE)
    new_highlight_count = book.content.highlight_count

    # THEN: the list is highlighted
    assert(new_highlight_count > total_highlight_count), \
        "No new highlight(s) found (list)"
    total_highlight_count = new_highlight_count

    # WHEN: any math content is selected with the mouse
    # AND: a highlight color button is clicked
    options = book.content.math
    equation = options[random.randint(0, len(options) - 1)]
    book.content.highlight(equation)
    new_highlight_count = book.content.highlight_count

    # THEN: the math content is highlighted
    assert(new_highlight_count > total_highlight_count), \
        "No new highlight(s) found (math)"
    total_highlight_count = new_highlight_count

    # WHEN: the page is refreshed
    book = book.reload()

    # THEN: all of the preceding hightlights should still be highlighted
    current_highlights = book.content.highlight_count
    assert(current_highlights == total_highlight_count), (
        "Highlight counts do not match: "
        f"found {current_highlights}, expected {total_highlight_count}")


@markers.test_case("C591512")
@markers.parametrize("page_slug", [("preface")])
@markers.desktop_only
def test_delete_a_highlight(
        selenium, base_url, book_slug, page_slug):
    """Create and then remove a highlight."""
    # GIVEN: a book preface page is displayed
    # AND: a user is logged in
    # AND: all content is visible
    book = Content(selenium, base_url,
                   book_slug=book_slug, page_slug=page_slug).open()

    book.navbar.click_login()
    Signup(selenium).register()

    book.wait_for_page_to_load()
    if book.notification_present:
        book.notification.got_it()
    book.content.show_solutions()

    initial_highlight_count = book.content.highlight_count

    # WHEN: any text content is selected with the mouse
    # AND: a highlight color button is clicked
    options = book.content.paragraphs
    paragraph = options[random.randint(0, len(options) - 1)]
    color = Highlight.random_color()
    book.content.highlight(paragraph, Highlight.RANDOM, color, close_box=False)
    new_highlight_count = book.content.highlight_count

    # THEN: the text is highlighted
    assert(new_highlight_count > initial_highlight_count), \
        "No new highlight(s) found (text)"

    # WHEN: the same highlight color button is clicked
    book.content.highlight_box.toggle(color)

    # THEN: the highlight is removed from the text
    # AND: the create note box disappears
    current_highlights = book.content.highlight_count
    assert(current_highlights == initial_highlight_count), (
        "Highlight counts do not match: "
        f"found {current_highlights}, expected {initial_highlight_count}")

    with pytest.raises(NoSuchElementException) as ex:
        book.content.highlight_box
    assert("No open highlight boxes found" in str(ex.value))

    # WHEN: the page is refreshed
    book = book.reload()

    # THEN: the highlight does not reappear
    current_highlights = book.content.highlight_count
    assert(current_highlights == initial_highlight_count), (
        "Highlight counts do not match after refresh: "
        f"found {current_highlights}, expected {initial_highlight_count}")


@markers.test_case("C591513")
@markers.parametrize("page_slug", [("preface")])
@markers.desktop_only
def test_highlight_stays_on_navigation(
        selenium, base_url, book_slug, page_slug):
    """Highlights remain while navigating between pages."""
    # GIVEN: a book preface page is displayed
    # AND: a user is logged in
    # AND: all content is visible
    book = Content(selenium, base_url,
                   book_slug=book_slug, page_slug=page_slug).open()

    book.navbar.click_login()
    Signup(selenium).register()

    book.wait_for_page_to_load()
    if book.notification_present:
        book.notification.got_it()
    book.content.show_solutions()

    initial_highlight_count = book.content.highlight_count
    initial_highlight_ids = book.content.highlight_ids

    # WHEN: any text content is selected with the mouse
    # AND: a highlight color button is clicked
    options = book.content.paragraphs
    paragraph = options[random.randint(0, len(options) - 1)]
    book.content.highlight(paragraph, Highlight.RANDOM)
    new_highlight_count = book.content.highlight_count

    # THEN: the text is highlighted
    assert(new_highlight_count > initial_highlight_count), \
        "No new highlight(s) found (text)"
    new_highlight_id = list(
        set(book.content.highlight_ids) - set(initial_highlight_ids))[0]

    # WHEN: they click the "Next" page link
    # AND: click on the initial page's table of contents link
    book.click_next_link()

    book.sidebar.toc.preface.click()
    reloaded_highlight_count = book.content.highlight_count

    # THEN: the highlight should still exist
    assert(reloaded_highlight_count == new_highlight_count), (
        "Highlight counts do not match after refresh: "
        f"found {reloaded_highlight_count}, expected {new_highlight_count}")
    assert(new_highlight_id in book.content.highlight_ids), \
        f"Highlight ID ({new_highlight_id}) not found on page"


@markers.test_case("C591514")
@markers.parametrize(
    "book_slug,page_slug", [
        ("astronomy",
         "1-1-the-nature-of-astronomy")])
def test_search_term_colored_within_a_highlight(
        selenium, base_url, book_slug, page_slug):
    """Search highlights should be over user highlights."""
    # GIVEN: a book section is displayed
    # AND: a user is logged in
    # AND: all content is visible
    # AND: some content is highlighted
    book = Content(selenium, base_url,
                   book_slug=book_slug, page_slug=page_slug).open()

    book.navbar.click_login()
    name, email = Signup(selenium).register()

    book.wait_for_page_to_load()
    if book.notification_present:
        book.notification.got_it()
    book.content.show_solutions()

    # make a highlight, requires a non-mobile window width
    width, height = book.get_window_size()
    if width <= DESKTOP[0]:
        selenium.set_window_size(width=DESKTOP[0], height=height)
    options = book.content.paragraphs
    paragraph = options[random.randint(0, len(options) - 1)]
    book.content.highlight(paragraph, Highlight.ENTIRE, Highlight.GREEN)
    highlight_id = book.content.highlight_ids[0]
    if width != DESKTOP[0]:
        # reset the window width for a mobile test
        selenium.set_window_size(width=width, height=height)

    # WHEN: they search for a word or phrase contained within the highlight
    # AND: click on the search excerpt (for mobile)
    phrase = re.search(r"\w{10,}", paragraph.text)
    if phrase is None:
        raise ValueError("No (10+) search phrase found in the paragraph")
    phrase = phrase.group(0)
    if book.is_desktop:
        book.toolbar.search_for(phrase)
    else:
        book.mobile_search_toolbar.search_for(phrase)
    search_results = book.search_sidebar.search_results(phrase)
    if not search_results:
        raise ValueError("No search results found")

    Utilities.click_option(selenium, element=search_results[0])
    XPATH_SEARCH = (
        "//span[contains(text(),'{term}') and contains(@class,'highlight')]")
    phrase_searched = book.content.find_elements(
        "xpath", XPATH_SEARCH.format(term=phrase))

    # THEN: the search highlighting is in place for the search term in the
    #       content
    # AND: the search highlight color is different from the user-highlighted
    #      color
    assert(phrase_searched), \
        f"the highlight phrase ('{phrase}') was not found on the page"

    assert("focus" in phrase_searched[0].get_attribute("class")), \
        "search phrase does not have the search focus highlight"
    assert(highlight_id in book.content.highlight_ids), \
        "the original highlight ID not found on the page"
