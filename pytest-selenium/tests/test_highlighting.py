"""Reading Experience highlighting."""

import random
import re
from string import digits, ascii_letters

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


def random_string(length: int = 20):
    """Return a random string of a specified length for use in notes."""
    characters = ascii_letters + digits + "      \n\n"
    return "".join(random.choices(population=characters, k=length))


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

    initial_highlight_count = book.content.highlight_count
    total_highlight_count = initial_highlight_count

    # WHEN: any text content is selected with the mouse
    # AND:  a highlight color button is clicked
    paragraph = random.choice(book.content.paragraphs)
    book.content.highlight(paragraph, Highlight.RANDOM)
    new_highlight_count = book.content.highlight_count

    # THEN: the text is highlighted
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
    assert(new_highlight_count > total_highlight_count), \
        "No new highlight(s) found (figure)"
    total_highlight_count = new_highlight_count

    # WHEN: any table is selected with the mouse
    # AND:  a highlight color button is clicked
    table = random.choice(book.content.tables)
    book.content.highlight(table, (100, 200))
    new_highlight_count = book.content.highlight_count

    # THEN: the table is highlighted
    assert(new_highlight_count > total_highlight_count), \
        "No new highlight(s) found (table)"
    total_highlight_count = new_highlight_count

    # WHEN: any bulleted or numbered list is selected with the mouse
    # AND:  a highlight color button is clicked
    _list = random.choice(book.content.lists)
    book.content.highlight(_list, Highlight.ENTIRE)
    new_highlight_count = book.content.highlight_count

    # THEN: the list is highlighted
    assert(new_highlight_count > total_highlight_count), \
        "No new highlight(s) found (list)"
    total_highlight_count = new_highlight_count

    # WHEN: any math content is selected with the mouse
    # AND:  a highlight color button is clicked
    equation = random.choice(book.content.math)
    book.content.highlight(equation)
    new_highlight_count = book.content.highlight_count

    # THEN: the math content is highlighted
    assert(new_highlight_count > total_highlight_count), \
        "No new highlight(s) found (math)"
    total_highlight_count = new_highlight_count

    # WHEN: the page is refreshed
    book = book.reload()

    # THEN: all of the preceding highlights should still be highlighted
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
@markers.parametrize("page_slug", [("preface")])
@markers.desktop_only
def test_highlight_stays_on_navigation(
        selenium, base_url, book_slug, page_slug):
    """Highlights remain while navigating between pages."""
    # GIVEN: a book preface page is displayed
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
@markers.parametrize(
    "book_slug,page_slug", [
        ("astronomy",
         "1-1-the-nature-of-astronomy")])
def test_search_term_colored_within_a_highlight(
        selenium, base_url, book_slug, page_slug):
    """Search highlights should be over user highlights."""
    # GIVEN: a book section is displayed
    # AND:   a user is logged in
    # AND:   all content is visible
    # AND:   some content is highlighted
    book = Content(selenium, base_url,
                   book_slug=book_slug, page_slug=page_slug).open()

    book.navbar.click_login()
    name, email = Signup(selenium).register()

    book.wait_for_page_to_load()
    if book.notification_present:
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
        book.toolbar.search_for(phrase)
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
@markers.parametrize(
    "book_slug,page_slug", [
        ("astronomy",
         "1-1-the-nature-of-astronomy")])
@markers.desktop_only
def test_user_highlight_over_search_term_highlight(
        selenium, base_url, book_slug, page_slug):
    """Search highlights should be over user highlights."""
    # GIVEN: a book section is displayed
    # AND:   a user is logged in
    # AND:   all content is visible
    # AND:   a search is performed
    book = Content(selenium, base_url,
                   book_slug=book_slug, page_slug=page_slug).open()

    book.navbar.click_login()
    name, email = Signup(selenium).register()

    book.wait_for_page_to_load()
    if book.notification_present:
        book.notification.got_it()
    book.content.show_solutions()

    paragraph = random.choice(book.content.paragraphs)
    phrase = re.search(r"\w{10,}", paragraph.text)
    if phrase is None:
        raise ValueError("No (10+) search phrase found in the paragraph")
    phrase = phrase.group(0)
    book.toolbar.search_for(phrase)
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


