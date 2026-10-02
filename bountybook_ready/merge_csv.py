import csv

def merge_csvs(left_path, right_path, key_col, output_path):
    with open(left_path, newline="", encoding="utf-8") as f:
        left_reader = csv.DictReader(f)
        left_fields = list(left_reader.fieldnames or [])
        left_rows = list(left_reader)

    with open(right_path, newline="", encoding="utf-8") as f:
        right_reader = csv.DictReader(f)
        right_fields = list(right_reader.fieldnames or [])
        right_rows = list(right_reader)

    if key_col not in left_fields or key_col not in right_fields:
        raise ValueError(f"key column {key_col!r} must exist in both CSV files")

    left_nonkey = [c for c in left_fields if c != key_col]
    right_nonkey = [c for c in right_fields if c != key_col]
    duplicates = set(left_nonkey) & set(right_nonkey)

    out_fields = [key_col]
    out_fields += [c + "_left" if c in duplicates else c for c in left_nonkey]
    out_fields += [c + "_right" if c in duplicates else c for c in right_nonkey]

    right_index = {}
    for row in right_rows:
        right_index.setdefault(row.get(key_col, ""), []).append(row)

    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=out_fields)
        writer.writeheader()
        for left in left_rows:
            key = left.get(key_col, "")
            for right in right_index.get(key, []):
                merged = {key_col: key}
                for c in left_nonkey:
                    merged[c + "_left" if c in duplicates else c] = left.get(c, "")
                for c in right_nonkey:
                    merged[c + "_right" if c in duplicates else c] = right.get(c, "")
                writer.writerow(merged)
