import pytest
import asyncio

import requests

from e2e.ui.pages.home import HomeRex


@pytest.mark.parametrize("book_slug, page_slug", [("biolgy", "preface")])
@pytest.mark.asyncio
async def test_redirect_to_osweb_404_when_book_is_incorrect(chrome_page, base_url, book_slug, page_slug):
    """User is redirected to osweb 404 page when book slug is incorrect"""

    # GIVEN: An invalid content page

    # WHEN: The Home page is not loaded
    await chrome_page.goto(f"{base_url}/books/{book_slug}/pages/{page_slug}")

    resp_code = requests.head(chrome_page.url)

    #THEN: Error page is shown
    assert 404 == resp_code.status_code


@pytest.mark.parametrize("book_slug, page_slug", [("", "preface")])
@pytest.mark.asyncio
async def test_redirect_to_osweb_404_when_book_does_not_exist(chrome_page, base_url, book_slug, page_slug):
    """User is redirected to osweb 404 page when book slug does not exist"""

    # GIVEN: An invalid content page

    # WHEN: The Home page is not loaded
    await chrome_page.goto(f"{base_url}/books/{book_slug}/pages/{page_slug}")

    resp_code = requests.head(chrome_page.url)

    #THEN: Error page is shown
    assert 404 == resp_code.status_code


@pytest.mark.parametrize("subjects", ["mths"])
@pytest.mark.asyncio
async def test_incorrect_subject(chrome_page, base_url, subjects):
    """User gets the Subject not found page"""

    # GIVEN: An invalid subjects title

    # WHEN: The Home page is not loaded
    await chrome_page.goto(f"{base_url}/subjects/{subjects}")
    home = HomeRex(chrome_page)

    # THEN: Error page is shown
    assert home.subjects_error_page_is_visible

    # THEN: User can get to book subjects page

    await home.click_view_all_subjects_link()

    assert "openstax.org/subjects" in chrome_page.url

    assert home.subject_listing_book_is_visible


@pytest.mark.parametrize("book_slug, page_slug", [("astronomy-2e", "9-3333-impact-craters")])
@pytest.mark.asyncio
async def test_incorrect_page_slug(chrome_page, base_url, book_slug, page_slug):
    """User gets the Uh-oh, no page here error"""

    # GIVEN: An invalid page slug

    # WHEN: The Home page is not loaded
    await chrome_page.goto(f"{base_url}/books/{book_slug}/pages/{page_slug}")
    home = HomeRex(chrome_page)

    resp_code = requests.head(chrome_page.url)

    #THEN: Error page is shown
    assert 404 == resp_code.status_code
    assert home.incorrect_page_error_is_visible