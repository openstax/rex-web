import pytest

from e2e.ui.pages.home import HomeRex

import asyncio


@pytest.mark.asyncio
@pytest.mark.parametrize("book_slug, page_slug",
                         [("astronomy-2e", "9-3-impact-craters")])
async def test_delete_existing_highlights_astro(chrome_page, base_url, book_slug, page_slug, rex_user, rex_password):
    # Deletes any existing highlighted text prior to starting new highlight tests

    # GIVEN: Playwright, chromium and the rex_base_url

    # WHEN: The Home page is fully loaded and logged in
    await chrome_page.goto(f"{base_url}/books/{book_slug}/pages/{page_slug}")
    home = HomeRex(chrome_page)

    await home.click_login()

    await home.fill_user_field(rex_user)
    await home.fill_password_field(rex_password)

    await home.click_continue_login()

    #THEN: Book page opens, checks for highlights and deletes any existing ones

    await chrome_page.keyboard.press("Escape")

    for section in await home.section_count():
        for p in await section.locator("p").all():
            for mark in await p.locator("mark").all():
                if await mark.get_attribute("data-highlighted") == "true":
                    print("Deleting a highlight...")
                    await home.click_highlights_option()
                    await home.click_highlights_option_page_menu()

                    await home.click_highlights_option_page_menu_delete()
                    await home.click_highlights_option_page_menu_delete_delete()

                    await chrome_page.keyboard.press("Escape")


@pytest.mark.asyncio
@pytest.mark.parametrize("book_slug, page_slug",
                         [("algebra-and-trigonometry-2e", "13-1-sequences-and-their-notations")])
async def test_delete_existing_highlights_alg_and_tri(chrome_page, base_url, book_slug, page_slug, rex_user, rex_password):
    # Deletes any existing highlighted text prior to starting new highlight tests

    # GIVEN: Playwright, chromium and the rex_base_url

    # WHEN: The Home page is fully loaded and logged in
    await chrome_page.goto(f"{base_url}/books/{book_slug}/pages/{page_slug}")
    home = HomeRex(chrome_page)

    await home.click_login()

    await home.fill_user_field(rex_user)
    await home.fill_password_field(rex_password)

    await home.click_continue_login()

    #THEN: Book page opens, checks for highlights and deletes any existing ones

    await chrome_page.keyboard.press("Escape")

    for section in await home.section_count():
        for p in await section.locator("p").all():
            for mark in await p.locator("mark").all():
                if await mark.get_attribute("data-highlighted") == "true":
                    print("Deleting a highlight...")
                    await home.click_highlights_option()
                    await home.click_highlights_option_page_menu()

                    await home.click_highlights_option_page_menu_delete()
                    await home.click_highlights_option_page_menu_delete_delete()

                    await chrome_page.keyboard.press("Escape")