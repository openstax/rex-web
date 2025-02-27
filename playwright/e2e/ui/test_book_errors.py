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
