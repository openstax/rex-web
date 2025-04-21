import pytest
import asyncio

from e2e.ui.pages.home import HomeRex


@pytest.mark.asyncio
async def test_book_opens(chrome_page, base_url):

    # GIVEN: Playwright, chromium and the rex_base_url

    # WHEN: The Home page is fully loaded
    await chrome_page.goto(f"{base_url}/subjects/business")
    home = HomeRex(chrome_page)

    await home.click_book_cover_link()

    #THEN: Book details page opens

    assert "macroeconomics-3e" in chrome_page.url

    assert home.highlight_recommended_popup_is_visible

    await home.click_view_online_link()

    await home.click_go_to_your_book_link()

    assert home.bookbanner_is_visible

    assert home.toc_is_visible

    assert home.highlights_option_is_visible

    assert home.order_a_print_copy_link_is_visible

    assert home.citation_attribution_link_is_visible
