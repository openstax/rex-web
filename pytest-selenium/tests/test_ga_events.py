"""Test Reading Experience Google Analytics message queuing ."""

import random

from selenium.common.exceptions import NoSuchElementException

from pages.accounts import Signup
from pages.content import Content
from tests import markers
from utils.utility import Color, Highlight, Utilities


@markers.test_case("C591502")
@markers.parametrize("book_slug, page_slug", [("physics", "1-introduction")])
def test_the_user_clicks_a_toc_link_ga_event(
        selenium, base_url, book_slug, page_slug):
    """The page submits the correct GA event when a TOC link is clicked."""
    # SETUP:
    event_action = None
    event_category = "REX Link (toc)"
    event_label = f"/books/{book_slug}/pages/{page_slug}"

    # GIVEN: a user viewing a book page
    book = Content(selenium, base_url,
                   book_slug=book_slug, page_slug=page_slug).open()
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
    assert(
        "eventAction" in toc_link_event and
        "eventCategory" in toc_link_event and
        "eventLabel" in toc_link_event
    ), "Not viewing the correct GA event"
    assert(toc_link_event["eventAction"] == event_action)
    assert(toc_link_event["eventCategory"] == event_category)
    assert(toc_link_event["eventLabel"] == event_label)


@markers.test_case("C591503")
@markers.parametrize("book_slug, page_slug", [("physics", "1-introduction")])
def test_user_clicks_the_order_a_print_copy_link_ga_event(
        selenium, base_url, book_slug, page_slug):
    """The page submits the correct GA event when a print link is clicked."""
    # SETUP:
    event_action = "buy-book"
    event_category = "REX Link"
    event_label = f"/books/{book_slug}/pages/{page_slug}"

    # GIVEN: a user viewing a book page
    book = Content(selenium, base_url,
                   book_slug=book_slug, page_slug=page_slug).open()
    while book.notification_present:
        book.notification.got_it()

    # WHEN:  they click the 'Order a print copy' button
    book.order_a_print_copy(remain_on_page=True)

    # THEN:  the correct Google Analytics event is queued
    #        { eventAction: "buy-book",
    #          eventCategory: "REX Link (toolbar)",
    #          eventLabel: "/books/{book_slug}/pages/{page_slug}" }
    last_event = Utilities.get_analytics_queue(selenium, -1)
    assert(
        "eventAction" in last_event and
        "eventCategory" in last_event and
        "eventLabel" in last_event
    ), "Not viewing the correct GA event"
    assert(last_event["eventAction"] == event_action)
    assert(last_event["eventCategory"] == event_category)
    assert(last_event["eventLabel"] == event_label)


@markers.test_case("C621361", "C621362")
@markers.parametrize(
    "book_slug, page_slug",
    [("physics", "1-2-the-scientific-methods")]
)
def test_user_clicks_the_previous_and_next_page_links_ga_events(
        selenium, base_url, book_slug, page_slug):
    """The page submits the correct GA event when the page link is clicked."""
    # SETUP:
    action_script = (
        'document.querySelector("[data-analytics-label={label}]").click(); '
        "return __APP_ANALYTICS.googleAnalyticsClient.getPendingCommands()"
        ".map(x => x.command.payload);"
    )
    load_script = (
        'return document.querySelector("[data-analytics-label={label}]");'
    )
    next_event_action = "next"
    next_event_category = "REX Link (prev-next)"
    next_event_label = None  # Not yet known
    previous_event_action = "prev"
    previous_event_category = next_event_category
    previous_event_label = f"/books/{book_slug}/pages/{page_slug}"

    # GIVEN: a user viewing a book that is not the first book page
    book = Content(selenium, base_url,
                   book_slug=book_slug, page_slug=page_slug).open()
    while book.notification_present:
        book.notification.got_it()

    # WHEN:  they click the 'Previous' link
    #        (use a script because we need the events before the page changes)
    events = selenium.execute_script(
        action_script.format(label=previous_event_action)
    )
    book.wait.until(lambda _: book.driver.execute_script(
        load_script.format(label=next_event_action)
    ))

    # THEN:  the correct Google Analytics event is queued
    #        { eventAction: "prev",
    #          eventCategory: "REX Link (prev-next)",
    #          eventLabel: "/books/{book_slug}/pages/{page_slug}" }
    next_event_label = "/".join([""] + selenium.current_url.split("/")[3:])
    transition_event = events[-2]
    assert(
        "eventAction" in transition_event and
        "eventCategory" in transition_event and
        "eventLabel" in transition_event
    ), "Not viewing the correct GA event"
    assert(transition_event["eventAction"] == previous_event_action)
    assert(transition_event["eventCategory"] == previous_event_category)
    assert(transition_event["eventLabel"] == previous_event_label)

    # WHEN:  they click the 'Next' link
    #        (use a script because we need the events before the page changes)
    events = selenium.execute_script(
        action_script.format(label=next_event_action)
    )

    # THEN:  the correct Google Analytics event is queued
    #        { eventAction: "next",
    #          eventCategory: "REX Link (prev-next)",
    #          eventLabel: "/books/{book_slug}/pages/{page_slug}" }
    transition_event = events[-2]
    assert(
        "eventAction" in transition_event and
        "eventCategory" in transition_event and
        "eventLabel" in transition_event
    ), "Not viewing the correct GA event"
    assert(transition_event["eventAction"] == next_event_action)
    assert(transition_event["eventCategory"] == next_event_category)
    assert(transition_event["eventLabel"] == next_event_label)


