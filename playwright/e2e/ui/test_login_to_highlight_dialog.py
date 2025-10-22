import pytest

from e2e.ui.pages.home import HomeRex


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "book_slug, page_slug", [("astronomy-2e", "9-3-impact-craters")]
)
async def test_login_to_highlight_dialog(
    chrome_page, base_url, book_slug, page_slug, rex_user, rex_password
):

    # GIVEN: Playwright, chromium and the rex_base_url

    # WHEN: The Home page is fully loaded
    await chrome_page.goto(f"{base_url}/books/{book_slug}/pages/{page_slug}")
    home = HomeRex(chrome_page)

    # THEN: User highlights text without being logged in
    await chrome_page.keyboard.press("Escape")

    await home.double_click_text()

    assert await home.small_login_box.is_visible()

    await home.click_small_login_box_cancel()

    assert not await home.small_login_box.is_visible()

    await home.double_click_text()

    await home.click_small_login_box_login()

    await home.fill_user_field(rex_user)
    await home.fill_password_field(rex_password)

    await home.click_continue_login()

    await chrome_page.keyboard.press("Escape")

    assert page_slug in chrome_page.url

    await home.double_click_text()

    assert await home.highlight_infobox.is_visible()

    await chrome_page.keyboard.press("Enter")

    assert await home.highlight_box_is_visible()

    # THEN: Delete existing highlight

    await home.click_highlights_option()
    await home.click_highlights_option_page_menu()

    await home.click_highlights_option_page_menu_delete()
    await home.click_highlights_option_page_menu_delete_delete()

    assert (
        "You have no highlights in this book"
        in await home.highlights_option_page_is_empty.inner_text()
    )
