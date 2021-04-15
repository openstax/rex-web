from pytest import mark
from pytest_testrail.plugin import pytestrail

desktop_only = mark.desktop_only
mobile_only = mark.mobile_only
nondestructive = mark.nondestructive
parametrize = mark.parametrize
skip_test = mark.skip
smoke_test = mark.smoke_test
test_case = pytestrail.case
dev_only = mark.dev_only
