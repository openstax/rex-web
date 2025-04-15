import requests

import pytest
import pytest_asyncio

from playwright.async_api import async_playwright


@pytest_asyncio.fixture
async def chrome_page():
    async with async_playwright() as playwright:
        browser_obj = playwright.chromium
        if browser_obj:
            ch_browser = await browser_obj.launch(headless=True, slow_mo=1200, timeout=120000)
            context = await ch_browser.new_context()
            page = await context.new_page()
            yield page

            await ch_browser.close()


@pytest.fixture
def abl_approved():
    """Return list of dictionaries of approved books in ABL json"""
    abl_url = "https://corgi.ce.openstax.org/api/abl/"
    abl_dict = requests.get(abl_url).json()
    return abl_dict


@pytest.fixture
def abl_uuids_slugs():
    """Returns dictionary of uuid:slug values of all collection entries in ABL api"""

    uuids_slugs = {}

    abl_url = "https://corgi.ce.openstax.org/api/abl/"
    abl_dict = requests.get(abl_url).json()

    for i in abl_dict:
        uuids_slugs[i["uuid"]] = i["slug"]

    return uuids_slugs


@pytest.fixture
def rex_user(request):
    """Return a rex username"""
    config = request.config
    rex_user = config.getoption("rex_user") or config.getini("rex_user")
    if rex_user is not None:
        return rex_user


@pytest.fixture
def rex_password(request):
    """Return a rex password"""
    config = request.config
    rex_password = config.getoption("rex_password") or config.getini(
        "rex_password"
    )
    if rex_password is not None:
        return rex_password
