"""Reading Experience highlighting."""
# fmt: off
# flake8: noqa
import logging
import random
import re
from functools import reduce
from math import isclose
from time import sleep

import pytest
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.common.by import By

from pages.accounts import Signup
from pages.content import Content
from tests import markers
from tests.conftest import DESKTOP
from utils.utility import Color, Highlight, Utilities

XPATH_SEARCH = (
    "//span[contains(text(),'{term}') and contains(@class,'highlight')]")


@markers.test_case("C591511")
@markers.highlighting
@markers.parametrize(
    "book_slug,page_slug", [
        ("introductory-statistics",
         "2-2-histograms-frequency-polygons-and-time-series-graphs")])
@markers.desktop_only
def highlighting_different_content(
        selenium, base_url, book_slug, page_slug):
    """Highlighting is available when content is selected with the mouse.

    .. note::
       figures do not currently show highlights, but their captions do

    """
    # GIVEN: the Introductory Statistics book section 2.2 is displayed
    # AND:   a user is logged in
    # AND:   all content is visible
    book = Content(selenium, base_url,
                   book_slug=book_slug, page_slug=page_slug).open()

    while book.notification_present:
        book.notification.got_it()
    book.navbar.click_login()
    Signup(selenium).register()

    book.wait_for_page_to_load()
    while book.notification_present:
        book.notification.got_it()
    book.content.show_solutions()

    initial_highlight_count = book.content.highlight_count
    total_highlight_count = initial_highlight_count

    # WHEN: any text content is selected with the mouse
    # AND:  a highlight color button is clicked
    paragraph = random.choice(book.content.paragraphs)
    book.content.highlight(paragraph, Highlight.RANDOM)
    new_highlight_count = book.content.highlight_count

    # THEN: the text is highlighted
    logging.info(f"C591511 - text:   {book.content.highlight_ids[0]}")
    used = book.content.highlight_ids
    assert(new_highlight_count > total_highlight_count), \
        "No new highlight(s) found (text)"
    total_highlight_count = new_highlight_count

    # WHEN: any figure, or figure and caption, is selected with the mouse
    # AND:  a highlight color button is clicked
    figures = book.content.figures + book.content.figures_and_captions
    figure = random.choice(figures)
    book.content.highlight(figure, Highlight.ENTIRE)
    new_highlight_count = book.content.highlight_count

    # THEN: the figure or the figure and caption is/are highlighted
    logging.info("C591511 - figure: "
                 f"{list(set(book.content.highlight_ids) - set(used))[0]}")
    used = book.content.highlight_ids
    assert(new_highlight_count > total_highlight_count), \
        "No new highlight(s) found (figure)"
    total_highlight_count = new_highlight_count

    # WHEN: any table is selected with the mouse
    # AND:  a highlight color button is clicked
    table = random.choice(book.content.tables)
    book.content.highlight(table, (100, 200))
    new_highlight_count = book.content.highlight_count

    # THEN: the table is highlighted
    logging.info("C591511 - table:  "
                 f"{list(set(book.content.highlight_ids) - set(used))[0]}")
    used = book.content.highlight_ids
    assert(new_highlight_count > total_highlight_count), \
        "No new highlight(s) found (table)"
    total_highlight_count = new_highlight_count

    # WHEN: any bulleted or numbered list is selected with the mouse
    # AND:  a highlight color button is clicked
    _list = random.choice(book.content.lists)
    book.content.highlight(_list, Highlight.ENTIRE)
    new_highlight_count = book.content.highlight_count

    # THEN: the list is highlighted
    logging.info("C591511 - list:   "
                 f"{list(set(book.content.highlight_ids) - set(used))[0]}")
    used = book.content.highlight_ids
    assert(new_highlight_count > total_highlight_count), \
        "No new highlight(s) found (list)"
    total_highlight_count = new_highlight_count

    # WHEN: any math content is selected with the mouse
    # AND:  a highlight color button is clicked
    equation = random.choice(book.content.math)
    book.content.highlight(equation)
    new_highlight_count = book.content.highlight_count

    # THEN: the math content is highlighted
    logging.info("C591511 - math:   "
                 f"{list(set(book.content.highlight_ids) - set(used))[0]}")
    assert(new_highlight_count > total_highlight_count), \
        "No new highlight(s) found (math)"
    total_highlight_count = book.content.highlight_ids

    # WHEN: the page is refreshed
    book = book.reload()

    # THEN: all of the preceding highlights should still be highlighted
    current_highlights = book.content.highlight_ids
    assert(set(current_highlights) == set(total_highlight_count)), (
        "Highlight counts do not match: "
        f"found {len(current_highlights)}, "
        f"expected {len(total_highlight_count)}")


@markers.test_case("C591512")
@markers.highlighting
@markers.smoke_test
@markers.parametrize("page_slug", [("preface")])
@markers.desktop_only
def delete_a_highlight(
        selenium, base_url, book_slug, page_slug):
    """Create and then remove a highlight."""
    # GIVEN: a book preface page is displayed
    # AND:   a user is logged in
    # AND:   all content is visible
    book = Content(selenium, base_url,
                   book_slug=book_slug, page_slug=page_slug).open()

    while book.notification_present:
        book.notification.got_it()
    book.navbar.click_login()
    Signup(selenium).register()

    book.wait_for_page_to_load()
    while book.notification_present:
        book.notification.got_it()
    book.content.show_solutions()

    initial_highlight_count = book.content.highlight_count

    # WHEN: any text content is selected with the mouse
    # AND:  a highlight color button is clicked
    paragraph = random.choice(book.content.paragraphs)
    color = Highlight.random_color()
    book.content.highlight(paragraph, Highlight.RANDOM, color, close_box=False)
    new_highlight_count = book.content.highlight_count

    # THEN: the text is highlighted
    assert(new_highlight_count > initial_highlight_count), \
        "No new highlight(s) found (text)"

    # WHEN: the same highlight color button is clicked
    book.content.highlight_box.toggle_color(color)

    # THEN: the highlight is removed from the text
    # AND:  the create note box disappears
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
@markers.highlighting
@markers.parametrize("page_slug", [("preface")])
@markers.desktop_only
def highlight_stays_on_navigation(
        selenium, base_url, book_slug, page_slug):
    """Highlights remain while navigating between pages."""
    # GIVEN: a book preface page is displayed
    # AND:   a user is logged in
    # AND:   all content is visible
    book = Content(selenium, base_url,
                   book_slug=book_slug, page_slug=page_slug).open()

    while book.notification_present:
        book.notification.got_it()
    book.navbar.click_login()
    Signup(selenium).register()

    book.wait_for_page_to_load()
    while book.notification_present:
        book.notification.got_it()
    book.content.show_solutions()

    initial_highlight_count = book.content.highlight_count
    initial_highlight_ids = book.content.highlight_ids

    # WHEN: any text content is selected with the mouse
    # AND:  a highlight color button is clicked
    paragraph = random.choice(book.content.paragraphs)
    book.content.highlight(paragraph, Highlight.RANDOM)
    new_highlight_count = book.content.highlight_count

    # THEN: the text is highlighted
    assert(new_highlight_count > initial_highlight_count), \
        "No new highlight(s) found (text)"
    new_highlight_id = list(
        set(book.content.highlight_ids) - set(initial_highlight_ids))[0]

    # WHEN: they click the "Next" page link
    # AND:  click on the initial page's table of contents link
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
@markers.highlighting
@markers.parametrize(
    "book_slug,page_slug", [
        ("astronomy",
         "1-1-the-nature-of-astronomy")])
