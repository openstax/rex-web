from selenium.webdriver.support import expected_conditions as expected

from pages.content import Content
from tests import markers
from pages.osweb import WebBase


@markers.test_case("C476808")
@markers.parametrize("page_slug", ["preface"])
@markers.nondestructive
def test_book_title_links_to_books_detail_page(selenium, base_url, book_slug, page_slug):
    # GIVEN: A page is loaded
    content = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()

    book_banner = content.bookbanner
    book_banner.book_title.click()

    osweb = WebBase(selenium)
    osweb.wait_for_load()

    expected_page_url = base_url + "/details/books/" + book_slug

    assert expected_page_url == content.current_url
