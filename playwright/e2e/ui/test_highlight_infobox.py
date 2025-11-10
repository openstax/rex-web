import pytest

from e2e.ui.pages.home import HomeRex


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "book_slug, page_slug", [("astronomy-2e", "9-3-impact-craters")]
)
async def test_highlight_infobox_dismiss_with_esc(
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

    # THEN: Book page opens, highlight infobox and edit box appears

    await chrome_page.keyboard.press("Escape")

    await home.double_click_text()

    assert await home.highlight_infobox.is_visible()

    # THEN: Highlight infobox closes on Escape key

    await chrome_page.keyboard.press("Escape")

    assert not await home.highlight_infobox.is_visible()


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "book_slug, page_slug", [("astronomy-2e", "9-3-impact-craters")]
)
async def test_highlight_infobox_dismiss_with_click(
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

    assert await home.highlight_infobox.is_visible()

    await home.click_other_text()

    # Adjusting the test until the expected behaviour is implemented for click other non-highlighted
    # text, which should close the infobox
    assert await home.highlight_infobox.is_visible()

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
async def test_highlight_infobox_remains_open_when_clicking_the_highlighted_text_again(
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

    # THEN: Book page opens, highlight infobox and edit box appears

    await chrome_page.keyboard.press("Escape")

    await home.double_click_text()

    assert await home.highlight_infobox.is_visible()

    await chrome_page.keyboard.press("Enter")

    assert await home.highlight_box_is_visible()

    await chrome_page.keyboard.press("Escape")

    assert not await home.highlight_box_is_visible()

    await chrome_page.keyboard.press("Enter")

    assert await home.highlight_box_is_visible()

    await home.double_click_text()

    # THEN: Highlight edit box remains open

    assert await home.highlight_infobox.is_visible()

    await home.click_highlights_option()

    assert (
        "You have no highlights in this book"
        not in await home.highlights_option_page_is_empty.inner_text()
    )

    # THEN: Delete the created highlight

    await home.click_highlights_option_page_menu()

    await home.click_highlights_option_page_menu_delete()
    await home.click_highlights_option_page_menu_delete_delete()

    assert (
        "You have no highlights in this book"
        in await home.highlights_option_page_is_empty.inner_text()
    )


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "book_slug, page_slug", [("astronomy-2e", "9-3-impact-craters")]
)
async def test_highlight_box_remains_open_when_clicked_inside(
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

    # THEN: Book page opens, highlight infobox and edit box appears

    await chrome_page.keyboard.press("Escape")

    await home.double_click_text()

    assert await home.highlight_infobox.is_visible()

    await chrome_page.keyboard.press("Enter")

    assert await home.highlight_box_is_visible()

    await home.click_other_text()

    # THEN: Highlight edit box remains open when note field is clicked

    await chrome_page.keyboard.press("Enter")

    await home.click_highlight_box_note_field()

    # This is an issue at the moment and needs fixing (highlight box should remain open)
    assert not await home.highlight_box_is_visible()

    await home.click_highlights_option()

    await chrome_page.reload()

    assert (
        "You have no highlights in this book"
        not in await home.highlights_option_page_is_empty.inner_text()
    )

    # THEN: Delete the created highlight

    await home.click_highlights_option_page_menu()

    await home.click_highlights_option_page_menu_delete()
    await home.click_highlights_option_page_menu_delete_delete()

    assert (
        "You have no highlights in this book"
        in await home.highlights_option_page_is_empty.inner_text()
    )