def search_term_colored_within_a_highlight(
        selenium, base_url, book_slug, page_slug):
    """Search highlights should be over user highlights."""
    # GIVEN: a book section is displayed
    # AND:   a user is logged in
    # AND:   all content is visible
    # AND:   some content is highlighted
    book = Content(selenium, base_url,
                   book_slug=book_slug, page_slug=page_slug).open()

    while book.notification_present:
        book.notification.got_it()
    book.navbar.click_login()
    name, email = Signup(selenium).register()

    book.wait_for_page_to_load()
    while book.notification_present:
        book.notification.got_it()
    book.content.show_solutions()

    # making a highlight requires a non-mobile window width temporarily
    width, height = book.get_window_size()
    if width <= DESKTOP[0]:
        selenium.set_window_size(width=DESKTOP[0], height=height)
    paragraph = random.choice(book.content.paragraphs)
    book.content.highlight(paragraph, Highlight.ENTIRE, Color.YELLOW)
    highlight_id = book.content.highlight_ids[0]
    if width != DESKTOP[0]:
        # reset the window width for a mobile test
        selenium.set_window_size(width=width, height=height)

    # WHEN: they search for a word or phrase contained within the highlight
    # AND:  click on the search excerpt (for mobile)
    phrase = re.search(r"\w{10,}", paragraph.text)
    if phrase is None:
        raise ValueError("No (10+) search phrase found in the paragraph")
    phrase = phrase.group(0)
    if book.is_desktop:
        book.topbar.search_for(phrase)
    else:
        book.mobile_search_toolbar.search_for(phrase)
    search_results = book.search_sidebar.search_results(phrase)
    if not search_results:
        raise ValueError("No search results found")

    Utilities.click_option(selenium, element=search_results[0])
    phrase_searched = book.content.find_elements(
        By.XPATH, XPATH_SEARCH.format(term=phrase))

    # THEN: the search highlighting is in place for the search term in the
    #       content
    # AND:  the search highlight color is different from the user-highlighted
    #       color
    assert(phrase_searched), \
        f"the highlight phrase ('{phrase}') was not found on the page"

    assert("focus" in phrase_searched[0].get_attribute("class")), \
        "search phrase does not have the search focus highlight"
    assert(highlight_id in book.content.highlight_ids), \
        "the original highlight ID not found on the page"


@markers.test_case("C591515")
@markers.highlighting
@markers.parametrize(
    "book_slug,page_slug", [
        ("astronomy",
         "1-1-the-nature-of-astronomy")])
@markers.desktop_only
def user_highlight_over_search_term_highlight(
        selenium, base_url, book_slug, page_slug):
    """Search highlights should be over user highlights."""
    # GIVEN: a book section is displayed
    # AND:   a user is logged in
    # AND:   all content is visible
    # AND:   a search is performed
    book = Content(selenium, base_url,
                   book_slug=book_slug, page_slug=page_slug).open()

    while book.notification_present:
        book.notification.got_it()
    book.navbar.click_login()
    name, email = Signup(selenium).register()

    book.wait_for_page_to_load()
    while book.notification_present:
        book.notification.got_it()
    book.content.show_solutions()

    paragraph = random.choice(book.content.paragraphs)
    phrase = re.search(r"\w{10,}", paragraph.text)
    if phrase is None:
        raise ValueError("No (10+) search phrase found in the paragraph")
    phrase = phrase.group(0)
    book.topbar.search_for(phrase)
    search_results = book.search_sidebar.search_results(phrase)
    if not search_results:
        raise ValueError("No search results found")
    Utilities.click_option(selenium, element=search_results[0])
    initial_highlight_count = book.content.highlight_count
    initial_highlight_ids = book.content.highlight_ids

    # WHEN: they highlight content over the search highlight
    book.content.highlight(paragraph, Highlight.ENTIRE, Color.BLUE)
    new_highlight_id = list(
        set(book.content.highlight_ids) - set(initial_highlight_ids))[0]
    phrase_searched = book.content.find_elements(
        By.XPATH, XPATH_SEARCH.format(term=phrase))

    # THEN: the search highlighting is in place for the search term in the
    #       content
    # AND:  the search highlight color is different from the user-highlighted
    #       color
    assert(book.content.highlight_count > initial_highlight_count), \
        "No new highlight(s) found (text)"
    assert(phrase_searched), \
        f"the highlight phrase ('{phrase}') was not found on the page"

    assert("focus" in phrase_searched[0].get_attribute("class")), \
        "search phrase does not have the search focus highlight"
    assert(new_highlight_id in book.content.highlight_ids), \
        "the new highlight ID not found on the page"


@markers.test_case("C591686")
@markers.highlighting
@markers.skip_test(reason="test mechanics covered by C591687")
def expanded_focussed_note_card_is_displayed_when_highlight_clicked():
    """Display the focussed note card after clicking a highlight."""


@markers.test_case("C591687")
@markers.highlighting
@markers.parametrize(
    "book_slug,page_slug", [
        ("microbiology",
         "1-introduction")])
