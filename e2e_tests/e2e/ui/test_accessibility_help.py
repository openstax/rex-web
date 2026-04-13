import pytest

from e2e_tests.e2e.ui.pages.home import HomeRex

from playwright.async_api import TimeoutError
import sys


@pytest.mark.parametrize(
    "book_slug, page_slug", [("astronomy-2e", "1-3-the-laws-of-nature")]
)
@pytest.mark.asyncio
async def test_accessibility_help(chrome_page_unlogged, base_url, book_slug, page_slug):
    # Verifies the hidden 'Go to accessibility page'

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

        await chrome_page_unlogged.keyboard.press("Tab")
        await chrome_page_unlogged.keyboard.press("Tab")

        await chrome_page_unlogged.keyboard.press("Enter")

        # THEN: Accessibility help opens

        accessibility_page_content = await home.accessibility_help_content.inner_text()

        assert (
            "Accessibility" in accessibility_page_content
            and "OpenStax" in accessibility_page_content
        )
