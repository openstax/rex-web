import pytest
import asyncio

from e2e.ui.pages.home import HomeRex


@pytest.mark.asyncio
async def test_subjects_footer(chrome_page, base_url):

    # GIVEN: Playwright, chromium and the rex_base_url

    # WHEN: The Home page is fully loaded
    await chrome_page.goto(base_url)
    home = HomeRex(chrome_page)

    await home.click_subjects_page_menu()

    await home.click_subjects_homepage_link()

    # THEN: Footer section loads
    assert home.footer_section

    assert home.footer_section_help_is_visible
    assert home.footer_section_openstax_is_visible
    assert home.footer_section_policies_is_visible

    assert home.footer_section_bottom_is_visible

    assert "Rice University" and "license" in await home.footer_section_bottom_is_visible.inner_text()

    assert "https://creativecommons.org" in await home.footer_section_license_link
