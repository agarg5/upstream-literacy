import csv
from pathlib import Path

from sqlalchemy.orm import Session


def import_nces_data(db: Session) -> int:
    """Import districts from the NCES CSV file into the database.

    Skips rows where a district with the same nces_id already exists.

    Returns:
        The number of new districts inserted.
    """
    from app.models.district import District

    csv_path = Path(__file__).parent.parent / "data" / "nces_districts.csv"
    if not csv_path.exists():
        print(f"NCES data file not found at {csv_path}")
        return 0

    inserted = 0
    with open(csv_path, "r") as f:
        reader = csv.DictReader(f)
        for row in reader:
            nces_id = row.get("nces_id", "").strip()
            if not nces_id:
                continue

            existing = db.query(District).filter(District.nces_id == nces_id).first()
            if existing:
                continue

            district = District(
                nces_id=nces_id,
                name=row.get("name", "").strip(),
                state=row.get("state", "").strip(),
                city=row.get("city", "").strip(),
                type=row.get("type", "urban").strip(),
                enrollment=int(row.get("enrollment", 0) or 0),
                free_reduced_lunch_pct=float(row.get("free_reduced_lunch_pct", 0) or 0),
                esl_pct=float(row.get("esl_pct", 0) or 0),
            )
            db.add(district)
            inserted += 1

    db.commit()
    print(f"Imported {inserted} new districts from NCES data")
    return inserted
