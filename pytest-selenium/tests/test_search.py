"""Test REx search."""

import unittest
import pytest
from math import isclose
from random import choice
from string import digits, ascii_letters
from time import sleep

from selenium.webdriver.common.by import By
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.support import expected_conditions as expected

from pages.content import Content
from tests import markers
from utils.utility import (
    Utilities,
    Library,
    get_default_page,
    get_search_term,
    expected_chapter_search_results_total,
    expected_rkt_search_results_total,
)


# fmt: off
@markers.test_case("C543235", "C635010")
@markers.parametrize("page_slug", ["preface"])
@markers.nondestructive
def message_when_search_yields_no_results(
        selenium, base_url, book_slug, page_slug):
    """Verify default message is displayed when no search results are found."""
    # GIVEN: a book page is loaded
    content = Content(selenium, base_url,
                      book_slug=book_slug, page_slug=page_slug).open()
    page_url_before_search = content.current_url
    # Using a random search term not found in the content
    search_term = "".join(choice(digits + ascii_letters) for i in range(25))

    # WHEN: they search for a term that yields no results
    if content.is_desktop:
        content.topbar.search_for(search_term)
    else:
        content.mobile_search_toolbar.search_for(search_term)

    # THEN: the search sidebar displays the no results message
    # AND:  they remain on the same page as before they executed the search
    assert(
        content.search_sidebar.no_results_message == f"Sorry, no results found for ‘{search_term}’"), \
        (
        "search sidebar no results message not found or incorrect"
    )

    expected_page_url_after_search = page_url_before_search + '?query=' + search_term
    assert(content.current_url == expected_page_url_after_search), \
        "page URL different after search"

    # WHEN: they close the search results
    # For mobile resolution, click on the search icon to close the search
    # sidebar/navigate back to content page
    if content.is_mobile:
        content.topbar.click_search_icon()
    # For desktop, close search sidebar
    else:
        content.search_sidebar.close_search_sidebar()

    # THEN: the scroll position of the content is not changed during the search
    assert(content.page_not_scrolled), "page scroll position is different"


@markers.test_case("C568506")
@markers.parametrize("page_slug", ["preface"])
@markers.nondestructive
def scroll_position_when_search_yields_no_results(
        selenium, base_url, book_slug, page_slug):
    # GIVEN: Book page is loaded
    content = Content(selenium, base_url,
                      book_slug=book_slug, page_slug=page_slug).open()

    # WHEN: they scroll the page down
    # AND:  trigger a search for a term that yields no results
    content.scroll_through_page()
    scroll_position_before_search = content.scroll_position
    # use a random search term not found in the content
    search_term = "".join(choice(digits + ascii_letters) for i in range(25))

    if content.is_desktop:
        content.topbar.search_for(search_term)
    else:
        content.mobile_search_toolbar.search_for(search_term)
        # For mobile resolution, click on the search icon to close the search
        # sidebar/navigate back to content page
        content.topbar.click_search_icon()

    # THEN: Scroll position of content is not changed after search
    scroll_position_after_search = content.scroll_position
    within = scroll_position_before_search * 0.01
    assert(isclose(scroll_position_before_search,
                   scroll_position_after_search,
                   rel_tol=within)), (
        r"vertical position after search not within 1% of position "
        "before search ({low} <= {target} <= {high})".format(
            low=scroll_position_before_search - within,
            high=scroll_position_before_search + within,
            target=scroll_position_after_search))

    if content.is_desktop:
        # WHEN: they close the search sidebar
        content.search_sidebar.close_search_sidebar()

        # THEN: the content scroll position is unchanged
        scroll_position_after_closing_search = content.scroll_position
        assert(isclose(scroll_position_before_search,
                       scroll_position_after_closing_search,
                       rel_tol=within)), (
            r"vertical position after search not within 1% of position "
            "before search ({low} <= {target} <= {high})".format(
                low=scroll_position_before_search - within,
                high=scroll_position_before_search + within,
                target=scroll_position_after_closing_search))
# fmt: on


