import pytest
import asyncio

from e2e.ui.pages.home import HomeRex


@pytest.mark.asyncio
async def test_osweb_homepage_loads(chrome_page, base_url):

    # GIVEN: Playwright, chromium and the rex_base_url

    # WHEN: The Home page is fully loaded
    await chrome_page.goto(base_url)
    home = HomeRex(chrome_page)

    # THEN: Openstax logo and osweb homepage sections are is visible
    assert await home.main_menu_and_openstax_logo_is_visible()
    assert await home.osweb_homepage_content_sections()