@markers.skip_test(reason="Expected result does not match current behavior")
@markers.test_case("C591686")
@markers.parametrize(
    "book_slug,page_slug", [
        ("microbiology",
         "1-introduction")])
@markers.desktop_only
def test_expanded_focussed_note_card_is_displayed_when_highlight_clicked(
        selenium, base_url, book_slug, page_slug):
    """Display the focussed note card after clicking a highlight."""
    # GIVEN: a book section is displayed
    # AND:   a user is logged in
    # AND:   all content is visible
    # AND:   some content is highlighted with a long note
    book = Content(selenium, base_url,
                   book_slug=book_slug, page_slug=page_slug).open()

    book.navbar.click_login()
    name, email = Signup(selenium).register()

    book.wait_for_page_to_load()
    if book.notification_present:
        book.notification.got_it()
    book.content.show_solutions()

    paragraph = random.choice(book.content.paragraphs)
    note = random_string(length=400)
    book.content.highlight(target=paragraph,
                           offset=Highlight.ENTIRE,
                           color=Color.GREEN,
                           note=note)

    # WHEN: they click on the highlighted text
    Utilities.click_option(selenium, element=book.content.highlights[0])

    # THEN: the note edit card appears in the expanded state to show all of the
    #       note
    # AND:  the highlighted text is in the focussed state
    # AND:  the entire note is visible and not hidden by the highlighted text
    #       or content unless the note exceeds the content height and a scroll
    #       bar is needed
    # AND:  the page scrolls appropriately to show the note if the highlight is
    #       present towards the bottom of the screen


@markers.test_case("C591687")
@markers.parametrize(
    "book_slug,page_slug", [
        ("microbiology",
         "1-introduction")])
@markers.desktop_only
def test_focussed_note_card_is_displayed_when_highlight_clicked(
        selenium, base_url, book_slug, page_slug):
    """Show the focussed note card when the user clicks a highlight."""
    # GIVEN: a book section is displayed
    # AND:   a user is logged in
    # AND:   all content is visible
    # AND:   some content is highlighted with a note
    book = Content(selenium, base_url,
                   book_slug=book_slug, page_slug=page_slug).open()

    book.navbar.click_login()
    name, email = Signup(selenium).register()

    book.wait_for_page_to_load()
    if book.notification_present:
        book.notification.got_it()
    book.content.show_solutions()

    paragraph = random.choice(book.content.paragraphs)
    note = random_string(length=100)
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
@markers.parametrize(
    "book_slug,page_slug", [
        ("microbiology",
         "1-introduction")])
@markers.desktop_only
def test_delete_a_highlight_and_note_using_the_context_menu(
        selenium, base_url, book_slug, page_slug):
    """Delete a highlight and associated note using the context menu."""
    # GIVEN: a book section is displayed
    # AND:   a user is logged in
    # AND:   all content is visible
    # AND:   some content is highlighted with a note
    # AND:   the highlight note is visible
    book = Content(selenium, base_url,
                   book_slug=book_slug, page_slug=page_slug).open()

    book.navbar.click_login()
    name, email = Signup(selenium).register()

    book.wait_for_page_to_load()
    if book.notification_present:
        book.notification.got_it()
    book.content.show_solutions()

    paragraph = random.choice(book.content.paragraphs)
    note = random_string(length=100)
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
@markers.parametrize(
    "book_slug,page_slug", [
        ("microbiology",
         "1-introduction")])
@markers.desktop_only
def test_delete_a_note_using_the_context_menu(
        selenium, base_url, book_slug, page_slug):
    """Delete a note from a highlight using the context menu."""
    # GIVEN: a book section is displayed
    # AND:   a user is logged in
    # AND:   all content is visible
    # AND:   some content is highlighted with a note
    # AND:   the highlight note is visible
    book = Content(selenium, base_url,
                   book_slug=book_slug, page_slug=page_slug).open()

    book.navbar.click_login()
    name, email = Signup(selenium).register()

    book.wait_for_page_to_load()
    if book.notification_present:
        book.notification.got_it()
    book.content.show_solutions()

    paragraph = random.choice(book.content.paragraphs)
    note = random_string(length=100)
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
@markers.parametrize(
    "book_slug,page_slug", [
        ("microbiology",
         "1-introduction")])
