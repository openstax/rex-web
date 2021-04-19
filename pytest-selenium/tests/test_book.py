# flake8: noqa
import pytest
from selenium.common.exceptions import NoSuchElementException, TimeoutException
from selenium.webdriver.common.by import By

import re
from time import sleep

from tests import markers
from pages.content import Content
from pages.osweb import WebBase
from utils.utility import Utilities, get_search_term
from pages.accounts import Login


EXPECTED_WEB_ERROR = (
    "Uh-oh, no page here"
    "Kudos on your desire to explore! Unfortunately, "
    "we don't have a page to go with that particular location."
)
XPATH_SEARCH = (
    "//span[contains(text(),'{term}') and "
    "contains(@class,'search-highlight first text last focus')]"
)


@markers.test_case("C476808")
@markers.parametrize("page_slug", ["preface"])
@markers.nondestructive
def test_book_title_links_to_books_detail_page(selenium, base_url, book_slug, page_slug):

    # GIVEN: A page is loaded
    content = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()

    # WHEN: The book title in the book banner is clicked
    book_banner = content.bookbanner
    book_banner.book_title.click()

    osweb = WebBase(selenium)
    osweb.wait_for_page_to_load()

    # THEN: The page navigates to {base_url}/details/books/college-physics
    expected_page_url = base_url + "/details/books/" + book_slug

    assert expected_page_url == osweb.current_url


@markers.test_case("C583482")
@markers.parametrize("page_slug", ["preface"])
@markers.nondestructive
def test_order_print_copy(selenium, base_url, book_slug, page_slug):

    # GIVEN: Open osweb book details page
    osweb = WebBase(selenium, base_url, book_slug=book_slug).open()
    osweb.wait_for_load()

    # AND: verify if 'order on amazon' option is present in the osweb print options modal
    book_availability_in_amazon = osweb.book_status_on_amazon()

    # WHEN: Click the view online link in osweb book detail page
    osweb.fix_view_online_url(base_url)
    osweb.click_view_online()
    rex = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug)

    # THEN: Order print copy option is present in rex page
    # AND: The Amazon link should be opened in a new tab
    if book_availability_in_amazon is not None:
        original = selenium.current_window_handle
        Utilities.switch_to(driver=selenium, element=rex.order_print_copy_button)
        assert (
            rex.current_url == book_availability_in_amazon
        ), "rex book has different amazon link than osweb"

        # AND: Order print copy button is present in all pages
        new_handle = 0 if original == selenium.window_handles[0] else 1
        if len(selenium.window_handles) > 1:
            selenium.switch_to.window(selenium.window_handles[new_handle])
        rex.click_next_link()
        assert rex.order_print_copy_button.is_displayed()

    # AND: Order print copy option should not be present in Rex if osweb has no amazon link
    else:
        with pytest.raises(NoSuchElementException):
            assert (
                not rex.order_print_copy_button
            ), "amazon print option present in rex but not present in osweb"


@markers.test_case("C613211")
@markers.parametrize("page_slug", ["preface"])
@markers.nondestructive
def test_redirect_to_osweb_404_when_book_is_incorrect(selenium, base_url, book_slug, page_slug):
    """User is redirected to osweb 404 page when book slug doesn't exist"""

    # WHEN: A page is loaded with incorrect book slug
    try:
        Content(selenium, base_url, book_slug=f"{book_slug}{'test'}", page_slug=page_slug).open()
    except TimeoutException:
        pass

    # THEN: osweb 404 page is displayed
    osweb = WebBase(selenium)
    assert osweb.osweb_404_displayed
    assert(osweb.osweb_404_error == EXPECTED_WEB_ERROR)


@markers.test_case("C614212")
@markers.parametrize("page_slug", ["preface"])
@markers.nondestructive
def test_redirect_to_osweb_404_when_page_is_incorrect_in_first_session(
    selenium, base_url, book_slug, page_slug
):
    """Rex 404 page is displayed when user opens incorrect page in the first session"""

    # WHEN: A page is loaded with incorrect page slug in the first session
    try:
        Content(selenium, base_url, book_slug=book_slug, page_slug=f"{page_slug}{'test'}").open()
    except TimeoutException:
        pass

    # THEN: osweb 404 page is displayed
    osweb = WebBase(selenium)
    assert osweb.osweb_404_displayed
    assert(osweb.osweb_404_error == EXPECTED_WEB_ERROR)


