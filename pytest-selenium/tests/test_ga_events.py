"""Test Reading Experience Google Analytics message queuing ."""

import random
from time import sleep

from selenium.common.exceptions import NoSuchElementException

from pages.accounts import Signup
from pages.content import Content
from tests import markers
from utils.utility import Color, Highlight, Utilities


@markers.test_case("C597377")
@markers.parametrize("book_slug, page_slug", [("physics", "1-introduction")])
def test_new_highlight_ga_event(selenium, base_url, book_slug, page_slug):
    """The page submits the correct GA event when content is selected."""
    # SETUP:
    color = Highlight.random_color()
    event_action = str(color)
    event_category = "REX highlighting (inline create)"
    event_label = f"/books/{book_slug}/pages/{page_slug}"

    # GIVEN: a logged in user viewing a book page
    book = user_setup(selenium, base_url, book_slug, page_slug)

    # WHEN:  they create a new highlight
    while not book.content.highlight_count:
        try:
            book.content.highlight(
                target=random.choice(book.content.paragraphs),
                offset=Highlight.ENTIRE,
                color=color
            )
        except NoSuchElementException:
            pass

    # THEN:  the correct Google Analytics event is queued
    #        { eventAction: "{color}",
    #          eventCategory: "REX highlighting (inline create)",
    #          eventLabel: "/books/{book_slug}/pages/{page_slug}" }
    last_event = Utilities.get_analytics_queue(selenium, -1)
    assert(last_event["eventAction"] == event_action)
    assert(last_event["eventCategory"] == event_category)
    assert(last_event["eventLabel"] == event_label)


@markers.test_case("C621346")
@markers.parametrize("book_slug, page_slug", [("physics", "1-introduction")])
def test_remove_highlight_by_using_same_color_button_ga_event(
        selenium, base_url, book_slug, page_slug):
    """The page submits the correct GA event when the same color is clicked."""
    # SETUP:
    color = Highlight.random_color()
    event_action = str(color)
    event_category = "REX highlighting (delete-inline-highlight)"
    event_label = f"/books/{book_slug}/pages/{page_slug}"

    # GIVEN: a logged in user viewing a book page
    book = user_setup(selenium, base_url, book_slug, page_slug)

    # WHEN:  they create a new highlight
    # AND:   click the highlight color again
    while not book.content.highlight_count:
        try:
            book.content.highlight(
                target=random.choice(book.content.paragraphs),
                offset=Highlight.ENTIRE,
                color=color,
                close_box=False
            )
        except NoSuchElementException:
            pass

    book.content.highlight_box.toggle_color(color)

    # THEN:  the correct Google Analytics event is queued
    #        { eventAction: "{color}",
    #          eventCategory: "REX highlighting (delete-inline-highlight)",
    #          eventLabel: "/books/{book_slug}/pages/{page_slug}" }
    last_event = Utilities.get_analytics_queue(selenium, -1)
    assert(last_event["eventAction"] == event_action)
    assert(last_event["eventCategory"] == event_category)
    assert(last_event["eventLabel"] == event_label)


@markers.test_case("C621347")
@markers.parametrize("book_slug, page_slug", [("physics", "1-introduction")])
def test_cancel_log_in_from_highlight_creation_nudge_ga_event(
        selenium, base_url, book_slug, page_slug):
    """The page submits the correct GA event when the login nudge is cancelled."""
    # SETUP:
    event_action = "cancel"
    event_category = "REX Button (highlighting-login)"
    event_label = f"/books/{book_slug}/pages/{page_slug}"

    # GIVEN: a non-logged in user viewing a book page
    book = Content(selenium, base_url,
                   book_slug=book_slug, page_slug=page_slug).open()
    while book.notification_present:
        book.notification.got_it()

    # WHEN:  they select some text
    # AND:   click the 'Cancel' button on the log in nudge
    while not book.content.highlight_boxes:
        book.content.highlight(
            target=random.choice(book.content.paragraphs),
            offset=Highlight.ENTIRE,
            color=None,
            close_box=False
        )

    book.content.highlight_box.cancel()

    # THEN:  the correct Google Analytics event is queued
    #        { eventAction: "cancel",
    #          eventCategory: "REX Button (highlighting-login)",
    #          eventLabel: "/books/{book_slug}/pages/{page_slug}" }
    last_event = Utilities.get_analytics_queue(selenium, -1)
    assert(last_event["eventAction"] == event_action)
    assert(last_event["eventCategory"] == event_category)
    assert(last_event["eventLabel"] == event_label)


