import pytest

from e2e_tests.e2e.ui.fixtures.ui import chrome_page
from e2e_tests.e2e.ui.pages.home import HomeRex


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "book_slug, page_slug", [("astronomy-2e", "5-2-the-electromagnetic-spectrum")]
)
async def test_citation_and_attribution_page(
    chrome_page, base_url, book_slug, page_slug
):

    # GIVEN: Playwright, chromium and the rex_base_url

    # WHEN: The Home page is fully loaded
    await chrome_page.goto(f"{base_url}/books/{book_slug}/pages/{page_slug}")
    home = HomeRex(chrome_page)

    # THEN: Book page opens and Citation/Attribution dropdown is visible
    await home.click_citation_attribution_dropdown()

    # THEN: Citation/Attribution sections and content is visible
    assert await home.citation_attribution_heading_is_visible(
        "Reuse and redistribution of this content in digital or print format:"
    )
    assert await home.citation_attribution_heading_is_visible("Attribution information")
    assert await home.citation_attribution_heading_is_visible("Citation information")

    assert await home.citation_attribution_paragraphs.count() > 1

    for cit in range(await home.citation_attribution_paragraphs.count()):
        paragraph_text = await home.citation_attribution_paragraphs.nth(
            cit
        ).inner_text()
        assert paragraph_text.strip() != ""