@markers.test_case("C613212")
@markers.parametrize("page_slug", ["preface"])
@markers.nondestructive
def test_redirect_to_rex_404_when_page_is_incorrect_in_existing_session(
    selenium, base_url, book_slug, page_slug
):
    """Rex 404 page is displayed when user opens incorrect page in an existing session."""

    # GIVEN: A page is loaded
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()

    book.wait_for_service_worker_to_install()

    # AND: User loads an incorrect page in the same session
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=f"{page_slug}{'test'}").open()
    toolbar = book.toolbar
    sidebar = book.sidebar
    toc = book.sidebar.toc

    # WHEN: Rex 404 page is displayed
    assert book.content.page_error_displayed
    assert (
        book.content.page_error
        == "Uh oh, we can't find the page you requested.Try another page in theTable of contents"
    )

    # THEN: Next & Previous links are not displayed
    assert not book.next_link_is_displayed
    assert not book.previous_link_is_displayed

    if book.is_desktop:
        # AND: TOC is displayed in the sidebar
        assert sidebar.header.is_displayed

        # AND: TOC toggle works
        sidebar.header.click_toc_toggle_button()
        assert not sidebar.header.is_displayed
        toolbar.click_toc_toggle_button()
        assert sidebar.header.is_displayed

        # AND: Clicking a TOC link loads the content and not the rex 404
        toc.sections[-1].click()
        assert toc.sections[-1].is_active
        assert not book.content.page_error_displayed

    else:
        # AND: TOC is closed by default for mobile
        assert not sidebar.header.is_displayed

        # AND: TOC toggle works
        toolbar.click_toc_toggle_button()
        assert sidebar.header.is_displayed
        sidebar.header.click_toc_toggle_button()
        assert not sidebar.header.is_displayed

        # AND: Clicking a TOC link loads the content and not the rex 404
        toolbar.click_toc_toggle_button()
        toc.sections[-1].click()
        assert toc.sections[-1].is_active
        assert not book.content.page_error_displayed


@markers.test_case("C619386")
@markers.parametrize("page_slug", ["preface"])
@markers.nondestructive
def test_bookbanner_behavior_in_rex_404_page(selenium, base_url, book_slug, page_slug):
    """On a rex 404 page, book title is displayed but page title is not displayed."""

    # GIVEN: A page is loaded
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()

    book.wait_for_service_worker_to_install()

    # WHEN: User loads an incorrect page in the same session
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=f"{page_slug}{'test'}").open()
    book_banner = book.bookbanner
    toc = book.sidebar.toc

    # WHEN: Rex 404 page is displayed
    assert book.content.page_error_displayed

    # THEN: Page title is not displayed in the book banner
    with pytest.raises(NoSuchElementException):
        assert not book_banner.section_title, (
            "Page title displayed in the book banner when rex 404 is displayed"
        )

    # AND: Clicking book title in book banner opens the osweb book details page
    book_banner.book_title.click()
    osweb = WebBase(selenium)
    osweb.wait_for_page_to_load()
    osweb.close_dialogs()
    expected_page_url = base_url + "/details/books/" + book_slug
    assert expected_page_url == osweb.current_url

    # AND: Navigating back to rex does not display the rex 404 page
    osweb.fix_view_online_url(base_url)
    book.click_and_wait_for_load(osweb.view_online)
    book.wait_for_page_to_load()
    assert toc.sections[1].is_active
    assert not book.content.page_error_displayed


@markers.test_case("C619384")
@markers.parametrize("page_slug", ["preface"])
@markers.nondestructive
def test_attribution_behavior_in_rex_404_page(selenium, base_url, book_slug, page_slug):
    """On a rex 404 page, attribution can be expanded and the attribution links work as usual."""

    # GIVEN: A page is loaded
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()

    book.wait_for_service_worker_to_install()

    # WHEN: User loads an incorrect page in the same session
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=f"{page_slug}{'test'}").open()
    toc = book.sidebar.toc
    attribution = book.attribution

    # WHEN: Rex 404 page is displayed
    assert book.content.page_error_displayed

    # THEN: Attribution can be expanded
    attribution.click_attribution_link()

    # AND: Clicking book url link in attribution works
    attribution.click_book_url()
    assert toc.sections[1].is_active

    # AND: Rex 404 page is not displayed
    assert not book.content.page_error_displayed