@markers.test_case("C621348")
@markers.parametrize("book_slug, page_slug", [("physics", "1-introduction")])
def test_log_in_nudge_login_ga_event(selenium, base_url, book_slug, page_slug):
    """The page submits the correct GA event when using the inline 'Log in'."""
    # SETUP:
    event_action = "login"
    event_category = "REX Link (highlighting-login)"
    event_label = f"/books/{book_slug}/pages/{page_slug}"
    event_unload_action = event_label
    event_unload_category = "REX unload"

    # GIVEN: a non-logged in user viewing a book page
    book = Content(selenium, base_url,
                   book_slug=book_slug, page_slug=page_slug).open()
    while book.notification_present:
        book.notification.got_it()

    # WHEN:  they select some text
    # AND:   click the 'Log in' button on the log in nudge
    while not book.content.highlight_boxes:
        book.content.highlight(
            target=random.choice(book.content.paragraphs),
            offset=Highlight.ENTIRE,
            color=None,
            close_box=False
        )

    # use a script because we need the events before the page changes
    action_script = (
        'document.querySelector("[data-testid=confirm").click(); '
        "return __APP_ANALYTICS.googleAnalyticsClient.getPendingCommands()"
        ".map(x => x.command.payload);"
    )
    events = selenium.execute_script(action_script)

    # THEN:  the correct Google Analytics event is queued
    #        { eventAction: "login",
    #          eventCategory: "REX Link (highlighting-login)",
    #          eventLabel: "/books/{book_slug}/pages/{page_slug}" }
    # AND:   the page unload Google Analytics event is queued
    #        { eventAction: "/books/{book_slug}/pages/{page_slug}",
    #          eventCategory: "REX unload" }
    second_to_last_event = events[-2]
    assert(second_to_last_event["eventAction"] == event_action)
    assert(second_to_last_event["eventCategory"] == event_category)
    assert(second_to_last_event["eventLabel"] == event_label)

    last_event = events[-1]
    assert(last_event["eventAction"] == event_unload_action)
    assert(last_event["eventCategory"] == event_unload_category)


@markers.test_case("C621349")
@markers.parametrize("book_slug, page_slug", [("physics", "1-introduction")])
def test_cancel_highlight_delete_ga_event(
        selenium, base_url, book_slug, page_slug):
    """The page submits the correct GA event when a highlight deletion is cancelled."""
    # SETUP:
    event_action = "cancel"
    event_category = "REX Button (confirm-delete-inline-highlight)"
    event_label = f"/books/{book_slug}/pages/{page_slug}"
    note = Utilities.random_string(length=36)

    # GIVEN: a logged in user viewing a book page
    book = user_setup(selenium, base_url, book_slug, page_slug)

    # WHEN:  they create a new highlight with a note
    # AND:   open the highlight context menu and click the 'Delete' link
    # AND:   click the 'Cancel' button
    while not book.content.highlight_count:
        try:
            book.content.highlight(
                target=random.choice(book.content.paragraphs),
                offset=Highlight.ENTIRE,
                note=note,
                close_box=False
            )
        except NoSuchElementException:
            pass

    book.content.highlight_box.delete_note()

    book.content.highlight_box.cancel()

    # THEN:  the correct Google Analytics event is queued
    #        { eventAction: "cancel",
    #          eventCategory: "REX Button (confirm-delete-inline-highlight)",
    #          eventLabel: "/books/{book_slug}/pages/{page_slug}" }
    last_event = Utilities.get_analytics_queue(selenium, -1)
    assert(last_event["eventAction"] == event_action)
    assert(last_event["eventCategory"] == event_category)
    assert(last_event["eventLabel"] == event_label)


