import os

import pytest


# Import fixtures
pytest_plugins = "e2e_tests.e2e.ui.fixtures.ui"


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
