import os
import shutil
import zipfile
import subprocess
from pathlib import Path
from pdf2image import convert_from_path
from PIL import ImageChops

"""
Accepts two zips or docx files, converts docx to pdf via LibreOffice,
and then visually compares the resulting PDFs between the two folders.

To run:
1. Run two docx jobs in corgi
2. Download the docx zip files or docx files from corgi (by default to Downloads folder on Mac)
3. Copy them to the BASE_FROM_DIR folder
4. Run 'pytest -k test_compare_converted_docx_to_pdf_files.py docx-tools > docx_diffs.txt'

Latest update: April 2nd, 2026
"""

HOME_DIR = os.path.expanduser("~")
BASE_FROM_DIR = Path(HOME_DIR) / "Downloads" / "corgi_input_files"
BASE_OUTPUT_DIR = Path(os.getcwd()) / "pdf_output_files"
DIFF_OUTPUT_DIR = BASE_OUTPUT_DIR / "visual_diffs"
TEMP_EXTRACT_ROOT = Path("/tmp/docx_conversion_work")

# Hardcoded LibreOffice path for macOS:
LIBREOFFICE_PATH = "/Applications/LibreOffice.app/Contents/MacOS/soffice"

# LibreOffice path for Linux:
# "/usr/bin/soffice" or "/usr/lib/libreoffice/program/soffice" or "/snap/bin/libreoffice"

# LibreOffice path for win32:
# "C:\Program Files\LibreOffice\program\soffice.exe" or "C:\Program Files (x86)\LibreOffice\program\soffice.exe"

DPI = 150


def unzip_file(zip_path, extract_to):
    """Unzips a zip file into extract_to directory."""
    with zipfile.ZipFile(zip_path) as z:
        z.extractall(extract_to)


def get_docx_files_from_dir(directory):
    """Returns all docx files in a directory recursively."""
    docx_files = []
    for root, _, files in os.walk(directory):
        for f in files:
            if f.endswith(".docx") and not f.startswith("~$"):
                docx_files.append(Path(root) / f)

    return docx_files


def convert_docx_to_pdf(docx_path, output_dir):
    """Converts a docx file to pdf using LibreOffice."""
    output_dir.mkdir(parents=True, exist_ok=True)
    try:
        subprocess.run(
            [
                LIBREOFFICE_PATH,
                "--headless",
                "--convert-to",
                "pdf",
                "--outdir",
                str(output_dir),
                str(docx_path),
            ],
            check=True,
            capture_output=True,
        )
    except subprocess.CalledProcessError as e:
        raise RuntimeError(
            f"LibreOffice failed to convert {docx_path.name}: {e.stderr.decode()}"
        ) from e

    # Verify the PDF was actually created
    expected_pdf = output_dir / (docx_path.stem + ".pdf")
    if not expected_pdf.exists():
        raise RuntimeError(
            f"Conversion appeared to succeed but no PDF was created for {docx_path.name}"
        )


def prepare_files(input_path, output_dir):
    """
    Accepts a .zip or .docx file.
    Extracts/copies to temp dir, converts all docx to pdf, saves to output_dir.
    """
    input_path = Path(input_path)
    temp_dir = TEMP_EXTRACT_ROOT / input_path.stem
    temp_dir.mkdir(parents=True, exist_ok=True)

    if input_path.suffix == ".zip":
        unzip_file(input_path, temp_dir)
        docx_files = get_docx_files_from_dir(temp_dir)
    elif input_path.suffix == ".docx":
        shutil.copy(input_path, temp_dir / input_path.name)
        docx_files = [temp_dir / input_path.name]
    else:
        raise ValueError(
            f"Unsupported file type: {input_path.name}. Only .zip and .docx are supported."
        )

    if not docx_files:
        raise RuntimeError(f"No .docx files found in {input_path.name}")

    failed = []
    for docx in docx_files:
        try:
            convert_docx_to_pdf(docx, output_dir)
        except RuntimeError as e:
            print(f"  ❌ {e}")
            failed.append(docx.name)

    if failed:
        raise RuntimeError(
            f"Conversion failed for {len(failed)}/{len(docx_files)} file(s): {failed}"
        )


