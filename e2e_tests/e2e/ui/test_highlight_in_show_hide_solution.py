import pytest

from e2e_tests.e2e.ui.pages.home import HomeRex


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "book_slug, page_slug",
    [("algebra-and-trigonometry-2e", "13-1-sequences-and-their-notations")],
)
async def test_highlight_not_saved_in_show_hide_solution(
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

    # THEN: Book page with solution opens and text inside is highlighted but not saved

    await chrome_page.keyboard.press("Escape")

    # THEN: Solution dialog opens and text gets highlighted

    await home.clear_all_blockers()

    await home.click_show_hide_solution_link()

    await home.clear_all_blockers()

    await home.click_text_in_solution_block()

    assert await home.highlight_infobox.is_visible()

    await home.oneclick_highlight_infobox()

    assert await home.highlight_box_is_visible()

    # THEN: Solution dialog closes

    await home.click_show_hide_solution_link()

    assert not await home.highlight_box_is_visible()

    # THEN: Solution dialog opens

    await home.click_show_hide_solution_link()

    assert not await home.highlight_box_is_visible()

    await home.click_text_in_solution_block()

    await home.oneclick_highlight_infobox()

    assert await home.highlight_box_is_visible()

    await home.fill_highlight_box_note_field("autotest highlight")

    # THEN: Solutions dialog closes/reopens

    await home.click_show_hide_solution_link()

    await home.click_show_hide_solution_link()

    assert await home.highlight_infobox.is_visible()

    # THEN: Delete existing highlight

    await home.click_highlights_option()

    await home.click_discard_changes_button()

    await home.click_highlights_option_page_menu()
    await home.click_highlights_option_page_menu_delete()
    await home.click_highlights_option_page_menu_delete_delete()


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "book_slug, page_slug",
    [("algebra-and-trigonometry-2e", "13-1-sequences-and-their-notations")],
)
async def test_highlight_saved_in_show_hide_solution(
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

    await chrome_page.keyboard.press("Escape")

    # THEN: Book page with solution opens and text inside is highlighted and saved

    await home.clear_all_blockers()

    await home.click_show_hide_solution_link()

    await home.clear_all_blockers()

    await home.click_text_in_solution_block()

    assert await home.highlight_infobox.is_visible()

    await home.oneclick_highlight_infobox()

    assert await home.highlight_box_is_visible()

    await home.fill_highlight_box_note_field("autotest highlight")

    await home.click_highlight_box_save_button()

    assert await home.small_highlighted_note_box_is_visible()

    # THEN: Solutions dialog closes

    await home.click_show_hide_solution_link()

    assert not await home.small_highlighted_note_box_is_visible()

    # THEN: Solutions dialog opens

    await home.click_show_hide_solution_link()

    # THEN: Selects a text block in the solution dropdown
    await chrome_page.locator("#fs-id1165134108431").select_text()
    await chrome_page.keyboard.press("Enter")

    assert (
        "Overlapping highlights are not supported."
        in await home.overlapping_highlights_message.inner_text()
    )

    await home.click_show_hide_solution_link()

    assert not await home.small_highlighted_note_box_is_visible()

    # THEN: Delete existing highlight

    await home.click_highlights_option()
    await home.click_highlights_option_page_menu()
    await home.click_highlights_option_page_menu_delete()
    await home.click_highlights_option_page_menu_delete_delete()
