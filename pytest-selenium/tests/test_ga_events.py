"""Test Reading Experience Google Analytics message queuing ."""

import random
import re

from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys

from pages.accounts import Signup
from pages.content import Content
from tests import markers
from utils.utility import Color, Highlight, Utilities

ACTION_SCRIPT = (
    'document.querySelector("{selector}").click(); '
    "return __APP_ANALYTICS.googleAnalyticsClient.getPendingCommands()"
    ".map(x => x.command.payload);"
)
VIEW_ANALYTICS_QUEUE = {"name": "ANALYTICS_OPT_OUT", "value": "1"}


# --------------------- #
# Critical Priority SEO #
# --------------------- #


@markers.test_case("C591502")
@markers.parametrize("book_slug, page_slug", [("physics", "1-introduction")])
def test_the_user_clicks_a_toc_link_ga_event(selenium, base_url, book_slug, page_slug):
    """The page submits the correct GA event when a TOC link is clicked."""
    # SETUP:
    event_action = None
    event_category = "REX Link (toc)"
    event_label = f"/books/{book_slug}/pages/{page_slug}"

    # GIVEN: a user viewing a book page
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    book.driver.add_cookie(VIEW_ANALYTICS_QUEUE)
    while book.notification_present:
        book.notification.got_it()

    # WHEN:  they click a table of contents link
    if book.is_mobile:
        book.toolbar.click_toc_toggle_button()
    event_action = book.sidebar.toc.next_section_page_slug
    book.sidebar.toc.view_next_section()

    # THEN:  the correct Google Analytics event is queued
    #        { eventAction: "{page_slug}",
    #          eventCategory: "REX Link (toc)",
    #          eventLabel: "/books/{book_slug}/pages/{page_slug}" }
    toc_link_event = Utilities.get_analytics_queue(selenium, -2)
    assert (
        "eventAction" in toc_link_event
        and "eventCategory" in toc_link_event
        and "eventLabel" in toc_link_event
    ), "Not viewing the correct GA event"
    assert toc_link_event["eventAction"] == event_action
    assert toc_link_event["eventCategory"] == event_category
    assert toc_link_event["eventLabel"] == event_label


@markers.test_case("C591503")
@markers.parametrize("book_slug, page_slug", [("physics", "1-introduction")])
def test_user_clicks_the_order_a_print_copy_link_ga_event(selenium, base_url, book_slug, page_slug):
    """The page submits the correct GA event when a print link is clicked."""
    # SETUP:
    event_action = "buy-book"
    event_category = "REX Link"
    event_label = f"/books/{book_slug}/pages/{page_slug}"

    # GIVEN: a user viewing a book page
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    book.driver.add_cookie(VIEW_ANALYTICS_QUEUE)
    while book.notification_present:
        book.notification.got_it()

    # WHEN:  they click the 'Order a print copy' button
    book.order_a_print_copy(remain_on_page=True)

    # THEN:  the correct Google Analytics event is queued
    #        { eventAction: "buy-book",
    #          eventCategory: "REX Link (toolbar)",
    #          eventLabel: "/books/{book_slug}/pages/{page_slug}" }
    last_event = Utilities.get_analytics_queue(selenium, -1)
    assert (
        "eventAction" in last_event and "eventCategory" in last_event and "eventLabel" in last_event
    ), "Not viewing the correct GA event"
    assert last_event["eventAction"] == event_action
    assert last_event["eventCategory"] == event_category
    assert last_event["eventLabel"] == event_label


@markers.test_case("C621361", "C621362")
@markers.parametrize("book_slug, page_slug", [("physics", "1-2-the-scientific-methods")])
def test_user_clicks_the_previous_and_next_page_links_ga_events(
    selenium, base_url, book_slug, page_slug
):
    """The page submits the correct GA event when the page link is clicked."""
    # SETUP:
    label = "[data-analytics-label={label}]"
    load_script = 'return document.querySelector("[data-analytics-label={label}]");'
    next_event_action = "next"
    next_event_category = "REX Link (prev-next)"
    next_event_label = None  # Not yet known
    previous_event_action = "prev"
    previous_event_category = next_event_category
    previous_event_label = f"/books/{book_slug}/pages/{page_slug}"

    # GIVEN: a user viewing a book that is not the first book page
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    book.driver.add_cookie(VIEW_ANALYTICS_QUEUE)
    while book.notification_present:
        book.notification.got_it()

    # WHEN:  they click the 'Previous' link
    #        (use a script because we need the events before the page changes)
    events = selenium.execute_script(
        ACTION_SCRIPT.format(selector=label.format(label=previous_event_action))
    )
    book.wait.until(
        lambda _: book.driver.execute_script(load_script.format(label=next_event_action))
    )

    # THEN:  the correct Google Analytics event is queued
    #        { eventAction: "prev",
    #          eventCategory: "REX Link (prev-next)",
    #          eventLabel: "/books/{book_slug}/pages/{page_slug}" }
    next_event_label = "/".join([""] + selenium.current_url.split("/")[3:])
    transition_event = events[-2]
    assert (
        "eventAction" in transition_event
        and "eventCategory" in transition_event
        and "eventLabel" in transition_event
    ), "Not viewing the correct GA event"
    assert transition_event["eventAction"] == previous_event_action
    assert transition_event["eventCategory"] == previous_event_category
    assert transition_event["eventLabel"] == previous_event_label

    # WHEN:  they click the 'Next' link
    #        (use a script because we need the events before the page changes)
    events = selenium.execute_script(
        ACTION_SCRIPT.format(selector=label.format(label=next_event_action))
    )

    # THEN:  the correct Google Analytics event is queued
    #        { eventAction: "next",
    #          eventCategory: "REX Link (prev-next)",
    #          eventLabel: "/books/{book_slug}/pages/{page_slug}" }
    transition_event = events[-2]
    assert (
        "eventAction" in transition_event
        and "eventCategory" in transition_event
        and "eventLabel" in transition_event
    ), "Not viewing the correct GA event"
    assert transition_event["eventAction"] == next_event_action
    assert transition_event["eventCategory"] == next_event_category
    assert transition_event["eventLabel"] == next_event_label


@markers.test_case("C621363")
@markers.parametrize("book_slug, page_slug", [("physics", "1-introduction")])
def test_user_logout_ga_event(selenium, base_url, book_slug, page_slug):
    """The page submits the correct GA event when a user logs out."""
    # SETUP:
    event_action = f"/accounts/logout?r=/books/{book_slug}/pages/{page_slug}"
    event_category = "REX Link (openstax-navbar)"
    event_label = f"/books/{book_slug}/pages/{page_slug}"
    selector = "a[href*=logout]"

    # GIVEN: a logged in user viewing a book page
    book = user_setup(selenium, base_url, book_slug, page_slug)

    # WHEN:  they click the user menu
    # AND:   click the 'Log out' menu link
    book.navbar.click_user_name()

    events = selenium.execute_script(ACTION_SCRIPT.format(selector=selector))

    # THEN:  the correct Google Analytics event is queued
    #        { eventAction: "/accounts/logout?r=/books/{book_slug}/pages/{page_slug}",  # NOQA
    #          eventCategory: "REX Link (openstax-navbar)",
    #          eventLabel: "/books/{book_slug}/pages/{page_slug}" }
    log_out_event = events[-2]
    assert (
        "eventAction" in log_out_event
        and "eventCategory" in log_out_event
        and "eventLabel" in log_out_event
    ), "Not viewing the correct GA event"
    assert log_out_event["eventAction"] == event_action
    assert log_out_event["eventCategory"] == event_category
    assert log_out_event["eventLabel"] == event_label


@markers.test_case("C621364", "C621366")
@markers.parametrize("book_slug, page_slug", [("physics", "1-introduction")])
def test_open_and_close_the_table_of_contents_ga_events(selenium, base_url, book_slug, page_slug):
    """The page submits the correct GA event when the ToC is opened."""
    # SETUP:
    close_event_action = "Click to close the Table of Contents"
    close_event_category = "REX Button (toc)"
    close_event_label = f"/books/{book_slug}/pages/{page_slug}"
    open_event_action = "Click to open the Table of Contents"
    open_event_category = "REX Button (toolbar)"
    open_event_label = close_event_label

    # GIVEN: a user viewing a book page and the ToC is open
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    book.driver.add_cookie(VIEW_ANALYTICS_QUEUE)
    while book.notification_present:
        book.notification.got_it()
    if book.is_mobile:
        book.toolbar.click_toc_toggle_button()

    # WHEN:  they close the table of contents
    book.sidebar.header.click_toc_toggle_button()

    # THEN:  the correct Google Analytics event is queued
    #        { eventAction: "Click to close the Table of Contents",
    #          eventCategory: "REX Button (toc)",
    #          eventLabel: "/books/{book_slug}/pages/{page_slug}" }
    last_event = Utilities.get_analytics_queue(selenium, -1)
    assert (
        "eventAction" in last_event and "eventCategory" in last_event and "eventLabel" in last_event
    ), "Not viewing the correct GA event"
    assert last_event["eventAction"] == close_event_action
    assert last_event["eventCategory"] == close_event_category
    assert last_event["eventLabel"] == close_event_label

    # WHEN:  they open the table of contents
    book.toolbar.click_toc_toggle_button()

    # THEN:  the correct Google Analytics event is queued
    #        { eventAction: "Click to open the Table of Contents",
    #          eventCategory: "REX Button (toolbar)",
    #          eventLabel: "/books/{book_slug}/pages/{page_slug}" }
    last_event = Utilities.get_analytics_queue(selenium, -1)
    assert (
        "eventAction" in last_event and "eventCategory" in last_event and "eventLabel" in last_event
    ), "Not viewing the correct GA event"
    assert last_event["eventAction"] == open_event_action
    assert last_event["eventCategory"] == open_event_category
    assert last_event["eventLabel"] == open_event_label


