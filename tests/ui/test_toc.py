from tests.ui.pages.content import Content
from tests.ui import markers


@markers.parametrize("book_slug,page_slug", [("college-physics", "preface")])
@markers.nondestructive
def test_toc_toggle_button_opens_and_closes(selenium, base_url, book_slug, page_slug):
    # GIVEN: The selenium driver, base_url, book_slug, and page_slug

    # WHEN: The book and page URL is loaded
    #   AND: The table of contents toggle button is clicked
    content = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()

    toc = content.table_of_contents
    content.click_table_of_contents_button()

    # THEN:  The table of contents area has been closed
    # AND:   The table of contents toggle button is clicked again
    # AND:   The table of contents area is opened
    assert not toc.is_displayed

    content.click_table_of_contents_button()
    assert toc.is_displayed


@markers.parametrize("book_slug,page_slug", [("college-physics", "preface")])
@markers.nondestructive
def test_toc_has_chapters(selenium, base_url, book_slug, page_slug):
    # GIVEN: The selenium driver, base_url, book_slug, and page_slug

    # WHEN: The URL is fully loaded using the book_slug and page_slug
    content = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()

    # THEN: There is more than 1 Chapter that exists
    assert len(content.table_of_contents.chapters) > 0
