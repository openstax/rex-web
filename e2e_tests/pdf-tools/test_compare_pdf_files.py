import os
import shutil

import warnings

warnings.filterwarnings("ignore", category=DeprecationWarning)

from diff_pdf_visually import pdf_similar
import fitz

import pytest
import tempfile


"""
Compares two pdf files. Before executing this test:
1. run two pdf jobs in corgi
2. download the pdf files from corgi (by default to Downloads folder on Mac)
3. copy them to a different folder (in my case 2pdfs folder in Downloads)
4. make sure that base_from_dir variable is set accordingly
5. base_to_dir is a temp folder and is auto-deleted after each test run
6. run 'pytest -k test_compare_pdf_files.py pdf-tools'
7. to get a log file, run 'pytest -k test_compare_pdf_files.py pdf-tools | tee pdf_diffs.txt'

Latest update on March 25th, 2026
"""


def extract_pdf_pages(pdf_path, start_page, end_page, output_path):
    """Extracts a range of pages from a PDF and saves to output_path."""
    pdf_doc = fitz.open(pdf_path)
    new_pdf_doc = fitz.open()
    new_pdf_doc.insert_pdf(pdf_doc, from_page=start_page, to_page=end_page - 1)
    new_pdf_doc.save(output_path)
    pdf_doc.close()
    new_pdf_doc.close()


def get_extra_pages_info(pdf_path, start_page):
    """Extracts page numbering info of extra pages from a PDF."""
    pdf_doc = fitz.open(pdf_path)
    extra_pages = []

    for page_num in range(start_page, pdf_doc.page_count):
        page = pdf_doc[page_num]

        #  Get physical page number (printed number on the page)
        text_lines = page.get_text()
        # Reads page number from footer and header text
        # as it can be in one or the other location
        first_line = text_lines.strip().split("\n")[0]
        last_line = text_lines.strip().split("\n")[-1]

        # Get page title from the largest font text (usually the heading)
        blocks = page.get_text("dict")["blocks"]
        title = ""
        max_font_size = 0

        for block in blocks:
            if block["type"] == 0:  # text block
                for line in block["lines"]:
                    for span in line["spans"]:
                        if span["size"] > max_font_size and span["text"].strip():
                            max_font_size = span["size"]
                            title = span["text"].strip()

        extra_pages.append(
            {
                "index": page_num + 1,
                "title": title,
                "physical_page_no1": first_line,
                "physical_page_no2": last_line,
            }
        )

    pdf_doc.close()
    return extra_pages


def test_compare_pdf_files():
    """Compares 2 pdf files page by page trimmed to have the same page numbers, in case they differ"""
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

        # Compares pdf files
        if len(pdf_files_paths) == 2:
            pdf1, pdf2 = pdf_files_paths[0], pdf_files_paths[1]

            # Check page counts
            pdf_doc1 = fitz.open(pdf1)
            pdf_doc2 = fitz.open(pdf2)

            pdf_pages1 = pdf_doc1.page_count
            pdf_pages2 = pdf_doc2.page_count

            pdf_doc1.close()
            pdf_doc2.close()

            print(f"\n\nPDF 1: {os.path.basename(pdf1)} — {pdf_pages1} pages")
            print(f"PDF 2: {os.path.basename(pdf2)} — {pdf_pages2} pages")

            # Trims pdfs to same page count, if different
            same_pages = min(pdf_pages1, pdf_pages2)

            if pdf_pages1 != pdf_pages2:
                # Find which PDF has more pages
                longer_pdf, longer_pages = (
                    (pdf1, pdf_pages1)
                    if pdf_pages1 > pdf_pages2
                    else (pdf2, pdf_pages2)
                )

                # Gets the numbering of extra pages and their titles
                extra_pages = get_extra_pages_info(longer_pdf, same_pages)

                print(
                    f"\nDifferent page counts (difference of {abs(pdf_pages1 - pdf_pages2)} pages). "
                    f"Comparing first {same_pages} pages only."
                )
                print(f"\nExtra pages in {os.path.basename(longer_pdf)}:")

                for ep in extra_pages:
                    print(
                        f"--Page index: {ep['index']} \n Title: {ep['title']} \n "
                        # Prints page number from both footer and header text
                        f"Physical page number: {ep['physical_page_no1']} \n "
                        f"Physical page number: {ep['physical_page_no2']}"
                    )

                trimmed_pdf1 = os.path.join(tmp_dir, "trimmed_pdf1.pdf")
                trimmed_pdf2 = os.path.join(tmp_dir, "trimmed_pdf2.pdf")

                extract_pdf_pages(pdf1, 0, same_pages, trimmed_pdf1)
                extract_pdf_pages(pdf2, 0, same_pages, trimmed_pdf2)

                pdf1, pdf2 = trimmed_pdf1, trimmed_pdf2

            # Visually compares trimmed pdfs (page by page)
            try:
                assert pdf_similar(pdf1, pdf2, threshold=0.95, dpi=50)

            except AssertionError:
                pytest.exit(f"PDFS ARE NOT THE SAME (compared {same_pages} pages)")

            else:
                print(
                    f"\n\n=========>>> PDFS APPEAR TO BE THE SAME "
                    f"(compared {same_pages} pages)"
                )

        else:
            pytest.fail(
                f"Two pdf files required: {len(pdf_files_paths)} file(s) available"
            )
