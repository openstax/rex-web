import pytest

from e2e_tests.e2e.ui.pages.home import HomeRex

import requests

from playwright.async_api import TimeoutError


@pytest.mark.asyncio
async def test_book_opens(chrome_page, base_url):

    # GIVEN: Playwright, chromium and the rex_base_url

    # WHEN: The Home page is fully loaded
    await chrome_page.goto(f"{base_url}/subjects/math")
    home = HomeRex(chrome_page)

    # THEN: Book details page opens
    async with chrome_page.expect_popup() as popup_info:
        await home.click_book_cover_link()

    new_tab = await popup_info.value
    await new_tab.wait_for_load_state()

    # THEN: Books details page opens
    assert "calculus-volume-1" in new_tab.url

    assert await new_tab.get_by_text("Recommended").is_visible()

    assert await new_tab.locator(".order-print-copy").is_visible()

    await new_tab.get_by_text("View online").click()

    # THEN: Cookies dialog might open
    try:
        await new_tab.get_by_role("button", name="Close", exact=True).click()

    except TimeoutError as te:
        print(f"{te}\nNo Cookies dialog, continue testing... ")

    finally:

        await new_tab.get_by_text("Go to your ").click()

        assert await new_tab.get_by_text("Table of contents").is_visible()


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
        await chrome_page.get_by_label("Astronomy").click()

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

    assert await new_tab.get_by_role("heading", name="Table of contents").is_visible()