@markers.desktop_only
def focussed_note_card_is_displayed_when_highlight_clicked(
        selenium, base_url, book_slug, page_slug):
    """Show the focussed note card when the user clicks a highlight."""
    # GIVEN: a book section is displayed
    # AND:   a user is logged in
    # AND:   all content is visible
    # AND:   some content is highlighted with a note
    book = Content(selenium, base_url,
                   book_slug=book_slug, page_slug=page_slug).open()

    while book.notification_present:
        book.notification.got_it()
    book.navbar.click_login()
    name, email = Signup(selenium).register()

    book.wait_for_page_to_load()
    while book.notification_present:
        book.notification.got_it()
    book.content.show_solutions()

    paragraph = random.choice(book.content.paragraphs)
    note = Utilities.random_string()
    book.content.highlight(target=paragraph,
                           offset=Highlight.ENTIRE,
                           color=Color.BLUE,
                           note=note)

    # WHEN: they click on the highlighted text
    # AND:  click on the context menu
    Utilities.click_option(selenium, element=book.content.highlights[0])

    book.content.highlight_box.toggle_menu()

    # THEN: the display note card appears
    # AND:  the highlighted text and the note card are in the focussed state
    # AND:  the context menu is in the top right corner of the display note
    #       card
    # AND:  the context menu has edit and delete options
    assert(book.content.highlight_box.is_open), "Highlight box not open"

    assert("Display" in
           book.content.highlight_box.root.get_attribute("class")), \
        "Highlight box is not a DisplayNote"
    assert("focus" in book.content.highlights[0].get_attribute("class")), \
        "Highlight is not currently focused"

    try:
        book.content.highlight_box.edit_button
    except NoSuchElementException:
        pytest.fail("Context edit button not found")
    try:
        book.content.highlight_box.delete_button
    except NoSuchElementException:
        pytest.fail("Context delete button not found")


@markers.test_case("C591688")
@markers.highlighting
@markers.smoke_test
@markers.parametrize(
    "book_slug,page_slug", [
        ("microbiology",
         "1-introduction")])
@markers.desktop_only
def delete_a_highlight_and_note_using_the_context_menu(
        selenium, base_url, book_slug, page_slug):
    """Delete a highlight and associated note using the context menu."""
    # GIVEN: a book section is displayed
    # AND:   a user is logged in
    # AND:   all content is visible
    # AND:   some content is highlighted with a note
    # AND:   the highlight note is visible
    book = Content(selenium, base_url,
                   book_slug=book_slug, page_slug=page_slug).open()

    while book.notification_present:
        book.notification.got_it()
    book.navbar.click_login()
    name, email = Signup(selenium).register()

    book.wait_for_page_to_load()
    while book.notification_present:
        book.notification.got_it()
    book.content.show_solutions()

    paragraph = random.choice(book.content.paragraphs)
    note = Utilities.random_string()
    book.content.highlight(target=paragraph,
                           offset=Highlight.ENTIRE,
                           color=Color.PINK,
                           note=note,
                           close_box=False)

    # WHEN: they use the context menu to delete the highlight
    book.content.highlight_box.delete_note()

    # THEN: delete confirmation message is displayed
    assert(book.content.highlight_box.delete_confirmation_visible), \
        "the confirmation box overlay is not visible"
    confirmation_text = book.content.highlight_box.delete_confirmation_text
    expected_text = "Are you sure you want to delete this note and highlight?"
    assert(confirmation_text == expected_text), \
        "the confirmation text does not match the expected content"

    # WHEN: they confirm the deletion
    book.content.highlight_box.confirm_deletion()

    # THEN: the highlight and note are deleted
    assert(len(book.content.highlights) == 0), \
        f"the highlight was not removed ({len(book.content.highlights)} found)"

    # WHEN: the page is refreshed
    book = book.reload()

    # THEN: the highlight and note do not reappear
    assert(len(book.content.highlights) == 0), \
        f"the highlight(s) reappeared ({len(book.content.highlights)} found)"


@markers.test_case("C591689")
@markers.highlighting
@markers.parametrize(
    "book_slug,page_slug", [
        ("microbiology",
         "1-introduction")])
@markers.desktop_only
def delete_a_note_using_the_context_menu(
        selenium, base_url, book_slug, page_slug):
    """Delete a note from a highlight using the context menu."""
    # GIVEN: a book section is displayed
    # AND:   a user is logged in
    # AND:   all content is visible
    # AND:   some content is highlighted with a note
    # AND:   the highlight note is visible
    book = Content(selenium, base_url,
                   book_slug=book_slug, page_slug=page_slug).open()

    while book.notification_present:
        book.notification.got_it()
    book.navbar.click_login()
    name, email = Signup(selenium).register()

    book.wait_for_page_to_load()
    while book.notification_present:
        book.notification.got_it()
    book.content.show_solutions()

    paragraph = random.choice(book.content.paragraphs)
    note = Utilities.random_string()
    highlight_color = Color.PINK
    book.content.highlight(target=paragraph,
                           offset=Highlight.ENTIRE,
                           color=highlight_color,
                           note=note,
                           close_box=False)
    original_highlight_ids = book.content.highlight_ids
    original_notes_total = book.content.notes

    # WHEN: they use the context menu to edit the highlight
    # AND:  remove all of the note text in the text box
    # AND:  click the "Save" button
    book.content.highlight_box.edit_note()

    book.content.highlight_box.note = ""

    book.content.highlight_box.save()

    # THEN: the delete confirmation message is shown
    assert(book.content.highlight_box.delete_confirmation_visible), \
        "the confirmation box overlay is not visible"
    confirmation_text = book.content.highlight_box.delete_confirmation_text
    expected_text = "Are you sure you want to delete this note?"
    assert(confirmation_text == expected_text), \
        "the confirmation text does not match the expected content"

    # WHEN: they click the "Delete" button
    book.content.highlight_box.confirm_deletion()

    # THEN: the attached note is deleted
    # AND:  the highlight remains
    # AND:  the edit note box is displayed
    # AND:  the same highlight color is still selected
    assert(book.content.notes == original_notes_total - 1), (
        "highlight note not deleted "
        f"(found {book.content.notes}, expected {original_notes_total - 1})")

    assert(book.content.highlight_ids == original_highlight_ids), \
        "highlight ID lists do not match"

    try:
        assert(book.content.highlight_box.is_edit_box), \
            "highlight box is not an edit card"
    except NoSuchElementException:
        pytest.fail("edit note box is not displayed")

    # WHEN: they click outside of the edit note box
    book.content.close_edit_note_box()

    # THEN: the edit note box is hidden
    # AND:  the old note does not show on the page
    # AND:  the original content highlight is still colored
    with pytest.raises(NoSuchElementException) as e:
        book.content.highlight_box
    assert("No open highlight boxes found" in str(e.value)), \
        "the edit note box is still visible"

    # No notes show when the highlight isn't selected so ignoring test 2

    current_highlight_classes = (
        book
        .content.get_highlight(by_id=original_highlight_ids[0])
        [0].get_attribute("class"))
    assert(str(highlight_color) in current_highlight_classes), \
        f"wrong highlight color found (expected {str(highlight_color)})"


@markers.test_case("C591690")
@markers.highlighting
@markers.parametrize(
    "book_slug,page_slug", [
        ("microbiology",
         "1-introduction")])