@markers.test_case("C621365")
@markers.parametrize(
    "book_slug, page_slug", [("physics", "1-1-physics-definitions-and-applications")]
)
def test_click_a_figure_link_ga_event(selenium, base_url, book_slug, page_slug):
    """The page submits the correct GA event when a figure link is clicked."""
    # SETUP:
    event_action = None  # Not yet known, uses the anchor reference
    event_category = "REX Link"
    event_label = f"/books/{book_slug}/pages/{page_slug}"

    # GIVEN: a user viewing a book page with a figure link
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    book.driver.add_cookie(VIEW_ANALYTICS_QUEUE)
    while book.notification_present:
        book.notification.got_it()

    # WHEN:  they click the figure link
    link = random.choice(book.content.figure_links)
    event_action = f'#{link.get_attribute("href").split("#")[-1]}'
    Utilities.click_option(selenium, element=link)

    # THEN:  the correct Google Analytics event is queued
    #        { eventAction: "{figure reference}",
    #          eventCategory: "REX Link",
    #          eventLabel: "/books/{book_slug}/pages/{page_slug}" }
    link_click_event = Utilities.get_analytics_queue(selenium, -2)
    assert (
        "eventAction" in link_click_event
        and "eventCategory" in link_click_event
        and "eventLabel" in link_click_event
    ), "Not viewing the correct GA event"
    assert link_click_event["eventAction"] == event_action
    assert link_click_event["eventCategory"] == event_category
    assert link_click_event["eventLabel"] == event_label


@markers.test_case("C621367")
@markers.parametrize("book_slug, page_slug", [("physics", "1-introduction")])
def test_account_profile_menu_bar_click_ga_event(selenium, base_url, book_slug, page_slug):
    """The page submits the correct GA event when account profile clicked."""
    # SETUP:
    event_action = "/accounts/profile"
    event_category = "REX Link (openstax-navbar)"
    event_label = f"/books/{book_slug}/pages/{page_slug}"
    selector = "a[href*=profile]"

    # GIVEN: a logged in user viewing a book page
    book = user_setup(selenium, base_url, book_slug, page_slug)

    # WHEN:  they click their name in the nav bar
    # AND:   click the 'Account Profile' link
    # AND:   switch back to the initial tabas
    book.navbar.click_user_name()
    events = selenium.execute_script(ACTION_SCRIPT.format(selector=selector))

    # THEN:  the correct Google Analytics event is queued
    #        { eventAction: "/accounts/profile",
    #          eventCategory: "REX Link (openstax-navbar)",
    #          eventLabel: "/books/{book_slug}/pages/{page_slug}" }
    last_event = events[-1]
    assert (
        "eventAction" in last_event and "eventCategory" in last_event and "eventLabel" in last_event
    ), "Not viewing the correct GA event"
    assert last_event["eventAction"] == event_action
    assert last_event["eventCategory"] == event_category
    assert last_event["eventLabel"] == event_label


@markers.test_case("C545852", "C621368")
@markers.parametrize("book_slug, page_slug", [("physics", "1-introduction")])
def test_clicking_a_search_excerpt_ga_event(selenium, base_url, book_slug, page_slug):
    """The page submits the correct GA event when ."""
    # SETUP:
    excerpt_event_action = None  # Not yet known, uses the search result link
    excerpt_event_category = "REX Link"
    excerpt_event_label = f"/books/{book_slug}/pages/{page_slug}"
    search_event_action = "Andromeda"
    search_event_category = "REX search"
    search_event_label = book_slug
    search_term = search_event_action

    # GIVEN: a user viewing a book page
    # AND:   searched the book for a term
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    book.driver.add_cookie(VIEW_ANALYTICS_QUEUE)
    while book.notification_present:
        book.notification.got_it()
    search = book.mobile_search_toolbar if book.is_mobile else book.toolbar

    # WHEN:  they search for a term
    search_results = search.search_for(search_term).results

    # THEN:  the correct Google Analytics search link event is queued
    #        { eventAction: "{new page slug}",
    #          eventCategory: "REX Link",
    #          eventLabel: "/books/{book_slug}/pages/{page_slug}" }
    search_event = Utilities.get_analytics_queue(selenium, -2)
    assert (
        "eventAction" in search_event
        and "eventCategory" in search_event
        and "eventLabel" in search_event
    ), "Not viewing the correct GA event"
    assert search_event["eventAction"] == search_event_action
    assert search_event["eventCategory"] == search_event_category
    assert search_event["eventLabel"] == search_event_label

    # WHEN:  they click on a search excerpt
    link = random.choice(search_results)
    excerpt_event_action = link.get_attribute("href").split("/")[-1]
    Utilities.click_option(selenium, element=link)

    # THEN:  the correct Google Analytics search link event is queued
    #        { eventAction: "{new page slug}",
    #          eventCategory: "REX Link",
    #          eventLabel: "/books/{book_slug}/pages/{page_slug}" }
    link_click_event = Utilities.get_analytics_queue(selenium, -2)
    assert (
        "eventAction" in link_click_event
        and "eventCategory" in link_click_event
        and "eventLabel" in link_click_event
    ), "Not viewing the correct GA event"
    assert link_click_event["eventAction"] == excerpt_event_action
    assert link_click_event["eventCategory"] == excerpt_event_category
    assert link_click_event["eventLabel"] == excerpt_event_label


@markers.test_case("C621369")
@markers.parametrize("book_slug, page_slug", [("physics", "1-introduction")])
def test_banner_book_title_click_ga_event(selenium, base_url, book_slug, page_slug):
    """The page submits the correct GA event when the book title is clicked."""
    # SETUP:
    event_action = f"/details/books/{book_slug}"
    event_category = "REX Link (book-banner-collapsed)"
    event_label = f"/books/{book_slug}/pages/{page_slug}"
    selector = "a[data-testid=details-link-collapsed]"

    # GIVEN: a non-logged in user viewing a book page that is scrolled down
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    book.driver.add_cookie(VIEW_ANALYTICS_QUEUE)
    while book.notification_present:
        book.notification.got_it()

    # WHEN:  they click on the banner book title
    events = selenium.execute_script(ACTION_SCRIPT.format(selector=selector))

    # THEN:  the correct Google Analytics event is queued
    #        { eventAction: "/details/books/{book_slug}",
    #          eventCategory: "REX Link (book-banner-collapsed)",
    #          eventLabel: "/books/{book_slug}/pages/{page_slug}" }
    link_click_event = events[-2]
    assert (
        "eventAction" in link_click_event
        and "eventCategory" in link_click_event
        and "eventLabel" in link_click_event
    ), "Not viewing the correct GA event"
    assert link_click_event["eventAction"] == event_action
    assert link_click_event["eventCategory"] == event_category
    assert link_click_event["eventLabel"] == event_label


@markers.test_case("C621370")
@markers.skip_test(reason="difficulty getting GA data from OSWeb")
@markers.dev_only
@markers.parametrize("book_slug, page_slug", [("physics", "1-introduction")])
def test_view_book_online_link_ga_event(selenium, base_url, book_slug, page_slug):
    """The page submits the correct GA event when a user clicks View online."""
    # SETUP:
    event_action = "open"
    event_category = "Webview {book_slug} REX"
    event_label = f"/books/{book_slug}/pages/{page_slug}"

    # GIVEN: a user viewing an OSWeb book details page

    # WHEN:  they click the 'View online' link

    # THEN:  the correct Google Analytics event is queued
    #        { eventAction: "open",
    #          eventCategory: "Webview {book_slug} REX",
    #          eventLabel: "/books/{book_slug}/pages/{page_slug}" }
    last_event = Utilities.get_analytics_queue(selenium, -1)
    assert (
        "eventAction" in last_event and "eventCategory" in last_event and "eventLabel" in last_event
    ), "Not viewing the correct GA event"
    assert last_event["eventAction"] == event_action
    assert last_event["eventCategory"] == event_category
    assert last_event["eventLabel"] == event_label


