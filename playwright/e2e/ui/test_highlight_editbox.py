import pytest

from e2e.ui.pages.home import HomeRex


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "book_slug, page_slug", [("astronomy-2e", "9-3-impact-craters")]
)
async def test_highlight_editbox_opens_on_one_click(
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

    # NOTE!!! For now infobox needs to be clicked twice to have the edit highlight box open
    await home.oneclick_highlight_infobox()
    await home.oneclick_highlight_infobox()

    assert await home.highlight_box_is_visible()

    assert await home.highlight_box_colours_are_visible()
    assert await home.highlight_box_trash_icon_is_visible()

    await home.click_highlight_box_trash_icon()

    await home.click_highlights_option()

    assert (
        "You have no highlights in this book"
        in await home.highlights_option_page_is_empty.inner_text()
    )


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "book_slug, page_slug", [("astronomy-2e", "9-3-impact-craters")]
)
async def test_highlight_editbox_remains_open_when_clicked_inside(
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

    # NOTE!!! For now infobox needs to clicked twice to have the edit highlight box open
    await home.oneclick_highlight_infobox()
    await home.oneclick_highlight_infobox()

    assert await home.highlight_box_is_visible()

    # THEN: Highlight edit box remains open when note field is clicked

    await home.click_highlight_box_note_field()

    assert await home.highlight_box_is_visible()

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