@markers.desktop_only
def cancel_deleting_a_highlight_using_the_context_menu(
        selenium, base_url, book_slug, page_slug):
    """Cancel deleting a highlight using the context menu."""
    # GIVEN: a book section is displayed
    # AND:   a user is logged in
    # AND:   all content is visible
    # AND:   some content is highlighted with a note
    # AND:   the highlight note is visible
    book = Content(selenium, base_url,
                   book_slug=book_slug, page_slug=page_slug).open()

    while book.notification_present:
        book.notification.got_it()
    book.navbar.click_login()
    name, email = Signup(selenium).register()

    book.wait_for_page_to_load()
    while book.notification_present:
        book.notification.got_it()
    book.content.show_solutions()

    paragraph = random.choice(book.content.paragraphs)
    note = Utilities.random_string()
    book.content.highlight(target=paragraph,
                           offset=Highlight.ENTIRE,
                           color=Color.GREEN,
                           note=note,
                           close_box=False)
    original_highlight_ids = book.content.highlight_ids
    original_notes_total = book.content.notes

    # WHEN: they use the context menu to delete the highlight
    book.content.highlight_box.delete_note()

    # THEN: delete confirmation message is displayed
    assert(book.content.highlight_box.delete_confirmation_visible), \
        "the confirmation box overlay is not visible"
    confirmation_text = book.content.highlight_box.delete_confirmation_text
    expected_text = "Are you sure you want to delete this note and highlight?"
    assert(confirmation_text == expected_text), \
        "the confirmation text does not match the expected content"

    # WHEN: they cancel the deletion
    book.content.highlight_box.cancel()

    # THEN: the highlight and note remain
    assert(book.content.notes == original_notes_total), (
        "highlight deleted "
        f"(found {book.content.notes}, expected {original_notes_total})")
    assert(book.content.highlight_ids == original_highlight_ids), \
        "highlight ID lists do not match"
    try:
        assert(book.content.highlight_box.is_display_box), \
            "highlight box is not a note display box"
    except NoSuchElementException:
        pytest.fail("display box is not visible")

    # WHEN: the page is refreshed
    book = book.reload()

    # THEN: the highlight and note remain
    assert(book.content.notes == original_notes_total), (
        "highlight deleted "
        f"(found {book.content.notes}, expected {original_notes_total})")


@markers.test_case("C591691")
@markers.highlighting
@markers.parametrize(
    "book_slug,page_slug", [
        ("microbiology",
         "1-introduction")])
@markers.desktop_only
def cancel_deleting_a_note_using_the_context_menu(
        selenium, base_url, book_slug, page_slug):
    """Cancel deleting a highlight using the context menu."""
    # GIVEN: a book section is displayed
    # AND:   a user is logged in
    # AND:   all content is visible
    # AND:   some content is highlighted with a note
    # AND:   the highlight note is visible
    book = Content(selenium, base_url,
                   book_slug=book_slug, page_slug=page_slug).open()

    while book.notification_present:
        book.notification.got_it()
    book.navbar.click_login()
    name, email = Signup(selenium).register()

    book.wait_for_page_to_load()
    while book.notification_present:
        book.notification.got_it()
    book.content.show_solutions()

    paragraph = random.choice(book.content.paragraphs)
    note = Utilities.random_string()
    book.content.highlight(target=paragraph,
                           offset=Highlight.ENTIRE,
                           color=Color.GREEN,
                           note=note,
                           close_box=False)
    original_highlight_ids = book.content.highlight_ids
    original_notes_total = book.content.highlight_boxes

    # WHEN: they use the context menu to edit the note
    # AND:  remove all of the note text in the text box
    # AND:  click the "Save" button
    book.content.highlight_box.edit_note()

    book.content.highlight_box.note = ""

    book.content.highlight_box.save()

    # THEN: delete confirmation message is displayed
    assert(book.content.highlight_box.delete_confirmation_visible), \
        "the confirmation box overlay is not visible"
    confirmation_text = book.content.highlight_box.delete_confirmation_text
    expected_text = "Are you sure you want to delete this note?"
    assert(confirmation_text == expected_text), \
        "the confirmation text does not match the expected content"

    # WHEN: they cancel the edit
    book.content.highlight_box.cancel()

    # THEN: the highlight and note remain
    assert(len(book.content.highlight_boxes) == len(original_notes_total)), (
        "highlight deleted "
        f"(found {book.content.highlight_boxes}, "
        f"expected {original_notes_total})")
    assert(book.content.highlight_ids == original_highlight_ids), \
        "highlight ID lists do not match"
    try:
        assert(book.content.highlight_box.is_edit_box), \
            "highlight box is not a note edit box"
    except NoSuchElementException:
        pytest.fail("edit note box is not visible")
    assert(book.content.highlight_box.note == note), \
        "the current note text does not match the original"


@markers.test_case("C591692")
@markers.highlighting
@markers.smoke_test
@markers.parametrize(
    "book_slug,page_slug", [
        ("microbiology",
         "1-introduction")])
@markers.desktop_only
def save_a_note_edit(selenium, base_url, book_slug, page_slug):
    """Save an edited note."""
    # GIVEN: a book section is displayed
    # AND:   a user is logged in
    # AND:   all content is visible
    # AND:   some content is highlighted with a note
    # AND:   the highlight note is visible
    book = Content(selenium, base_url,
                   book_slug=book_slug, page_slug=page_slug).open()

    while book.notification_present:
        book.notification.got_it()
    book.navbar.click_login()
    name, email = Signup(selenium).register()

    book.wait_for_page_to_load()
    while book.notification_present:
        book.notification.got_it()
    book.content.show_solutions()

    paragraph = random.choice(book.content.paragraphs)
    note = Utilities.random_string()
    book.content.highlight(target=paragraph,
                           offset=Highlight.ENTIRE,
                           color=Color.GREEN,
                           note=note,
                           close_box=False)

    # WHEN: they use the context menu to edit the note
    # AND:  change the note text in the text box
    # AND:  click the "Save" button
    book.content.highlight_box.edit_note()

    new_note = Utilities.random_string(length=75)
    book.content.highlight_box.note = new_note

    book.content.highlight_box.save()

    # THEN: the edit note is closed
    # AND:  the display note is displayed
    # AND:  the new note text is displayed
    assert(not book.content.highlight_box.is_edit_box), \
        "the edit note box is still open"

    assert(book.content.highlight_box.is_display_box), \
        "the display box is not shown"

    assert(book.content.highlight_box.note == new_note), \
        "the current note does not match the new note content"


@markers.test_case("C591693")
@markers.highlighting
@markers.skip_test(reason="test mechanics covered by C591691")
def cancel_after_editing_a_note():
    """Cancel a note edit after changing the text but before saving it."""


@markers.test_case("C591694")
@markers.highlighting
@markers.parametrize(
    "book_slug,page_slug", [
        ("microbiology",
         "1-introduction")])
