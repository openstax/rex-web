"""Test user accounts for testing."""

import pytest

__all__ = [
    "student",
    "teacher",
    "admin",
    "content",
    "salesforce",
    "facebook",
    "facebook_signup",
    "google",
    "google_signup",
]

STUDENT = "student"
TEACHER = "teacher"
ADMIN = "admin"
CONTENT = "content"
SALESFORCE = "salesforce"
FACEBOOK = "facebook"
FACEBOOK_SIGNUP = "facebook_signup"
GOOGLE = "google"
GOOGLE_SIGNUP = "google_signup"

SINGLETON = [SALESFORCE, FACEBOOK, FACEBOOK_SIGNUP, GOOGLE, GOOGLE_SIGNUP]

DEV = "dev"
QA = "qa"
STAGING = "staging"
PROD = ["prod", "production"]
UNIQUE = "unique"


@pytest.fixture(scope="module")
def student(request):
    """Set the student user information."""
    return _data_return(request, STUDENT)


@pytest.fixture(scope="module")
def teacher(request):
    """Set the instructor user information."""
    return _data_return(request, TEACHER)


@pytest.fixture(scope="module")
def admin(request):
    """Set the administrative user information."""
    return _data_return(request, ADMIN)


@pytest.fixture(scope="module")
def content(request):
    """Set the content user information."""
    return _data_return(request, CONTENT)


@pytest.fixture(scope="module")
def salesforce(request):
    """Set the Salesforce user information."""
    return _data_return(request, SALESFORCE)


@pytest.fixture(scope="module")
def facebook(request):
    """Set the Facebook user information."""
    return _data_return(request, FACEBOOK)


@pytest.fixture(scope="module")
def facebook_signup(request):
    """Set the Facebook user email information."""
    return _data_return(request, FACEBOOK_SIGNUP)


@pytest.fixture(scope="module")
def google(request):
    """Set the Google user information."""
    return _data_return(request, GOOGLE)


@pytest.fixture(scope="module")
def google_signup(request):
    """Set the Google Gmail user information."""
    return _data_return(request, GOOGLE_SIGNUP)


def _data_return(request, target):
    """Retrieve user account information from the environment file."""
    config = request.config
    instance = config.getoption("instance").lower() or config.getini("instance").lower()
    user = config.getoption(target) or config.getini(target)
    name = 0
    if target in SINGLETON or instance == DEV or len(user) == 2:
        password = 1
    else:
        if instance == QA:
            password = 2
        elif instance == STAGING:
            password = 3
        elif instance in PROD:
            password = 4
        elif instance == UNIQUE:
            password = 5
        else:
            raise ValueError("Unknown instance request: %s" % instance)
    user = config.getoption(target) or config.getini(target)
    return (user[name], user[password])