def compare_pdfs(pdf1_path, pdf2_path, diff_folder):
    """Converts PDFs to images and saves diffs if they exist."""
    name = pdf1_path.stem

    images1 = convert_from_path(pdf1_path, dpi=DPI)
    images2 = convert_from_path(pdf2_path, dpi=DPI)

    if len(images1) != len(images2):
        print(
            f"  \n⚠️  Different page counts: {len(images1)} vs {len(images2)} pages. "
            f"Comparing first {min(len(images1), len(images2))} pages only."
        )

    diff_pages = []
    for i in range(min(len(images1), len(images2))):
        diff = ImageChops.difference(images1[i], images2[i])
        if diff.getbbox():
            diff_folder.mkdir(parents=True, exist_ok=True)
            save_path = diff_folder / f"{name}_page_{i + 1}_diff.png"
            diff.save(save_path)
            diff_pages.append(i + 1)

    return diff_pages


def test_compare_converted_docx_to_pdf_files():
    if not BASE_FROM_DIR.exists():
        print(f"Source directory not found: {BASE_FROM_DIR}")
        return

    # Find zip or docx files
    all_files = sorted(
        [
            f
            for f in os.listdir(BASE_FROM_DIR)
            if f.endswith(".zip") or f.endswith(".docx")
        ]
    )

    if len(all_files) != 2:
        print(f"Expected exactly 2 files (.zip or .docx), found {len(all_files)}.")
        return

    file1 = BASE_FROM_DIR / all_files[0]
    file2 = BASE_FROM_DIR / all_files[1]

    print("\nINPUT FILES:")
    print(f"  File 1: {all_files[0]}")
    print(f"  File 2: {all_files[1]}")

    # Cleanup
    for d in [TEMP_EXTRACT_ROOT, BASE_OUTPUT_DIR]:
        if d.exists():
            shutil.rmtree(d)
    TEMP_EXTRACT_ROOT.mkdir(parents=True)
    BASE_OUTPUT_DIR.mkdir(parents=True)

    # Part 1: Prepare and convert files
    dir_old = BASE_OUTPUT_DIR / Path(all_files[0]).stem
    dir_new = BASE_OUTPUT_DIR / Path(all_files[1]).stem

    prepare_files(file1, dir_old)
    prepare_files(file2, dir_new)

    # Part 2: Compare PDFs
    pdfs_old = sorted(dir_old.glob("*.pdf"))
    pdfs_new = sorted(dir_new.glob("*.pdf"))

    # Validates that PDFs were created
    if not pdfs_old:
        raise RuntimeError(f"No PDFs were produced from {file1.name} — cannot compare.")
    if not pdfs_new:
        raise RuntimeError(f"No PDFs were produced from {file2.name} — cannot compare.")

    if len(pdfs_old) != len(pdfs_new):
        print(f"  ⚠️  Different number of PDFs: {len(pdfs_old)} vs {len(pdfs_new)}")

    total_diffs = 0

    for pdf_old, pdf_new in zip(pdfs_old, pdfs_new):
        print("\nCOMPARING converted pdf files (converted from docx (zip) files):")
        print(f"  OLD: {pdf_old.name}")
        print(f"  NEW: {pdf_new.name}")

        diff_pages = compare_pdfs(pdf_old, pdf_new, DIFF_OUTPUT_DIR)
        if diff_pages:
            print(
                f"❌ Found {len(diff_pages)} page(s) with differences: pages {diff_pages}"
            )
            total_diffs += len(diff_pages)
        else:
            print("✅ PDFs are visually identical.")

    # Part 3: Summary
    if total_diffs == 0:
        print("------>>>>> NO DIFFERENCES <<<<<------")
    else:
        print(f"\nIMAGES WITH DIFFERENCES SAVED TO: {DIFF_OUTPUT_DIR}\n")

    shutil.rmtree(TEMP_EXTRACT_ROOT)


if __name__ == "__main__":
    test_compare_converted_docx_to_pdf_files()