@markers.test_case("C621371")
@markers.parametrize("book_slug, page_slug", [("physics", "1-introduction")])
def test_openstax_logo_click_ga_event(selenium, base_url, book_slug, page_slug):
    """The page submits the correct GA event when a user clicks the logo."""
    # SETUP:
    event_action = "/"
    event_category = "REX Link (openstax-navbar)"
    event_label = f"/books/{book_slug}/pages/{page_slug}"
    selector = "a[href='/']"

    # GIVEN: a user viewing a book page
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    book.driver.add_cookie(VIEW_ANALYTICS_QUEUE)
    while book.notification_present:
        book.notification.got_it()

    # WHEN:  they click on the OpenStax logo in the nav bar
    events = selenium.execute_script(ACTION_SCRIPT.format(selector=selector))

    # THEN:  the correct Google Analytics event is queued
    #        { eventAction: "/",
    #          eventCategory: "REX Link (openstax-navbar)",
    #          eventLabel: "/books/{book_slug}/pages/{page_slug}" }
    logo_click_event = events[-2]
    assert (
        "eventAction" in logo_click_event
        and "eventCategory" in logo_click_event
        and "eventLabel" in logo_click_event
    ), "Not viewing the correct GA event"
    assert logo_click_event["eventAction"] == event_action
    assert logo_click_event["eventCategory"] == event_category
    assert logo_click_event["eventLabel"] == event_label


@markers.test_case("C621372")
@markers.parametrize("book_slug, page_slug", [("physics", "1-introduction")])
def test_log_in_click_ga_event(selenium, base_url, book_slug, page_slug):
    """The page submits the correct GA event when ."""
    # SETUP:
    event_action = "login"
    event_category = "REX Link (openstax-navbar)"
    event_label = f"/books/{book_slug}/pages/{page_slug}"
    selector = "a[href*=login]"

    # GIVEN: a non-logged in user viewing a book page that is scrolled down
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    book.driver.add_cookie(VIEW_ANALYTICS_QUEUE)
    while book.notification_present:
        book.notification.got_it()

    # WHEN:  they click the 'Log in' link in the nav bar
    events = selenium.execute_script(ACTION_SCRIPT.format(selector=selector))

    # THEN:  the correct Google Analytics event is queued
    #        { eventAction: "/accounts/login",
    #          eventCategory: "REX Link (openstax-navbar)",
    #          eventLabel: "/books/{book_slug}/pages/{page_slug}" }
    log_in_event = events[-2]
    assert (
        "eventAction" in log_in_event
        and "eventCategory" in log_in_event
        and "eventLabel" in log_in_event
    ), "Not viewing the correct GA event"
    assert log_in_event["eventAction"] == event_action
    assert log_in_event["eventCategory"] == event_category
    assert log_in_event["eventLabel"] == event_label


@markers.test_case("C597377")
@markers.highlighting
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
                target=random.choice(book.content.paragraphs), offset=Highlight.ENTIRE, color=color
            )
        except NoSuchElementException:
            pass

    # THEN:  the correct Google Analytics event is queued
    #        { eventAction: "{color}",
    #          eventCategory: "REX highlighting (inline create)",
    #          eventLabel: "/books/{book_slug}/pages/{page_slug}" }
    last_event = Utilities.get_analytics_queue(selenium, -1)
    assert (
        "eventAction" in last_event and "eventCategory" in last_event and "eventLabel" in last_event
    ), "Not viewing the correct GA event"
    assert last_event["eventAction"] == event_action
    assert last_event["eventCategory"] == event_category
    assert last_event["eventLabel"] == event_label


@markers.test_case("C621346")
@markers.highlighting
@markers.parametrize("book_slug, page_slug", [("physics", "1-introduction")])
def test_remove_highlight_by_using_same_color_button_ga_event(
    selenium, base_url, book_slug, page_slug
):
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
                close_box=False,
            )
        except NoSuchElementException:
            pass

    book.content.highlight_box.toggle_color(color)

    # THEN:  the correct Google Analytics event is queued
    #        { eventAction: "{color}",
    #          eventCategory: "REX highlighting (delete-inline-highlight)",
    #          eventLabel: "/books/{book_slug}/pages/{page_slug}" }
    last_event = Utilities.get_analytics_queue(selenium, -1)
    assert (
        "eventAction" in last_event and "eventCategory" in last_event and "eventLabel" in last_event
    ), "Not viewing the correct GA event"
    assert last_event["eventAction"] == event_action
    assert last_event["eventCategory"] == event_category
    assert last_event["eventLabel"] == event_label


@markers.test_case("C621347")
@markers.highlighting
@markers.parametrize("book_slug, page_slug", [("physics", "1-introduction")])
def test_cancel_log_in_from_highlight_creation_nudge_ga_event(
    selenium, base_url, book_slug, page_slug
):
    """The page submits the correct GA event when login nudge is cancelled."""
    # SETUP:
    event_action = "cancel"
    event_category = "REX Button (highlighting-login)"
    event_label = f"/books/{book_slug}/pages/{page_slug}"

    # GIVEN: a non-logged in user viewing a book page
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    book.driver.add_cookie(VIEW_ANALYTICS_QUEUE)
    while book.notification_present:
        book.notification.got_it()

    # WHEN:  they select some text
    # AND:   click the 'Cancel' button on the log in nudge
    while not book.content.highlight_boxes:
        book.content.highlight(
            target=random.choice(book.content.paragraphs),
            offset=Highlight.ENTIRE,
            color=None,
            close_box=False,
        )

    book.content.highlight_box.cancel()

    # THEN:  the correct Google Analytics event is queued
    #        { eventAction: "cancel",
    #          eventCategory: "REX Button (highlighting-login)",
    #          eventLabel: "/books/{book_slug}/pages/{page_slug}" }
    last_event = Utilities.get_analytics_queue(selenium, -1)
    assert (
        "eventAction" in last_event and "eventCategory" in last_event and "eventLabel" in last_event
    ), "Not viewing the correct GA event"
    assert last_event["eventAction"] == event_action
    assert last_event["eventCategory"] == event_category
    assert last_event["eventLabel"] == event_label


@markers.test_case("C621348")
@markers.highlighting
@markers.parametrize("book_slug, page_slug", [("physics", "1-introduction")])
def test_log_in_nudge_login_ga_event(selenium, base_url, book_slug, page_slug):
    """The page submits the correct GA event when using the inline 'Log in'."""
    # SETUP:
    event_action = "login"
    event_category = "REX Link (highlighting-login)"
    event_label = f"/books/{book_slug}/pages/{page_slug}"
    event_unload_action = event_label
    event_unload_category = "REX unload"
    selector = "[data-testid=confirm]"

    # GIVEN: a non-logged in user viewing a book page
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    book.driver.add_cookie(VIEW_ANALYTICS_QUEUE)
    while book.notification_present:
        book.notification.got_it()

    # WHEN:  they select some text
    # AND:   click the 'Log in' button on the log in nudge
    while not book.content.highlight_boxes:
        book.content.highlight(
            target=random.choice(book.content.paragraphs),
            offset=Highlight.ENTIRE,
            color=None,
            close_box=False,
        )

    # use a script because we need the events before the page changes
    events = selenium.execute_script(ACTION_SCRIPT.format(selector=selector))

    # THEN:  the correct Google Analytics event is queued
    #        { eventAction: "login",
    #          eventCategory: "REX Link (highlighting-login)",
    #          eventLabel: "/books/{book_slug}/pages/{page_slug}" }
    # AND:   the page unload Google Analytics event is queued
    #        { eventAction: "/books/{book_slug}/pages/{page_slug}",
    #          eventCategory: "REX unload" }
    second_to_last_event = events[-2]
    assert (
        "eventAction" in second_to_last_event
        and "eventCategory" in second_to_last_event
        and "eventLabel" in second_to_last_event
    ), "Not viewing the correct GA event"
    assert second_to_last_event["eventAction"] == event_action
    assert second_to_last_event["eventCategory"] == event_category
    assert second_to_last_event["eventLabel"] == event_label

    last_event = events[-1]
    assert (
        "eventAction" in last_event
        and "eventCategory" in last_event
        and "eventLabel" not in last_event
    ), "Not viewing the correct GA event"
    assert last_event["eventAction"] == event_unload_action
    assert last_event["eventCategory"] == event_unload_category


