import pytest
import requests


@pytest.fixture
def rex_released_books(base_url):
    release_json_url = f"{base_url}/rex/release.json"
    response = requests.get(release_json_url)
    response.raise_for_status()

    return response.json()["books"]


@pytest.fixture
def abl_books_uuids_slugs(abl_api_approved):
    """Returns dictionary of uuid:slug values of all collection entries in ABL api"""

    uuids_slugs = {}

    for i in abl_api_approved:
        uuids_slugs[i["uuid"]] = i["slug"]

    return uuids_slugs


@pytest.fixture
def abl_url(request):
    """Return ABL json url"""
    config = request.config
    base_url = config.getoption("abl_url") or config.getini("abl_url")
    return base_url


@pytest.fixture
def abl_api_approved(abl_url):
    """Return list of dictionaries of approved books in ABL json"""
    abl_dict = requests.get(abl_url).json()
    return abl_dict