@markers.test_case("C621350")
@markers.parametrize("book_slug, page_slug", [("physics", "1-introduction")])
def test_highlight_delete_ga_event(selenium, base_url, book_slug, page_slug):
    """The page submits the correct GA event when a highlight is deleted."""
    # SETUP:
    event_action = "cancel"
    event_category = "REX Button (confirm-delete-inline-highlight)"
    event_label = f"/books/{book_slug}/pages/{page_slug}"
    note = Utilities.random_string(length=36)

    # GIVEN: a logged in user viewing a book page
    book = user_setup(selenium, base_url, book_slug, page_slug)

    # WHEN:  they create a new highlight with a note
    # AND:   open the highlight context menu and click the 'Delete' link
    # AND:   click the 'Cancel' button
    while not book.content.highlight_count:
        try:
            book.content.highlight(
                target=random.choice(book.content.paragraphs),
                offset=Highlight.ENTIRE,
                note=note,
                close_box=False
            )
        except NoSuchElementException:
            pass

    book.content.highlight_box.delete_note()

    book.content.highlight_box.cancel()

    # THEN:  the correct Google Analytics event is queued
    #        { eventAction: "cancel",
    #          eventCategory: "REX Button (confirm-delete-inline-highlight)",
    #          eventLabel: "/books/{book_slug}/pages/{page_slug}" }
    last_event = Utilities.get_analytics_queue(selenium, -1)
    assert(last_event["eventAction"] == event_action)
    assert(last_event["eventCategory"] == event_category)
    assert(last_event["eventLabel"] == event_label)


@markers.test_case("C621351", "C621352")
@markers.parametrize("book_slug, page_slug", [("physics", "1-introduction")])
def test_edit_existing_note_ga_event(selenium, base_url, book_slug, page_slug):
    """The page submits the correct GA event when an existing note is edited."""
    # SETUP:
    color = Highlight.random_color()
    first_event_action = "save"
    first_event_category = "REX Button (edit-note)"
    first_event_label = f"/books/{book_slug}/pages/{page_slug}"
    note_one = Utilities.random_string(length=16)
    note_two = Utilities.random_string(length=28)
    second_event_action = str(color)
    second_event_category = "REX highlighting (inline edit note)"
    second_event_label = first_event_label

    # GIVEN: a logged in user viewing a book page
    book = user_setup(selenium, base_url, book_slug, page_slug)

    # WHEN:  they create a new highlight with a note
    # AND:   open the highlight context menu and click the 'Edit' link
    # AND:   edit the note and click the 'Save' button
    while not book.content.highlight_count:
        try:
            book.content.highlight(
                target=random.choice(book.content.paragraphs),
                offset=Highlight.ENTIRE,
                color=color,
                note=note_one,
                close_box=False
            )
        except NoSuchElementException:
            pass

    book.content.highlight_box.edit_note()

    book.content.highlight_box.note = note_two
    book.content.highlight_box.save()

    # THEN:  the correct save Google Analytics event is queued
    #        { eventAction: "save",
    #          eventCategory: "REX button (edit note)",
    #          eventLabel: "/books/{book_slug}/pages/{page_slug}" }
    # AND:   the correct note update Google Analytics event is queued
    #        { eventAction: "{color}",
    #          eventCategory: "REX highlighting (inline edit note)",
    #          eventLabel: "/books/{book_slug}/pages/{page_slug}" }
    events = Utilities.get_analytics_queue(selenium)
    second_to_last_event = events[-2]
    assert(second_to_last_event["eventAction"] == first_event_action)
    assert(second_to_last_event["eventCategory"] == first_event_category)
    assert(second_to_last_event["eventLabel"] == first_event_label)

    last_event = events[-1]
    assert(last_event["eventAction"] == second_event_action)
    assert(last_event["eventCategory"] == second_event_category)
    assert(last_event["eventLabel"] == second_event_label)


