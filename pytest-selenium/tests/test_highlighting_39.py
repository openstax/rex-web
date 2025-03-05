"""Reading Experience highlighting."""
# fmt: off
import random

import pytest
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys

from pages.accounts import Signup
from pages.content import Content
from tests import markers
from tests.conftest import DESKTOP
from utils.utility import Color, Highlight, Utilities


HAS_INDICATOR = (
    "return window.getComputedStyle(arguments[0], ':after')"
    ".getPropertyValue('opacity') == '0.8';"
)


@markers.test_case("C592627")
@markers.desktop_only
@markers.highlighting
@markers.parametrize(
    "book_slug, page_slug",
    [("astronomy", "1-1-the-nature-of-astronomy")]
)
def keyboard_navigation_for_my_highlights_button_on_content_page(
        selenium, base_url, book_slug, page_slug):
    """Use keyboard navigation to open and close My Highlights and Notes."""
    # GIVEN: a book page is displayed
    # AND:   a user is logged in
    # AND:   all content is visible
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

    # WHEN: they select the search bar, tab twice and hit the return key
    (ActionChains(selenium)
        .click(book.topbar.search_textbox)
        .send_keys(Keys.TAB * 4)
        .send_keys(Keys.RETURN)
        .perform())

    # THEN: the My Highlights and Notes modal is displayed
    assert(book.my_highlights_open), \
        "My Highlights modal not open"
    assert(book.my_highlights.root.is_displayed()), \
        "My Highlights modal not displayed"

    # WHEN: they tab and hit the return key
    (ActionChains(selenium)
        .send_keys(Keys.TAB)
        .send_keys(Keys.RETURN)
        .perform())

    # THEN: the My Highlights and Notes modal is closed
    assert(not book.my_highlights_open), \
        "My Highlights modal is still open"

    # WHEN: they select the search bar, tab twice and hit the enter key
    (ActionChains(selenium)
        .click(book.topbar.search_textbox)
        .send_keys(Keys.TAB * 4)
        .send_keys(Keys.ENTER)
        .perform())

    # THEN: the My Highlights and Notes modal is displayed
    assert(book.my_highlights_open), \
        "My Highlights modal not open"
    assert(book.my_highlights.root.is_displayed()), \
        "My Highlights modal not displayed"

    # WHEN: they hit the escape key
    (ActionChains(selenium)
        .send_keys(Keys.ESCAPE)
        .perform())

    # THEN: the My Highlights and Notes modal is closed
    assert(not book.my_highlights_open), \
        "My Highlights modal is still open"


@markers.test_case("C592629")
@markers.desktop_only
@markers.highlighting
@markers.parametrize(
    "book_slug, page_slug",
    [("astronomy", "1-1-the-nature-of-astronomy")]
)
def open_my_highlights_for_non_logged_in_users_on_desktop(
        selenium, base_url, book_slug, page_slug):
    """Open the My Highlights and Notes modal for non-logged in users."""
    # GIVEN: a book page is displayed
    # AND:   all content is visible
    book = Content(selenium, base_url,
                   book_slug=book_slug, page_slug=page_slug).open()

    while book.notification_present:
        book.notification.got_it()
    book.content.show_solutions()

    # WHEN: they click on the My highlights navigation bar button
    my_highlights = book.toolbar.my_highlights()

    # THEN: the My Highlights and Notes modal is displayed
    # AND:  the log in nudge message is displayed
    assert(book.my_highlights_open), \
        "My Highlights modal not open"
    assert(my_highlights.root.is_displayed()), \
        "My Highlights modal not displayed"

    assert(my_highlights.log_in_available), \
        "log in link not found"

    # WHEN: they click on the 'Log in' link
    accounts = my_highlights.log_in()

    # THEN: the Accounts log in page is displayed
    assert("accounts" in accounts.current_url), \
        "not viewing an Accounts URL"
    assert("Log in to your OpenStax account" in accounts.source), \
        "Accounts log in page not displayed"


@markers.test_case("C592631")
@markers.highlighting
@markers.mobile_only
@markers.parametrize(
    "book_slug, page_slug",
    [("astronomy", "1-1-the-nature-of-astronomy")]
)
def open_my_highlights_for_non_logged_in_users_on_mobile(
        selenium, base_url, book_slug, page_slug):
    """Open the My Highlights and Notes modal for non-logged in users."""
    # GIVEN: a book page is displayed
    # AND:   all content is visible
    book = Content(selenium, base_url,
                   book_slug=book_slug, page_slug=page_slug).open()

    while book.notification_present:
        book.notification.got_it()
    book.content.show_solutions()

    # WHEN: they click on the My highlights navigation bar button
    my_highlights = book.toolbar.my_highlights()

    # THEN: the My Highlights and Notes modal is displayed
    # AND:  the log in link is available
    assert(book.my_highlights_open), \
        "My Highlights modal not open"
    assert(my_highlights.root.is_displayed()), \
        "My Highlights modal not displayed"

    assert(my_highlights.log_in_available), \
        "log in link not found"

    # WHEN: they click the 'x' button
    book = my_highlights.close()

    # THEN: the My Highlights and Notes modal is closed
    assert(not book.my_highlights_open), \
        "My Highlights modal is still open"


