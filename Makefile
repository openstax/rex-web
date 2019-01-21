.PHONY: help pre-commit clean clean-build clean-pyc clean-test venv

include pytest-selenium/Makefile-py

pre-commit:
	pre-commit install

help:
	@echo "Please use 'make <target>' where <target> is one of the following commands."
	@echo "Commands that are designed to be run in either the container or the host:"
	@echo "  pre-commit        installs pre-commit if you haven't done so yet"
	@$(MAKE) help_submake --no-print-directory
	@echo "Check the Makefile to know exactly what each target is doing."

