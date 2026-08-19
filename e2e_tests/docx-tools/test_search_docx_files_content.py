import os
import re
import shutil
import zipfile
import pytest
from docx import Document

user_input = input("\nEnter search terms separated by commas (e.g. \\\sqrt, \\\pi): ")
# Process the input into a list and clean up whitespace
PATT_LIST = [item.strip() for item in user_input.split(",")]


def test_search_docx_files_content():
    base_to_dir = f"{os.getcwd()}/docx_search"

    # Ensure the destination directory exists
    if os.path.exists(base_to_dir):
        shutil.rmtree(base_to_dir)
    os.makedirs(base_to_dir)

    home_dir = os.path.expanduser("~")
    base_from_dir = f"{home_dir}/Downloads/"

    all_files = os.listdir(base_from_dir)

    files = [
        x
        for x in all_files
        if x.startswith("openstax-osbooks")
        and x.lower().endswith(".zip")
        and not os.path.isdir(os.path.join(base_from_dir, x))
    ]

    unzip_dirs = []

    if len(files) > 0:
        for f_name in files:
            file_source = os.path.join(base_from_dir, f_name)
            file_dest = os.path.join(base_to_dir, f_name)

            shutil.copy(file_source, file_dest)
            # Use the directory containing the zip for extraction
            unzip_dirs.append(base_to_dir)
    else:
        pytest.fail(f"No zip files found in {base_from_dir}")

    # Deduplicate directory list and unzip
    for j in set(unzip_dirs):
        for file in os.listdir(j):
            file_path = os.path.join(j, file)
            if zipfile.is_zipfile(file_path):
                with zipfile.ZipFile(file_path) as item:
                    # Extract into a folder named after the zip
                    extract_path = os.path.join(j, file.replace(".zip", ""))
                    item.extractall(extract_path)
                os.remove(file_path)

    found_anything = False

    # 1. Combine PATT_LIST into a single regex for speed: "term1|term2|term3"
    combined_pattern = "|".join(PATT_LIST)

    for root, _, filenames in os.walk(base_to_dir):
        docx_files = [
            f for f in filenames if f.endswith(".docx") and not f.startswith("~$")
        ]

        for filename in docx_files:
            f_path = os.path.join(root, filename)
            doc = Document(f_path)

            # Check every paragraph against the combined regex
            for para in doc.paragraphs:
                match = re.search(combined_pattern, para.text)
                if match:
                    found_anything = True
                    # match.group() tells us exactly which keyword was found
                    print(
                        f"\nFOUND '{match.group()}': {para.text} \nLOCATION: {f_path}"
                    )

    if not found_anything:
        print(
            f"\n{'=' * 60}\nSEARCH COMPLETE: No matches found for {PATT_LIST}\n{'=' * 60}"
        )
