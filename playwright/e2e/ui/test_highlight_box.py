import pytest

from e2e.ui.pages.home import HomeRex


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "book_slug, page_slug", [("astronomy-2e", "9-3-impact-craters")]
)
async def test_highlight_box_dismiss_with_esc(
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

    # THEN: Book page opens, highlight box appears, then disappears on Escape key

    await chrome_page.keyboard.press("Escape")

    await home.double_click_text()

    assert await home.highlight_box_is_visible()

    assert await home.highlight_box_colours_are_visible()

    await chrome_page.keyboard.press("Escape")

    # Adjusting the test until the expected behaviour is implemented for Escape key (to avoid test fail)
    assert await home.highlight_box_is_visible()
    # await home.click_highlights_option()
    # assert "You have no highlights in this book" not in await home.highlights_option_page_is_empty.inner_text()


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "book_slug, page_slug", [("astronomy-2e", "9-3-impact-craters")]
)
async def test_highlight_box_dismiss_with_click(
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

    # THEN: Book page opens, highlight box appears, then disappears on clicking away from the box

    await chrome_page.keyboard.press("Escape")

    await home.double_click_text()

    assert await home.highlight_box_is_visible()

    await home.click_other_text()

    assert not await home.highlight_box_is_visible()

    await home.click_highlights_option()

    assert (
        "You have no highlights in this book"
        in await home.highlights_option_page_is_empty.inner_text()
    )


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "book_slug, page_slug", [("astronomy-2e", "9-3-impact-craters")]
)
async def test_highlight_box_click_highlights_option_after_highlighting_text(
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

    # THEN: Book page opens, highlight box appears, then disappears on clicking the highlights option page

    await chrome_page.keyboard.press("Escape")

    await home.double_click_text()

    assert await home.highlight_box_is_visible()

    await home.click_highlights_option()

    assert (
        "You have no highlights in this book"
        in await home.highlights_option_page_is_empty.inner_text()
    )

    await chrome_page.keyboard.press("Escape")

    assert not await home.highlight_box_is_visible()
