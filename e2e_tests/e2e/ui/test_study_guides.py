import pytest

from e2e_tests.e2e.ui.pages.studyguides import StudyGuides
from e2e_tests.e2e.ui.pages.home import HomeRex


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "book_slug, page_slug", [("principles-management", "3-2-the-italian-renaissance")]
)
async def test_study_guides(chrome_page, base_url, book_slug, page_slug):

    # GIVEN: Playwright, chromium and the rex_base_url

    # WHEN: The Home page is fully loaded
    await chrome_page.goto(f"{base_url}/books/{book_slug}/pages/{page_slug}")
    studyguides = StudyGuides(chrome_page)

    # THEN: Study Guides icon is visible (only present in Principles of Economics 2e, American Government 2e,
    # Introduction to Business, Principles of Management, and Psychology 2e books)
    assert await studyguides.study_guides_icon.is_visible()

    await studyguides.study_guides_icon.click()

    # THEN: Study Guides page opens
    assert await studyguides.study_guides_page.is_visible()

    assert await studyguides.study_guides_filter_by_chapter.is_visible()
    assert await studyguides.study_guides_filter_by_color.is_visible()

    assert await studyguides.study_guides_other_filters.is_visible()

    assert "The Italian Renaissance" in await studyguides.study_guides_page.inner_text()

    await studyguides.study_guides_filter_by_chapter.click()

    assert await studyguides.study_guides_filter_by_chapter_dropdown.is_visible()

    # THEN: Dismisses the Chapter dropdown
    await chrome_page.keyboard.press("Escape")

    await studyguides.study_guides_filter_by_color.click()

    assert await studyguides.study_guides_filter_by_color_dropdown.is_visible()

    # THEN: Dismisses the Color dropdown and the Study Guide page
    await chrome_page.keyboard.press("Escape")
    await chrome_page.keyboard.press("Escape")

    assert not await studyguides.study_guides_page.is_visible()


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "book_slug, page_slug", [("principles-management", "3-2-the-italian-renaissance")]
)
async def test_study_guides_unlogged_banner_signup(
    chrome_page_unlogged, base_url, book_slug, page_slug
):

    # GIVEN: Playwright, chromium and the rex_base_url

    # WHEN: The Home page is fully loaded
    await chrome_page_unlogged.goto(f"{base_url}/books/{book_slug}/pages/{page_slug}")
    studyguides = StudyGuides(chrome_page_unlogged)
    home = HomeRex(chrome_page_unlogged)

    # THEN: Study Guides icon is visible (only present in Principles of Economics 2e, American Government 2e,
    # Introduction to Business, Principles of Management, and Psychology 2e books)
    assert await studyguides.study_guides_icon.is_visible()

    await studyguides.study_guides_icon.click()

    # THEN: Study Guides signup banner opens
    assert await studyguides.study_guides_unlogged_banner.is_visible()

    # THEN: Study Guides signup page opens
    await studyguides.study_guides_unlogged_banner_signup.click()
    assert await home.signup_page.is_visible()

    assert await home.signup_page_student.is_visible()
    assert await home.signup_page_educator_researcher.is_visible()


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "book_slug, page_slug", [("principles-management", "3-2-the-italian-renaissance")]
)
async def test_study_guides_unlogged_banner_login(
    chrome_page_unlogged, base_url, book_slug, page_slug
):

    # GIVEN: Playwright, chromium and the rex_base_url

    # WHEN: The Home page is fully loaded
    await chrome_page_unlogged.goto(f"{base_url}/books/{book_slug}/pages/{page_slug}")
    studyguides = StudyGuides(chrome_page_unlogged)
    home = HomeRex(chrome_page_unlogged)

    # THEN: Study Guides icon is visible (only present in Principles of Economics 2e, American Government 2e,
    # Introduction to Business, Principles of Management, and Psychology 2e books)
    assert await studyguides.study_guides_icon.is_visible()

    await studyguides.study_guides_icon.click()

    # THEN: Study Guides login banner opens
    assert await studyguides.study_guides_unlogged_banner.is_visible()

    # THEN: Study Guides login page opens
    await home.login_link.click()
    assert await home.login_page.is_visible()

    assert await home.signup_page_facebook_link.is_visible()
    assert await home.signup_page_google_link.is_visible()