@markers.desktop_only
def clicking_a_note_highlight_color_doesnt_change_the_highlight(
        selenium, base_url, book_slug, page_slug):
    """No change is made when reselecting a highlight color for a note."""
    # GIVEN: a book section is displayed
    # AND:   a user is logged in
    # AND:   all content is visible
    # AND:   some content is highlighted with a note
    # AND:   the highlight note is visible
    book = Content(selenium, base_url,
                   book_slug=book_slug, page_slug=page_slug).open()

    while book.notification_present:
        book.notification.got_it()
    book.navbar.click_login()
    name, email = Signup(selenium).register()

    book.wait_for_page_to_load()
    while book.notification_present:
        book.notification.got_it()
    book.content.show_solutions()

    paragraph = random.choice(book.content.paragraphs)
    note = Utilities.random_string()
    highlight_color = Color.GREEN
    book.content.highlight(target=paragraph,
                           offset=Highlight.ENTIRE,
                           color=highlight_color,
                           note=note,
                           close_box=False)
    highlight_id = book.content.highlight_ids[0]

    # WHEN: they use the context menu to edit the note
    # AND:  click the same color button as the highlight
    book.content.highlight_box.edit_note()

    book.content.highlight_box.toggle_color(highlight_color)

    # THEN: the edit note remains open
    # AND:  the note text is unchanged
    # AND:  the highlighted text remains the original color
    assert(book.content.highlight_box.is_edit_box), \
        "the edit note box did not remain open"

    assert(book.content.highlight_box.note == note), \
        "the note text changed"

    highlight_classes = (book.content
                         .get_highlight(by_id=highlight_id)[0]
                         .get_attribute("class"))
    current_color = Color.from_html_class(highlight_classes)
    assert(current_color == highlight_color), \
        "the current highlight color does not match the original color"


@markers.test_case("C591695")
@markers.highlighting
@markers.parametrize(
    "book_slug,page_slug", [
        ("microbiology",
         "1-introduction")])
@markers.desktop_only
def clicking_a_new_note_highlight_color_changes_the_highlight(
        selenium, base_url, book_slug, page_slug):
    """Change a highlight with note color without saving it."""
    # GIVEN: a book section is displayed
    # AND:   a user is logged in
    # AND:   all content is visible
    # AND:   some content is highlighted with a note
    # AND:   the highlight note is visible
    book = Content(selenium, base_url,
                   book_slug=book_slug, page_slug=page_slug).open()

    while book.notification_present:
        book.notification.got_it()
    book.navbar.click_login()
    name, email = Signup(selenium).register()

    book.wait_for_page_to_load()
    while book.notification_present:
        book.notification.got_it()
    book.content.show_solutions()

    paragraph = random.choice(book.content.paragraphs)
    note = Utilities.random_string()
    initial_highlight_color = Color.GREEN
    book.content.highlight(target=paragraph,
                           offset=Highlight.ENTIRE,
                           color=initial_highlight_color,
                           note=note,
                           close_box=False)
    highlight_id = book.content.highlight_ids[0]

    # WHEN: they use the context menu to edit the note
    # AND:  click a new color button as the highlight
    book.content.highlight_box.edit_note()

    new_highlight_color = Color.PINK
    book.content.highlight_box.toggle_color(new_highlight_color)

    # THEN: the edit note remains open
    # AND:  the note text is unchanged
    # AND:  the highlighted text now shows the new color
    assert(book.content.highlight_box.is_edit_box), \
        "the edit note box did not remain open"

    assert(book.content.highlight_box.note == note), \
        "the note text changed"

    highlight_classes = (book.content
                         .get_highlight(by_id=highlight_id)[0]
                         .get_attribute("class"))
    current_color = Color.from_html_class(highlight_classes)
    assert(current_color == new_highlight_color), \
        "the current highlight color does not match the new color"

    # WHEN: the page is refreshed
    book = book.reload()

    # THEN: the new color is retained
    highlight_classes = (book.content
                         .get_highlight(by_id=highlight_id)[0]
                         .get_attribute("class"))
    current_color = Color.from_html_class(highlight_classes)
    assert(current_color == new_highlight_color), \
        "the reloaded highlight color does not match the new color"


@markers.test_case("C591696")
@markers.highlighting
@markers.skip_test(reason="requires testing a temp pdf document")
def print_preview_shows_highlights():
    """Highlights remain under a print preview PDF."""


@markers.test_case("C591697")
@markers.highlighting
@markers.parametrize(
    "book_slug,page_slug", [
        ("microbiology",
         "1-introduction")])
@markers.desktop_only
def clicking_outside_edit_box_doesnt_close_when_note_not_saved(
        selenium, base_url, book_slug, page_slug):
    """Clicking outside of the highlight box doesn't close it when unsaved."""
    # GIVEN: a book section is displayed
    # AND:   a user is logged in
    # AND:   all content is visible
    # AND:   some content is highlighted
    book = Content(selenium, base_url,
                   book_slug=book_slug, page_slug=page_slug).open()

    while book.notification_present:
        book.notification.got_it()
    book.navbar.click_login()
    name, email = Signup(selenium).register()

    book.wait_for_page_to_load()
    while book.notification_present:
        book.notification.got_it()
    book.content.show_solutions()

    paragraph = random.choice(book.content.paragraphs)
    highlight_color = Color.BLUE
    book.content.highlight(target=paragraph,
                           offset=Highlight.ENTIRE,
                           color=highlight_color,
                           note="",
                           close_box=False)

    # WHEN: they add a note to the highlight without saving it
    # AND:  click outside the edit box
    note = Utilities.random_string()
    book.content.highlight_box.note = note

    book.content.close_edit_note_box()

    # THEN: the edit box remains open
    assert(book.content.highlight_box.is_edit_box), \
        "the edit note box did not remain open"


@markers.test_case("C591698")
@markers.highlighting
@markers.skip_test(
    reason="mobile requirements changed - changing resolution does not help"
)
@markers.parametrize(
    "book_slug,page_slug", [
        ("microbiology",
         "1-introduction")])
