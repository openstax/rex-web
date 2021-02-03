"""Test Reading Experience Google Analytics message queuing ."""

import random
from time import sleep

from pages.accounts import Signup
from pages.content import Content
from tests import markers
from utils.utility import Highlight, Utilities


@markers.test_case("C615600")
@markers.desktop_only
@markers.parametrize("page_slug", ["preface"])
def test_go_to_highlight_ga_event(selenium, base_url, book_slug, page_slug):
    """The page submits the correct GA event for the 'Go to highlight' button.

    This is the final event before switching the browser to a new tab/window.

    """
    # SETUP:
    event_label = f"/books/{book_slug}/pages/{page_slug}"
    event_action = f"{event_label}?target="

    # GIVEN: a logged in user viewing a book page
    # AND:   one or more highlights are present on the page
    # AND:   the 'My Highlights and Notes' window is open
    # AND:   the context menu is open for a highlight
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
    assert(last_event['eventCategory'] == "REX Link (MH gotohighlight)")
    assert(last_event['eventLabel'] == event_label)


def switch_tab(driver):
    """Switch to the other window/tab handle."""
    current = driver.current_window_handle
    new_handle = 1 if current == driver.window_handles[0] else 0
    if len(driver.window_handles) > 1:
        driver.switch_to.window(driver.window_handles[new_handle])
