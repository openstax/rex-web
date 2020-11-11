# flake8: noqa
import pytest
from selenium.common.exceptions import NoSuchElementException

from tests import markers
from pages.content import Content
from pages.osweb import WebBase
from utils.utility import Utilities


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
    osweb.click_view_online()

    # THEN: Order print copy option is present in rex page
    rex = Content(selenium)
    if book_availability_in_amazon is not None:
        Utilities.click_option(selenium, element=rex.order_print_copy)
        # AND: The Amazon link should be opened in a new tab
        rex.switch_to_window(1)
        assert (
            rex.current_url == book_availability_in_amazon
        ), "rex book has different amazon link than osweb"

        # AND: Order print copy button is present in all pages
        rex.switch_to_window(0)
        rex.click_next_link()
        assert rex.order_print_copy.is_displayed()

    # AND: Order print copy option should not be present in Rex if osweb has no amazon link
    else:
        with pytest.raises(NoSuchElementException):
            assert (
                not rex.order_print_copy
            ), "amazon print option present in rex but not present in osweb"


@markers.test_case("C613212")
@markers.parametrize("page_slug", ["preface"])
@markers.nondestructive
def test_book_error(selenium, base_url, book_slug, page_slug):

    # GIVEN: A page is loaded
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    book.wait_for_load()
    toolbar = book.toolbar
    sidebar = book.sidebar

    from time import sleep

    x = book.current_url
    print(x)
    y = "testing"
    z = f"{x}{y}"
    print(z)

    selenium.get(z)

    # book(selenium, base_url, book_slug=book_slug, page_slug="xfjfycj").open()
    book.wait_for_load()

    assert book.content.page_error_displayed
    assert (
        book.content.page_error
        == "Uh oh, we can't find the page you requested.Try another page in theTable of contents"
    )
    sleep(3)

    # AND TOC is displayed
    if book.is_desktop:
        sidebar.header.click_toc_toggle_button()
        assert not sidebar.header.is_displayed

        book.content.click_page_error_toc_button()

    if book.is_mobile:
        book.content.click_page_error_toc_button()

        assert sidebar.header.is_displayed
        toolbar.click_toc_toggle_button()
    sleep(3)
    # AND Links in TOC, citation, footer, navbar, toolbar, bookbanner all work as usual