@markers.test_case("C543231")
@markers.parametrize("page_slug", ["preface"])
@markers.nondestructive
def TOC_closed_if_search_sidebar_is_displayed(selenium, base_url, book_slug, page_slug):
    # GIVEN: Book page is loaded
    content = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    topbar = content.topbar
    mobile = content.mobile_search_toolbar
    toc_sidebar = content.sidebar
    search_sidebar = content.search_sidebar

    # WHEN: Search is triggered for a string
    search_term = get_search_term(book_slug)

    if content.is_desktop:
        topbar.search_for(search_term)

    if content.is_mobile:
        mobile.search_for(search_term)

    # THEN: TOC is not displayed
    assert not toc_sidebar.is_displayed

    # AND: Search sidebar is displayed
    assert search_sidebar.is_displayed


@markers.test_case("C543239")
@markers.parametrize("page_slug", ["preface"])
@markers.nondestructive
def opening_TOC_closes_search_sidebar(selenium, base_url, book_slug, page_slug):
    """Opening TOC closes search sidebar and content stays in the same location"""

    # GIVEN: Book page is loaded
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()

    # Skip any notification/nudge popups
    while book.notification_present:
        book.notification.got_it()

    toolbar = book.toolbar
    topbar = book.topbar
    mobile = book.mobile_search_toolbar
    toc_sidebar = book.sidebar.header
    search_sidebar = book.search_sidebar
    search_term = get_search_term(book_slug)

    if book.is_desktop:
        # WHEN: Search sidebar is displayed with search results
        topbar.search_for(search_term)
        assert search_sidebar.search_results_present

        Utilities.click_option(selenium, element=book.search_sidebar.chapter_results[0])

        # AND: Search term is focussed in the content page
        book.assert_search_term_is_highlighted_in_content_page(search_term)

        scroll_position_before_closing_search_sidebar = book.scroll_position

        # AND: TOC is opened
        toolbar.click_toc_toggle_button()

        # THEN: Search sidebar disappears
        assert search_sidebar.search_results_not_displayed

        # AND: TOC is displayed
        assert toc_sidebar.is_displayed

        # AND search string stays in the search box
        assert topbar.search_term_displayed_in_search_textbox == search_term

        # AND Content page stays in the same location
        scroll_position_after_closing_search_sidebar = book.scroll_position

        within = scroll_position_before_closing_search_sidebar * 0.01
        assert isclose(
            scroll_position_before_closing_search_sidebar,
            scroll_position_after_closing_search_sidebar,
            rel_tol=within,
        ), (
            r"vertical position after closing search sidebar not within 1% of position "
            "before closing search sidebar ({low} <= {target} <= {high})".format(
                low=scroll_position_before_closing_search_sidebar - within,
                high=scroll_position_before_closing_search_sidebar + within,
                target=scroll_position_after_closing_search_sidebar,
            )
        )

        # WHEN TOC is closed
        toc_sidebar.click_toc_toggle_button()
        scroll_position_after_closing_toc = book.scroll_position

        # THEN search sidebar does not re-appear
        assert search_sidebar.search_results_not_displayed

        # AND Content page still stays in the same location
        assert isclose(
            scroll_position_after_closing_toc,
            scroll_position_before_closing_search_sidebar,
            rel_tol=within,
        ), (
            r"vertical position after closing TOC not within 1% of position "
            "before closing TOC ({low} <= {target} <= {high})".format(
                low=scroll_position_after_closing_toc - within,
                high=scroll_position_after_closing_toc + within,
                target=scroll_position_before_closing_search_sidebar,
            )
        )

        # AND search string still stays in the search box
        assert topbar.search_term_displayed_in_search_textbox == search_term

    if book.is_mobile:
        # WHEN: Search sidebar is displayed with search results
        mobile.search_for(search_term)
        assert search_sidebar.search_results_present

        # For mobile, content is not visible when search results are displayed.
        # So click on first search result to store the content scroll position.
        Utilities.click_option(selenium, element=book.search_sidebar.chapter_results[0])

        # AND: Search term is focussed in the content page
        book.assert_search_term_is_highlighted_in_content_page(search_term)

        search_result_scroll_position = book.scroll_position

        mobile.click_back_to_search_results_button()

        # AND: TOC is opened
        topbar.click_mobile_menu_button()
        toolbar.click_toc_toggle_button()

        # THEN: Search sidebar disappears
        assert search_sidebar.search_results_not_displayed

        # AND: TOC is displayed
        assert toc_sidebar.is_displayed

        #  WHEN: TOC is closed
        toc_sidebar.click_toc_toggle_button()

        # THEN search sidebar does not re-appear
        assert search_sidebar.search_results_not_displayed

        # AND Content page still stays in the same location
        scroll_position_after_closing_search = book.scroll_position

        within = search_result_scroll_position * 0.01
        assert isclose(
            search_result_scroll_position, scroll_position_after_closing_search, rel_tol=within
        ), (
            r"vertical position after closing search sidebar not within 1% of position "
            "before closing search sidebar ({low} <= {target} <= {high})".format(
                low=search_result_scroll_position - within,
                high=search_result_scroll_position + within,
                target=scroll_position_after_closing_search,
            )
        )

        # AND: search string still stays in the search box
        topbar.click_search_icon()
        assert mobile.search_term_displayed_in_search_textbox == search_term


