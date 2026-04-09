"""
Compares uuids from rex/release.json and abl api
Run: pytest -k test_compare_rex_abl.py docx-tools
    --base-url https://(staging.)openstax.org --abl_url https://corgi(-staging).ce.openstax.org/api/abl/

Latest update on April 9, 2026
"""


def test_compare_rex_abl(rex_released_books, abl_books_uuids_slugs):
    rex_uuids = set(rex_released_books.keys())
    abl_uuids = set(abl_books_uuids_slugs.keys())

    missing = abl_uuids - rex_uuids

    print(f"MATCHING UUIDs    : {len(abl_uuids & rex_uuids)}")

    if missing:
        print("NOT MATCHING UUIDs:")
        for uuid in missing:
            # Get the title/slug from the ABL dictionary
            title = abl_books_uuids_slugs.get(uuid, "Unknown Title")
            print(f"  - {uuid} : {title}")
    else:
        print("NOT MATCHING UUIDs: 0")

    # Construct a detailed error message for the assertion
    error_details = "\n".join([f"{u}: {abl_books_uuids_slugs.get(u)}" for u in missing])
    assert (
        not missing
    ), f"\n\n >>>>> UUID(s) IN ABL BUT NOT IN REX: \n{error_details} <<<<<\n"
