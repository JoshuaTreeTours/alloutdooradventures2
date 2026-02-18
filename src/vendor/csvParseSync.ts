export type CsvParseOptions = {
  columns?: boolean;
  skip_empty_lines?: boolean;
  relax_column_count?: boolean;
};

const parseCsvRows = (text: string): string[][] => {
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
      row.push(current.trim());
      current = "";
      continue;
    }

    if (char === "\n" && !inQuotes) {
      row.push(current.trim());
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
    row.push(current.trim());
    rows.push(row);
  }

  return rows;
};

export const parse = (
  input: string,
  options: CsvParseOptions = {}
): Array<Record<string, string>> => {
  const rows = parseCsvRows(input);
  if (!rows.length) {
    return [];
  }

  const normalizedRows = options.skip_empty_lines
    ? rows.filter(row => row.some(cell => cell.trim().length > 0))
    : rows;

  if (!normalizedRows.length) {
    return [];
  }

  if (!options.columns) {
    return normalizedRows.map(row =>
      Object.fromEntries(row.map((value, index) => [String(index), value]))
    );
  }

  const headers = normalizedRows[0].map(header => header.trim());
  return normalizedRows.slice(1).reduce<Array<Record<string, string>>>(
    (records, row) => {
      if (!options.relax_column_count && row.length !== headers.length) {
        return records;
      }

      const record = headers.reduce<Record<string, string>>((acc, header, index) => {
        if (!header) {
          return acc;
        }
        acc[header] = (row[index] ?? "").trim();
        return acc;
      }, {});

      records.push(record);
      return records;
    },
    []
  );
};
