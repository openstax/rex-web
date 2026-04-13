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
2. download the docx zip files or docx files from corgi (by default to Downloads folder on Mac)
- make sure that BASE_TO_DIR exists and contains 2 subdirectories named 0 and 1
3. make sure that BASE_FROM_DIR variable is set correctly and files are copied there from Downloads folder
4. run 'pytest -k test_compare_zip_or_docx_files.py docx-tools > docx_diffs.txt'

Note, that the test accepts two .zip files from corgi docx job, two .docx files (or one of each)

Latest update on March 31st, 2026
"""

HOME_DIR = os.path.expanduser("~")
BASE_FROM_DIR = f"{HOME_DIR}/Downloads/2pdfs"
BASE_TO_DIR = f"{os.getcwd()}/docx_old_new"
MAX_WIDTH = 120


def unzip_file(zip_path, extract_to):
    """Unzips a zip file into extract_to directory."""
    with zipfile.ZipFile(zip_path) as z:
        z.extractall(extract_to)


def get_docx_texts_from_dir(directory):
    """Returns a dict of {book_name: {filename: text}} for all docx files in subdirs."""
    result = {}
    for sub in os.listdir(directory):
        sub_path = os.path.join(directory, sub)
        if os.path.isdir(sub_path):
            result[sub] = {
                f: docx2txt.process(os.path.join(sub_path, f))
                for f in os.listdir(sub_path)
                if f.endswith(".docx")
            }
    return result


def get_docx_texts_from_file(docx_path):
    """Returns a dict for a single docx file."""
    filename = os.path.basename(docx_path)
    return {filename: docx2txt.process(docx_path)}


def prepare_files(file_path, dest_dir):
    """
    Copies and extracts zip files or copies docx files to dest_dir.
    Returns a dict of docx texts.
    """
    file_path = str(file_path)
    dest_dir = str(dest_dir)

    os.makedirs(dest_dir, exist_ok=True)

    if file_path.endswith(".zip"):
        dest_path = os.path.join(dest_dir, os.path.basename(file_path))
        shutil.copy(file_path, dest_path)
        unzip_file(dest_path, dest_dir)
        return get_docx_texts_from_dir(dest_dir)

    elif file_path.endswith(".docx"):
        dest_path = os.path.join(dest_dir, os.path.basename(file_path))
        shutil.copy(file_path, dest_path)
        return get_docx_texts_from_file(dest_path)

    else:
        pytest.fail(
            f"Unsupported file type: {file_path}. Only .zip and .docx are supported."
        )


def print_diffs(diffs):
    for diff_type, changes in diffs.items():
        # Diff type header
        print(f"\n{'#' * 60}")
        print(f"  {diff_type.replace('_', ' ').upper()}")
        print(f"{'#' * 60}")

        for key, value in changes.items():
            # Extract book/file name from key for readability
            print(f"\n  {'─' * 40}")
            print(f"  LOCATION: {key}")
            print(f"  {'─' * 40}")

            # Handle old/new values separately if present
            if hasattr(value, "get"):
                old_val = str(value.get("old_value", ""))
                new_val = str(value.get("new_value", ""))
                if old_val:
                    print(f"\n  OLD VALUE:")
                    for line in textwrap.wrap(old_val, width=MAX_WIDTH):
                        print(f"    {line}")
                if new_val:
                    print(f"\n  NEW VALUE:")
                    for line in textwrap.wrap(new_val, width=MAX_WIDTH):
                        print(f"    {line}")
            else:
                print(f"\n  CHANGE:")
                for line in textwrap.wrap(str(value), width=MAX_WIDTH):
                    print(f"    {line}")


def test_compare_zip_or_docx_files():
    # Part 1: Find zip or docx files
    all_files = [
        f
        for f in os.listdir(BASE_FROM_DIR)
        if f.endswith(".zip") or f.endswith(".docx")
    ]

    if len(all_files) != 2:
        pytest.fail(
            f"Two files required (.zip or .docx): {len(all_files)} file(s) available"
        )

    file1 = os.path.join(BASE_FROM_DIR, all_files[0])
    file2 = os.path.join(BASE_FROM_DIR, all_files[1])

    print(f"\nFile 1: {all_files[0]}")
    print(f"File 2: {all_files[1]}")

    # Part 2: Prepare and extract text
    dest_dir_0 = os.path.join(BASE_TO_DIR, "0")
    dest_dir_1 = os.path.join(BASE_TO_DIR, "1")

    dict_old = prepare_files(file1, dest_dir_0)
    dict_new = prepare_files(file2, dest_dir_1)

    # Part 3: Compare and print diffs
    diffs = DeepDiff(dict_new, dict_old, verbose_level=2)

    if not diffs:
        print("------>>>>> NO DIFFERENCES <<<<<------")
    else:
        print_diffs(diffs)
