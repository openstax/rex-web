import pytest

from e2e_tests.e2e.ui.pages.home import HomeRex
from e2e_tests.e2e.ui.pages.nursingbooks import NursingBooks


@pytest.mark.asyncio
async def test_nursing_book_content_warning_logged(chrome_page, base_url):

    # GIVEN: Playwright, chromium and the rex_base_url

    # WHEN: The Home page is fully loaded
    await chrome_page.goto(f"{base_url}/subjects/nursing")
    nursing = NursingBooks(chrome_page)

    await chrome_page.keyboard.press("Escape")

    await nursing.click_get_the_book_link()

    await nursing.click_maternal_newborn_book_view_online_link()
    await nursing.click_nursing_content_warning_dialog_goto()

    # THEN: Content warning dialog opens with user already logged in
    assert await nursing.nursing_material_warning_dialog.is_visible()

    await nursing.dismiss_nursing_material_warning_dialog()

    assert "maternal-newborn-nursing/pages/1-introduction" in chrome_page.url


@pytest.mark.asyncio
async def test_nursing_book_content_warning_signup(chrome_page_unlogged, base_url):

    # GIVEN: Playwright, chromium and the rex_base_url

    # WHEN: The Home page is fully loaded for Maternal-newborn nursing and Clinical nursing skills
    await chrome_page_unlogged.goto(f"{base_url}/subjects/nursing")
    nursing = NursingBooks(chrome_page_unlogged)

    await chrome_page_unlogged.keyboard.press("Escape")

    is_staging = "staging" in chrome_page_unlogged.url
    (
        await nursing.click_get_the_book_link()
        if is_staging
        else await nursing.click_get_the_book_link2()
    )

    await nursing.click_maternal_newborn_book_view_online_link()
    await nursing.click_nursing_content_warning_dialog_goto()

    # THEN: Content warning dialog opens and user can sign up
    assert await nursing.nursing_material_warning_dialog.is_visible()

    if await nursing.nursing_content_warning_dialog_login.is_visible():
        await nursing.click_nursing_content_warning_dialog_create()

        assert "accounts/i/signup/student" in chrome_page_unlogged.url

    else:
        pytest.fail("Nursing content warning dialog is not visible")


@pytest.mark.asyncio
async def test_nursing_book_content_warning_login(
    chrome_page_unlogged, base_url, rex_user, rex_password
):

    # GIVEN: Playwright, chromium and the rex_base_url

    # WHEN: The Home page is fully loaded for Maternal-newborn nursing
    await chrome_page_unlogged.goto(f"{base_url}/subjects/nursing")
    nursing = NursingBooks(chrome_page_unlogged)
    home = HomeRex(chrome_page_unlogged)

    await chrome_page_unlogged.keyboard.press("Escape")

    await nursing.click_get_the_book_link()

    await nursing.click_maternal_newborn_book_view_online_link()
    await nursing.click_nursing_content_warning_dialog_goto()

    # THEN: Content warning dialog opens and user can log in
    assert await nursing.nursing_material_warning_dialog.is_visible()

    if await nursing.nursing_content_warning_dialog_login.is_visible():
        await nursing.click_nursing_content_warning_dialog_login()

        await home.fill_user_field(rex_user)
        await home.fill_password_field(rex_password)

        await home.click_continue_login()

        await chrome_page_unlogged.keyboard.press("Escape")

        assert await nursing.nursing_material_warning_dialog.is_visible()

        await nursing.dismiss_nursing_material_warning_dialog()

        await home.click_logged_in_user_dropdown()

        await home.logout_link_is_visible()

        assert (
            "maternal-newborn-nursing/pages/1-introduction" in chrome_page_unlogged.url
        )

    else:
        pytest.fail("Nursing content warning dialog is not visible")