@markers.test_case("C621363")
@markers.parametrize("book_slug, page_slug", [("physics", "1-introduction")])
def test_user_logout_ga_event(
        selenium, base_url, book_slug, page_slug):
    """The page submits the correct GA event when a user logs out."""
    # SETUP:
    action_script = (
        'document.querySelector("a[href*=logout]").click(); '
        "return __APP_ANALYTICS.googleAnalyticsClient.getPendingCommands()"
        ".map(x => x.command.payload);"
    )
    event_action = f"/accounts/logout?r=/books/{book_slug}/pages/{page_slug}"
    event_category = "REX Link (openstax-navbar)"
    event_label = f"/books/{book_slug}/pages/{page_slug}"

    # GIVEN: a logged in user viewing a book page
    book = user_setup(selenium, base_url, book_slug, page_slug)

    # WHEN:  they click the user menu
    # AND:   click the 'Log out' menu link
    book.navbar.click_user_name()
    events = selenium.execute_script(action_script)

    # THEN:  the correct Google Analytics event is queued
    #        { eventAction: "/accounts/logout?r=/books/{book_slug}/pages/{page_slug}",  # NOQA
    #          eventCategory: "REX Link (openstax-navbar)",
    #          eventLabel: "/books/{book_slug}/pages/{page_slug}" }
    log_out_event = events[-2]
    assert(
        "eventAction" in log_out_event and
        "eventCategory" in log_out_event and
        "eventLabel" in log_out_event
    ), "Not viewing the correct GA event"
    assert(log_out_event["eventAction"] == event_action)
    assert(log_out_event["eventCategory"] == event_category)
    assert(log_out_event["eventLabel"] == event_label)


@markers.test_case("C621364", "C621366")
@markers.parametrize("book_slug, page_slug", [("physics", "1-introduction")])
def test_open_and_close_the_table_of_contents_ga_events(
        selenium, base_url, book_slug, page_slug):
    """The page submits the correct GA event when the ToC is opened."""
    # SETUP:
    close_event_action = "Click to close the Table of Contents"
    close_event_category = "REX Button (toc)"
    close_event_label = f"/books/{book_slug}/pages/{page_slug}"
    open_event_action = "Click to open the Table of Contents"
    open_event_category = "REX Button (toolbar)"
    open_event_label = close_event_label

    # GIVEN: a user viewing a book page and the ToC is open
    book = Content(selenium, base_url,
                   book_slug=book_slug, page_slug=page_slug).open()
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
    assert(
        "eventAction" in last_event and
        "eventCategory" in last_event and
        "eventLabel" in last_event
    ), "Not viewing the correct GA event"
    assert(last_event["eventAction"] == close_event_action)
    assert(last_event["eventCategory"] == close_event_category)
    assert(last_event["eventLabel"] == close_event_label)

    # WHEN:  they open the table of contents
    book.toolbar.click_toc_toggle_button()

    # THEN:  the correct Google Analytics event is queued
    #        { eventAction: "Click to open the Table of Contents",
    #          eventCategory: "REX Button (toolbar)",
    #          eventLabel: "/books/{book_slug}/pages/{page_slug}" }
    last_event = Utilities.get_analytics_queue(selenium, -1)
    assert(
        "eventAction" in last_event and
        "eventCategory" in last_event and
        "eventLabel" in last_event
    ), "Not viewing the correct GA event"
    assert(last_event["eventAction"] == open_event_action)
    assert(last_event["eventCategory"] == open_event_category)
    assert(last_event["eventLabel"] == open_event_label)


