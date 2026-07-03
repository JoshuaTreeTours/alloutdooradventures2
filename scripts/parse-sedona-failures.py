import json
import re
from pathlib import Path

data = json.loads(Path("reports/sedona-creation-results.json").read_text(encoding="utf-8"))
for test in data["testResults"][0]["assertionResults"]:
    if test["status"] != "failed":
        continue
    match = re.search(r"productCode: '([^']+)'", test["title"])
    code = match.group(1) if match else test["title"][:60]
    msg = test.get("failureMessages", [""])[0]
    violations = re.findall(r'\+   "([^"]+)"', msg)
    if violations:
        for violation in violations:
            print(f"{code}: {violation}")
    else:
        print(f"{code}: {msg[:400]}")
