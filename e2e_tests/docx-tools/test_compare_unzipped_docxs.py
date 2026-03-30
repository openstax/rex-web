import pytest

import os

import shutil
import zipfile
import textwrap

from deepdiff import DeepDiff

import docx2txt

"""
Compares docx files. To run:
1. run two docx jobs in corgi
2. download the docx zip files from corgi (by default to Downloads folder on Mac)
3. make sure that base_to_dir and base_from_dir variables are set correctly
   - required folder structure is: root folder docx_old_new and its two subfolders 0 and 1
4. run 'pytest -k test_compare_unzipped_docxs.py docx-tools > docx_diffs.txt'

Latest update on March 30th, 2026
"""

HOME_DIR = os.path.expanduser("~")
BASE_FROM_DIR = f"{HOME_DIR}/Downloads/2pdfs"
BASE_TO_DIR = f"{os.getcwd()}/docx_old_new"
MAX_WIDTH = 120


def unzip_files(zip_path, extract_to):
    """Unzips the downloaded docx file packages from corgi"""
    with zipfile.ZipFile(zip_path) as z:
        z.extractall(extract_to)


def get_docx_texts(directory, split_key):
    """Returns a dict of {book_name: {filename: text}} for all docx files in subdirs."""
    result = {}
    for sub in os.listdir(directory):
        sub_path = os.path.join(directory, sub)
        if os.path.isdir(sub_path):
            book_name = sub_path.split(split_key)[1].lstrip().split(" ")[0]
            result[book_name] = {
                f: docx2txt.process(os.path.join(sub_path, f))
                for f in os.listdir(sub_path)
                if os.path.isfile(os.path.join(sub_path, f))
            }
    return result


def print_diffs(diffs):
    for diff_type, changes in diffs.items():
        print(f"\n{'=' * 50}\n  {diff_type}\n{'=' * 50}")
        for key, value in changes.items():
            print(f"  {key}:")
            for line in textwrap.wrap(str(value), width=MAX_WIDTH):
                print(f"    {line}")


def test_compare_unzipped_docx_files():
    # Part 1: Validate and copy zip files
    zip_files = [f for f in os.listdir(BASE_FROM_DIR) if f.endswith(".zip")]

    if len(zip_files) != 2:
        pytest.fail(f"Two zip files required: {len(zip_files)} file(s) available")

    for i, zip_file in enumerate(zip_files):
        dest_dir = os.path.join(BASE_TO_DIR, str(i))
        os.makedirs(dest_dir, exist_ok=True)
        dest_path = os.path.join(dest_dir, zip_file)
        shutil.copy(os.path.join(BASE_FROM_DIR, zip_file), dest_path)
        unzip_files(dest_path, dest_dir)

    # Part 2: Extract text from docx files
    dict_old = get_docx_texts(os.path.join(BASE_TO_DIR, "0"), "/0")
    dict_new = get_docx_texts(os.path.join(BASE_TO_DIR, "1"), "/1")

    # Part 3: Compare and print diffs
    diffs = DeepDiff(dict_new, dict_old, verbose_level=2)

    if not diffs:
        print("------>>>>> NO DIFFERENCES <<<<<------")
    else:
        print_diffs(diffs)
        pytest.fail(
            "Differences found between DOCX files. See printed diffs in docx_diffs.txt"
        )
