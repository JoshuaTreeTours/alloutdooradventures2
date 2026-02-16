import fs from "node:fs";
import path from "node:path";

type CsvData = {
  headers: string[];
  rows: Record<string, string>[];
};

const filePath = path.join(process.cwd(), "data/tourEnrichment.csv");

const parseCsvRows = (text: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(current);
      current = "";
      continue;
    }

    if (char === "\n" && !inQuotes) {
      row.push(current);
      rows.push(row);
      row = [];
      current = "";
      continue;
    }

    if (char !== "\r") {
      current += char;
    }
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current);
    rows.push(row);
  }

  return rows;
};

const parseCsv = (text: string): CsvData => {
  const normalized = text.replace(/^\uFEFF/, "");
  const rawRows = parseCsvRows(normalized);

  if (!rawRows.length) {
    return { headers: [], rows: [] };
  }

  const headers = rawRows[0].map((cell) => cell.trim());
  const rows = rawRows.slice(1).map((cells) => {
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = cells[index] ?? "";
    });
    return row;
  });

  return { headers, rows };
};

const escapeCsvCell = (value: string) => {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

const stringifyCsv = (data: CsvData, newline: "\n" | "\r\n") => {
  const lines: string[] = [];
  lines.push(data.headers.map(escapeCsvCell).join(","));

  for (const row of data.rows) {
    lines.push(data.headers.map((header) => escapeCsvCell(row[header] ?? "")).join(","));
  }

  return `${lines.join(newline)}${newline}`;
};

const isMissingDescription = (value: string) => {
  const normalized = value.trim().toLowerCase();
  return normalized.length === 0 || normalized === "null";
};

const buildDescription = (title: string) =>
  `Enjoy a guided ${title} experience featuring professional guidance and memorable outdoor moments. Perfect for visitors seeking adventure, learning, and a unique local experience.`;

const main = () => {
  const content = fs.readFileSync(filePath, "utf8");
  const newline: "\n" | "\r\n" = content.includes("\r\n") ? "\r\n" : "\n";

  const csv = parseCsv(content);
  const titleColumn = "title";
  const descriptionColumn = "description";

  if (!csv.headers.includes(titleColumn) || !csv.headers.includes(descriptionColumn)) {
    throw new Error("title or description column not found");
  }

  let updatedCount = 0;

  for (const row of csv.rows) {
    const title = (row[titleColumn] ?? "").trim();
    const description = row[descriptionColumn] ?? "";

    if (title && isMissingDescription(description)) {
      row[descriptionColumn] = buildDescription(title);
      updatedCount += 1;
    }
  }

  const updatedContent = stringifyCsv(csv, newline);
  fs.writeFileSync(filePath, updatedContent, "utf8");

  console.log(`Tour descriptions generated. Updated ${updatedCount} rows.`);
};

main();
