import pytest

from e2e.ui.pages.home import HomeRex

import asyncio


@pytest.mark.asyncio
@pytest.mark.parametrize("book_slug, page_slug", [("astronomy-2e", "9-3-impact-craters")])
async def test_unsuccessful_search(chrome_page, base_url, book_slug, page_slug, rex_user, rex_password):

    # GIVEN: Playwright, chromium and the rex_base_url

    # WHEN: The Home page is fully loaded
    await chrome_page.goto(f"{base_url}/books/{book_slug}/pages/{page_slug}")
    home = HomeRex(chrome_page)

    assert home.content_search_field_is_visible

    await home.click_search()

    await home.fill_search_field("mmmxxx11")

    # THEN: No search results are shown

    await chrome_page.keyboard.press("Enter")

    assert "Sorry, no results found for " in await home.search_result_is_visible.inner_text()

    assert "Preface" not in await home.book_toc_slideout_is_visible.inner_text()

    await home.close_unsuccessful_search_result_sidebar()

    assert "Preface" in await home.book_toc_slideout_is_visible.inner_text()


@pytest.mark.asyncio
@pytest.mark.parametrize("book_slug, page_slug", [("astronomy-2e", "9-3-impact-craters")])
async def test_successful_search(chrome_page, base_url, book_slug, page_slug, rex_user, rex_password):

    # GIVEN: Playwright, chromium and the rex_base_url

    # WHEN: The Home page is fully loaded
    await chrome_page.goto(f"{base_url}/books/{book_slug}/pages/{page_slug}")
    home = HomeRex(chrome_page)

    assert home.content_search_field_is_visible

    await home.click_search()

    await home.fill_search_field('“cannibal galaxy”')

    # THEN: Search results are shown

    await chrome_page.keyboard.press("Enter")

    assert "4 search results for " in await home.search_result_is_visible.inner_text()

    assert '“cannibal galaxy”' in await home.search_result_is_visible.inner_text()

    await home.close_successful_search_result_sidebar()

    assert "4 search results for " not in await home.book_toc_slideout_is_visible.inner_text()


@pytest.mark.asyncio
@pytest.mark.parametrize("book_slug, page_slug", [("astronomy-2e", "9-3-impact-craters")])
async def test_search_result(chrome_page, base_url, book_slug, page_slug, rex_user, rex_password):

    # GIVEN: Playwright, chromium and the rex_base_url

    # WHEN: The Home page is fully loaded
    await chrome_page.goto(f"{base_url}/books/{book_slug}/pages/{page_slug}")
    home = HomeRex(chrome_page)

    assert home.content_search_field_is_visible

    await home.click_search()

    await home.fill_search_field('“cannibal galaxy”')

    # THEN: Search results are shown

    await chrome_page.keyboard.press("Enter")

    assert "6.2 Telescopes Today" in await home.search_result_is_visible.inner_text()

    await home.click_first_search_result()

    # THEN: Correct page opens with the correct search result

    await chrome_page.keyboard.press("Escape")

    assert "6.2 Telescopes Today" in await chrome_page.title()
    assert "cannibal galaxy" in await chrome_page.content()
