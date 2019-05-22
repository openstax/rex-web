from pages.content import Content
from tests import markers


@markers.test_case("C476303")
@markers.parametrize("book_slug,page_slug", [("college-physics", "preface")])
@markers.nondestructive
def test_attribution_collapsed_by_default_expands_when_clicked(
    selenium, base_url, book_slug, page_slug
):

    """attribution section is initially collapsed, expands when clicked"""

    # GIVEN: A page URL in the format of {base_url}/books/{book_slug}/pages/{page_slug}
    # WHEN: The page is fully loaded
    content = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    attribution = content.attribution

    # THEN: The attribution section is collapsed by default
    assert not attribution.is_open

    # AND The attribution section opens when clicked
    attribution.click_attribution_link()
    assert attribution.is_open

    attribution.click_attribution_link()
    # """click on attribution again and verify it closes

    # """
    assert not attribution.is_open
