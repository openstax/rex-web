import pytest

from e2e.ui.pages.home import HomeRex

import asyncio

import requests


@pytest.mark.asyncio
@pytest.mark.parametrize("book_slug, page_slug", [("astronomy-2e", "9-333-impact-craters")])
async def test_logged_and_unlogged_page_content(chrome_page, base_url, book_slug, page_slug, rex_user, rex_password):

    # GIVEN: Playwright, chromium and the rex_base_url

    # WHEN: The Home page is fully loaded
    await chrome_page.goto(f"{base_url}/books/{book_slug}/pages/{page_slug}")
    home = HomeRex(chrome_page)

    resp_code = requests.head(chrome_page.url)

    # THEN: Error page is shown
    assert 404 == resp_code.status_code

    incorrect_page_slug = chrome_page.url
    correct_page_slug = incorrect_page_slug.replace("9-333-impact-craters", "9-3-impact-craters")

    await chrome_page.goto(f"{correct_page_slug}")

    #THEN: Correct book page opens
    resp_code = requests.head(chrome_page.url)

    assert 200 == resp_code.status_code

    assert "impact craters" in await chrome_page.content()

    # THEN: User logs in and sees the same content
    await home.click_login()

    await home.fill_user_field(rex_user)
    await home.fill_password_field(rex_password)

    await home.click_continue_login()

    if home.content_page_black_overlay_is_visible:
        await home.click_content_page_black_overlay_close()

    assert "impact craters" in await chrome_page.content()

    assert home.logged_in_user_dropdown_is_visible

    await home.click_logged_in_user_dropdown()

    assert home.logout_link_is_visible