@markers.test_case("C621349")
@markers.highlighting
@markers.parametrize("book_slug, page_slug", [("physics", "1-introduction")])
def test_cancel_highlight_delete_ga_event(selenium, base_url, book_slug, page_slug):
    """The page submits the correct GA event when hl deletion is cancelled."""
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
                close_box=False,
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
    assert (
        "eventAction" in last_event and "eventCategory" in last_event and "eventLabel" in last_event
    ), "Not viewing the correct GA event"
    assert last_event["eventAction"] == event_action
    assert last_event["eventCategory"] == event_category
    assert last_event["eventLabel"] == event_label


@markers.test_case("C621350")
@markers.highlighting
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
                close_box=False,
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
    assert (
        "eventAction" in last_event and "eventCategory" in last_event and "eventLabel" in last_event
    ), "Not viewing the correct GA event"
    assert last_event["eventAction"] == event_action
    assert last_event["eventCategory"] == event_category
    assert last_event["eventLabel"] == event_label


@markers.test_case("C621351", "C621352")
@markers.highlighting
@markers.parametrize("book_slug, page_slug", [("physics", "1-introduction")])
def test_edit_existing_note_ga_event(selenium, base_url, book_slug, page_slug):
    """The page submits the correct GA event when existing note is edited."""
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
                close_box=False,
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
    assert (
        "eventAction" in second_to_last_event
        and "eventCategory" in second_to_last_event
        and "eventLabel" in second_to_last_event
    ), "Not viewing the correct GA event"
    assert second_to_last_event["eventAction"] == first_event_action
    assert second_to_last_event["eventCategory"] == first_event_category
    assert second_to_last_event["eventLabel"] == first_event_label

    last_event = events[-1]
    assert (
        "eventAction" in last_event and "eventCategory" in last_event and "eventLabel" in last_event
    ), "Not viewing the correct GA event"
    assert last_event["eventAction"] == second_event_action
    assert last_event["eventCategory"] == second_event_category
    assert last_event["eventLabel"] == second_event_label


@markers.test_case("C621353", "C621354")
@markers.highlighting
@markers.parametrize("book_slug, page_slug", [("physics", "1-introduction")])
def test_add_note_to_highlight_ga_event(selenium, base_url, book_slug, page_slug):
    """The page submits the correct GA event when note added to a highlight."""
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
                close_box=False,
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
    assert (
        "eventAction" in second_to_last_event
        and "eventCategory" in second_to_last_event
        and "eventLabel" in second_to_last_event
    ), "Not viewing the correct GA event"
    assert second_to_last_event["eventAction"] == first_event_action
    assert second_to_last_event["eventCategory"] == first_event_category
    assert second_to_last_event["eventLabel"] == first_event_label

    last_event = events[-1]
    assert (
        "eventAction" in last_event and "eventCategory" in last_event and "eventLabel" in last_event
    ), "Not viewing the correct GA event"
    assert last_event["eventAction"] == second_event_action
    assert last_event["eventCategory"] == second_event_category
    assert last_event["eventLabel"] == second_event_label


@markers.test_case("C621355")
@markers.highlighting
@markers.parametrize("book_slug, page_slug", [("physics", "1-introduction")])
def test_change_highlight_color_ga_event(selenium, base_url, book_slug, page_slug):
    """The page submits the correct GA event when a hl color is changed."""
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
                close_box=False,
            )
        except NoSuchElementException:
            pass

    book.content.highlight_box.toggle_color(changed_color)

    # THEN:  the correct Google Analytics event is queued
    #        { eventAction: "{color}",
    #          eventCategory: "REX highlighting (inline edit)",
    #          eventLabel: "/books/{book_slug}/pages/{page_slug}" }
    last_event = Utilities.get_analytics_queue(selenium, -1)
    assert (
        "eventAction" in last_event and "eventCategory" in last_event and "eventLabel" in last_event
    ), "Not viewing the correct GA event"
    assert last_event["eventAction"] == event_action
    assert last_event["eventCategory"] == event_category
    assert last_event["eventLabel"] == event_label


@markers.test_case("C597671")
@markers.highlighting
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
            close_box=False,
        )

    # THEN:  the create highlight box is opened
    # AND:   the correct Google Analytics event is queued
    #        { eventAction: "show create",
    #          eventCategory: "REX highlighting - show create",
    #          eventLabel: "/books/{book_slug}/pages/{page_slug}" }
    assert book.content.highlight_boxes, "No highlight box found"

    last_event = Utilities.get_analytics_queue(selenium, -1)
    assert (
        "eventAction" in last_event and "eventCategory" in last_event and "eventLabel" in last_event
    ), "Not viewing the correct GA event"
    assert last_event["eventAction"] == event_action
    assert last_event["eventCategory"] == event_category
    assert last_event["eventLabel"] == event_label


@markers.test_case("C597672")
@markers.highlighting
@markers.parametrize("book_slug, page_slug", [("physics", "1-introduction")])
def test_inline_highlighting_login_nudge_ga_event(selenium, base_url, book_slug, page_slug):
    """The page submits the correct GA event when the log in nudge is shown."""
    # SETUP:
    event_action = "show login"
    event_category = "REX highlighting - show login"
    event_label = f"/books/{book_slug}/pages/{page_slug}"

    # GIVEN: a non-logged in user viewing a book page
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    book.driver.add_cookie(VIEW_ANALYTICS_QUEUE)
    while book.notification_present:
        book.notification.got_it()

    # WHEN:  they select some text
    while not book.content.highlight_boxes:
        book.content.highlight(
            target=random.choice(book.content.paragraphs),
            offset=Highlight.ENTIRE,
            color=None,
            close_box=False,
        )

    # THEN:  the inline log in nudge is opened
    # AND:   the correct Google Analytics event is queued
    #        { eventAction: "show login",
    #          eventCategory: "REX highlighting - show login",
    #          eventLabel: "/books/{book_slug}/pages/{page_slug}" }
    assert book.content.highlight_box.login_overlay_present, "Log in not seen"

    last_event = Utilities.get_analytics_queue(selenium, -1)
    assert (
        "eventAction" in last_event and "eventCategory" in last_event and "eventLabel" in last_event
    ), "Not viewing the correct GA event"
    assert last_event["eventAction"] == event_action
    assert last_event["eventCategory"] == event_category
    assert last_event["eventLabel"] == event_label


@markers.test_case("C615600")
@markers.desktop_only
@markers.highlighting
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
                target=random.choice(book.content.paragraphs), offset=Highlight.ENTIRE
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
    assert (
        "eventAction" in last_event and "eventCategory" in last_event and "eventLabel" in last_event
    ), "Not viewing the correct GA event"
    assert event_action in last_event["eventAction"]
    assert last_event["eventCategory"] == event_category
    assert last_event["eventLabel"] == event_label


# ----------------- #
# High Priority SEO #
# ----------------- #


@markers.test_case("C602208")
@markers.parametrize("book_slug", [("chemistry-2e")])
def test_title_and_meta_page_tags_for_seo(selenium, base_url, book_slug):
    """Test the title and meta title property book header tags."""
    # SETUP:
    action_script = "return document.querySelector('[href=\"{}\"]');"
    chapters = ["Ch. 1", "1.1", "Ch. 1", "B"]
    pages = ["1-introduction", "1-1-chemistry-in-context", "1-key-terms", "b-essential-mathematics"]
    starting_page = "preface"
    title = "{chapter} {title} - Chemistry 2e | OpenStax"
    titles = ["Introduction", "Chemistry in Context", "Key Terms", "Essential Mathematics"]

    # GIVEN: a user
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=starting_page).open()

    for section in range(4):
        # WHEN:  they open a book page
        new_page = book.driver.execute_script(action_script.format(pages[section]))
        Utilities.click_option(book.driver, element=new_page)
        book.wait_for_page_to_load()
        page_title, page_meta_title, page_meta_url = book.titles
        expected_title = title.format(chapter=chapters[section], title=titles[section])

        # THEN:  the page title is formatted correctly
        assert page_title == expected_title, "Incorrect title found"

        # AND:   the page meta title tag content is formatted correctly
        assert page_meta_title == expected_title, "Incorrect title found"

        # AND:   the page meta URL tag content is the current page URL
        assert page_meta_url == selenium.current_url, "Incorrect page URL"


@markers.test_case("C605728")
@markers.parametrize("book_slug, page_slug", [("american-government-2e", "1-introduction")])
def test_study_guide_chapter_tag_ga_event(selenium, base_url, book_slug, page_slug):
    """The page submits the correct GA event when a SG chapter tag opened."""
    # SETUP:
    event_action = "Filter study guides by Chapter"
    event_category = "REX Button (SG popup)"
    event_label = f"/books/{book_slug}/pages/{page_slug}"

    # GIVEN: a user viewing a book study guide
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    book.driver.add_cookie(VIEW_ANALYTICS_QUEUE)
    while book.notification_present:
        book.notification.got_it()
    guide = book.toolbar.study_guides()

    # WHEN:  they open click the 'Chapter' filter drop down
    guide.toolbar.chapter.click()

    # THEN:  the correct Google Analytics event is queued
    #        { eventAction: "Filter study guides by Chapter",
    #          eventCategory: "REX Button (SG popup)",
    #          eventLabel: "/books/{book_slug}/pages/{page_slug}" }
    last_event = Utilities.get_analytics_queue(selenium, -1)
    assert (
        "eventAction" in last_event and "eventCategory" in last_event and "eventLabel" in last_event
    ), "Not viewing the correct GA event"
    assert event_action in last_event["eventAction"]
    assert last_event["eventCategory"] == event_category
    assert last_event["eventLabel"] == event_label


