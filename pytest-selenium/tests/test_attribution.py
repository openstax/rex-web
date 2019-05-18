from pages.content import Content
from tests import markers
from urllib.parse import urlparse


@markers.test_case("C476302")
@markers.parametrize("book_slug,page_slug", [("college-physics", "preface")])
@markers.nondestructive
def test_citation_text_shows_url_for_current_page(selenium, base_url, book_slug, page_slug):
    """
    citation text shows url for current page.

    GIVEN: A page URL in the format of {base_url}/books/{book_slug}/pages/{page_slug}
    WHEN: The page is fully loaded
    AND: The attribution section is expanded when clicked
    THEN: The urls in the the attribution should reference current page in rex
    """
    content = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    attribution = content.attribution
    attribution.click_attribution_link()
    attribution_section_url_expected = (
        "https://openstax.org/books/" + book_slug + "/pages/" + page_slug
    )

    # validate section url within attribution refers to current page
    assert attribution_section_url_expected == attribution.section_url

    sidebar = content.sidebar
    if content.is_desktop:
        attribution_book_url_slug = urlparse(sidebar.header.chapter1_url).path.split("/")[-1]
        attribution_book_url_expected = (
            "https://openstax.org/books/" + book_slug + "/pages/" + attribution_book_url_slug
        )

        # validate book url within attribution refers to chapter 1 of the book
        assert attribution_book_url_expected == attribution.book_url

        attribution_access_for_free_expected = attribution_book_url_expected

        # validate access for free url refers to chapter 1 of the book
        attribution_access_for_free_expected == attribution.access_for_free_url

    if content.is_mobile:
        toolbar = content.toolbar
        toolbar.click_toc_toggle_button()
        chapter1_slug = urlparse(sidebar.header.chapter1_url).path.split("/")[-1]
        attribution_book_url_expected = (
            "https://openstax.org/books/" + book_slug + "/pages/" + chapter1_slug
        )

        # validate book url within attribution refers to chapter 1 of the book for mobile
        assert attribution_book_url_expected == attribution.book_url

        attribution_access_for_free_expected = attribution_book_url_expected

        # validate access for free url refers to chapter 1 of the book for mobile
        attribution_access_for_free_expected == attribution.access_for_free_url