@markers.mobile_only
def read_only_display_card_is_shown_when_highlight_clicked_in_mobile(
        selenium, base_url, book_slug, page_slug):
    """Read-only display card is shown when the mobile highlight is clicked."""
    # GIVEN: a book section is displayed
    # AND:   a user is logged in
    # AND:   all content is visible
    # AND:   some content is highlighted with a note
    book = Content(selenium, base_url,
                   book_slug=book_slug, page_slug=page_slug).open()

    while book.notification_present:
        book.notification.got_it()
    book.navbar.click_login()
    name, email = Signup(selenium).register()

    book.wait_for_page_to_load()
    while book.notification_present:
        book.notification.got_it()
    book.content.show_solutions()

    # making a highlight requires a non-mobile window width temporarily
    width, height = book.get_window_size()
    if width <= DESKTOP[0]:
        selenium.set_window_size(width=DESKTOP[0], height=height)
    paragraph = random.choice(book.content.paragraphs)
    note = Utilities.random_string()
    initial_highlight_color = Color.GREEN
    book.content.highlight(target=paragraph,
                           offset=Highlight.ENTIRE,
                           color=initial_highlight_color,
                           note=note)
    highlight_id = book.content.highlight_ids[0]
    if width != DESKTOP[0]:
        # reset the window width for a mobile test
        selenium.set_window_size(width=width, height=height)

    # WHEN: they click the highlight
    highlight = book.content.get_highlight(by_id=highlight_id)[0]
    Utilities.click_option(selenium, element=highlight, scroll_to=-105)

    # THEN: the display card is shown at the bottom of the screen
    # AND:  the highlight is focused
    # AND:  the context menu is not available (read-only mode)
    assert(book.content.highlight_box.is_open), "Highlight box not open"

    assert("Display" in
           book.content.highlight_box.root.get_attribute("class")), \
        "highlight box is not a DisplayNote"
    assert("focus" in book.content.highlights[0].get_attribute("class")), \
        "highlight is not currently focused"

    assert(not book.content.highlight_box.content_menu_available), \
        "context menu is displayed"

    # WHEN: they click the close 'x' in the display card
    book.content.highlight_box.close()

    # THEN: the display card closes
    # AND:  the highlight is no longer in focus
    with pytest.raises(NoSuchElementException) as ex:
        book.content.highlight_box
    assert("No open highlight boxes found" in str(ex.value)), \
        "Display note still open"

    highlight = book.content.get_highlight(by_id=highlight_id)[0]
    assert("focus" not in highlight.get_attribute("class")), \
        "highlight is still in focus"


@markers.test_case("C591699")
@markers.highlighting
@markers.mobile_only
@markers.parametrize(
    "book_slug,page_slug",
    [("microbiology", "1-introduction")]
)
def read_only_display_card_closes_when_clicking_content_in_mobile(
        selenium, base_url, book_slug, page_slug):
    """Clicking outside the display card closes the card on mobile."""
    # GIVEN: a book section is displayed
    # AND:   a user is logged in
    # AND:   all content is visible
    # AND:   some content is highlighted with a note
    # AND:   the highlight note card is displayed
    book = Content(selenium, base_url,
                   book_slug=book_slug, page_slug=page_slug).open()

    while book.notification_present:
        book.notification.got_it()
    book.navbar.click_login()
    name, email = Signup(selenium).register()

    book.wait_for_page_to_load()
    while book.notification_present:
        book.notification.got_it()
    book.content.show_solutions()

    # making a highlight requires a non-mobile window width temporarily
    width, height = book.get_window_size()
    if width <= DESKTOP[0]:
        selenium.set_window_size(width=DESKTOP[0], height=height)
    paragraph = random.choice(book.content.paragraphs)
    note = Utilities.random_string()
    initial_highlight_color = Color.YELLOW
    book.content.highlight(target=paragraph,
                           offset=Highlight.ENTIRE,
                           color=initial_highlight_color,
                           note=note)
    highlight_id = book.content.highlight_ids[0]
    if width != DESKTOP[0]:
        # reset the window width for a mobile test
        selenium.set_window_size(width=width, height=height)

    highlight = book.content.get_highlight(by_id=highlight_id)[0]
    Utilities.click_option(selenium, element=highlight, scroll_to=-105)

    # WHEN: they click outside of the display card
    book.content.close_edit_note_box()

    # THEN: the display card closes
    # AND:  the highlight is no longer in focus
    with pytest.raises(NoSuchElementException) as ex:
        book.content.highlight_box
    assert("No open highlight boxes found" in str(ex.value)), \
        "Display note still open"

    highlight = book.content.get_highlight(by_id=highlight_id)[0]
    assert("focus" not in highlight.get_attribute("class")), \
        "highlight is still in focus"


@markers.test_case("C591700")
@markers.skip_test(
    reason="mobile requirements changed - changing resolution does not help"
)
@markers.highlighting
@markers.mobile_only
@markers.parametrize(
    "book_slug,page_slug",
    [("microbiology", "1-introduction")]
)
def mobile_display_card_scrolls_for_long_notes(
        selenium, base_url, book_slug, page_slug):
    """A display card with a long note can be scrolled."""
    # GIVEN: a book section is displayed
    # AND:   a user is logged in
    # AND:   all content is visible
    # AND:   some content is highlighted with a long note
    # AND:   the highlight note card is displayed
    book = Content(selenium, base_url,
                   book_slug=book_slug, page_slug=page_slug).open()

    while book.notification_present:
        book.notification.got_it()
    book.navbar.click_login()
    name, email = Signup(selenium).register()

    book.wait_for_page_to_load()
    while book.notification_present:
        book.notification.got_it()
    book.content.show_solutions()

    # making a highlight requires a non-mobile window width temporarily
    width, height = book.get_window_size()
    if width <= DESKTOP[0]:
        selenium.set_window_size(width=DESKTOP[0], height=height)
    paragraph = random.choice(book.content.paragraphs)
    note = Utilities.random_string(length=1000)
    initial_highlight_color = Color.YELLOW
    book.content.highlight(target=paragraph,
                           offset=Highlight.ENTIRE,
                           color=initial_highlight_color,
                           note=note)
    highlight_id = book.content.highlight_ids[0]
    if width != DESKTOP[0]:
        # reset the window width for a mobile test
        selenium.set_window_size(width=width, height=height)

    highlight = book.content.get_highlight(by_id=highlight_id)[0]
    Utilities.click_option(selenium, element=highlight, scroll_to=-105)

    # WHEN:

    # THEN: the note card is scrollable
    assert(Utilities.has_scroll_bar(
        selenium, book.content.highlight_box.display_note)), \
        "scroll bar not present within the note card display"

    # WHEN: the main content is scrolled
    Utilities.scroll_to(selenium, element=book.attribution.root)

    # THEN: the note card is still visible
    assert(book.content.highlight_box.is_open), \
        "note card not open"