@markers.test_case("C607438")
@markers.parametrize("book_slug, page_slug", [("principles-economics-2e", "1-introduction")])
def test_study_guide_cta_sign_up_ga_event(selenium, base_url, book_slug, page_slug):
    """The page submits the correct GA event when sign up link is clicked."""
    # SETUP:
    event_action = "signup"
    event_category = "REX Link (SG popup)"
    event_label = f"/books/{book_slug}/pages/{page_slug}"
    selector = "[data-analytics-label=signup]"

    # GIVEN: a non-logged in user viewing a book page
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    book.driver.add_cookie(VIEW_ANALYTICS_QUEUE)
    while book.notification_present:
        book.notification.got_it()

    # WHEN:  they open the study guide
    # AND:   click the 'Sign Up' button
    book.toolbar.study_guides()

    events = selenium.execute_script(ACTION_SCRIPT.format(selector=selector))

    # THEN:  the correct Google Analytics event is queued
    #        { eventAction: "signup",
    #          eventCategory: "REX Link (SG popup)",
    #          eventLabel: "/books/{book_slug}/pages/{page_slug}" }
    sign_up_link_event = events[-2]
    assert (
        "eventAction" in sign_up_link_event
        and "eventCategory" in sign_up_link_event
        and "eventLabel" in sign_up_link_event
    ), "Not viewing the correct GA event"
    assert event_action in sign_up_link_event["eventAction"]
    assert sign_up_link_event["eventCategory"] == event_category
    assert sign_up_link_event["eventLabel"] == event_label


@markers.test_case("C605716", "C621330")
@markers.parametrize("book_slug, page_slug", [("principles-economics-2e", "1-introduction")])
def test_open_study_guide_ga_event(selenium, base_url, book_slug, page_slug):
    """The page submits the correct GA event when the study guide is opened."""
    # SETUP:
    button_event_action = "button"
    button_event_category = "REX Study guides (open SG popup)"
    button_event_label = f"/books/{book_slug}/pages/{page_slug}"
    open_event_action = "Study guides"
    open_event_category = "REX Button (toolbar)"
    open_event_label = button_event_label

    # GIVEN: a user viewing a book page with a study guide
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    book.driver.add_cookie(VIEW_ANALYTICS_QUEUE)
    while book.notification_present:
        book.notification.got_it()

    # WHEN:  they open the study guide
    book.toolbar.study_guides()

    # THEN:  the correct open Google Analytics event is queued
    #        { eventAction: "Study guides",
    #          eventCategory: "REX Button (toolbar)",
    #          eventLabel: "/books/{book_slug}/pages/{page_slug}" }
    # AND:   the correct button Google Analytics event is queued
    #        { eventAction: "button",
    #          eventCategory: "REX Study guides (open SG popup)",
    #          eventLabel: "/books/{book_slug}/pages/{page_slug}" }
    events = Utilities.get_analytics_queue(selenium)
    open_study_guide_event = events[-3]
    assert (
        "eventAction" in open_study_guide_event
        and "eventCategory" in open_study_guide_event
        and "eventLabel" in open_study_guide_event
    ), "Not viewing the correct GA event"
    assert open_event_action in open_study_guide_event["eventAction"]
    assert open_study_guide_event["eventCategory"] == open_event_category
    assert open_study_guide_event["eventLabel"] == open_event_label

    button_event = events[-1]
    assert (
        "eventAction" in button_event
        and "eventCategory" in button_event
        and "eventLabel" in button_event
    ), "Not viewing the correct GA event"
    assert button_event_action in button_event["eventAction"]
    assert button_event["eventCategory"] == button_event_category
    assert button_event["eventLabel"] == button_event_label


@markers.test_case("C621326")
@markers.parametrize("book_slug, page_slug", [("principles-economics-2e", "1-introduction")])
def test_sg_close_using_overlay_click_ga_event(selenium, base_url, book_slug, page_slug):
    """The page submits the correct GA event when SG close by overlay click."""
    # SETUP:
    event_action = "overlay"
    event_category = "REX Study guides (close SG popup)"
    event_label = f"/books/{book_slug}/pages/{page_slug}"

    # GIVEN: a user viewing a book page with a study guide
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    book.driver.add_cookie(VIEW_ANALYTICS_QUEUE)
    while book.notification_present:
        book.notification.got_it()

    # WHEN:  they open the study guide
    # AND:   click on the content overlay
    guide = book.toolbar.study_guides()

    (ActionChains(selenium).move_to_element_with_offset(guide.overlay, 5, 5).click().perform())

    # THEN:  the correct Google Analytics event is queued
    #        { eventAction: "overlay",
    #          eventCategory: "REX Study guides (close SG popup)",
    #          eventLabel: "/books/{book_slug}/pages/{page_slug}" }
    last_event = Utilities.get_analytics_queue(selenium, -2)
    assert (
        "eventAction" in last_event and "eventCategory" in last_event and "eventLabel" in last_event
    ), "Not viewing the correct GA event"
    assert event_action in last_event["eventAction"]
    assert last_event["eventCategory"] == event_category
    assert last_event["eventLabel"] == event_label


@markers.test_case("C621327")
@markers.parametrize("book_slug, page_slug", [("principles-economics-2e", "1-introduction")])
def test_sg_close_using_esc_key_ga_event(selenium, base_url, book_slug, page_slug):
    """The page submits the correct GA event when close SG by escape key."""
    # SETUP:
    event_action = "esc"
    event_category = "REX Study guides (close SG popup)"
    event_label = f"/books/{book_slug}/pages/{page_slug}"

    # GIVEN: a user viewing a book page with a study guide
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    book.driver.add_cookie(VIEW_ANALYTICS_QUEUE)
    while book.notification_present:
        book.notification.got_it()

    # WHEN:  they open the study guide
    # AND:   hit the escape key
    book.toolbar.study_guides()

    (ActionChains(selenium).send_keys(Keys.ESCAPE).perform())

    # THEN:  the correct Google Analytics event is queued
    #        { eventAction: "esc",
    #          eventCategory: "REX Study guides (close SG popup)",
    #          eventLabel: "/books/{book_slug}/pages/{page_slug}" }
    esc_key_event = Utilities.get_analytics_queue(selenium, -2)
    assert (
        "eventAction" in esc_key_event
        and "eventCategory" in esc_key_event
        and "eventLabel" in esc_key_event
    ), "Not viewing the correct GA event"
    assert event_action in esc_key_event["eventAction"]
    assert esc_key_event["eventCategory"] == event_category
    assert esc_key_event["eventLabel"] == event_label


@markers.test_case("C621328", "C621329")
@markers.parametrize("book_slug, page_slug", [("principles-economics-2e", "1-introduction")])
def test_sg_close_using_x_close_button_ga_events(selenium, base_url, book_slug, page_slug):
    """The page submits the correct GA event when SG close 'x' is clicked."""
    # SETUP:
    button_event_action = "button"
    button_event_category = "REX Study guides (close SG popup)"
    button_event_label = f"/books/{book_slug}/pages/{page_slug}"
    close_event_action = "Close Study Guides"
    close_event_category = "REX Button"
    close_event_label = button_event_label

    # GIVEN: a user viewing a book page with a study guide
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    book.driver.add_cookie(VIEW_ANALYTICS_QUEUE)
    while book.notification_present:
        book.notification.got_it()

    # WHEN:  they open the study guide
    # AND:   click the escape key
    guide = book.toolbar.study_guides()

    guide.header.close()

    # THEN:  the correct close Google Analytics event is queued
    #        { eventAction: "Close Study Guides",
    #          eventCategory: "REX Button",
    #          eventLabel: "/books/{book_slug}/pages/{page_slug}" }
    # AND:   the correct button Google Analytics event is queued
    #        { eventAction: "button",
    #          eventCategory: "REX Study guides (close SG popup)",
    #          eventLabel: "/books/{book_slug}/pages/{page_slug}" }
    events = Utilities.get_analytics_queue(selenium)
    close_event = events[-3]
    assert (
        "eventAction" in close_event
        and "eventCategory" in close_event
        and "eventLabel" in close_event
    ), "Not viewing the correct GA event"
    assert close_event_action in close_event["eventAction"]
    assert close_event["eventCategory"] == close_event_category
    assert close_event["eventLabel"] == close_event_label

    button_event = events[-2]
    assert (
        "eventAction" in button_event
        and "eventCategory" in button_event
        and "eventLabel" in button_event
    ), "Not viewing the correct GA event"
    assert button_event_action in button_event["eventAction"]
    assert button_event["eventCategory"] == button_event_category
    assert button_event["eventLabel"] == button_event_label


