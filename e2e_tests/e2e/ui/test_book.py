import pytest

from e2e_tests.e2e.ui.pages.home import HomeRex

from playwright.async_api import TimeoutError
import sys


@pytest.mark.asyncio
async def test_book_title_links_to_books_detail_page(chrome_page_unlogged, base_url):

    # GIVEN: Playwright, chromium and the rex_base_url

    # WHEN: The Home page is fully loaded
    await chrome_page_unlogged.goto(f"{base_url}/subjects")
    home = HomeRex(chrome_page_unlogged)

    assert await home.subject_listing_book_is_visible()

    await home.click_subject_listing_book()

    await home.click_book_selection()

    # THEN: The page navigates to {base_url}/details/books/astronomy-2e
    assert "astronomy" in chrome_page_unlogged.url.lower()


@pytest.mark.parametrize("book_slug", ["physics"])
@pytest.mark.asyncio
async def test_buy_print_copy_link(chrome_page_unlogged, base_url, book_slug):

    # GIVEN: Open osweb book details page

    # WHEN: The Home page is fully loaded
    details_books_url = f"{base_url}/details/books/{book_slug}"

    await chrome_page_unlogged.goto(details_books_url)
    home = HomeRex(chrome_page_unlogged)

    # THEN: Buy print copy button exists and opens correct page
    assert await home.buy_print_copy_button_is_visible()

    async with chrome_page_unlogged.expect_popup() as popup_info:
        await home.click_buy_print_copy_button()

    new_tab = await popup_info.value
    new_tab_content = await new_tab.content()

    if "staging" in details_books_url:
        assert "amazon.com" in new_tab_content.lower()
    else:
        assert "openstax" and book_slug in new_tab_content.lower()


@pytest.mark.parametrize("book_slug", ["statistics"])
@pytest.mark.asyncio
async def test_order_options_link(chrome_page_unlogged, base_url, book_slug):

    # GIVEN: Open osweb book details page

    # WHEN: The Home page is fully loaded
    details_books_url = f"{base_url}/details/books/{book_slug}"

    await chrome_page_unlogged.goto(details_books_url)
    home = HomeRex(chrome_page_unlogged)

    # THEN: Order options button exists and opens correct page
    assert await home.bookstore_box_is_visible()
    assert await home.order_options_button_is_visible()

    assert "Kendall_Hunt" in await home.order_options_href()


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

        assert "Accessibility" and "OpenStax" in accessibility_page_content


@pytest.mark.parametrize("book_slug", ["algebra-and-trigonometry-2e"])
@pytest.mark.asyncio
async def test_toc_slideout(chrome_page_unlogged, base_url, book_slug):

    # GIVEN: Open osweb book details page

    # WHEN: The Home page is fully loaded
    details_books_url = f"{base_url}/details/books/{book_slug}"

    await chrome_page_unlogged.goto(details_books_url)
    home = HomeRex(chrome_page_unlogged)

    await home.click_book_toc_link()

    book_toc_content = await home.book_toc_content.inner_text()

    # THEN: Book TOC slideout opens
    assert "Chapter" and "Index" in book_toc_content


@pytest.mark.parametrize("book_slug", ["chemistry"])
@pytest.mark.asyncio
async def test_resources_tabs(chrome_page_unlogged, base_url, book_slug):

    # GIVEN: Open osweb book details page

    # WHEN: The Home page is fully loaded
    details_books_url = f"{base_url}/details/books/{book_slug}"

    await chrome_page_unlogged.goto(details_books_url)
    home = HomeRex(chrome_page_unlogged)

    # THEN: Resources tabs are visible and clickable
    assert await home.resources_tabs_are_visible()

    await home.click_instructor_resources_tab()

    assert "Instructor" in chrome_page_unlogged.url

    await home.click_student_resources_tab()

    assert "Student" in chrome_page_unlogged.url
