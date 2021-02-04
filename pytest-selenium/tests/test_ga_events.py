"""Test Reading Experience Google Analytics message queuing ."""

import random
from time import sleep

from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains

from pages.accounts import Signup
from pages.content import Content
from tests import markers
from utils.utility import Highlight, Utilities


@markers.test_case("C597671")
@markers.parametrize(
    "book_slug, page_slug",
    [("physics", "1-introduction")])
def test_select_text_ga_event(selenium, base_url, book_slug, page_slug):
    """The page submits the correct GA event when content is selected."""
    # SETUP:
    event_action = "show create"
    event_category = "REX highlighting - show create"
    event_label = f"/books/{book_slug}/pages/{page_slug}"

    # GIVEN: a logged in user viewing a book page
    book = user_setup(selenium, base_url, book_slug, page_slug)

    # WHEN:  they select some text
    while not book.content.highlight_boxes:
        paragraph = random.choice(book.content.paragraphs)
        book.content.highlight(
            target=paragraph,
            offset=Highlight.ENTIRE,
            color=None,
            close_box=False
        )

    # THEN:  the create highlight box is opened
    # AND:   the correct Google Analytics event is queued
    #        { eventAction: "show create",
    #          eventCategory: "REX highlighting - show create",
    #          eventLabel: "/books/{book_slug}/pages/{page_slug}" }
    assert(book.content.highlight_boxes), 'No highlight box found'

    last_event = Utilities.get_analytics_queue(selenium, -1)
    assert(last_event['eventAction'] == event_action)
    assert(last_event['eventCategory'] == event_category)
    assert(last_event['eventLabel'] == event_label)


@markers.test_case("C597672")
@markers.parametrize(
    "book_slug, page_slug",
    [("physics", "1-introduction")])
def test_inline_highlighting_login_nudge_ga_event(
        selenium, base_url, book_slug, page_slug):
    """The page submits the correct GA event when the log in nudge is shown."""
    # SETUP:
    event_action = "show login"
    event_category = "REX highlighting - show login"
    event_label = f"/books/{book_slug}/pages/{page_slug}"

    # GIVEN: a non-logged in user viewing a book page
    book = Content(selenium, base_url,
                   book_slug=book_slug, page_slug=page_slug).open()
    while book.notification_present:
        book.notification.got_it()

    # WHEN:  they select some text
    while not book.content.highlight_boxes:
        paragraph = random.choice(book.content.paragraphs)
        book.content.highlight(
            target=paragraph,
            offset=Highlight.ENTIRE,
            color=None,
            close_box=False
        )

    # THEN:  the inline log in nudge is opened
    # AND:   the correct Google Analytics event is queued
    #        { eventAction: "show login",
    #          eventCategory: "REX highlighting - show login",
    #          eventLabel: "/books/{book_slug}/pages/{page_slug}" }
    assert(book.content.highlight_box.login_overlay_present), "Log in not seen"

    last_event = Utilities.get_analytics_queue(selenium, -1)
    assert(last_event['eventAction'] == event_action)
    assert(last_event['eventCategory'] == event_category)
    assert(last_event['eventLabel'] == event_label)


@markers.test_case("C615600")
@markers.desktop_only
@markers.parametrize(
    "book_slug, page_slug",
    [("physics", "1-introduction")])
def test_go_to_highlight_ga_event(selenium, base_url, book_slug, page_slug):
    """The page submits the correct GA event for the 'Go to highlight' button.

    This is the final event before switching the browser to a new tab/window.

    """
    # SETUP:
    event_category = "REX Link (MH gotohighlight)"
    event_label = f"/books/{book_slug}/pages/{page_slug}"
    event_action = f"{event_label}?target="

    # GIVEN: a logged in user viewing a book page
    # AND:   one or more highlights are present on the page
    # AND:   the 'My Highlights and Notes' window is open
    # AND:   the context menu is open for a highlight
    book = user_setup(selenium, base_url, book_slug, page_slug)

    while not book.content.highlight_count:
        paragraph = random.choice(book.content.paragraphs)
        book.content.highlight(paragraph, Highlight.ENTIRE)

    my_highlights = book.toolbar.my_highlights()

    highlight = my_highlights.highlights.edit_highlight
    highlight[0].toggle_menu()

    # WHEN:  they click to 'Go to highlight' link
    highlight[0].go_to_highlight()
    switch_tab(selenium)  # switch to the My Highlights tab to get the event

    # THEN:  the correct Google Analytics event is queued
    #        { eventAction: "/books/{book_slug}/pages/{page_slug}?target=...",
    #          eventCategory: "REX Link (MH gotohighlight)",
    #          eventLabel: "/books/{book_slug}/pages/{page_slug}" }
    last_event = Utilities.get_analytics_queue(selenium, -1)
    assert(event_action in last_event['eventAction'])
    assert(last_event['eventCategory'] == event_category)
    assert(last_event['eventLabel'] == event_label)


def user_setup(driver, base_url, book_slug, page_slug):
    """Setup a new user for use in highlighting event tests."""
    book = Content(driver, base_url,
                   book_slug=book_slug, page_slug=page_slug).open()
    while book.notification_present:
        book.notification.got_it()
    book.navbar.click_login()
    Signup(driver).register()
    book.wait_for_page_to_load()
    while book.notification_present:
        book.notification.got_it()
    book.content.show_solutions()
    return book


def switch_tab(driver):
    """Switch to the other window/tab handle."""
    current = driver.current_window_handle
    new_handle = 1 if current == driver.window_handles[0] else 0
    if len(driver.window_handles) > 1:
        driver.switch_to.window(driver.window_handles[new_handle])
