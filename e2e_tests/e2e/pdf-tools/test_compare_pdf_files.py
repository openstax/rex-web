import os

import shutil

from diff_pdf_visually import pdf_similar

import pytest

import tempfile

"""
Compares two pdf files. To run:
1. run two pdf jobs in corgi
2. download the pdf files from corgi (by default to Downloads folder on Mac)
3. copy them to a different folder (in my case 2pdfs folder in Downloads)
4. make sure that base_from_dir variable is set accordingly
5. base_to_dir is a temp folder and is auto-deleted after each test run
6. run 'pytest -k test_compare_pdf_files.py e2e_tests/e2e/pdf-tools'
7. to get a log file, run 'pytest -k test_compare_pdf_files.py e2e_tests/e2e/pdf-tools | tee docx_diffs.txt'

Latest update on March 24th, 2026
"""


def test_compare_pdf_files():
    # Part 1: Copies pdf files into temp folder
    with tempfile.TemporaryDirectory() as tmp_dir:
        base_to_dir = tmp_dir

        home_dir = os.path.expanduser("~")
        base_from_dir = f"{home_dir}/downloads/2pdfs"

        pdf_files_paths = []

        for afile in os.listdir(base_from_dir):
            if afile.endswith(".pdf"):
                from_dir = os.path.join(base_from_dir, afile)
                to_dir = os.path.join(base_to_dir, afile)

                shutil.copy(from_dir, to_dir)

                pdf_files_paths.append(to_dir)

        # Part 2: Compares pdf files
        if len(pdf_files_paths) == 2:
            try:
                assert pdf_similar(
                    pdf_files_paths[0], pdf_files_paths[1], threshold=0.95, dpi=50
                )

            except AssertionError:
                pytest.exit("PDFS ARE NOT THE SAME")

            else:
                print("\n\n=========>>> PDFS APPEAR TO BE THE SAME")

        else:
            pytest.fail(
                f"Two pdf files required: {len(pdf_files_paths)} file(s) available"
            )
