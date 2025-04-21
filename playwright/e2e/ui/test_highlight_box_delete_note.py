import pytest

from e2e.ui.pages.home import HomeRex

import asyncio


@pytest.mark.asyncio
@pytest.mark.parametrize("book_slug, page_slug",
                         [("astronomy-2e", "9-3-impact-craters")])
async def test_highlight_box_delete_note(chrome_page, base_url, book_slug, page_slug, rex_user, rex_password):

    # GIVEN: Playwright, chromium and the rex_base_url

    # WHEN: The Home page is fully loaded
    await chrome_page.goto(f"{base_url}/books/{book_slug}/pages/{page_slug}")
    home = HomeRex(chrome_page)

    if home.cookieyes_accept_is_visible:
        await home.click_cookieyes_accept()

    await chrome_page.keyboard.press("Escape")

    await home.click_login()

    await home.fill_user_field(rex_user)
    await home.fill_password_field(rex_password)

    await home.click_continue_login()

    #THEN: Book page opens, highlight box appears, note is saved, then deleted and box disappears

    if home.content_page_black_overlay_is_visible:
        await home.click_content_page_black_overlay_close()

    if home.cookies_info_dialog_is_visible:
        await home.close_cookies_info_dialog()

    await home.double_click_text()

    assert home.highlight_box_is_visible

    await home.click_highlight_box_note_field()

    await home.fill_highlight_box_note_field('autotest highlight')

    await home.click_highlight_box_save_button()

    assert await home.yellow_highlighted_text_is_visible()

    await home.click_small_highlight_box_dropdown()

    await home.click_small_highlight_box_delete_button()

    await home.click_delete_highlight_button()

    assert not await home.yellow_highlighted_text_is_visible()

    assert not await home.small_highlighted_note_box_is_visible()


