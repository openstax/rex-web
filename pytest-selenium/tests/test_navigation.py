from pages.content import Content
from tests import markers
import pytest


@markers.test_case("C477321")
@markers.parametrize("book_slug,page_slug", [("prealgebra", "preface")])
@markers.nondestructive
def test_previous_link_hidden_on_first_page(selenium, base_url, book_slug, page_slug):

    content = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    toc = content.sidebar.toc

    # confirm first page is selected
    assert toc.active_section.text == toc.pages[0].section_title()

    print(toc.active_section.text)
    print(toc.pages[3].section_title())

    with pytest.raises(Exception) as exc_info:
        assert not content.previous_link.is_displayed

    exception_raised = exc_info.type
    assert "NoSuchElementException" in str(exception_raised)


@markers.test_case("C477322")
@markers.parametrize("book_slug,page_slug", [("prealgebra", "index")])
@markers.nondestructive
def test_next_link_hidden_on_last_page(selenium, base_url, book_slug, page_slug):

    content = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    toc = content.sidebar.toc

    # -1 gives the last element in the list. confirm last page is selected
    assert toc.active_section.text == toc.pages[-1].section_title()

    with pytest.raises(Exception) as exc_info:
        assert not content.next_link.is_displayed

    exception_raised = exc_info.type
    assert "NoSuchElementException" in str(exception_raised)