@markers.test_case("C621365")
@markers.parametrize(
    "book_slug, page_slug",
    [("physics", "1-1-physics-definitions-and-applications")]
)
def test_click_a_figure_link_ga_event(
        selenium, base_url, book_slug, page_slug):
    """The page submits the correct GA event when a figure link is clicked."""
    # SETUP:
    event_action = None  # Not yet known, uses the anchor reference
    event_category = "REX Link"
    event_label = f"/books/{book_slug}/pages/{page_slug}"

    # GIVEN: a user viewing a book page with a figure link
    book = Content(selenium, base_url,
                   book_slug=book_slug, page_slug=page_slug).open()
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
    assert(
        "eventAction" in link_click_event and
        "eventCategory" in link_click_event and
        "eventLabel" in link_click_event
    ), "Not viewing the correct GA event"
    assert(link_click_event["eventAction"] == event_action)
    assert(link_click_event["eventCategory"] == event_category)
    assert(link_click_event["eventLabel"] == event_label)


@markers.test_case("C621367")
@markers.parametrize("book_slug, page_slug", [("physics", "1-introduction")])
def test_account_profile_menu_bar_click_ga_event(
        selenium, base_url, book_slug, page_slug):
    """The page submits the correct GA event when account profile clicked."""
    # SETUP:
    action_script = (
        'document.querySelector("a[href*=profile]").click(); '
        "return __APP_ANALYTICS.googleAnalyticsClient.getPendingCommands()"
        ".map(x => x.command.payload);"
    )
    event_action = "/accounts/profile"
    event_category = "REX Link (openstax-navbar)"
    event_label = f"/books/{book_slug}/pages/{page_slug}"

    # GIVEN: a logged in user viewing a book page
    book = user_setup(selenium, base_url, book_slug, page_slug)

    # WHEN:  they click their name in the nav bar
    # AND:   click the 'Account Profile' link
    # AND:   switch back to the initial tabas
    book.navbar.click_user_name()
    events = selenium.execute_script(action_script)

    # THEN:  the correct Google Analytics event is queued
    #        { eventAction: "/accounts/profile",
    #          eventCategory: "REX Link (openstax-navbar)",
    #          eventLabel: "/books/{book_slug}/pages/{page_slug}" }
    last_event = events[-1]
    assert(
        "eventAction" in last_event and
        "eventCategory" in last_event and
        "eventLabel" in last_event
    ), "Not viewing the correct GA event"
    assert(last_event["eventAction"] == event_action)
    assert(last_event["eventCategory"] == event_category)
    assert(last_event["eventLabel"] == event_label)


@markers.test_case("C621368")
@markers.parametrize("book_slug, page_slug", [("physics", "1-introduction")])
def test_clicking_a_search_excerpt_ga_event(
        selenium, base_url, book_slug, page_slug):
    """The page submits the correct GA event when ."""
    # SETUP:
    event_action = None  # Not yet known, uses the search result link reference
    event_category = "REX Link"
    event_label = f"/books/{book_slug}/pages/{page_slug}"
    search_term = "Andromeda"

    # GIVEN: a user viewing a book page
    # AND:   searched the book for a term
    book = Content(selenium, base_url,
                   book_slug=book_slug, page_slug=page_slug).open()
    while book.notification_present:
        book.notification.got_it()
    search = book.mobile_search_toolbar if book.is_mobile else book.toolbar
    search_results = search.search_for(search_term).results

    # WHEN:  they click on a search excerpt
    link = random.choice(search_results)
    event_action = link.get_attribute("href").split("/")[-1]
    Utilities.click_option(selenium, element=link)

    # THEN:  the correct Google Analytics search link event is queued
    #        { eventAction: "{new page slug}",
    #          eventCategory: "REX Link",
    #          eventLabel: "/books/{book_slug}/pages/{page_slug}" }
    link_click_event = Utilities.get_analytics_queue(selenium, -2)
    assert(
        "eventAction" in link_click_event and
        "eventCategory" in link_click_event and
        "eventLabel" in link_click_event
    ), "Not viewing the correct GA event"
    assert(link_click_event["eventAction"] == event_action)
    assert(link_click_event["eventCategory"] == event_category)
    assert(link_click_event["eventLabel"] == event_label)