@markers.test_case("C592633")
@markers.highlighting
@markers.parametrize(
    "book_slug, page_slug",
    [("introductory-statistics",
      "2-2-histograms-frequency-polygons-and-time-series-graphs")]
)
def clicking_on_the_note_indicator_opens_the_note_card(
        selenium, base_url, book_slug, page_slug):
    """Open the note card for various highlights with notes."""
    # GIVEN: a book page is displayed
    # AND:   a user is logged in
    # AND:   all content is visible
    # AND:   several types of content are highlighted with notes
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
    if width < DESKTOP[0]:
        selenium.set_window_size(width=DESKTOP[0], height=height)

    highlight_options = [
        (random.choice(book.content.figures_and_captions),
         Utilities.random_string()),
        (random.choice(book.content.lists),
         Utilities.random_string()),
        (random.choice(book.content.math),
         Utilities.random_string()),
        (random.choice(book.content.paragraphs),
         Utilities.random_string()),
        (random.choice(book.content.tables),
         Utilities.random_string())
    ]
    highlight_list = {}
    for content, note in highlight_options:
        highlight_ids = book.content.highlight_ids
        book.content.highlight(target=content,
                               offset=Highlight.ENTIRE,
                               color=Highlight.random_color(),
                               note=note)
        new_id = list(set(book.content.highlight_ids) - set(highlight_ids))[0]
        highlight_list[new_id] = note

    if width != DESKTOP[0]:
        # reset the window width for a mobile test
        selenium.set_window_size(width=width, height=height)

    for _id in book.content.highlight_ids:
        # WHEN: they select each highlight
        Utilities.click_option(
            driver=selenium,
            element=book.content.get_highlight(by_id=_id)[0],
            scroll_to=-130)

        # THEN: the highlight card and note are displayed
        try:
            book.content.highlight_box
        except NoSuchElementException:
            pytest.fail("the highlight note card is not open")
        assert(book.content.highlight_box.note == highlight_list[_id]), \
            "Displayed note does not match"


@markers.test_case("C592634")
@markers.highlighting
@markers.parametrize(
    "book_slug, page_slug",
    [("biology-2e", "1-1-the-science-of-biology")]
)
@markers.smoke_test
def note_indicator_not_present_for_highlights_without_notes(
        selenium, base_url, book_slug, page_slug):
    """The note indicator is not present on highlights without notes.

    .. note::
       The note indicator has been temporarily been replaced by off-color
       underlining (bottom border).

    """
    # GIVEN: a book page is displayed
    # AND:   a user is logged in
    # AND:   all content is visible
    # AND:   some content is highlighted without a note
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
    if width < DESKTOP[0]:
        selenium.set_window_size(width=DESKTOP[0], height=height)
    paragraphs = random.sample(book.content.paragraphs, 2)
    book.content.highlight(target=paragraphs[0],
                           offset=Highlight.ENTIRE,
                           color=Highlight.random_color())
    no_note = list(set(book.content.highlight_ids))[0]

    book.content.highlight(target=paragraphs[1],
                           offset=Highlight.ENTIRE,
                           color=Highlight.random_color(),
                           note=Utilities.random_string())
    _ids = book.content.highlight_ids
    with_note = _ids[0] if _ids[0] != no_note else _ids[1]

    if width != DESKTOP[0]:
        # reset the window width for a mobile test
        selenium.set_window_size(width=width, height=height)

    # WHEN:

    # THEN: the note indicator is not present on the highlight
    # AND:  the note indicator is present on the highlight with a note
    no_note = book.content.get_highlight(by_id=no_note)[0]
    assert(not selenium.execute_script(HAS_INDICATOR, no_note)), \
        "indicator found on a highlight without a note"

    with_note = book.content.get_highlight(by_id=with_note)[0]
    assert(selenium.execute_script(HAS_INDICATOR, with_note)), \
        "indicator not found on a highlight with a note"


@markers.test_case("C592635")
@markers.desktop_only
@markers.highlighting
@markers.parametrize("page_slug", [("preface")])
def note_indicator_added_when_highlight_without_a_note_has_a_note_added(
        selenium, base_url, book_slug, page_slug):
    """Adding a note to a highlight also adds the indicator to the highlight.

    """
    # GIVEN: a book page is displayed
    # AND:   a user is logged in
    # AND:   all content is visible
    # AND:   some content is highlighted without a note
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

    width, height = book.get_window_size()
    paragraph = random.choice(book.content.paragraphs)
    book.content.highlight(paragraph, Highlight.ENTIRE, Color.YELLOW)
    highlight_id = book.content.highlight_ids[0]
    highlight = book.content.get_highlight(by_id=highlight_id)[0]

    # WHEN: they click the highlight
    # AND:  add a note
    # AND:  click the 'Save' button
    Utilities.click_option(selenium, element=highlight, scroll_to=-130)
    book.content.highlight_box.note = Utilities.random_string()
    book.content.highlight_box.save()

    # THEN: the note indicator is present on the highlight
    assert(selenium.execute_script(HAS_INDICATOR, highlight)), \
        "indicator not found after adding a note"
# fmt: on
