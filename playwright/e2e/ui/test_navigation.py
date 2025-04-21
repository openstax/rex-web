import pytest

from e2e.ui.pages.home import HomeRex

import asyncio

from playwright.async_api import TimeoutError


@pytest.mark.asyncio
@pytest.mark.parametrize("book_slug, page_slug", [("astronomy-2e", "preface")])
async def test_previous_link_hidden_on_first_page(chrome_page, base_url, abl_uuids_slugs, book_slug, page_slug):

    # GIVEN: Playwright, chromium and the rex_base_url

    # WHEN: The Home page is fully loaded
    await chrome_page.goto(f"{base_url}/books/{book_slug}/pages/{page_slug}")
    home = HomeRex(chrome_page)

    if home.cookieyes_accept_is_visible:
        await home.click_cookieyes_accept()

    #THEN: Book page opens on the first page

    assert home.content_page_previous_next_page_bar_is_visible

    first_page = chrome_page.url

    await home.click_content_page_next_link()

    next_page = chrome_page.url

    if home.content_page_black_overlay_is_visible:
        await home.click_content_page_black_overlay_close()

    assert home.content_page_previous_next_page_bar_is_visible

    assert first_page != next_page

    await home.click_content_page_previous_link()

    first_page_again = chrome_page.url

    assert first_page_again == first_page


@pytest.mark.asyncio
@pytest.mark.parametrize("book_slug, page_slug", [("statistics", "index")])
async def test_next_link_hidden_on_last_page(chrome_page, base_url, abl_uuids_slugs, book_slug, page_slug):

    # GIVEN: Playwright, chromium and the rex_base_url

    # WHEN: The Home page is fully loaded
    await chrome_page.goto(f"{base_url}/books/{book_slug}/pages/{page_slug}")
    home = HomeRex(chrome_page)

    if home.cookieyes_accept_is_visible:
        await home.click_cookieyes_accept()

    #THEN: Book page opens on the last page

    assert home.content_page_previous_next_page_bar_is_visible

    first_page = chrome_page.url

    await home.click_content_page_previous_link()

    next_page = chrome_page.url

    if home.content_page_black_overlay_is_visible:
        await home.click_content_page_black_overlay_close()

    assert first_page != next_page
