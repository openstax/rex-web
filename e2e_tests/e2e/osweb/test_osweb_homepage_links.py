import pytest

from e2e_tests.e2e.ui.pages.home import HomeRex


@pytest.mark.asyncio
async def test_osweb_homepage_interested_link(chrome_page, base_url):

    # GIVEN: Playwright, chromium and the rex_base_url

    # WHEN: The Home page is fully loaded
    await chrome_page.goto(base_url)
    home = HomeRex(chrome_page)

    # THEN: I'm interested page opens
    await home.click_interested_link()

    assert "interest" in chrome_page.url

    await home.click_iam_dropdown_in_interested()

    assert await home.iam_dropdown_list_item.is_visible()

    await home.iam_dropdown_list_item.click()

    assert await home.iam_form_page.is_visible()


@pytest.mark.asyncio
async def test_osweb_homepage_try_assignable_link(chrome_page, base_url):

    # GIVEN: Playwright, chromium and the rex_base_url

    # WHEN: The Home page is fully loaded
    await chrome_page.goto(base_url)
    home = HomeRex(chrome_page)

    # THEN: Try OpenStax Assignable page opens
    await home.click_try_assignable_link()

    assert "assignable" in chrome_page.url

    if "staging" not in chrome_page.url:
        # THEN: Number of books available in assignables is 31 (as of Feb. 2026)
        assert await home.available_book_list() >= 31

    else:
        pytest.skip(
            "Staging environment. Skipping 'available books in assignable' test"
        )
