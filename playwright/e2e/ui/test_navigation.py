import pytest
import random

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

    if home.cookies_accept_is_visible:
        await home.click_cookies_accept()

    #THEN: Book page opens on the first page

    assert home.content_page_previous_next_page_bar_is_visible

    first_page = chrome_page.url

    try:
        await home.click_content_page_previous_link()

    except TimeoutError:
        print(f"No Previous button is present on first page. As expected!")

    else:

        if home.content_page_black_overlay_is_visible:
            await home.click_content_page_black_overlay_close()

        await home.click_content_page_next_link()

        next_page = chrome_page.url

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

    if home.cookies_accept_is_visible:
        await home.click_cookies_accept()

    #THEN: Book page opens on the last page

    assert home.content_page_previous_next_page_bar_is_visible

    first_page = chrome_page.url

    try:
        await home.click_content_page_next_link()

    except TimeoutError:
        print(f"No Next button is present on last page. As expected!")

    else:

        if home.content_page_black_overlay_is_visible:
            await home.click_content_page_black_overlay_close()

        await home.click_content_page_previous_link()

        next_page = chrome_page.url

        assert first_page == next_page