@markers.desktop_only
def test_cancel_deleting_a_highlight_using_the_context_menu(
        selenium, base_url, book_slug, page_slug):
    """Cancel deleting a highlight using the context menu."""
    # GIVEN: a book section is displayed
    # AND:   a user is logged in
    # AND:   all content is visible
    # AND:   some content is highlighted with a note
    # AND:   the highlight note is visible
    book = Content(selenium, base_url,
                   book_slug=book_slug, page_slug=page_slug).open()

    book.navbar.click_login()
    name, email = Signup(selenium).register()

    book.wait_for_page_to_load()
    if book.notification_present:
        book.notification.got_it()
    book.content.show_solutions()

    paragraph = random.choice(book.content.paragraphs)
    note = random_string(length=100)
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
@markers.parametrize(
    "book_slug,page_slug", [
        ("microbiology",
         "1-introduction")])
@markers.desktop_only
def test_cancel_deleting_a_note_using_the_context_menu(
        selenium, base_url, book_slug, page_slug):
    """Cancel deleting a highlight using the context menu."""
    # GIVEN: a book section is displayed
    # AND:   a user is logged in
    # AND:   all content is visible
    # AND:   some content is highlighted with a note
    # AND:   the highlight note is visible
    book = Content(selenium, base_url,
                   book_slug=book_slug, page_slug=page_slug).open()

    book.navbar.click_login()
    name, email = Signup(selenium).register()

    book.wait_for_page_to_load()
    if book.notification_present:
        book.notification.got_it()
    book.content.show_solutions()

    paragraph = random.choice(book.content.paragraphs)
    note = random_string(length=100)
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

    # THEN: the delete confirmation message is shown
    assert(book.content.highlight_box.delete_confirmation_visible), \
        "the confirmation box overlay is not visible"
    confirmation_text = book.content.highlight_box.delete_confirmation_text
    expected_text = "Are you sure you want to delete this note?"
    assert(confirmation_text == expected_text), \
        "the confirmation text does not match the expected content"

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
@markers.parametrize(
    "book_slug,page_slug", [
        ("microbiology",
         "1-introduction")])
@markers.desktop_only
def test_save_a_note_edit(selenium, base_url, book_slug, page_slug):
    """Save an edited note."""
    # GIVEN: a book section is displayed
    # AND:   a user is logged in
    # AND:   all content is visible
    # AND:   some content is highlighted with a note
    # AND:   the highlight note is visible
    book = Content(selenium, base_url,
                   book_slug=book_slug, page_slug=page_slug).open()

    book.navbar.click_login()
    name, email = Signup(selenium).register()

    book.wait_for_page_to_load()
    if book.notification_present:
        book.notification.got_it()
    book.content.show_solutions()

    paragraph = random.choice(book.content.paragraphs)
    note = random_string(length=100)
    book.content.highlight(target=paragraph,
                           offset=Highlight.ENTIRE,
                           color=Color.GREEN,
                           note=note,
                           close_box=False)

    # WHEN: they use the context menu to edit the note
    # AND:  change the note text in the text box
    # AND:  click the "Save" button
    book.content.highlight_box.edit_note()

    new_note = random_string(75)
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
@markers.skip_test(reason="test mechanics covered by C591691")
def test_cancel_after_editing_a_note(selenium, base_url):
    """Cancel a note edit after changing the text but before saving it."""


@markers.test_case("C591694")
@markers.parametrize(
    "book_slug,page_slug", [
        ("microbiology",
         "1-introduction")])
@markers.desktop_only
def test_clicking_a_note_highlight_color_doesnt_change_the_highlight(
        selenium, base_url, book_slug, page_slug):
    """Save an edited note."""
    # GIVEN: a book section is displayed
    # AND:   a user is logged in
    # AND:   all content is visible
    # AND:   some content is highlighted with a note
    # AND:   the highlight note is visible
    book = Content(selenium, base_url,
                   book_slug=book_slug, page_slug=page_slug).open()

    book.navbar.click_login()
    name, email = Signup(selenium).register()

    book.wait_for_page_to_load()
    if book.notification_present:
        book.notification.got_it()
    book.content.show_solutions()

    paragraph = random.choice(book.content.paragraphs)
    note = random_string(length=100)
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
