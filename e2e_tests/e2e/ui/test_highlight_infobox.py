import pytest

from e2e_tests.e2e.ui.pages.home import HomeRex


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "book_slug, page_slug", [("astronomy-2e", "9-3-impact-craters")]
)
async def test_highlight_infobox_dismisses_on_esc(
    chrome_page, base_url, book_slug, page_slug, rex_user, rex_password
):

    # GIVEN: Playwright, chromium and the rex_base_url

    # WHEN: The Home page is fully loaded
    await chrome_page.goto(f"{base_url}/books/{book_slug}/pages/{page_slug}")
    home = HomeRex(chrome_page)

    # THEN: Book page opens, highlight infobox and edit box appears

    await chrome_page.keyboard.press("Escape")

    await home.double_click_text()

    assert await home.highlight_infobox.is_visible()

    await chrome_page.keyboard.press("Escape")

    assert not await home.highlight_infobox.is_visible()

    await home.click_highlights_option()

    assert (
        "You have no highlights in this book"
        in await home.highlights_option_page_is_empty.inner_text()
    )


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "book_slug, page_slug", [("astronomy-2e", "9-3-impact-craters")]
)
async def test_highlight_infobox_dismisses_on_one_click(
    chrome_page, base_url, book_slug, page_slug, rex_user, rex_password
):

    # GIVEN: Playwright, chromium and the rex_base_url

    # WHEN: The Home page is fully loaded
    await chrome_page.goto(f"{base_url}/books/{book_slug}/pages/{page_slug}")
    home = HomeRex(chrome_page)

    # THEN: Book page opens, highlight infobox and edit box appears

    await chrome_page.keyboard.press("Escape")

    await home.double_click_text()

    assert await home.highlight_infobox.is_visible()

    await home.click_other_text()

    assert not await home.highlight_infobox.is_visible()

    await home.click_highlights_option()

    assert (
        "You have no highlights in this book"
        in await home.highlights_option_page_is_empty.inner_text()
    )


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "book_slug, page_slug", [("astronomy-2e", "9-3-impact-craters")]
)
async def test_highlight_infobox_remains_open_when_clicking_the_highlighted_text_again(
    chrome_page, base_url, book_slug, page_slug, rex_user, rex_password
):

    # GIVEN: Playwright, chromium and the rex_base_url

    # WHEN: The Home page is fully loaded
    await chrome_page.goto(f"{base_url}/books/{book_slug}/pages/{page_slug}")
    home = HomeRex(chrome_page)

    # THEN: Book page opens, highlight infobox and edit box appears

    await chrome_page.keyboard.press("Escape")

    await home.double_click_text()

    assert await home.highlight_infobox.is_visible()

    await home.double_click_text()

    assert await home.highlight_infobox.is_visible()

    assert not await home.highlight_box_is_visible()

    await chrome_page.keyboard.press("Escape")

    assert not await home.highlight_infobox.is_visible()

    assert not await home.highlight_box_is_visible()

    await home.click_highlights_option()

    assert (
        "You have no highlights in this book"
        in await home.highlights_option_page_is_empty.inner_text()
    )
