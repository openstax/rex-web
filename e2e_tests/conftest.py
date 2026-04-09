import os
import pytest


# Import fixtures
pytest_plugins = ("e2e_tests.e2e.ui.fixtures.ui", "e2e_tests.e2e.ui.fixtures.webview")


def pytest_addoption(parser):
    parser.addini("rex_user", help="rex user")
    parser.addoption(
        "--rex_user",
        metavar="tag",
        default=os.getenv("REX_USER", None),
        help="rex user",
    )
    parser.addini("rex_password", help="rex password")
    parser.addoption(
        "--rex_password",
        metavar="tag",
        default=os.getenv("REX_PASSWORD", None),
        help="rex password",
    )
    parser.addini("abl_url", help="base url for abl json file")
    parser.addoption(
        "--abl_url",
        metavar="url",
        default=os.getenv("ABL_URL", None),
        help="base url for abl json",
    )


@pytest.fixture(scope="session")
def browser_context_args(browser_context_args):
    """
    Override browser context arguments to set a large viewport size
    """
    return {
        **browser_context_args,
        "viewport": {
            "width": 1920,
            "height": 1080,
        },
        "device_scale_factor": 1,
    }