@markers.test_case("C619385")
@markers.parametrize("page_slug", ["preface"])
@markers.nondestructive
def test_navbar_behavior_in_rex_404_page(selenium, base_url, book_slug, page_slug, email, password):
    """On a rex 404 page, login/logout does not change rex 404 status."""

    # GIVEN: A page is loaded
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()

    book.wait_for_service_worker_to_install()

    # AND: User loads an incorrect page in the same session
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=f"{page_slug}{'test'}").open()
    user_nav = book.navbar

    # WHEN: Rex 404 page is displayed
    assert book.content.page_error_displayed

    # THEN: User can login
    page_url_before_login = selenium.current_url
    user_nav.click_login()
    Login(selenium).login(email, password)
    assert user_nav.user_is_logged_in

    # AND: Login does not change the rex 404 status
    assert selenium.current_url == page_url_before_login
    assert book.content.page_error_displayed

    # AND: Logout does not change the rex 404 status
    user_nav.click_logout()
    assert user_nav.user_is_not_logged_in
    assert selenium.current_url == page_url_before_login
    assert book.content.page_error_displayed


@markers.test_case("C614422")
@markers.parametrize("page_slug", ["preface"])
@markers.nondestructive
def test_search_behavior_in_rex_404_page(selenium, base_url, book_slug, page_slug):
    """On a rex 404 page, search functionality works as usual."""

    # GIVEN: A page is loaded
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    book.wait_for_service_worker_to_install()

    # AND: Rex 404 page is displayed
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=f"{page_slug}{'test'}").open()
    assert book.content.page_error_displayed

    toolbar = book.toolbar
    mobile = book.mobile_search_toolbar
    search_sidebar = book.search_sidebar
    search_term = get_search_term(book_slug)

    if book.is_desktop:
        # WHEN: Search is performed
        toolbar.search_for(search_term)

        # THEN: Search sidebar is displayed with results
        assert search_sidebar.search_results_present

        # AND: Content page scrolls to the first search result
        # Loop through the words in search term and assert if at least one of
        # them is highlighted in the book
        split_search_term = re.findall(r"\w+", search_term)
        for x in split_search_term:
            focussed_search_term = book.content.find_elements(By.XPATH, XPATH_SEARCH.format(term=x))
            try:
                assert (
                    focussed_search_term
                ), f"the highlighted search term ('{x}') was not found on the page"
                assert book.element_in_viewport(focussed_search_term[0])
            except AssertionError:
                continue
            except IndexError:
                # Wait till the focussed search term is scrolled to the viewport
                sleep(1)
                assert book.element_in_viewport(focussed_search_term[0])
            break

        # AND: Rex 404 page is not displayed
        assert not book.content.page_error_displayed

    if book.is_mobile:
        # WHEN: Search is performed
        mobile.search_for(search_term)

        # THEN: Search sidebar is displayed with results
        assert search_sidebar.search_results_present

        # For mobile, content is not visible when search results are displayed.
        # So click on first search result
        search_results = book.search_sidebar.search_results(search_term)
        Utilities.click_option(selenium, element=search_results[0])

        # AND: Content page scrolls to the selected search result
        # Loop through the words in search term and assert if atleast one of
        # them is highlighted in the book
        split_search_term = re.findall(r"\w+", search_term)
        for x in split_search_term:
            focussed_search_term = book.content.find_elements(By.XPATH, XPATH_SEARCH.format(term=x))
            try:
                assert (
                    focussed_search_term
                ), f"the highlighted search term ('{x}') was not found on the page"
                assert book.element_in_viewport(focussed_search_term[0])
            except AssertionError:
                continue
            except IndexError:
                # Wait till the focussed search term is scrolled to the viewport
                sleep(1)
                assert book.element_in_viewport(focussed_search_term[0])
            break

        # AND: Rex 404 page is not displayed
        assert not book.content.page_error_displayed
