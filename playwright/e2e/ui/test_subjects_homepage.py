import pytest
import asyncio

from e2e.ui.pages.home import HomeRex


@pytest.mark.asyncio
async def test_subjects_homepage(chrome_page, base_url):

    # GIVEN: Playwright, chromium and the rex_base_url

    # WHEN: The Home page is fully loaded
    await chrome_page.goto(base_url)
    home = HomeRex(chrome_page)

    assert home.subjects_page_menu

    await home.click_subjects_page_menu()

    await home.click_subjects_homepage_link()

    assert "English, Spanish, and Polish" in await home.language_selector_section.inner_text()

    assert "Business" and "College Success" and "Computer Science" and "Humanities" and "Math" and "Nursing" and "Science" and "Social Sciences" in await home.subjects_listing_section.inner_text()

    about = await home.about_openstax_section.inner_text()
    assert "about openstax textbooks" in about.lower()

    await home.click_learn_about_openstax_link()

    if "staging" in chrome_page.url:
        assert f"{base_url}/about" in chrome_page.url
    else:
        assert f"{base_url}/about" in chrome_page.url
        assert "Who we are" and "What we do" and "Where we're going" in await home.about_page.inner_text()
