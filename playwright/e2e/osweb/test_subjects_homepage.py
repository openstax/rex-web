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

    subjects_list = ["Business", "College Success", "Computer Science", "Humanities", "Math", "Nursing",
                     "Science", "Social Sciences"]

    # THEN: Book subjects homepage opens
    assert "English, Spanish, and Polish" in await home.language_selector_section.inner_text()

    for subject in subjects_list:
        assert subject in await home.subjects_listing_section.inner_text()

    about = await home.about_openstax_section.inner_text()
    assert "about openstax textbooks" in about.lower()

    await home.click_learn_about_openstax_link()

    assert f"{base_url}/about" == chrome_page.url
    assert "Who we are" and "What we do" and "Where we're going" in await home.about_page.inner_text()
