import { buildEngine6ValidationReport } from "../src/engine6/validation";
import { ENGINE6_VALIDATION_FIXTURES } from "../src/engine6/validationFixtures";

const reports = ENGINE6_VALIDATION_FIXTURES.map(buildEngine6ValidationReport);

for (const report of reports) {
  console.log(JSON.stringify(report, null, 2));
}