@markers.test_case("C621331")
@markers.parametrize("book_slug, page_slug", [("principles-economics-2e", "1-introduction")])
def test_study_guide_log_in_link_ga_event(selenium, base_url, book_slug, page_slug):
    """The page submits the correct GA event when SG log in link is clicked."""
    # SETUP:
    event_action = "login"
    event_category = "REX Link (SG popup)"
    event_label = f"/books/{book_slug}/pages/{page_slug}"
    selector = "[class*=StudyGuides] [data-analytics-label=login]"

    # GIVEN: a user viewing a book page with a study guide
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    book.driver.add_cookie(VIEW_ANALYTICS_QUEUE)
    while book.notification_present:
        book.notification.got_it()

    # WHEN:  they open the study guide
    # AND:   click the 'Log in' link
    book.toolbar.study_guides()

    events = selenium.execute_script(ACTION_SCRIPT.format(selector=selector))

    # THEN:  the correct Google Analytics event is queued
    #        { eventAction: "login",
    #          eventCategory: "REX Link (SG popup)",
    #          eventLabel: "/books/{book_slug}/pages/{page_slug}" }
    log_in_link_event = events[-2]
    assert (
        "eventAction" in log_in_link_event
        and "eventCategory" in log_in_link_event
        and "eventLabel" in log_in_link_event
    ), "Not viewing the correct GA event"
    assert event_action in log_in_link_event["eventAction"]
    assert log_in_link_event["eventCategory"] == event_category
    assert log_in_link_event["eventLabel"] == event_label


@markers.test_case("C621333")
@markers.parametrize("book_slug, page_slug", [("principles-economics-2e", "1-introduction")])
def test_study_guide_remove_chapter_filter_ga_event(selenium, base_url, book_slug, page_slug):
    """The page submits the correct GA event when SA chapter filter removed."""
    # SETUP:
    event_action = "Remove breadcrumb for chapter {number} {name}"
    event_category = "REX Button (SG popup)"
    event_label = f"/books/{book_slug}/pages/{page_slug}"

    # GIVEN: a logged in user viewing a book page
    book = user_setup(selenium, base_url, book_slug, page_slug)

    # WHEN:  they open the study guide
    # AND:   remove a chapter filter
    guide = book.toolbar.study_guides()

    chapter = guide.toolbar.active_filters[0]
    event_action = event_action.format(number=chapter.number, name=chapter.name)
    chapter.remove_filter()

    # THEN:  the correct Google Analytics event is queued
    #        { eventAction: "Remove breadcrumb for chapter {number} {name}",
    #          eventCategory: "REX Button (SG popup)",
    #          eventLabel: "/books/{book_slug}/pages/{page_slug}" }
    last_event = Utilities.get_analytics_queue(selenium, -1)
    assert (
        "eventAction" in last_event and "eventCategory" in last_event and "eventLabel" in last_event
    ), "Not viewing the correct GA event"
    assert event_action.lower() in last_event["eventAction"].lower()
    assert last_event["eventCategory"] == event_category
    assert last_event["eventLabel"] == event_label


@markers.test_case("C609711")
@markers.parametrize("book_slug, page_slug", [("american-government-2e", "1-introduction")])
def test_using_this_guide_ga_event(selenium, base_url, book_slug, page_slug):
    """The page submits the correct GA event when 'Using this guide' in SG."""
    # SETUP:
    event_action = "button"
    event_category = "REX Study guides (open UTG)"
    event_label = f"/books/{book_slug}/pages/{page_slug}"

    # GIVEN: a logged in user viewing a book page
    book = user_setup(selenium, base_url, book_slug, page_slug)

    # WHEN:  they open the study guide
    # AND:   open the 'Using this guide' banner
    guide = book.toolbar.study_guides()
    if guide.toolbar.guide_is_open:
        guide.toolbar.help_guide.close()

    using_this_guide = guide.toolbar.using_this_guide()

    # THEN:  the correct Google Analytics event is queued
    #        { eventAction: "button",
    #          eventCategory: "REX Study guides (open UTG)",
    #          eventLabel: "/books/{book_slug}/pages/{page_slug}" }
    events = Utilities.get_analytics_queue(selenium)
    last_event = events[-1]
    assert (
        "eventAction" in last_event and "eventCategory" in last_event and "eventLabel" in last_event
    ), "Not viewing the correct GA event"
    assert event_action in last_event["eventAction"]
    assert last_event["eventCategory"] == event_category
    assert last_event["eventLabel"] == event_label

    # WHEN:  they close the 'Using this guide' banner
    using_this_guide.close()

    # THEN:  no new Google Analytics event is created
    ga_queue = Utilities.get_analytics_queue(selenium)
    assert len(ga_queue) == len(events), "new GA event(s) created"


@markers.test_case("C620209")
@markers.parametrize(
    "book_slug, page_slug", [("physics", "1-1-physics-definitions-and-applications")]
)
def test_practice_opened_ga_event(selenium, base_url, book_slug, page_slug):
    """The page submits the correct GA event when Practice is opened."""
    # SETUP:
    button_event_action = "button"
    button_event_category = "REX Practice questions (open PQ popup)"
    button_event_label = f"/books/{book_slug}/pages/{page_slug}"
    link_event_action = f"{page_slug}?modal=PQ"
    link_event_category = "REX Link (toolbar)"
    link_event_label = button_event_label

    # GIVEN: a user viewing a book page with practice questions
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    book.driver.add_cookie(VIEW_ANALYTICS_QUEUE)
    while book.notification_present:
        book.notification.got_it()

    # WHEN:  they click the 'Practice' toolbar button
    book.toolbar.practice()

    # THEN:  the correct Practice link Google Analytics event is queued
    #        { eventAction: "{page_slug}?modal=PQ",
    #          eventCategory: "REX Link (toolbar)",
    #          eventLabel: "/books/{book_slug}/pages/{page_slug}" }
    # AND:   the correct button Google Analytics event is queued
    #        { eventAction: "button",
    #          eventCategory: "REX Study guides (close SG popup)",
    #          eventLabel: "/books/{book_slug}/pages/{page_slug}" }
    events = Utilities.get_analytics_queue(selenium)
    link_event = events[-3]
    assert (
        "eventAction" in link_event and "eventCategory" in link_event and "eventLabel" in link_event
    ), "Not viewing the correct GA event"
    assert link_event_action in link_event["eventAction"]
    assert link_event["eventCategory"] == link_event_category
    assert link_event["eventLabel"] == link_event_label

    button_event = events[-2]
    assert (
        "eventAction" in button_event
        and "eventCategory" in button_event
        and "eventLabel" in button_event
    ), "Not viewing the correct GA event"
    assert button_event_action in button_event["eventAction"]
    assert button_event["eventCategory"] == button_event_category
    assert button_event["eventLabel"] == button_event_label


@markers.test_case("C621317")
@markers.parametrize("book_slug, page_slug", [("physics", "1-introduction")])
def test_continue_to_questions_button_ga_event(selenium, base_url, book_slug, page_slug):
    """The page submits the correct GA event when Continue button clicked."""
    # SETUP:
    event_action = "Continue (Empty Screen)"
    event_category = "REX Button (PQ popup)"
    event_label = None
    re_title = re.compile(r"(?:Ch\.\ \d{1,2})?(\ ?.*)(?:\ \-\ .*){1}")

    # GIVEN: a user viewing the practice modal for a page without questions
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    book.driver.add_cookie(VIEW_ANALYTICS_QUEUE)
    while book.notification_present:
        book.notification.got_it()
    practice = book.toolbar.practice()
    event_label = re_title.match(book.page_title).groups()[0]

    # WHEN:  they click the 'Continue' button
    practice.content._continue()

    # THEN:  the correct Google Analytics event is queued
    #        { eventAction: "Continue (Empty Screen)",
    #          eventCategory: "REX Button (PQ popup)",
    #          eventLabel: "{page_title}" }
    last_event = Utilities.get_analytics_queue(selenium, -1)
    assert (
        "eventAction" in last_event and "eventCategory" in last_event and "eventLabel" in last_event
    ), "Not viewing the correct GA event"
    assert event_action in last_event["eventAction"]
    assert last_event["eventCategory"] == event_category
    assert last_event["eventLabel"] == event_label


