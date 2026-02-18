export type CsvParseOptions = {
  columns?: boolean;
  skip_empty_lines?: boolean;
  relax_column_count?: boolean;
};

const parseLine = (line: string): string[] => {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

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
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
};

export const parse = (
  input: string,
  options: CsvParseOptions = {}
): Array<Record<string, string>> => {
  const lines = input
    .split(/\r?\n/)
    .map(line => line.trimEnd())
    .filter(line => (options.skip_empty_lines ? Boolean(line.trim()) : true));

  if (!lines.length) {
    return [];
  }

  const headers = parseLine(lines[0]);
  if (!options.columns) {
    return lines.slice(1).map(line => {
      const row = parseLine(line);
      return Object.fromEntries(row.map((value, index) => [String(index), value]));
    });
  }

  return lines.slice(1).reduce<Array<Record<string, string>>>((records, line) => {
    const row = parseLine(line);
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
  }, []);
};
