from selenium.webdriver.support import expected_conditions as expected

from urllib.parse import urlparse
from urllib.parse import urlsplit

from pages.content import Content
from tests import markers


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
    attribution_section_url_expected = (
        "https://openstax.org/books/" + book_slug + "/pages/" + page_slug
    )

    # Validate section url within attribution refers to current page
    assert attribution_section_url_expected == attribution.section_url


@markers.test_case("C476303")
@markers.parametrize("page_slug", ["preface"])
@markers.nondestructive
def test_attribution_collapsed_by_default_expands_when_clicked(
    selenium, base_url, book_slug, page_slug
):

    # GIVEN: A page URL in the format of {base_url}/books/{book_slug}/pages/{page_slug}
    # WHEN: The page is fully loaded
    content = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    attribution = content.attribution

    # THEN: The attribution section is collapsed by default
    assert not attribution.is_open

    # AND: The attribution section opens when clicked
    attribution.click_attribution_link()
    assert attribution.is_open

    # AND: The attribution collapses on clicking it again
    attribution.click_attribution_link()
    assert not attribution.is_open


@markers.test_case("C476304")
@markers.parametrize("page_slug", ["preface"])
@markers.nondestructive
def test_attribution_collapses_on_navigating_to_new_page(selenium, base_url, book_slug, page_slug):

    # GIVEN: A page URL in the format of {base_url}/books/{book_slug}/pages/{page_slug}
    # AND: The citation/attribution tab is open
    content = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    attribution = content.attribution
    toolbar = content.toolbar
    toc = content.sidebar.toc

    attribution.click_attribution_link()

    # WHEN: Navigating via next link
    content.click_next_link()

    # THEN: The citation/attribution section is not open on the new page
    assert not attribution.is_open

    attribution.click_attribution_link()

    # WHEN: Navigating via Previous link
    content.click_previous_link()

    # THEN: The citation/attribution section is not open on the new page
    assert not attribution.is_open

    attribution.click_attribution_link()

    # WHEN: Navigating via TOC link
    while content.is_mobile:
        toolbar.click_toc_toggle_button()
        break
    toc.sections[-1].click()

    # THEN: The citation/attribution section is not open on the new page
    assert not attribution.is_open


@markers.test_case("C480905")
@markers.parametrize("page_slug", ["preface"])
@markers.nondestructive
def test_book_url_in_citation_text_shows_url_for_default_page(
    selenium, base_url, book_slug, page_slug
):
    # GIVEN: A page is loaded
    content = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    attribution = content.attribution
    toc = content.sidebar.toc

    # WHEN: The attribution section is expanded
    attribution.click_attribution_link()

    # THEN: The book url in the the citation section should reference the default page of the book
    default_page_url = toc.default_page_url
    default_page_slug = default_page_url.split("/")[-1]

    attribution_book_url_expected = (
        "https://openstax.org/books/" + book_slug + "/pages/" + default_page_slug
    )

    assert attribution_book_url_expected == attribution.book_url
