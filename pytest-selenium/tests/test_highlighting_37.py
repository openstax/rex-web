"""Reading Experience highlighting."""

import random

import pytest
from selenium.common.exceptions import NoSuchElementException

from pages.accounts import Login, Signup
from pages.content import Content
from tests import markers
from tests.conftest import DESKTOP
from utils.utility import Color, Highlight, Utilities


@markers.test_case("C591999")
@markers.desktop_only
@markers.highlighting
@markers.parametrize(
    "book_slug, page_slug",
    [("astronomy", "1-introduction")]
)
def highlight_is_not_created_until_a_color_is_selected(
        selenium, base_url, book_slug, page_slug):
    """A highlight is not created until the highlight color is selected."""
    # GIVEN: the Astronomy book section 1.0 introduction is displayed
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
@markers.desktop_only
@markers.highlighting
@markers.parametrize(
    "book_slug, page_slug",
    [("microbiology", "1-introduction")]
)
def color_auto_selected_if_a_note_is_added(
        selenium, base_url, book_slug, page_slug):
    """The first highlight color is auto-selected if a note is typed."""
    # GIVEN: the Astronomy book section 1.0 introduction is displayed
    # AND:   a user is logged in
    # AND:   all content is visible
    # AND:   some content is selected
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

    paragraph = random.choice(book.content.paragraphs)
    book.content.highlight(target=paragraph,
                           offset=Highlight.RANDOM,
                           color=None)

    expected_color = Color.YELLOW

    # WHEN: they type a note in the create note box
    book.content.highlight_box.note = Utilities.random_string()
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


@markers.test_case("C592625")
@markers.desktop_only
@markers.highlighting
@markers.parametrize(
    "book_slug, page_slug",
    [("microbiology", "1-introduction")]
)
def signup_as_a_new_user_via_the_highlight_nudge_overlay(
        selenium, base_url, book_slug, page_slug):
    """Signup as a new user using the highlight nudge overlay."""
    # GIVEN: the Astronomy book section 1.0 introduction is displayed
    # AND:   some content is selected
    book = Content(selenium, base_url,
                   book_slug=book_slug, page_slug=page_slug).open()
    while book.notification_present:
        book.notification.got_it()

    paragraph = random.choice(book.content.paragraphs)
    book.content.highlight(target=paragraph,
                           offset=Highlight.RANDOM,
                           color=None)

    initial_page_url = selenium.current_url

    # WHEN: they click the "Log in" button on the highlight nudge
    book.content.highlight_box.log_in()

    # THEN: the Accounts screen is displayed
    assert("accounts" in selenium.current_url), "not viewing the Accounts page"
    assert("Log in to your OpenStax account" in selenium.page_source), \
        "Accounts header not found"

    # WHEN: they sign up for an account
    Signup(selenium).register()

    book.wait_for_page_to_load()
    while book.notification_present:
        book.notification.got_it()
    book.content.show_solutions()

    # THEN: the same book page as the log in nudge is displayed
    # AND:  the user is logged in
    assert(selenium.current_url == initial_page_url), \
        "not returned to the correct book section page after account sign up"

    assert(book.navbar.user_is_logged_in), "user not logged in"

    # WHEN: they select some content
    paragraph = random.choice(book.content.paragraphs)
    book.content.highlight(target=paragraph,
                           offset=Highlight.RANDOM,
                           color=None)

    # THEN: the create note box is displayed
    try:
        book.content.highlight_box
    except NoSuchElementException:
        pytest.fail("the create note box is not open")
    assert(not book.content.highlight_box.login_overlay_present), \
        "log in nudge overlay found"


@markers.test_case("C592626")
@markers.highlighting
@markers.parametrize(
    "book_slug, page_slug",
    [("microbiology", "1-introduction")]
)
@markers.smoke_test
def display_highlights_for_returning_users(
        selenium, base_url, book_slug, page_slug):
    """Existing highlights are displayed for returning users."""
    # GIVEN: a book section is displayed
    # AND:   a user is logged in
    # AND:   all content is visible
    # AND:   some content is highlighted
    # AND:   some content is highlighted with a note
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
    first_highlight_color = Color.YELLOW
    book.content.highlight(target=paragraphs[0],
                           offset=Highlight.ENTIRE,
                           color=first_highlight_color)
    highlight_id_one = book.content.highlight_ids[0]

    second_highlight_color = Color.BLUE
    book.content.highlight(target=paragraphs[1],
                           offset=Highlight.ENTIRE,
                           color=second_highlight_color,
                           note=Utilities.random_string())
    highlight_ids = book.content.highlight_ids
    highlight_id_two = highlight_ids[1] \
        if highlight_id_one == highlight_ids[0] \
        else highlight_ids[0]

    if width != DESKTOP[0]:
        # reset the window width for a mobile test
        selenium.set_window_size(width=width, height=height)

    # WHEN: they log out
    book.navbar.click_user_name()
    book.navbar.click_logout()

    # THEN: the highlights and notes are no longer displayed
    assert(not book.content.highlight_count), \
        "highlights found without a logged in user"

    # WHEN: they log in
    book.navbar.click_login()
    Login(selenium).login(email.address, password)
    book.wait_for_page_to_load()
    while book.notification_present:
        book.notification.got_it()
    book.content.show_solutions()

    highlight_ids = book.content.highlight_ids

    # THEN: the highlights and notes are displayed
    assert(highlight_ids), "no highlights found after log in"
    assert(highlight_id_one in highlight_ids), "highlight not found"
    assert(highlight_id_two in highlight_ids), "highlight with note not found"