@markers.test_case("C543233")
@markers.parametrize("page_slug", ["preface"])
@markers.nondestructive
def x_in_search_sidebar(selenium, base_url, book_slug, page_slug):
    """X in search sidebar closes sidebar, text in search input still visible"""

    # GIVEN: Book page is loaded
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()

    # Skip any notification/nudge popups
    while book.notification_present:
        book.notification.got_it()

    topbar = book.topbar
    mobile = book.mobile_search_toolbar
    search_sidebar = book.search_sidebar
    search_term = get_search_term(book_slug)

    if book.is_desktop:
        # AND: Search results are displayed in search sidebar
        topbar.search_for(search_term)
        assert search_sidebar.search_results_present

        search_result_scroll_position = book.scroll_position

        # WHEN: Close search sidebar
        search_sidebar.close_search_sidebar()

        # THEN: Search sidebar is closed
        assert search_sidebar.search_results_not_displayed

        # AND: Search string in the search  textbox is still visible
        assert topbar.search_term_displayed_in_search_textbox == search_term

        # AND: User stays in the same location in the book content as before closing the sidebar
        scroll_position_after_closing_search_sidebar = book.scroll_position
        assert scroll_position_after_closing_search_sidebar == search_result_scroll_position

    if book.is_mobile:
        # AND: Search results are displayed in search sidebar
        mobile.search_for(search_term)
        assert search_sidebar.search_results_present

        # WHEN: Close search sidebar
        mobile.click_close_search_results_link()

        # THEN: Search sidebar is closed
        assert search_sidebar.search_results_not_displayed

        # AND search string in the search input box is still visible
        topbar.click_search_icon()
        assert mobile.search_term_displayed_in_search_textbox == search_term


@markers.test_case("C543234")
@markers.parametrize("page_slug", ["preface"])
@markers.nondestructive
def x_in_search_textbox(selenium, base_url, book_slug, page_slug):
    """X in search textbox clears search string but search results are not affected"""

    # GIVEN: Book page is loaded
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()

    # Skip any notification/nudge popups
    while book.notification_present:
        book.notification.got_it()

    topbar = book.topbar
    mobile = book.mobile_search_toolbar
    search_sidebar = book.search_sidebar
    search_term = get_search_term(book_slug)

    if book.is_desktop:
        # AND: Search sidebar is open
        topbar.search_for(search_term)
        assert search_sidebar.search_results_present

        # WHEN: Click X in the search textbox
        topbar.click_search_textbox_x()

        # THEN: Search string is cleared from the search textbox
        assert topbar.search_term_displayed_in_search_textbox == ""

        # AND: Search sidebar is still open
        assert search_sidebar.search_results_present

    if book.is_mobile:
        # AND: Search sidebar is open
        mobile.search_for(search_term)
        assert search_sidebar.search_results_present

        # WHEN: Click X in the search textbox
        mobile.click_search_textbox_x()

        # THEN: Search string is cleared from the search textbox
        assert mobile.search_term_displayed_in_search_textbox == ""

        # AND: Search sidebar is still open
        assert search_sidebar.search_results_present