@markers.test_case("C621318")
@markers.parametrize(
    "book_slug, page_slug", [("physics", "1-1-physics-definitions-and-applications")]
)
def test_submit_practice_question_answer_ga_event(selenium, base_url, book_slug, page_slug):
    """The page submits the correct GA event when submiting a PQ answer."""
    # SETUP:
    event_action = "Submit"
    event_category = "REX Button (PQ popup)"
    event_label = None

    # GIVEN: a student viewing a practice question
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    book.driver.add_cookie(VIEW_ANALYTICS_QUEUE)
    while book.notification_present:
        book.notification.got_it()
    practice = book.toolbar.practice()
    practice.content.start_now()
    event_label = f"{practice.content.number} {practice.content.title}"

    # WHEN:  they select an answer option
    # AND:   click the 'Submit' button
    answer = random.choice(practice.content.answers)
    answer.select()

    practice.content.submit()

    # THEN:  the correct Google Analytics event is queued
    #        { eventAction: "Submit",
    #          eventCategory: "REX Button (PQ popup)",
    #          eventLabel: "{section page title}" }
    last_event = Utilities.get_analytics_queue(selenium, -1)
    assert (
        "eventAction" in last_event and "eventCategory" in last_event and "eventLabel" in last_event
    ), "Not viewing the correct GA event"
    assert event_action in last_event["eventAction"]
    assert last_event["eventCategory"] == event_category
    assert last_event["eventLabel"] == event_label


@markers.test_case("C621319")
@markers.parametrize("book_slug, page_slug", [("physics", "2-4-velocity-vs-time-graphs")])
def test_practice_question_finish_section_button_ga_event(selenium, base_url, book_slug, page_slug):
    """The page submits the correct GA event when 'Finish' button clicked."""
    # SETUP:
    event_action = "Finish"
    event_category = "REX Button (PQ popup)"
    event_label = None

    # GIVEN: a student viewing a practice question
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    book.driver.add_cookie(VIEW_ANALYTICS_QUEUE)
    while book.notification_present:
        book.notification.got_it()
    practice = book.toolbar.practice()
    practice.content.start_now()
    event_label = f"{practice.content.number} {practice.content.title}"

    # WHEN:  they answer each question
    # AND:   click the 'Finish' button
    for question in practice.content.questions:
        answer = random.choice(practice.content.answers)
        answer.select()
        practice.content.submit()
        try:
            practice.content._next()
        except NoSuchElementException:
            break

    practice.content.finish()

    # THEN:  the correct Google Analytics event is queued
    #        { eventAction: "Finish",
    #          eventCategory: "REX Button (PQ popup)",
    #          eventLabel: "{section page title}" }
    last_event = Utilities.get_analytics_queue(selenium, -1)
    assert (
        "eventAction" in last_event and "eventCategory" in last_event and "eventLabel" in last_event
    ), "Not viewing the correct GA event"
    assert event_action in last_event["eventAction"]
    assert last_event["eventCategory"] == event_category
    assert last_event["eventLabel"] == event_label


@markers.test_case("C621320")
@markers.smoke_test
@markers.parametrize(
    "book_slug, page_slug", [("physics", "1-1-physics-definitions-and-applications")]
)
def test_practice_show_answer_button_ga_event(selenium, base_url, book_slug, page_slug):
    """The page submits the correct GA event when show answer clicked."""
    # SETUP:
    event_action = "Show answer"
    event_category = "REX Button (PQ popup)"
    event_label = None

    # GIVEN: a student viewing a practice question
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    book.driver.add_cookie(VIEW_ANALYTICS_QUEUE)
    while book.notification_present:
        book.notification.got_it()
    practice = book.toolbar.practice()
    practice.content.start_now()

    # WHEN:  they answer a question incorrectly
    # AND:   click the 'Show answer' button
    for question in practice.content.questions:
        answer = random.choice(practice.content.answers)
        answer.select()
        practice.content.submit()
        try:
            practice.content.show_answer()
            break
        except NoSuchElementException:
            practice.content._next()
    event_label = f"{practice.content.number} {practice.content.title}"

    # THEN:  the correct Google Analytics event is queued
    #        { eventAction: "Show answer",
    #          eventCategory: "REX Button (PQ popup)",
    #          eventLabel: "{section page title}" }
    last_event = Utilities.get_analytics_queue(selenium, -1)
    assert (
        "eventAction" in last_event and "eventCategory" in last_event and "eventLabel" in last_event
    ), "Not viewing the correct GA event"
    assert event_action in last_event["eventAction"]
    assert last_event["eventCategory"] == event_category
    assert last_event["eventLabel"] == event_label


@markers.test_case("C621321")
@markers.parametrize(
    "book_slug, page_slug", [("physics", "1-1-physics-definitions-and-applications")]
)
def test_skip_practice_question_ga_event(selenium, base_url, book_slug, page_slug):
    """The page submits the correct GA event when skip link is clicked."""
    # SETUP:
    event_action = "Skip"
    event_category = "REX Button (PQ popup)"
    event_label = None

    # GIVEN: a student viewing a practice question
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    book.driver.add_cookie(VIEW_ANALYTICS_QUEUE)
    while book.notification_present:
        book.notification.got_it()
    practice = book.toolbar.practice()
    practice.content.start_now()

    # WHEN:  they click the 'Skip' link
    practice.content.skip()
    event_label = f"{practice.content.number} {practice.content.title}"

    # THEN:  the correct Google Analytics event is queued
    #        { eventAction: "Skip",
    #          eventCategory: "REX Button (PQ popup)",
    #          eventLabel: "{section page title}" }
    last_event = Utilities.get_analytics_queue(selenium, -1)
    assert (
        "eventAction" in last_event and "eventCategory" in last_event and "eventLabel" in last_event
    ), "Not viewing the correct GA event"
    assert event_action in last_event["eventAction"]
    assert last_event["eventCategory"] == event_category
    assert last_event["eventLabel"] == event_label


@markers.test_case("C621322")
@markers.parametrize("book_slug, page_slug", [("physics", "1-introduction")])
def test_close_practice_by_clicking_the_overlay_ga_event(selenium, base_url, book_slug, page_slug):
    """The page submits the correct GA event when the overlay is clicked."""
    # SETUP:
    event_action = "overlay"
    event_category = "REX Practice questions (close PQ popup)"
    event_label = f"/books/{book_slug}/pages/{page_slug}"

    # GIVEN: a student viewing the practice question modal
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    book.driver.add_cookie(VIEW_ANALYTICS_QUEUE)
    while book.notification_present:
        book.notification.got_it()
    practice = book.toolbar.practice()

    # WHEN:  they click the overlay outside the modal
    (ActionChains(selenium).move_to_element_with_offset(practice.overlay, 5, 5).click().perform())

    # THEN:  the correct Google Analytics event is queued
    #        { eventAction: "overlay",
    #          eventCategory: "REX Practice questions (close PQ popup)",
    #          eventLabel: "/books/{book_slug}/pages/{page_slug}" }
    last_event = Utilities.get_analytics_queue(selenium, -1)
    assert (
        "eventAction" in last_event and "eventCategory" in last_event and "eventLabel" in last_event
    ), "Not viewing the correct GA event"
    assert event_action in last_event["eventAction"]
    assert last_event["eventCategory"] == event_category
    assert last_event["eventLabel"] == event_label


@markers.test_case("C621323")
@markers.parametrize("book_slug, page_slug", [("physics", "1-introduction")])
def test_close_practice_by_using_esc_key_ga_event(selenium, base_url, book_slug, page_slug):
    """The page submits the correct GA event when ESC key hit."""
    # SETUP:
    event_action = "esc"
    event_category = "REX Practice questions (close PQ popup)"
    event_label = f"/books/{book_slug}/pages/{page_slug}"

    # GIVEN: a student viewing the practice question modal
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    book.driver.add_cookie(VIEW_ANALYTICS_QUEUE)
    while book.notification_present:
        book.notification.got_it()
    book.toolbar.practice()

    # WHEN:  they hit the escape key
    (ActionChains(selenium).send_keys(Keys.ESCAPE).perform())

    # THEN:  the correct Google Analytics event is queued
    #        { eventAction: "esc",
    #          eventCategory: "REX Practice questions (close PQ popup)",
    #          eventLabel: "/books/{book_slug}/pages/{page_slug}" }
    last_event = Utilities.get_analytics_queue(selenium, -1)
    assert (
        "eventAction" in last_event and "eventCategory" in last_event and "eventLabel" in last_event
    ), "Not viewing the correct GA event"
    assert event_action in last_event["eventAction"]
    assert last_event["eventCategory"] == event_category
    assert last_event["eventLabel"] == event_label


