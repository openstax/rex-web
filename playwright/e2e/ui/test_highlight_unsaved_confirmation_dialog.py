import pytest

from e2e.ui.pages.home import HomeRex


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "book_slug, page_slug", [("astronomy-2e", "9-3-impact-craters")]
)
async def test_highlight_unsaved_confirmation_dialog(
    chrome_page, base_url, book_slug, page_slug, rex_user, rex_password
):

    # GIVEN: Playwright, chromium and the rex_base_url

    # WHEN: The Home page is fully loaded
    await chrome_page.goto(f"{base_url}/books/{book_slug}/pages/{page_slug}")
    home = HomeRex(chrome_page)

    await chrome_page.keyboard.press("Escape")

    await home.click_login()

    await home.fill_user_field(rex_user)
    await home.fill_password_field(rex_password)

    await home.click_continue_login()

    # THEN: Book page opens, highlight box appears, note is unsaved

    await chrome_page.keyboard.press("Escape")

    await home.double_click_text()

    # NOTE!!! For now infobox needs to be clicked twice to have the edit highlight box open
    await home.oneclick_highlight_infobox()
    await home.oneclick_highlight_infobox()

    assert await home.highlight_box_is_visible()

    await home.click_highlight_box_note_field()

    await home.fill_highlight_box_note_field("autotest highlight")

    # THEN: Click search with unsaved highlights and confirmation dialog pops up

    await home.click_search()

    await home.fill_search_field('"about the Sun (88"')

    await home.click_search_magnifier_icon()

    await home.click_search_result()

    assert await home.unsaved_highlight_dialog_is_visible()

    await home.click_cancel_changes_button()

    # THEN: Click openstax logo with unsaved highlights and confirmation dialog pops up

    await home.click_openstax_logo()
    assert await home.unsaved_highlight_dialog_is_visible()
    await home.click_cancel_changes_button()

    # THEN: Click logout with unsaved highlights and confirmation dialog pops up

    await home.click_logged_in_user_dropdown()
    await home.click_logout_link()
    assert await home.unsaved_highlight_dialog_is_visible()
    await home.click_cancel_changes_button()

    # THEN: Click Highlights option with unsaved highlights and confirmation dialog pops up

    await home.click_highlights_option()
    assert await home.unsaved_highlight_dialog_is_visible()
    await home.click_cancel_changes_button()

    # THEN: Delete existing highlight

    await chrome_page.keyboard.press("Escape")

    await home.click_highlights_option()

    await home.click_discard_changes_button()

    await home.click_highlights_option_page_menu()
    await home.click_highlights_option_page_menu_delete()
    await home.click_highlights_option_page_menu_delete_delete()
