import pytest

from e2e_tests.e2e.ui.pages.home import HomeRex

from playwright.async_api import TimeoutError
from playwright.async_api import expect

import sys


@pytest.mark.parametrize(
    "book_slug, page_slug", [("astronomy-2e", "1-3-the-laws-of-nature")]
)
@pytest.mark.asyncio
async def test_accessibility_help(chrome_page_unlogged, base_url, book_slug, page_slug):
    # Verifies the hidden 'Go to accessibility page' link

    # GIVEN: Open osweb book details page

    # WHEN: The Home page is fully loaded
    await chrome_page_unlogged.goto(f"{base_url}/books/{book_slug}/pages/{page_slug}")
    home = HomeRex(chrome_page_unlogged)

    await chrome_page_unlogged.keyboard.press("Escape")

    try:
        await home.click_cookieyes_accept()

    except TimeoutError as te:
        print(f"{te}\nNo Cookies dialog, continue testing... ", file=sys.stderr)

    finally:

        async with chrome_page_unlogged.expect_popup() as popup_info:

            await chrome_page_unlogged.keyboard.press("Tab")
            await chrome_page_unlogged.keyboard.press("Tab")

            await chrome_page_unlogged.keyboard.press("Enter")

        # THEN: Accessibility help page opens
        new_tab = await popup_info.value
        await new_tab.wait_for_load_state("domcontentloaded")

        top_heading = new_tab.get_by_role("heading", name="Web accessibility", level=2)
        bottom_heading = new_tab.get_by_role(
            "heading", name="Accessibility documentation", level=2
        )
        await expect(top_heading).to_be_visible()
        await expect(bottom_heading).to_be_visible()
