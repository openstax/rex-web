from pages.content import Content
from tests import markers


@markers.test_case("C476302")
@markers.parametrize("book_slug,page_slug", [("college-physics", "preface")])
@markers.nondestructive
def test_page_url_does_not_change_when_clicking_attribution_link(
    selenium, base_url, book_slug, page_slug
):
    # GIVEN: A page URL in the format of {base_url}/books/{book_slug}/pages/{page_slug}

    # WHEN: The page is fully loaded
    # AND: The attribution section is expanded when clicked
    content = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    url_before_attribution_click = content.current_url

    attribution = content.attribution
    attribution.attribution_click()
    url_after_attribution_click = content.current_url

    # THEN: The page url should not change
    assert url_before_attribution_click == url_after_attribution_click
