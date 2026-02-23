import pytest

from e2e_tests.e2e.ui.pages.home import HomeRex


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "book_slug, page_slug", [("astronomy-2e", "9-3-impact-craters")]
)
async def test_delete_existing_highlights_astro_cleanup(
    chrome_page, base_url, book_slug, page_slug, rex_user, rex_password
):
    # Deletes any existing highlighted text prior to starting new highlight tests

    # GIVEN: Playwright, chromium and the rex_base_url

    # WHEN: The Home page is fully loaded and logged in
    await chrome_page.goto(f"{base_url}/books/{book_slug}/pages/{page_slug}")
    home = HomeRex(chrome_page)

    await home.click_login()

    await home.fill_user_field(rex_user)
    await home.fill_password_field(rex_password)

    await home.click_continue_login()

    # THEN: Book page opens, checks for highlights and deletes any existing ones
    await chrome_page.keyboard.press("Escape")

    highlights = chrome_page.locator("mark[data-highlighted='true']")

    max_iterations = 20
    iteration = 0
    while await highlights.count() > 0:
        iteration += 1
        if iteration > max_iterations:
            raise RuntimeError(f"Failed to delete all highlights after {max_iterations} attempts")
        current_count = await highlights.count()
        print(f"Found {current_count} highlights. Deleting...")

        target = highlights.first
        await target.scroll_into_view_if_needed()

        # THEN: Deletes existing highlights
        await home.click_highlights_option()
        await home.click_highlights_option_page_menu()
        await home.click_highlights_option_page_menu_delete()
        await home.click_highlights_option_page_menu_delete_delete()

        await home.close_highlights_option_page()

        await chrome_page.keyboard.press("Escape")

        await chrome_page.wait_for_load_state("networkidle")


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "book_slug, page_slug",
    [("algebra-and-trigonometry-2e", "13-1-sequences-and-their-notations")],
)
async def test_delete_existing_highlights_alg_and_tri_cleanup(
    chrome_page, base_url, book_slug, page_slug, rex_user, rex_password
):
    # Deletes any existing highlighted text prior to starting new highlight tests

    # GIVEN: Playwright, chromium and the rex_base_url

    # WHEN: The Home page is fully loaded and logged in
    await chrome_page.goto(f"{base_url}/books/{book_slug}/pages/{page_slug}")
    home = HomeRex(chrome_page)

    await home.click_login()

    await home.fill_user_field(rex_user)
    await home.fill_password_field(rex_password)

    await home.click_continue_login()

    # THEN: Book page opens, checks for highlights and deletes any existing ones
    await chrome_page.keyboard.press("Escape")

    highlights = chrome_page.locator("mark[data-highlighted='true']")

    max_iterations = 20
    iteration = 0
    while await highlights.count() > 0:
        iteration += 1
        if iteration > max_iterations:
            raise RuntimeError(f"Failed to delete all highlights after {max_iterations} attempts")
        current_count = await highlights.count()
        print(f"Found {current_count} highlights. Deleting...")

        target = highlights.first
        await target.scroll_into_view_if_needed()

        # THEN: Deletes existing highlights
        await home.click_highlights_option()
        await home.click_highlights_option_page_menu()
        await home.click_highlights_option_page_menu_delete()
        await home.click_highlights_option_page_menu_delete_delete()

        await home.close_highlights_option_page()

        await chrome_page.keyboard.press("Escape")

        await chrome_page.wait_for_load_state("networkidle")
