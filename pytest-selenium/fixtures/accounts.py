"""OpenStax Accounts fixtures."""

import pytest

__all__ = ["accounts_base_url"]
SPLIT = "accounts"


@pytest.fixture(scope="session")
def accounts_base_url(request):
    """Return a base URL for OpenStax Accounts."""
    config = request.config
    base_url = config.getoption("accounts_base_url") or config.getini("accounts_base_url")
    instance = config.getoption("instance") or config.getini("instance")
    if instance == "unique":
        return base_url
    if instance and base_url:
        segments = base_url.split(SPLIT)
        insert = "" if instance.startswith("prod") else f"-{instance}"
        return "{0}{2}{3}{1}".format(*segments, SPLIT, insert)
    if base_url is not None:
        return base_url
