import pytest

from e2e.ui.pages.home import HomeRex

import asyncio


@pytest.mark.asyncio
@pytest.mark.parametrize("book_slug, page_slug",
                         [("astronomy-2e", "9-3-impact-craters")])
async def test_highlight_unsaved_confirmation_on_chapter_change(chrome_page, base_url, book_slug, page_slug,
                                                                rex_user, rex_password):

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

    await home.double_click_text()

    assert await home.highlight_box_is_visible()

    await home.click_highlight_box_note_field()

    await home.fill_highlight_box_note_field('autotest highlight')

    await home.click_new_chapter()

    # THEN: Click another chapter with unsaved highlights and confirmation dialog pops up

    assert await home.unsaved_highlight_dialog_is_visible()
    assert home.unsaved_highlight_dialog_discard_button_is_visible
    assert home.unsaved_highlight_dialog_cancel_button_is_visible

    await home.click_cancel_changes_button()

    assert not await home.unsaved_highlight_dialog_is_visible()

    await home.click_highlight_box_cancel_button()

    assert home.highlight_box_trash_icon_is_visible

    await home.click_highlight_box_note_field()

    await home.fill_highlight_box_note_field('new note')

    await home.click_new_chapter()

    await home.click_discard_changes_button()

    assert "9-4-the-origin-of-the-moon" in chrome_page.url
    assert "Ideas for the Origin of the Moon" in await chrome_page.content()

    # THEN: Delete any existing highlights

    await home.click_highlights_option()
    await home.click_highlights_option_page_menu()

    await home.click_highlights_option_page_menu_delete()
    await home.click_highlights_option_page_menu_delete_delete()


@pytest.mark.asyncio
@pytest.mark.parametrize("book_slug, page_slug",
                         [("astronomy-2e", "9-3-impact-craters")])
async def test_highlight_unsaved_confirmation_on_previous_next_page_change(chrome_page, base_url, book_slug,
                                                                           page_slug, rex_user, rex_password):
    # GIVEN: Playwright, chromium and the rex_base_url

    # WHEN: The Home page is fully loaded
    await chrome_page.goto(f"{base_url}/books/{book_slug}/pages/{page_slug}")
    home = HomeRex(chrome_page)

    await chrome_page.keyboard.press("Escape")

    await home.click_login()

    await home.fill_user_field(rex_user)
    await home.fill_password_field(rex_password)

    await home.click_continue_login()

    # THEN: Book page opens, highlight box appears, note is saved

    await chrome_page.keyboard.press("Escape")

    await home.double_click_text()

    assert await home.highlight_box_is_visible()

    await home.click_highlight_box_note_field()

    await home.fill_highlight_box_note_field('autotest highlight')

    # THEN: Click next page, then click previous page link with unsaved highlights and confirmation dialog pops up

    await home.click_content_page_next_link()

    assert await home.unsaved_highlight_dialog_is_visible()

    await home.click_cancel_changes_button()

    assert not await home.unsaved_highlight_dialog_is_visible()

    await home.click_content_page_previous_link()

    assert await home.unsaved_highlight_dialog_is_visible()

    await home.click_cancel_changes_button()

    assert not await home.unsaved_highlight_dialog_is_visible()

    await home.click_highlight_box_save_button()

    assert await home.small_highlighted_note_box_is_visible()

    # THEN: Delete any existing highlights

    await home.click_highlights_option()
    await home.click_highlights_option_page_menu()

    await home.click_highlights_option_page_menu_delete()
    await home.click_highlights_option_page_menu_delete_delete()
