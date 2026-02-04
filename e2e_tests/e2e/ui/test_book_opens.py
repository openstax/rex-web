import pytest

from e2e_tests.e2e.ui.pages.home import HomeRex

import requests


@pytest.mark.asyncio
async def test_book_opens(chrome_page, base_url):

    # GIVEN: Playwright, chromium and the rex_base_url

    # WHEN: The Home page is fully loaded
    await chrome_page.goto(f"{base_url}/subjects/math")
    home = HomeRex(chrome_page)

    # THEN: Book details page opens
    if "staging" in chrome_page.url:
        async with chrome_page.expect_popup() as popup_info:
            await home.click_book_cover_link()

        new_tab = await popup_info.value
        await new_tab.wait_for_load_state()

        # THEN: Books details page opens
        assert "calculus-volume-1" in new_tab.url

        assert await new_tab.get_by_text("Recommended").is_visible()

        assert await new_tab.locator(".order-print-copy").is_visible()

        await new_tab.get_by_text("View online").click()

        await new_tab.get_by_text("Go to your ").click()

        assert await new_tab.get_by_text("Table of contents").is_visible()

    else:
        await home.click_book_cover_link()

        assert await home.book_title_image.is_visible()

        assert "calculus-volume-1" in chrome_page.url

        assert await home.highlight_recommended_popup_is_visible()

        assert await home.order_print_copy_options_box_is_visible()

        await home.click_view_online_link()

        await home.click_go_to_your_book_link()

        assert await home.toc_is_visible()


@pytest.mark.asyncio
async def test_book_content_portal_opens(chrome_page, base_url):

    # GIVEN: Playwright, chromium and the rex_base_url

    # WHEN: The Home page is fully loaded
    await chrome_page.goto(f"{base_url}/qatest-ottoportal")
    home = HomeRex(chrome_page)

    if "staging" not in chrome_page.url:
        pytest.skip("This is production environment. Skipping content portal test...")

    # THEN: Content portal page opens
    assert "qatest otto portal - OpenStax" in await chrome_page.title()

    resp_code = requests.head(chrome_page.url)
    assert 200 == resp_code.status_code

    # THEN: New browser tab opens
    async with chrome_page.expect_popup() as popup_info:
        await home.click_book_details_page_link()

    new_tab = await popup_info.value
    await new_tab.wait_for_load_state()

    # THEN: Books details page opens
    assert "qatest-ottoportal/details/books/astronomy-2e" in new_tab.url

    new_tab_code = requests.head(new_tab.url)
    assert 200 == new_tab_code.status_code

    # THEN: Book content page opens
    await new_tab.get_by_text("View online").click()
    await new_tab.get_by_text("Go to your ").click()

    assert "404 Not Found - OpenStax" not in await new_tab.title()

    assert await new_tab.locator("span").get_by_text("Table of contents").is_visible()
