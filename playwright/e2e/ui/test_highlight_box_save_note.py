import pytest

from e2e.ui.pages.home import HomeRex

import asyncio


@pytest.mark.asyncio
@pytest.mark.parametrize("book_slug, page_slug",
                         [("astronomy-2e", "9-3-impact-craters")])
async def test_highlight_box_save_note(chrome_page, base_url, book_slug, page_slug, rex_user, rex_password):

    # GIVEN: Playwright, chromium and the rex_base_url

    # WHEN: The Home page is fully loaded
    await chrome_page.goto(f"{base_url}/books/{book_slug}/pages/{page_slug}")
    home = HomeRex(chrome_page)

    await chrome_page.keyboard.press("Escape")

    await home.click_login()

    await home.fill_user_field(rex_user)
    await home.fill_password_field(rex_password)

    await home.click_continue_login()

    #THEN: Book page opens, highlight box appears, note is saved

    await chrome_page.keyboard.press("Escape")

    await home.select_text()
    await home.double_click_text()

    assert await home.highlight_box_is_visible()

    await home.click_highlight_box_note_field()

    await home.fill_highlight_box_note_field('autotest highlight')

    await home.click_highlight_box_save_button()

    assert home.small_highlighted_note_box_is_visible

    await home.click_highlights_option()

    assert "\nNote:\nautotest highlight" in await home.highlights_option_page_is_visible.inner_text()


@pytest.mark.asyncio
@pytest.mark.parametrize("book_slug, page_slug",
                         [("astronomy-2e", "9-3-impact-craters")])
async def test_overlapping_highlights(chrome_page, base_url, book_slug, page_slug, rex_user, rex_password):

    # GIVEN: Playwright, chromium and the rex_base_url

    # WHEN: The Home page is fully loaded
    await chrome_page.goto(f"{base_url}/books/{book_slug}/pages/{page_slug}")
    home = HomeRex(chrome_page)

    await chrome_page.keyboard.press("Escape")

    await home.click_login()

    await home.fill_user_field(rex_user)
    await home.fill_password_field(rex_password)

    await home.click_continue_login()

    # THEN: Book page opens, a highlight exists and adding another highlight brings up an overlapping warning message

    await chrome_page.keyboard.press("Escape")

    assert await home.small_highlighted_note_box_is_visible()

    await home.double_click_text()

    assert home.overlapping_highlights_message_is_visible

    assert ("Overlapping highlights are not supported."
            in await home.overlapping_highlights_message_is_visible.inner_text())

    await home.click_highlights_option()
    await home.click_highlights_option_page_menu()

    await home.click_highlights_option_page_menu_delete()
    await home.click_highlights_option_page_menu_delete_delete()

    assert "You have no highlights in this book" in await home.highlights_option_page_is_empty.inner_text()


@pytest.mark.asyncio
@pytest.mark.parametrize("book_slug, page_slug",
                         [("astronomy-2e", "9-3-impact-craters")])
async def test_highlight_box_note_colours(chrome_page, base_url, book_slug, page_slug, rex_user, rex_password):

    # GIVEN: Playwright, chromium and the rex_base_url

    # WHEN: The Home page is fully loaded
    await chrome_page.goto(f"{base_url}/books/{book_slug}/pages/{page_slug}")
    home = HomeRex(chrome_page)

    await home.click_login()

    await home.fill_user_field(rex_user)
    await home.fill_password_field(rex_password)

    await home.click_continue_login()

    #THEN: Book page opens, highlight box appears with colours and highlighted text can get different colour

    await chrome_page.keyboard.press("Escape")

    await home.select_text()
    await home.double_click_text()

    assert await home.highlight_box_is_visible()

    await home.click_highlight_box_purple_colour()

    await home.click_highlight_box_note_field()

    await home.fill_highlight_box_note_field('purple autotest highlight')

    await home.click_highlight_box_save_button()

    assert home.small_highlighted_note_box_is_visible

    await home.click_highlights_option()

    assert "\nNote:\npurple autotest highlight" in await home.highlights_option_page_is_visible.inner_text()

    assert "purple" in await home.highlights_option_text_colour_check_purple

    await home.click_highlights_option_page_menu()

    await home.click_highlights_option_green_colour()

    await chrome_page.keyboard.press("Escape")

    assert "green" in await home.highlights_option_text_colour_check_green

    await home.click_highlights_option_page_menu()

    await home.click_highlights_option_page_menu_delete()
    await home.click_highlights_option_page_menu_delete_delete()

    assert "You have no highlights in this book" in await home.highlights_option_page_is_empty.inner_text()