@markers.test_case("C621369")
@markers.parametrize("book_slug, page_slug", [("physics", "1-introduction")])
def test_banner_book_title_click_ga_event(
        selenium, base_url, book_slug, page_slug):
    """The page submits the correct GA event when the book title is clicked."""
    # SETUP:
    event_action = "/details/books/{book_slug}"
    event_category = "REX Link (book-banner-collapsed)"
    event_label = f"/books/{book_slug}/pages/{page_slug}"

    # GIVEN: a non-logged in user viewing a book page that is scrolled down
    book = Content(selenium, base_url,
                   book_slug=book_slug, page_slug=page_slug).open()
    while book.notification_present:
        book.notification.got_it()

    # WHEN:  they click on the banner book title
    assert(False)

    # THEN:  the correct Google Analytics event is queued
    #        { eventAction: "/details/books/{book_slug}",
    #          eventCategory: "REX Link (book-banner-collapsed)",
    #          eventLabel: "/books/{book_slug}/pages/{page_slug}" }
    last_event = Utilities.get_analytics_queue(selenium, -1)
    assert(
        "eventAction" in last_event and
        "eventCategory" in last_event and
        "eventLabel" in last_event
    ), "Not viewing the correct GA event"
    assert(last_event["eventAction"] == event_action)
    assert(last_event["eventCategory"] == event_category)
    assert(last_event["eventLabel"] == event_label)


@markers.test_case("C621370")
@markers.skip_test(reason="difficulty getting GA data from OSWeb")
@markers.parametrize("book_slug, page_slug", [("physics", "1-introduction")])
def test_view_book_online_link_ga_event(
        selenium, base_url, book_slug, page_slug):
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
    assert(
        "eventAction" in last_event and
        "eventCategory" in last_event and
        "eventLabel" in last_event
    ), "Not viewing the correct GA event"
    assert(last_event["eventAction"] == event_action)
    assert(last_event["eventCategory"] == event_category)
    assert(last_event["eventLabel"] == event_label)


@markers.test_case("C621371")
@markers.parametrize("book_slug, page_slug", [("physics", "1-introduction")])
def test_openstax_logo_click_ga_event(
        selenium, base_url, book_slug, page_slug):
    """The page submits the correct GA event when a user clicks the logo."""
    # SETUP:
    event_action = "/"
    event_category = "REX Link (openstax-navbar)"
    event_label = f"/books/{book_slug}/pages/{page_slug}"

    # GIVEN: a user viewing a book page
    book = Content(selenium, base_url,
                   book_slug=book_slug, page_slug=page_slug).open()
    while book.notification_present:
        book.notification.got_it()

    # WHEN:  they click on the OpenStax logo in the nav bar
    assert(False)

    # THEN:  the correct Google Analytics event is queued
    #        { eventAction: "/",
    #          eventCategory: "REX Link (openstax-navbar)",
    #          eventLabel: "/books/{book_slug}/pages/{page_slug}" }
    last_event = Utilities.get_analytics_queue(selenium, -1)
    assert(
        "eventAction" in last_event and
        "eventCategory" in last_event and
        "eventLabel" in last_event
    ), "Not viewing the correct GA event"
    assert(last_event["eventAction"] == event_action)
    assert(last_event["eventCategory"] == event_category)
    assert(last_event["eventLabel"] == event_label)


