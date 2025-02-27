import pytest
from pages.content import Content
from tests import markers
from utils.utility import Library, get_default_page


@markers.test_case("C476302")
@markers.parametrize("page_slug", ["preface"])
@markers.nondestructive
def section_url_in_citation_text_shows_url_for_current_page(
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


@markers.test_case("C476303")
@markers.parametrize("page_slug", ["preface"])
@markers.nondestructive
def attribution_collapsed_by_default_expands_when_clicked(
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
@markers.smoke_test
@markers.parametrize("page_slug", ["preface"])
@markers.nondestructive
def attribution_collapses_on_navigating_to_new_page(selenium, base_url, book_slug, page_slug):

    # GIVEN: A page URL in the format of {base_url}/books/{book_slug}/pages/{page_slug}
    # AND: The citation/attribution tab is open
    content = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    attribution = content.attribution
    toolbar = content.toolbar
    topbar = content.topbar
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
    if content.is_mobile:
        topbar.click_mobile_menu_button()
        toolbar.click_toc_toggle_button()

    toc.sections[-1].click()

    # THEN: The citation/attribution section is not open on the new page
    assert not attribution.is_open


@markers.test_case("C480905")
@markers.parametrize("page_slug", ["preface"])
@markers.nondestructive
def book_url_in_citation_text_shows_url_for_default_page(
    selenium, base_url, book_slug, page_slug
):
    # GIVEN: A page is loaded
    content = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    attribution = content.attribution

    # WHEN: The attribution section is expanded
    attribution.click_attribution_link()

    # THEN: The book url in the the citation section should reference the default page of the book
    default_page_slug = get_default_page(book_slug)
    attribution_book_url_expected = (
        "https://openstax.org/books/" + book_slug + "/pages/" + default_page_slug
    )

    assert attribution_book_url_expected == attribution.book_url


@markers.test_case("C480906")
@markers.parametrize("page_slug", ["preface"])
@markers.nondestructive
def access_free_url_in_citation_text_shows_url_for_default_page(
    selenium, base_url, book_slug, page_slug
):

    # GIVEN: A page is loaded
    content = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    attribution = content.attribution

    # WHEN: The attribution section is expanded
    attribution.click_attribution_link()

    # THEN: The access for free at url in the the citation section should reference the default page of the book
    default_page_slug = get_default_page(book_slug)
    attribution_access_free_url_expected = (
        "https://openstax.org/books/" + book_slug + "/pages/" + default_page_slug
    )

    assert attribution_access_free_url_expected == attribution.access_free_url


@markers.test_case("C623700", "C623701")
@markers.parametrize("page_slug", ["preface"])
@markers.desktop_only
@markers.nondestructive
def license_details(selenium, base_url, page_slug):
    """Verify license name, link address and copyright name"""
    book_list = Library()
    book_slugs = book_list.book_slugs_list

    # Repeat the test for all books in the library
    for book_slug in list(book_slugs):

        # GIVEN: Book page is loaded
        book = Content(
            selenium, base_url, book_slug=book_slug, page_slug=get_default_page(book_slug)
        ).open()
        attribution = book.attribution

        # Skip any notification/nudge popups
        while book.notification_present:
            book.notification.got_it()

        if book_slug in (
            "business-law-i-essentials",
            "calculus-volume-1",
            "calculus-volume-2",
            "calculus-volume-3",
            "organic-chemistry",
            "principles-financial-accounting",
            "principles-managerial-accounting",
        ):
            license_name_expected = "Creative Commons Attribution-NonCommercial-ShareAlike License"
            license_url_expected = "http://creativecommons.org/licenses/by-nc-sa/4.0/"

        else:
            license_name_expected = "Creative Commons Attribution License"
            license_url_expected = "http://creativecommons.org/licenses/by/4.0/"

        # WHEN: The attribution section is expanded
        attribution.click_attribution_link()

        # THEN: License name & license link address is Creative Commons
        license_name = attribution.citation_builder.get_attribute("text").strip()
        license_url = attribution.citation_builder.get_attribute("href").strip()

        if license_name == "CC BY":
            print(
                f"{book_slug} has license name as {license_name}. But expected name is {license_name_expected}"
            )
        elif license_name != license_name_expected:
            pytest.xfail(
                f"{book_slug} has license name as {license_name}. But expected name is {license_name_expected}"
            )

        assert (
            license_url == license_url_expected
        ), f"{book_slug} has license url as {license_url}. But expected name is {license_url_expected}"

        # AND: OpenStax is present in the attribution text
        # AND: Copyright name is OpenStax
        attribution_text_expected = "you must attribute OpenStax"
        if book_slug not in ("physics", "statistics", "introduction-intellectual-property"):
            assert attribution_text_expected in attribution.attribution_text
            assert attribution.copyright_name == "OpenStax"


@markers.test_case("C614211")
@markers.parametrize(
    "book_slug, page_slug", [("physics", "1-introduction"), ("statistics", "1-introduction")]
)
@markers.desktop_only
@markers.nondestructive
def TEA_attribution_for_HS_books(selenium, base_url, book_slug, page_slug):
    """Verify TEA attribution for HS books."""

    # GIVEN: Book page is loaded
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    attribution = book.attribution

    # Skip any notification/nudge popups
    while book.notification_present:
        book.notification.got_it()

    # WHEN: The attribution section is expanded
    attribution.click_attribution_link()

    # THEN: TEA is present in the attribution text
    attribution_text_expected = "you must attribute Texas Education Agency (TEA)"
    assert attribution_text_expected in attribution.attribution_text

    # AND: TEA website link is present in the attribution text
    if book_slug == "physics":
        tea_link_expected = "https://www.texasgateway.org/book/tea-physics"
    else:
        tea_link_expected = "https://www.texasgateway.org/book/tea-statistics"

    assert tea_link_expected in attribution.attribution_text

    # AND: Copyright name is TEA
    assert attribution.copyright_name == "Texas Education Agency (TEA)"


@markers.test_case("C623699")
@markers.parametrize(
    "book_slug, page_slug", [("introduction-intellectual-property", "1-introduction")]
)
@markers.desktop_only
@markers.nondestructive
def Michelson_20MM_Foundation_attribution_for_intellectual_property(
    selenium, base_url, book_slug, page_slug
):
    """Verify Michelson 20MM Foundation attribution for intellectual property."""

    # GIVEN: Book page is loaded
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    attribution = book.attribution

    # Skip any notification/nudge popups
    while book.notification_present:
        book.notification.got_it()

    # WHEN: The attribution section is expanded
    attribution.click_attribution_link()

    # THEN: The Michelson 20MM Foundation is present in the attribution text
    attribution_text_expected = "you must attribute The Michelson 20MM Foundation"
    assert attribution_text_expected in attribution.attribution_text

    # AND: Copyright name is The Michelson 20MM Foundation
    assert attribution.copyright_name == "The Michelson 20MM Foundation"
