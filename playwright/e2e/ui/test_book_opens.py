import pytest

from e2e.ui.pages.home import HomeRex


@pytest.mark.asyncio
async def test_book_opens(chrome_page, base_url):

    # GIVEN: Playwright, chromium and the rex_base_url

    # WHEN: The Home page is fully loaded
    await chrome_page.goto(f"{base_url}/subjects/business")
    home = HomeRex(chrome_page)

    if "staging" not in chrome_page.url:

        # THEN: Book details page opens (openstax prod)
        await home.click_book_cover_link()

        await home.book_title_image.is_visible()

        assert await home.highlight_recommended_popup_is_visible()

        assert await home.order_print_copy_options_box_is_visible()

        await home.click_view_online_link()

        await home.click_go_to_your_book_link()

        assert await home.toc_is_visible()

    else:

        # THEN: Book details page opens (openstax staging)
        await home.click_book_cover_link()

        await home.book_title_image.is_visible()