@markers.test_case("C621372")
@markers.parametrize("book_slug, page_slug", [("physics", "1-introduction")])
def test__ga_event(
        selenium, base_url, book_slug, page_slug):
    """The page submits the correct GA event when ."""
    # SETUP:
    event_action = "/accounts/login"
    event_category = "REX Link (openstax-navbar)"
    event_label = f"/books/{book_slug}/pages/{page_slug}"

    # GIVEN: a non-logged in user viewing a book page that is scrolled down
    book = Content(selenium, base_url,
                   book_slug=book_slug, page_slug=page_slug).open()
    while book.notification_present:
        book.notification.got_it()

    # WHEN:  they click the 'Log in' link in the nav bar
    assert(False)

    # THEN:  the correct Google Analytics event is queued
    #        { eventAction: "/accounts/login",
    #          eventCategory: "REX Link (openstax-navbar)",
    #          eventLabel: "/books/{book_slug}/pages/{page_slug}" }
    last_event = Utilities.get_analytics_queue(selenium, -1)
    assert(
        "eventAction" in last_event and
        "eventCategory" in last_event and
        "eventLabel" in last_event
    ), "Not viewing the correct GA event"
    assert(last_event["eventAction"] == event_action)
    assert(last_event["eventCategory"] == event_category)
    assert(last_event["eventLabel"] == event_label)


@markers.test_case("C597377")
@markers.parametrize("book_slug, page_slug", [("physics", "1-introduction")])
def test_new_highlight_ga_event(
        selenium, base_url, book_slug, page_slug):
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
    assert(
        "eventAction" in last_event and
        "eventCategory" in last_event and
        "eventLabel" in last_event
    ), "Not viewing the correct GA event"
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
    assert(
        "eventAction" in last_event and
        "eventCategory" in last_event and
        "eventLabel" in last_event
    ), "Not viewing the correct GA event"
    assert(last_event["eventAction"] == event_action)
    assert(last_event["eventCategory"] == event_category)
    assert(last_event["eventLabel"] == event_label)


@markers.test_case("C621347")
@markers.parametrize("book_slug, page_slug", [("physics", "1-introduction")])
def test_cancel_log_in_from_highlight_creation_nudge_ga_event(
        selenium, base_url, book_slug, page_slug):
    """The page submits the correct GA event when login nudge is cancelled."""
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
    assert(
        "eventAction" in last_event and
        "eventCategory" in last_event and
        "eventLabel" in last_event
    ), "Not viewing the correct GA event"
    assert(last_event["eventAction"] == event_action)
    assert(last_event["eventCategory"] == event_category)
    assert(last_event["eventLabel"] == event_label)


@markers.test_case("C621348")
@markers.parametrize("book_slug, page_slug", [("physics", "1-introduction")])
def test_log_in_nudge_login_ga_event(
        selenium, base_url, book_slug, page_slug):
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
    assert(
        "eventAction" in second_to_last_event and
        "eventCategory" in second_to_last_event and
        "eventLabel" in second_to_last_event
    ), "Not viewing the correct GA event"
    assert(second_to_last_event["eventAction"] == event_action)
    assert(second_to_last_event["eventCategory"] == event_category)
    assert(second_to_last_event["eventLabel"] == event_label)

    last_event = events[-1]
    assert(
        "eventAction" in last_event and
        "eventCategory" in last_event and
        "eventLabel" not in last_event
    ), "Not viewing the correct GA event"
    assert(last_event["eventAction"] == event_unload_action)
    assert(last_event["eventCategory"] == event_unload_category)


@markers.test_case("C621349")
@markers.parametrize("book_slug, page_slug", [("physics", "1-introduction")])
def test_cancel_highlight_delete_ga_event(
        selenium, base_url, book_slug, page_slug):
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
    assert(
        "eventAction" in last_event and
        "eventCategory" in last_event and
        "eventLabel" in last_event
    ), "Not viewing the correct GA event"
    assert(last_event["eventAction"] == event_action)
    assert(last_event["eventCategory"] == event_category)
    assert(last_event["eventLabel"] == event_label)


