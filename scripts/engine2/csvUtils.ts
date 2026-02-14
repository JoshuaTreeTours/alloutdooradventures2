import path from "node:path";

export const toSourceCitySlug = (csvPath: string) =>
  path.basename(csvPath, path.extname(csvPath)).trim().toLowerCase();

const parseCsvRows = (text: string) => {
  const rows: string[][] = [];
  let current = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        index += 1;
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

  if (current.length || row.length) {
    row.push(current);
    rows.push(row);
  }

  return rows;
};

export const parseCsv = (contents: string): Record<string, string>[] => {
  const rows = parseCsvRows(contents);
  if (!rows.length) {
    return [];
  }

  const headers = rows[0].map(header => header.trim());

  return rows
    .slice(1)
    .map(row => {
      const entry: Record<string, string> = {};
      headers.forEach((header, i) => {
        entry[header] = row[i]?.trim() ?? "";
      });
      return entry;
    })
    .filter(row => Object.values(row).some(value => value.trim().length > 0));
};