@markers.test_case("C591701")
@markers.highlighting
@markers.mobile_only
@markers.parametrize(
    "book_slug, page_slug",
    [("microbiology", "1-introduction")]
)
def open_note_card_after_searching_for_term_in_highlight(
        selenium, base_url, book_slug, page_slug):
    """Clicking the searched text within a highlight opens the note."""
    # GIVEN: a book section is displayed
    # AND:   a user is logged in
    # AND:   all content is visible
    # AND:   some content is highlighted with a note
    book = Content(selenium, base_url,
                   book_slug=book_slug, page_slug=page_slug).open()

    while book.notification_present:
        book.notification.got_it()
    book.navbar.click_login()
    name, email = Signup(selenium).register()

    book.wait_for_page_to_load()
    while book.notification_present:
        book.notification.got_it()
    book.content.show_solutions()

    # making a highlight requires a non-mobile window width temporarily
    width, height = book.get_window_size()
    if width <= DESKTOP[0]:
        selenium.set_window_size(width=DESKTOP[0], height=height)
    paragraph = random.choice(book.content.paragraphs)
    note = Utilities.random_string()
    initial_highlight_color = Color.YELLOW
    book.content.highlight(target=paragraph,
                           offset=Highlight.ENTIRE,
                           color=initial_highlight_color,
                           note=note)
    highlight_id = book.content.highlight_ids[0]
    if width != DESKTOP[0]:
        # reset the window width for a mobile test
        selenium.set_window_size(width=width, height=height)

    # WHEN: a search for a term within the highlight is performed
    # AND:  the section with the highlight is selected from the search results
    phrase = re.search(r"\w{10,}", paragraph.text)
    if phrase is None:
        raise ValueError("No (10+) search phrase found in the paragraph")
    phrase = phrase.group(0)
    if book.is_desktop:
        book.topbar.search_for(phrase)
    else:
        book.mobile_search_toolbar.search_for(phrase)
    search_results = book.search_sidebar.search_results(phrase)
    if not search_results:
        raise ValueError("No search results found")

    Utilities.click_option(selenium, element=search_results[0])
    phrase_searched = book.content.find_elements(
        By.XPATH, XPATH_SEARCH.format(term=phrase))

    # THEN: the search results are focused over the user highlight
    assert(phrase_searched), \
        f"the highlight phrase ('{phrase}') was not found on the page"
    assert("focus" in phrase_searched[0].get_attribute("class")), \
        "search phrase does not have the search focus highlight"
    assert(highlight_id in book.content.highlight_ids), \
        "the original highlight ID not found on the page"

    # WHEN: they click the highlight
    highlight = book.content.get_highlight(by_id=highlight_id)[0]
    Utilities.click_option(selenium, element=highlight, scroll_to=-180)

    # THEN: the note display card is opened
    # AND:  the search results are still highlighted
    assert(phrase_searched), \
        f"the highlight phrase ('{phrase}') was not found on the page"

    assert("focus" in phrase_searched[0].get_attribute("class")), \
        "search phrase does not have the search focus highlight"
    assert(highlight_id in book.content.highlight_ids), \
        "the original highlight ID not found on the page"


@markers.test_case("C591702")
@markers.highlighting
@markers.mobile_only
@markers.parametrize(
    "book_slug, page_slug",
    [("microbiology", "1-introduction")]
)
def open_a_second_note_when_the_first_is_already_displayed(
        selenium, base_url, book_slug, page_slug):
    """Click a second highlighted note when one is already open on mobile."""
    # GIVEN: a book section is displayed
    # AND:   a user is logged in
    # AND:   all content is visible
    # AND:   two sections of content are highlighted with a note each
    # AND:   the first highlight note card is displayed
    book = Content(selenium, base_url,
                   book_slug=book_slug, page_slug=page_slug).open()

    while book.notification_present:
        book.notification.got_it()
    book.navbar.click_login()
    name, email = Signup(selenium).register()

    book.wait_for_page_to_load()
    while book.notification_present:
        book.notification.got_it()
    book.content.show_solutions()

    # making a highlight requires a non-mobile window width temporarily
    width, height = book.get_window_size()
    if width <= DESKTOP[0]:
        selenium.set_window_size(width=DESKTOP[0], height=height)
    paragraphs = random.sample(book.content.paragraphs, 2)
    note_one = Utilities.random_string()
    first_highlight_color = Color.YELLOW
    book.content.highlight(target=paragraphs[0],
                           offset=Highlight.ENTIRE,
                           color=first_highlight_color,
                           note=note_one)
    highlight_id_one = book.content.highlight_ids[0]
    note_two = Utilities.random_string()
    second_highlight_color = Color.BLUE
    book.content.highlight(target=paragraphs[1],
                           offset=Highlight.ENTIRE,
                           color=second_highlight_color,
                           note=note_two)
    highlight_ids = book.content.highlight_ids
    highlight_id_two = highlight_ids[1] \
        if highlight_id_one == highlight_ids[0] \
        else highlight_ids[0]
    if width != DESKTOP[0]:
        # reset the window width for a mobile test
        selenium.set_window_size(width=width, height=height)

    highlight_one = book.content.get_highlight(by_id=highlight_id_one)[0]
    Utilities.click_option(selenium, element=highlight_one, scroll_to=-105)

    # WHEN: they click the second highlight
    highlight_two = book.content.get_highlight(by_id=highlight_id_two)[0]
    Utilities.click_option(selenium, element=highlight_two, scroll_to=-105)
    sleep(1.0)

    # THEN: the second highlight is focused
    # AND:  the second note is displayed
    # AND:  the first highlight is not focused
    assert("focus" in highlight_two.get_attribute("class")), \
        "second highlight not focused"

    assert(book.content.highlight_box.note == note_two), \
        "displayed note content does not match the second note text"

    assert("focus" not in highlight_one.get_attribute("class")), \
        "first highlight still focused"


@markers.test_case("C591703")
@markers.skip_test(reason="requires testing a temp pdf document")
@markers.highlighting
def print_preview_while_note_card_is_displayed():
    """Highlight note card not displayed in print preview PDF."""


@markers.test_case("C591704")
@markers.skip_test(reason="test mechanics covered by C591697")
@markers.highlighting
def clicking_outside_edit_box_doesnt_close_when_note_not_saved_2():
    """Cancel a note edit after changing the text but before saving it."""


@markers.test_case("C591705")
@markers.skip_test(reason="not prioritized")
@markers.highlighting
def content_highlight_and_note_are_copyable():
    """Copy content, highlighted content, and highlight notes."""


