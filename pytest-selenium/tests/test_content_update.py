from pages.content import Content
from tests import markers
from utils import utility


# verify toc structure
# verify chapter filters in sg/my highlights/practice
# verify page title is not repeated in content
# verify in book links are working\
# verify search is working
# verify copyright date is recent
# verify images are loaded


@markers.test_case("C476302")
@markers.parametrize("page_slug", ["preface"])
@markers.nondestructive
def test_section_url_in_citation_text_shows_url_for_current_page(
    selenium, base_url, book_slug, page_slug
):
    """
    citation text shows url for current page.

    GIVEN: A page URL in the format of {base_url}/books/{book_slug}/pages/{page_slug}
    WHEN: The page is fully loaded
    AND: The attribution section is expanded when clicked
    THEN: The section url in the the attribution should reference current page in rex
    """
    content = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    attribution = content.attribution
    attribution.click_attribution_link()
    attribution_section_url_expected = f"https://openstax.org/books/{book_slug}/pages/{page_slug}"

    # Validate section url within attribution refers to current page
    assert attribution_section_url_expected in attribution.section_url


@markers.test_case("C480905")
@markers.parametrize("page_slug", ["preface"])
@markers.nondestructive
def test_book_url_in_citation_text_shows_url_for_default_page(
    selenium, base_url, book_slug, page_slug
):
    # GIVEN: A page is loaded
    content = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    attribution = content.attribution

    # WHEN: The attribution section is expanded
    attribution.click_attribution_link()

    # THEN: The book url in the the citation section should reference the default page of the book
    default_page_slug = utility.get_default_page(book_slug)
    attribution_book_url_expected = (
        "https://openstax.org/books/" + book_slug + "/pages/" + default_page_slug
    )

    assert attribution_book_url_expected == attribution.book_url


@markers.test_case("C480906")
@markers.parametrize("page_slug", ["preface"])
@markers.nondestructive
def test_access_free_url_in_citation_text_shows_url_for_default_page(
    selenium, base_url, book_slug, page_slug
):

    # GIVEN: A page is loaded
    content = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    attribution = content.attribution

    # WHEN: The attribution section is expanded
    attribution.click_attribution_link()

    # THEN: The access for free at url in the the citation section should reference the default page of the book
    default_page_slug = utility.get_default_page(book_slug)
    attribution_access_free_url_expected = (
        "https://openstax.org/books/" + book_slug + "/pages/" + default_page_slug
    )

    assert attribution_access_free_url_expected == attribution.access_free_url
