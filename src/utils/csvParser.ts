export interface CsvRow {
  id: string;
  longitude: string;
  latitude: string;
  timestamp: string;
  subtotal: string;
}

export function parseCsv(text: string): CsvRow[] {
  const lines = text.trim().split("\n");
  const header = lines[0];
  if (!header) return [];

  const columns = header.split(",").map((c) => c.trim());
  const rows: CsvRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line?.trim()) continue;

    const values = line.split(",");
    const row: CsvRow = {
      id: "",
      longitude: "",
      latitude: "",
      timestamp: "",
      subtotal: ""
    };
    columns.forEach((col, idx) => {
      if (col in row) {
        row[col as keyof CsvRow] = values[idx]?.trim() ?? "";
      }
    });
    rows.push(row);
  }

  return rows;
}
