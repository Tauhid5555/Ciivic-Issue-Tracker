"""Create a staff account for local use.

    python seed.py you@example.org "Your Name" "a-long-password"

Prints the second-factor secret once. Add it to an authenticator app
(manual entry, time-based). `python seed.py --code <secret>` prints the
current code for local testing.
"""
import sys

import pyotp

from app import case_workflow, models  # noqa: F401
from app.db import Base, SessionLocal, engine
from app.platform_services import create_staff


def main(argv: list[str]) -> int:
    if len(argv) == 3 and argv[1] == "--code":
        print(pyotp.TOTP(argv[2]).now())
        return 0
    if len(argv) != 4:
        print(__doc__)
        return 2
    email, name, password = argv[1:]
    if len(password) < 12:
        print("Use a password of at least 12 characters.")
        return 2
    Base.metadata.create_all(engine)
    with SessionLocal() as db:
        case_workflow.seed_categories(db)
        account, secret = create_staff(db, email, name, password)
        db.commit()
    print(f"Created staff account {account.email}")
    print(f"Second-factor secret (shown once): {secret}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