@markers.test_case("C621353", "C621354")
@markers.parametrize("book_slug, page_slug", [("physics", "1-introduction")])
def test_add_note_to_highlight_ga_event(
        selenium, base_url, book_slug, page_slug):
    """The page submits the correct GA event when a note is added to a highlight."""
    # SETUP:
    color = Highlight.random_color()
    first_event_action = "save"
    first_event_category = "REX Button (edit-note)"
    first_event_label = f"/books/{book_slug}/pages/{page_slug}"
    note = Utilities.random_string(length=30)
    second_event_action = str(color)
    second_event_category = "REX highlighting (inline add note)"
    second_event_label = first_event_label

    # GIVEN: a logged in user viewing a book page
    book = user_setup(selenium, base_url, book_slug, page_slug)

    # WHEN:  they create a new highlight without a note
    # AND:   add the note and click the 'Save' button
    while not book.content.highlight_count:
        try:
            book.content.highlight(
                target=random.choice(book.content.paragraphs),
                offset=Highlight.ENTIRE,
                color=color,
                note=None,
                close_box=False
            )
        except NoSuchElementException:
            pass

    book.content.highlight_box.note = note
    book.content.highlight_box.save()

    # THEN:  the correct save Google Analytics event is queued
    #        { eventAction: "save",
    #          eventCategory: "REX Button (edit-note)",
    #          eventLabel: "/books/{book_slug}/pages/{page_slug}" }
    # AND:   the correct note update Google Analytics event is queued
    #        { eventAction: "{color}",
    #          eventCategory: "REX highlighting (inline add note)",
    #          eventLabel: "/books/{book_slug}/pages/{page_slug}" }
    events = Utilities.get_analytics_queue(selenium)
    second_to_last_event = events[-2]
    assert(second_to_last_event["eventAction"] == first_event_action)
    assert(second_to_last_event["eventCategory"] == first_event_category)
    assert(second_to_last_event["eventLabel"] == first_event_label)

    last_event = events[-1]
    assert(last_event["eventAction"] == second_event_action)
    assert(last_event["eventCategory"] == second_event_category)
    assert(last_event["eventLabel"] == second_event_label)


@markers.test_case("C621355")
@markers.parametrize("book_slug, page_slug", [("physics", "1-introduction")])
def test_change_highlight_color_ga_event(
        selenium, base_url, book_slug, page_slug):
    """The page submits the correct GA event when a highlight color is changed."""
    # SETUP:
    changed_color = Color.PURPLE
    event_action = str(changed_color)
    event_category = "REX highlighting (inline edit)"
    event_label = f"/books/{book_slug}/pages/{page_slug}"
    initial_color = Color.PINK

    # GIVEN: a logged in user viewing a book page
    book = user_setup(selenium, base_url, book_slug, page_slug)

    # WHEN:  they create a new highlight
    # AND:   click the new highlight color button
    while not book.content.highlight_count:
        try:
            book.content.highlight(
                target=random.choice(book.content.paragraphs),
                offset=Highlight.ENTIRE,
                color=initial_color,
                close_box=False
            )
        except NoSuchElementException:
            pass

    book.content.highlight_box.toggle_color(changed_color)

    # THEN:  the correct Google Analytics event is queued
    #        { eventAction: "{color}",
    #          eventCategory: "REX highlighting (inline edit)",
    #          eventLabel: "/books/{book_slug}/pages/{page_slug}" }
    last_event = Utilities.get_analytics_queue(selenium, -1)
    assert(last_event["eventAction"] == event_action)
    assert(last_event["eventCategory"] == event_category)
    assert(last_event["eventLabel"] == event_label)


@markers.test_case("C597671")
@markers.parametrize("book_slug, page_slug", [("physics", "1-introduction")])
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
        book.content.highlight(
            target=random.choice(book.content.paragraphs),
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
    assert(last_event["eventAction"] == event_action)
    assert(last_event["eventCategory"] == event_category)
    assert(last_event["eventLabel"] == event_label)


@markers.test_case("C597672")
@markers.parametrize("book_slug, page_slug", [("physics", "1-introduction")])
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
        book.content.highlight(
            target=random.choice(book.content.paragraphs),
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
    assert(last_event["eventAction"] == event_action)
    assert(last_event["eventCategory"] == event_category)
    assert(last_event["eventLabel"] == event_label)


@markers.test_case("C615600")
@markers.desktop_only
@markers.parametrize("book_slug, page_slug", [("physics", "1-introduction")])
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
        try:
            book.content.highlight(
                target=random.choice(book.content.paragraphs),
                offset=Highlight.ENTIRE
            )
        except NoSuchElementException:
            pass

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
    assert(event_action in last_event["eventAction"])
    assert(last_event["eventCategory"] == event_category)
    assert(last_event["eventLabel"] == event_label)


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