@markers.test_case("C621324")
@markers.smoke_test
@markers.parametrize("book_slug, page_slug", [("physics", "1-introduction")])
def test_practice_closed_when_x_close_button_clicked_ga_events(
    selenium, base_url, book_slug, page_slug
):
    """The page submits the correct GA events when 'x' close button clicked."""
    # SETUP:
    button_event_action = "button"
    button_event_category = "REX Practice questions (close PQ popup)"
    button_event_label = f"/books/{book_slug}/pages/{page_slug}"
    close_event_action = "Click to close Practice Questions modal"
    close_event_category = "REX Button"
    close_event_label = button_event_label

    # GIVEN: a student viewing the practice question modal
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    book.driver.add_cookie(VIEW_ANALYTICS_QUEUE)
    while book.notification_present:
        book.notification.got_it()
    practice = book.toolbar.practice()

    # WHEN:  they click the close 'x' button
    practice.close()

    # THEN:  the correct Google Analytics close event is queued
    #        { eventAction: "Click to close Practice Questions modal",
    #          eventCategory: "REX Button",
    #          eventLabel: "/books/{book_slug}/pages/{page_slug}" }
    # AND:   the correct Google Analytics button event is queued
    #        { eventAction: "button",
    #          eventCategory: "REX Practice questions (close PQ popup)",
    #          eventLabel: "/books/{book_slug}/pages/{page_slug}" }
    events = Utilities.get_analytics_queue(selenium)
    close_event = events[-3]
    assert (
        "eventAction" in close_event
        and "eventCategory" in close_event
        and "eventLabel" in close_event
    ), "Not viewing the correct GA event"
    assert close_event_action in close_event["eventAction"]
    assert close_event["eventCategory"] == close_event_category
    assert close_event["eventLabel"] == close_event_label

    button_event = events[-1]
    assert (
        "eventAction" in button_event
        and "eventCategory" in button_event
        and "eventLabel" in button_event
    ), "Not viewing the correct GA event"
    assert button_event_action in button_event["eventAction"]
    assert button_event["eventCategory"] == button_event_category
    assert button_event["eventLabel"] == button_event_label


@markers.test_case("C621325")
@markers.parametrize("book_slug, page_slug", [("physics", "1-introduction")])
def test_practice_read_link_ga_event(selenium, base_url, book_slug, page_slug):
    """The page submits the correct GA event when read link is clicked."""
    # SETUP:
    event_action = "Go to link"
    event_category = "REX Link (PQ popup)"
    event_label = None
    selector = "[data-analytics-label='Go to link']"

    # GIVEN: a student viewing the practice question modal
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    book.driver.add_cookie(VIEW_ANALYTICS_QUEUE)
    while book.notification_present:
        book.notification.got_it()
    practice = book.toolbar.practice()

    # WHEN:  they click the read link
    event_label = f"{practice.content.number} {practice.content.title}"
    events = selenium.execute_script(ACTION_SCRIPT.format(selector=selector))

    # THEN:  the correct Google Analytics event is queued
    #        { eventAction: "Go to link",
    #          eventCategory: "REX Link (PQ popup)",
    #          eventLabel: "/books/{book_slug}/pages/{page_slug}" }
    last_event = events[-1]
    assert (
        "eventAction" in last_event and "eventCategory" in last_event and "eventLabel" in last_event
    ), "Not viewing the correct GA event"
    assert event_action in last_event["eventAction"]
    assert last_event["eventCategory"] == event_category
    assert last_event["eventLabel"] in event_label


@markers.test_case("C622245")
@markers.smoke_test
@markers.parametrize("book_slug, page_slug", [("physics", "2-4-velocity-vs-time-graphs")])
def test_pq_continue_to_next_section_button_click_ga_event(
    selenium, base_url, book_slug, page_slug
):
    """The page submits the correct GA event when continuing to next pq set."""
    # SETUP:
    event_action = "Continue (Final Screen)"
    event_category = "REX Button (PQ popup)"
    event_label = None

    # GIVEN: a student viewing the practice question modal
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    book.driver.add_cookie(VIEW_ANALYTICS_QUEUE)
    while book.notification_present:
        book.notification.got_it()
    practice = book.toolbar.practice()

    # WHEN:  they answer each question
    # AND:   click the 'Continue' button
    practice.content.start_now()
    for question in practice.content.questions:
        answer = random.choice(practice.content.answers)
        answer.select()
        practice.content.submit()
        try:
            practice.content._next()
        except NoSuchElementException:
            practice.content.finish()

    event_label = f"{practice.content.number} {practice.content.title}"
    practice.content._continue()

    # THEN:  the correct Google Analytics event is queued
    #        { eventAction: "Continue (Final Screen)",
    #          eventCategory: "REX Button (PQ popup)",
    #          eventLabel: "{section page title}" }
    last_event = Utilities.get_analytics_queue(selenium, -1)
    assert (
        "eventAction" in last_event and "eventCategory" in last_event and "eventLabel" in last_event
    ), "Not viewing the correct GA event"
    assert event_action in last_event["eventAction"]
    assert last_event["eventCategory"] == event_category
    assert last_event["eventLabel"] == event_label


@markers.test_case("C622246")
@markers.parametrize("book_slug, page_slug", [("physics", "1-introduction")])
def test_practice_filter_ga_events(selenium, base_url, book_slug, page_slug):
    """The page submits the correct GA events when a PQ filter selected."""
    # SETUP:
    filter_menu_event_action = "Filter PQ by Chapter & Section"
    filter_menu_event_category = "REX Button (PQ popup)"
    filter_menu_event_label = None
    filter_section_event_action = None
    filter_section_event_category = "REX Button (PQ popup)"
    filter_section_event_label = None

    # GIVEN: a student viewing the practice question modal
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    book.driver.add_cookie(VIEW_ANALYTICS_QUEUE)
    while book.notification_present:
        book.notification.got_it()
    practice = book.toolbar.practice()
    filter_menu_event_label = f"{practice.content.number} {practice.content.title}"
    filter_section_event_label = filter_menu_event_label

    # WHEN:  they select a different section filter
    filters = practice.filters.toggle()
    filters.chapters[0].toggle()
    section = filters.chapters[0].sections[0]
    filter_section_event_action = f"Filter PQ by {section.number} {section.title}"
    section.select()

    # THEN:  the correct Google Analytics filter menu event is queued
    #        { eventAction: "Filter PQ by Chapter & Section",
    #          eventCategory: "REX Button (PQ popup)",
    #          eventLabel: "{section page title}" }
    # AND:   the correct Google Analytics filter selection event is queued
    #        { eventAction: "button",
    #          eventCategory: "REX Practice questions (close PQ popup)",
    #          eventLabel: "{section page title}" }
    events = Utilities.get_analytics_queue(selenium)
    menu_event = events[-2]
    assert (
        "eventAction" in menu_event and "eventCategory" in menu_event and "eventLabel" in menu_event
    ), "Not viewing the correct GA event"
    assert filter_menu_event_action in menu_event["eventAction"]
    assert menu_event["eventCategory"] == filter_menu_event_category
    assert menu_event["eventLabel"] == filter_menu_event_label

    selection_event = events[-1]
    assert (
        "eventAction" in selection_event
        and "eventCategory" in selection_event
        and "eventLabel" in selection_event
    ), "Not viewing the correct GA event"
    assert filter_section_event_action in selection_event["eventAction"]
    assert selection_event["eventCategory"] == filter_section_event_category
    assert selection_event["eventLabel"] == filter_section_event_label


@markers.test_case("C620825")
@markers.parametrize(
    "book_slug, page_slug", [("physics", "1-1-physics-definitions-and-applications")]
)
def test_start_practice_ga_event(selenium, base_url, book_slug, page_slug):
    """The page submits the correct GA event when starting a practice."""
    # SETUP:
    event_action = "Start now"
    event_category = "REX Button (PQ popup)"
    event_label = None

    # GIVEN: a logged in user viewing a numbered section page
    book = user_setup(selenium, base_url, book_slug, page_slug)
    event_label, _, _ = book.titles
    event_label = event_label.split(" - ")[0]

    # WHEN:  they click the 'Practice' button
    # AND:   click the 'Start now' button
    practice = book.toolbar.practice()

    practice.content.start_now()

    # THEN:  the correct Google Analytics event is queued
    #        { eventAction: "Start now",
    #          eventCategory: "REX Button (PQ popup)",
    #          eventLabel: "{page title}" }
    last_event = Utilities.get_analytics_queue(selenium, -1)
    assert (
        "eventAction" in last_event and "eventCategory" in last_event and "eventLabel" in last_event
    ), "Not viewing the correct GA event"
    assert event_action in last_event["eventAction"]
    assert last_event["eventCategory"] == event_category
    assert last_event["eventLabel"] == event_label


def user_setup(driver, base_url, book_slug, page_slug):
    """Setup a new user for use in Goggle Analytics event tests."""
    book = Content(driver, base_url, book_slug=book_slug, page_slug=page_slug).open()
    book.driver.add_cookie(VIEW_ANALYTICS_QUEUE)
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