@markers.test_case("C543252")
@markers.parametrize("page_slug", ["preface"])
@markers.desktop_only
@markers.nondestructive
def search_results(selenium, base_url, page_slug):
    """Search sidebar shows total number of matches throughout the book"""

    book_list = Library()
    book_slugs = book_list.book_slugs_list

    # Repeat the test for all books in the library
    for book_slug in list(book_slugs):

        # GIVEN: Book page is loaded
        book = Content(
            selenium, base_url, book_slug=book_slug, page_slug=get_default_page(book_slug)
        ).open()

        # Skip any notification/nudge popups
        while book.notification_present:
            book.notification.got_it()

        # WHEN: Search is performed
        search_sidebar = book.search_sidebar
        search_term = get_search_term(book_slug)
        chapter_search_results_expected_value = expected_chapter_search_results_total(book_slug)
        rkt_results_expected_value = expected_rkt_search_results_total(book_slug)

        # AND: Search sidebar is open
        book.topbar.search_for(search_term)
        try:
            assert search_sidebar.search_results_present
        except TimeoutException:
            # wait and check if search sidebar appears
            sleep(0.5)
            assert search_sidebar.search_results_present

        # THEN: Search sidebar shows total number of matches throughout the book
        try:
            assert search_sidebar.rkt_search_result_total == rkt_results_expected_value
        except AssertionError:
            # Total search results vary slightly between environment/search sessions which is being worked on by the developers.
            # Till then asserting with a threshold value
            print(
                f"Search results mismatch for '{book_slug}', expected = '{rkt_results_expected_value}', actual = '{search_sidebar.rkt_search_result_total}'"
            )
            tc = unittest.TestCase()
            tc.assertAlmostEqual(
                search_sidebar.rkt_search_result_total, rkt_results_expected_value, delta=3
            )
        try:
            assert (
                search_sidebar.chapter_search_result_total == chapter_search_results_expected_value
            )
        except AssertionError:
            # Total search results vary slightly between environment/search sessions which is being worked on by the developers.
            # Till then asserting with a threshold value
            print(
                f"Search results mismatch for '{book_slug}', expected = '{chapter_search_results_expected_value}', actual = '{search_sidebar.chapter_search_result_total}'"
            )
            tc = unittest.TestCase()
            tc.assertAlmostEqual(
                search_sidebar.chapter_search_result_total,
                chapter_search_results_expected_value,
                delta=3,
            )


@markers.test_case("C641288")
@markers.parametrize("book_slug, page_slug", [("introductory-statistics", "1-introduction")])
@markers.nondestructive
@markers.desktop_only
def open_search_results_in_new_tab(selenium, base_url, book_slug, page_slug):
    """Search results can be opened in a new tab."""

    # GIVEN: Book page is loaded
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()

    # Skip any notification/nudge popups
    while book.notification_present:
        book.notification.got_it()

    search_sidebar = book.search_sidebar
    search_term = get_search_term(book_slug)

    # AND: Search sidebar is displayed with search results
    book.topbar.search_for(search_term)
    assert search_sidebar.search_results_present
    page_url_with_search_results = search_sidebar.chapter_results[9].get_attribute("href")

    # WHEN: Open search result from section 2.2 in new window
    book.open_new_tab()
    book.switch_to_window(1)

    rex = Content(selenium)
    selenium.get(page_url_with_search_results)
    rex.wait_for_page_to_load()
    book_banner = rex.bookbanner

    # THEN: Page 2.2 displays highlighted search result in new window
    assert book_banner.section_title == "2.2 Histograms, Frequency Polygons, and Time Series Graphs"

    # AND: Search term is focussed in the content page
    book.assert_search_term_is_highlighted_in_content_page(search_term)

    # AND: Search string stays in the search box as in the first window
    assert rex.topbar.search_term_displayed_in_search_textbox == search_term

    # AND: Total search results is same as in first window
    assert rex.search_sidebar.chapter_search_result_total == 13