@markers.test_case("C621350")
@markers.parametrize("book_slug, page_slug", [("physics", "1-introduction")])
def test_highlight_delete_ga_event(
        selenium, base_url, book_slug, page_slug):
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
    assert(
        "eventAction" in last_event and
        "eventCategory" in last_event and
        "eventLabel" in last_event
    ), "Not viewing the correct GA event"
    assert(last_event["eventAction"] == event_action)
    assert(last_event["eventCategory"] == event_category)
    assert(last_event["eventLabel"] == event_label)


@markers.test_case("C621351", "C621352")
@markers.parametrize("book_slug, page_slug", [("physics", "1-introduction")])
def test_edit_existing_note_ga_event(
        selenium, base_url, book_slug, page_slug):
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
    assert(
        "eventAction" in second_to_last_event and
        "eventCategory" in second_to_last_event and
        "eventLabel" in second_to_last_event
    ), "Not viewing the correct GA event"
    assert(second_to_last_event["eventAction"] == first_event_action)
    assert(second_to_last_event["eventCategory"] == first_event_category)
    assert(second_to_last_event["eventLabel"] == first_event_label)

    last_event = events[-1]
    assert(
        "eventAction" in last_event and
        "eventCategory" in last_event and
        "eventLabel" in last_event
    ), "Not viewing the correct GA event"
    assert(last_event["eventAction"] == second_event_action)
    assert(last_event["eventCategory"] == second_event_category)
    assert(last_event["eventLabel"] == second_event_label)


@markers.test_case("C621353", "C621354")
@markers.parametrize("book_slug, page_slug", [("physics", "1-introduction")])
def test_add_note_to_highlight_ga_event(
        selenium, base_url, book_slug, page_slug):
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
    assert(
        "eventAction" in second_to_last_event and
        "eventCategory" in second_to_last_event and
        "eventLabel" in second_to_last_event
    ), "Not viewing the correct GA event"
    assert(second_to_last_event["eventAction"] == first_event_action)
    assert(second_to_last_event["eventCategory"] == first_event_category)
    assert(second_to_last_event["eventLabel"] == first_event_label)

    last_event = events[-1]
    assert(
        "eventAction" in last_event and
        "eventCategory" in last_event and
        "eventLabel" in last_event
    ), "Not viewing the correct GA event"
    assert(last_event["eventAction"] == second_event_action)
    assert(last_event["eventCategory"] == second_event_category)
    assert(last_event["eventLabel"] == second_event_label)


@markers.test_case("C621355")
@markers.parametrize("book_slug, page_slug", [("physics", "1-introduction")])
def test_change_highlight_color_ga_event(
        selenium, base_url, book_slug, page_slug):
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
    assert(
        "eventAction" in last_event and
        "eventCategory" in last_event and
        "eventLabel" in last_event
    ), "Not viewing the correct GA event"
    assert(last_event["eventAction"] == event_action)
    assert(last_event["eventCategory"] == event_category)
    assert(last_event["eventLabel"] == event_label)


@markers.test_case("C597671")
@markers.parametrize("book_slug, page_slug", [("physics", "1-introduction")])
def test_select_text_ga_event(
        selenium, base_url, book_slug, page_slug):
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
    assert(
        "eventAction" in last_event and
        "eventCategory" in last_event and
        "eventLabel" in last_event
    ), "Not viewing the correct GA event"
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
    assert(
        "eventAction" in last_event and
        "eventCategory" in last_event and
        "eventLabel" in last_event
    ), "Not viewing the correct GA event"
    assert(last_event["eventAction"] == event_action)
    assert(last_event["eventCategory"] == event_category)
    assert(last_event["eventLabel"] == event_label)


@markers.test_case("C615600")
@markers.desktop_only
@markers.parametrize("book_slug, page_slug", [("physics", "1-introduction")])
def test_go_to_highlight_ga_event(
        selenium, base_url, book_slug, page_slug):
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
    assert(
        "eventAction" in last_event and
        "eventCategory" in last_event and
        "eventLabel" in last_event
    ), "Not viewing the correct GA event"
    assert(event_action in last_event["eventAction"])
    assert(last_event["eventCategory"] == event_category)
    assert(last_event["eventLabel"] == event_label)


def user_setup(driver, base_url, book_slug, page_slug):
    """Setup a new user for use in Goggle Analytics event tests."""
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
