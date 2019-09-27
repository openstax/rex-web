import pytest

__all__ = ["student"]

STUDENT = "student"


@pytest.fixture(scope="module")
def student(request):
    return _data_return(request, STUDENT)


def _data_return(request, target):
    config = request.config

    name = 0

    password = 1

    user = config.getoption(target) or config.getini(target)
    return (user[name], user[password])
