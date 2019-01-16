import os

import pytest

# Window resolutions
DESKTOP = (1080, 1920)
MOBILE = (414, 738)


@pytest.fixture(
    scope="function", params=[DESKTOP, MOBILE], ids=["Resolution: 1080x1920", "Resolution: 414x738"]
)
def selenium(selenium, request):
    """Fixture to set custom selenium parameters.

    This fixture will also parametrize all of the tests to run them on both a
    Desktop resolution and a mobile resolution.

    Desktop size: 1920x1080
    Mobile size: 738x414 (iPhone 7+)
    """
    selenium.set_window_size(*request.param)
    return selenium


def pytest_addoption(parser):
    """Adds additional options to the pytest command line

    """
    group = parser.getgroup("selenium", "selenium")
    group.addoption(
        "--disable-dev-shm-usage",
        action="store_true",
        default=os.getenv("DISABLE_DEV_SHM_USAGE", False),
        help="disable chrome's usage of /dev/shm.",
    )
    group.addoption(
        "--headless",
        action="store_true",
        default=os.getenv("HEADLESS", False),
        help="enable headless mode for chrome.",
    )
    group.addoption(
        "--no-sandbox",
        action="store_true",
        default=os.getenv("NO_SANDBOX", False),
        help="disable chrome's sandbox.",
    )


@pytest.fixture
def language(request):
    return "en"


@pytest.fixture
def chrome_options(chrome_options, pytestconfig, language):
    """Fixture to set custom chrome options

    This fixture is also important to add options to the command line that
    support running the Chrome WebDriver in Travis or other languages

    """
    if pytestconfig.getoption("--headless"):
        chrome_options.headless = True

    # Required to run in Travis containers
    if pytestconfig.getoption("--no-sandbox"):
        chrome_options.add_argument("--no-sandbox")
    if pytestconfig.getoption("--disable-dev-shm-usage"):
        chrome_options.add_argument("--disable-dev-shm-usage")

    # Set the browser language
    chrome_options.add_argument("--lang={lang}".format(lang=language))
    chrome_options.add_experimental_option("prefs", {"intl.accept_languages": language})

    return chrome_options