@markers.test_case("C545836")
@markers.parametrize("book_slug, page_slug", [("biology-2e", "preface")])
@markers.desktop_only
@markers.nondestructive
def highlight_entire_search_element(selenium, base_url, book_slug, page_slug):
    """Highlight entire search element if unable to find single term"""

    # GIVEN: Book page is loaded
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()

    # Skip any notification/nudge popups
    while book.notification_present:
        book.notification.got_it()

    # WHEN: Search is performed
    search_sidebar = book.search_sidebar
    search_term = "phospholipid bilayer"

    # AND: Search sidebar is displayed with search results
    book.topbar.search_for(search_term)
    sleep(0.5)
    assert search_sidebar.search_results_present

    Utilities.click_option(selenium, element=book.search_sidebar.chapter_results[0])
    book.assert_search_term_is_highlighted_in_content_page(search_term)

    # THEN: Entire search element is highlighted in content page
    xpath_search_block = "//mark[contains(text(), '{term}') and (@aria-current='true') and (@class='search-highlight text last')]"
    focussed_search_term = book.find_elements(By.XPATH, xpath_search_block.format(term=search_term))

    try:
        # Verify search element is highlighted in content
        book.wait.until(expected.visibility_of(focussed_search_term[0]))

        # Verify if the search element is scrolled to viewport
        assert book.element_in_viewport(focussed_search_term[0])

    except TimeoutException:
        pytest.fail(f"the highlighted search term ('{search_term}') was not found on the page")

    except IndexError:
        pytest.fail(
            f"Value of focussed_search_term = '{focussed_search_term}'."
            f"If the value is null, the search term ('{search_term}') is not highlighted in the page."
        )

    except AssertionError:
        pytest.fail(f"highlighted search term ('{search_term}') is not in view port")

    # AND: The entire element is highlighted
    assert focussed_search_term[0].text == (
        "The phospholipid bilayer is the major component of all cellular membranes. "
        "The hydrophilic head groups of the phospholipids face the aqueous solution. "
        "The hydrophobic tails are sequestered in the middle of the bilayer."
    )


@markers.test_case("C543252a")
@markers.parametrize("page_slug", ["preface"])
@markers.desktop_only
@markers.nondestructive
def search_results_for_international_books(selenium, base_url, page_slug):
    """Search sidebar shows total number of matches throughout the book for international books"""

    book_list = Library()
    book_slugs = book_list.book_slugs_list_intl

    # Repeat the test for all books in the library
    for book_slug in list(book_slugs):

        # GIVEN: Book page is loaded
        book = Content(
            selenium, base_url, book_slug=book_slug, page_slug=get_default_page(book_slug)
        ).open()

        # Skip any notification/nudge popups
        while book.notification_present:
            book.notification.got_it()

        # WHEN: Search is performed
        search_sidebar = book.search_sidebar
        search_term = get_search_term(book_slug)
        chapter_search_results_expected_value = expected_chapter_search_results_total(book_slug)
        rkt_results_expected_value = expected_rkt_search_results_total(book_slug)

        # AND: Search sidebar is open
        book.topbar.search_for(search_term)
        try:
            assert search_sidebar.search_results_present
        except TimeoutException:
            # wait and check if search sidebar appears
            sleep(0.5)
            assert search_sidebar.search_results_present

        # THEN: Search sidebar shows total number of matches throughout the book
        assert search_sidebar.rkt_search_result_total == rkt_results_expected_value
        try:
            assert (
                search_sidebar.chapter_search_result_total == chapter_search_results_expected_value
            )
        except AssertionError:
            # Total search results vary slightly between environment/search sessions which is being worked on by the developers.
            # Till then asserting with a threshold value
            print(
                f"Search results mismatch for '{book_slug}', expected = '{chapter_search_results_expected_value}', actual = '{search_sidebar.chapter_search_result_total}'"
            )
            tc = unittest.TestCase()
            tc.assertAlmostEqual(
                search_sidebar.chapter_search_result_total,
                chapter_search_results_expected_value,
                delta=3,
            )