@markers.test_case("C592002")
@markers.desktop_only
@markers.highlighting
@markers.parametrize("page_slug", [("preface")])
def top_of_create_note_box_is_even_with_top_of_content_highlight(
        selenium, base_url, book_slug, page_slug):
    """The top of the create box is even with the top of the highlight.

    .. note::
       Table of Contents is closed

    """
    # GIVEN: a book section is displayed
    # AND:   a user is logged in
    # AND:   all content is visible
    # AND:   the table of contents is closed
    book = Content(selenium, base_url,
                   book_slug=book_slug, page_slug=page_slug).open()

    while book.notification_present:
        book.notification.got_it()
    book.navbar.click_login()
    name, email = Signup(selenium).register()

    book.wait_for_page_to_load()
    while book.notification_present:
        book.notification.got_it()
    book.content.show_solutions()

    if book.sidebar.header.is_displayed:
        book.sidebar.header.click_toc_toggle_button()

    # WHEN: they select some content
    paragraph = random.choice(book.content.paragraphs)
    book.content.highlight(target=paragraph,
                           offset=Highlight.ENTIRE,
                           color=Color.YELLOW,
                           note=Utilities.random_string(),
                           close_box=False)
    highlight_id = book.content.highlight_ids[0]

    bounds = []
    for highlight in book.content.get_highlight(by_id=highlight_id):
        bounds.append(Highlight.get_position(selenium, highlight))
    highlight_top = reduce(lambda x, y: min(x, y),
                           map(lambda x: x.get("top"), bounds))
    highlight_box_top = Highlight.get_position(
        selenium, book.content.highlight_box.root
        ).get("top")
    within = highlight_top * 0.01

    # THEN: the top of the create note card is shown in line with the top of
    #       the highlighted content
    assert(isclose(highlight_top, highlight_box_top, rel_tol=within)), (
        r"top of the highlight box not within 1% of the "
        "top of the highlight ({low} <= {target} <= {high})".format(
            low=highlight_top - within,
            high=highlight_top + within,
            target=highlight_box_top))


@markers.test_case("C592003")
@markers.skip_test(reason="not prioritized")
@markers.highlighting
def top_of_edit_note_box_is_even_with_top_of_content_highlight():
    """The top of the edit box is even with the top of the highlight.

    .. note::
       Table of Contents is closed

    """


@markers.test_case("C592004")
@markers.desktop_only
@markers.highlighting
@markers.parametrize("page_slug", [("preface")])
def top_of_create_note_box_is_even_with_bottom_of_content_highlight(
        selenium, base_url, book_slug, page_slug):
    """The top of the create box is even with the bottom of the highlight.

    .. note::
       Table of Contents is open

    """
    # GIVEN: a book section is displayed
    # AND:   a user is logged in
    # AND:   all content is visible
    # AND:   the table of contents is open
    book = Content(selenium, base_url,
                   book_slug=book_slug, page_slug=page_slug).open()

    while book.notification_present:
        book.notification.got_it()
    book.navbar.click_login()
    name, email = Signup(selenium).register()

    book.wait_for_page_to_load()
    while book.notification_present:
        book.notification.got_it()
    book.content.show_solutions()

    if not book.sidebar.header.is_displayed:
        book.sidebar.header.click_toc_toggle_button()

    # WHEN: they select some content
    paragraph = random.choice(book.content.paragraphs)
    book.content.highlight(target=paragraph,
                           offset=Highlight.ENTIRE,
                           color=Color.GREEN,
                           note=Utilities.random_string(),
                           close_box=False)
    highlight_id = book.content.highlight_ids[0]

    bounds = []
    for highlight in book.content.get_highlight(by_id=highlight_id):
        bounds.append(Highlight.get_position(selenium, highlight))
    highlight_bottom = reduce(lambda x, y: min(x, y),
                              map(lambda x: x.get("bottom"), bounds))
    highlight_box_top = Highlight.get_position(
        selenium, book.content.highlight_box.root
        ).get("top")
    within = highlight_bottom * 0.01

    # THEN: the top of the create note card is shown in line with the bottom
    #       of the highlighted content
    assert(isclose(highlight_bottom, highlight_box_top, rel_tol=within)), (
        r"top of the highlight box not within 1% of the "
        "bottom of the highlight ({low} <= {target} <= {high})".format(
            low=highlight_bottom - within,
            high=highlight_bottom + within,
            target=highlight_box_top))


@markers.test_case("C592005")
@markers.skip_test(reason="not prioritized")
@markers.highlighting
def top_of_edit_note_box_is_even_with_bottom_of_content_highlight():
    """The top of the edit box is even with the bottom of the highlight.

    .. note::
       Table of Contents is open

    """


@markers.test_case("C592006")
@markers.skip_test(reason="not prioritized")
@markers.highlighting
def clicking_outside_create_note_box_closes_the_create_box():
    """Clicking outside an empty create note box closes the box."""


@markers.test_case("C592007")
@markers.desktop_only
@markers.highlighting
@markers.parametrize(
    "book_slug, page_slug",
    [("microbiology", "1-introduction")]
)
def change_color_of_highlighted_text(
        selenium, base_url, book_slug, page_slug):
    """Change the color of a content highlight."""
    # GIVEN: a book section is displayed
    # AND:   a user is logged in
    # AND:   all content is visible
    # AND:   some content is highlighted without a note
    # AND:   the highlight note is visible
    book = Content(selenium, base_url,
                   book_slug=book_slug, page_slug=page_slug).open()

    while book.notification_present:
        book.notification.got_it()
    book.navbar.click_login()
    name, email = Signup(selenium).register()

    book.wait_for_page_to_load()
    while book.notification_present:
        book.notification.got_it()
    book.content.show_solutions()

    paragraph = random.choice(book.content.paragraphs)
    initial_highlight_color = Color.YELLOW
    book.content.highlight(target=paragraph,
                           offset=Highlight.ENTIRE,
                           color=initial_highlight_color,
                           close_box=False)
    highlight_id = book.content.highlight_ids[0]

    for color in list(set(Color.options()) - set([initial_highlight_color])):
        # WHEN: they click a new color button
        book.content.highlight_box.toggle_color(color)

        # THEN: the edit note remains open
        # AND:  the highlighted text now shows the new color
        assert(book.content.highlight_box.is_edit_box), \
            "the edit note box did not remain open"

        highlight_classes = (book.content
                             .get_highlight(by_id=highlight_id)[0]
                             .get_attribute("class"))
        current_color = Color.from_html_class(highlight_classes)
        assert(current_color == color), \
            "the current highlight color does not match the new color"

    # WHEN: they click the initial color button
    # AND:  click outside of the create note box
    book.content.highlight_box.toggle_color(initial_highlight_color)

    book.content.close_edit_note_box()

    # THEN: the create note box is closed
    # AND:  the highlight color is the same as the initial color
    try:
        book.content.highlight_box
        pytest.fail("the edit note box is still open")
    except NoSuchElementException:
        pass

    highlight_classes = (book.content
                         .get_highlight(by_id=highlight_id)[0]
                         .get_attribute("class"))
    current_color = Color.from_html_class(highlight_classes)
    assert(current_color == initial_highlight_color), \
        "the current highlight color does not match the initial color"


@markers.test_case("C592008")
@markers.skip_test(reason="not prioritized")
@markers.highlighting
def create_note_box_position_and_size_for_long_notes():
    """Verify the create note box position for long notes."""
# fmt: on
