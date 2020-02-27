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
def test_buy_book_link(selenium, base_url, book_slug, page_slug):

    # GIVEN: A page is loaded
    browser = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    rex_url = browser.current_url

    # WHEN: Click on 'Buy Book' link in toolbar
    Utilities.click_option(selenium, element=browser.buy_book)

    # THEN: The Amazon link should be opened in a new tab
    browser.switch_to_window(1)
    # new_url = browser.current_url
    assert browser.current_url == "https://www.amazon.com/s?me=A1540JPBBI3F06&qid=1517336719"

    # AND: The first tab has rex page open
    browser.switch_to_window(0)
    assert browser.current_url == rex_url
