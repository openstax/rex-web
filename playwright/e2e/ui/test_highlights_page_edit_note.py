import pytest

from e2e.ui.pages.home import HomeRex


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "book_slug, page_slug", [("astronomy-2e", "9-3-impact-craters")]
)
async def test_highlights_page_edit_note(
    chrome_page, base_url, book_slug, page_slug, rex_user, rex_password
):

    # GIVEN: Playwright, chromium and the rex_base_url

    # WHEN: The Home page is fully loaded
    await chrome_page.goto(f"{base_url}/books/{book_slug}/pages/{page_slug}")
    home = HomeRex(chrome_page)

    await home.click_login()

    await home.fill_user_field(rex_user)
    await home.fill_password_field(rex_password)

    await home.click_continue_login()

    # THEN: Book page opens, highlight box appears and note can be edited

    await chrome_page.keyboard.press("Escape")

    await home.select_text()
    await home.double_click_text()

    # NOTE!!! For now infobox needs to be clicked twice to have the edit highlight box open
    await home.oneclick_highlight_infobox()

    assert home.highlight_box_is_visible

    await home.click_highlight_box_note_field()

    await home.fill_highlight_box_note_field("autotest highlight")

    await home.click_highlight_box_save_button()

    await chrome_page.keyboard.press("Escape")

    assert not await home.small_highlighted_note_box_is_visible()

    await home.click_highlights_option()

    assert (
        "\nNote:\nautotest highlight" in await home.highlights_option_page.inner_text()
    )

    await home.click_highlights_option_page_menu()
    await home.click_highlights_option_page_menu_edit()

    await home.fill_highlights_option_edit_note_field("edited highlight test notes")

    await home.click_highlights_option_edit_save_button()

    await chrome_page.keyboard.press("Escape")

    assert (
        "\nNote:\nautotest highlight"
        not in await home.highlights_option_page.inner_text()
    )
    assert (
        "\nNote:\nedited highlight test notes"
        in await home.highlights_option_page.inner_text()
    )

    await chrome_page.keyboard.press("Escape")

    # THEN: Delete the created highlight

    await home.click_highlights_option()
    await home.click_highlights_option_page_menu()

    await home.click_highlights_option_page_menu_delete()
    await home.click_highlights_option_page_menu_delete_delete()

    assert (
        "You have no highlights in this book"
        in await home.highlights_option_page_is_empty.inner_text()
    )
