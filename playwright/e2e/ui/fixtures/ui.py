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
