import { useState, useCallback } from "react";
import { parseCsv } from "@/utils/csvParser";
import { csvRowSchema, type CsvRowParsed } from "@/validation/csvSchema";

export interface ValidatedRow {
  data: CsvRowParsed;
  valid: boolean;
  errors: string[];
}

export function useFileUpload() {
  const [rows, setRows] = useState<ValidatedRow[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [parsing, setParsing] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const processFile = useCallback((f: File) => {
    setParsing(true);
    setFileName(f.name);
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text !== "string") {
        setParsing(false);
        return;
      }
      const rawRows = parseCsv(text);
      const validated: ValidatedRow[] = rawRows.map((raw) => {
        const result = csvRowSchema.safeParse(raw);
        if (result.success) {
          return { data: result.data, valid: true, errors: [] };
        }
        return {
          data: { id: Number(raw.id) || 0, longitude: Number(raw.longitude) || 0, latitude: Number(raw.latitude) || 0, timestamp: raw.timestamp, subtotal: Number(raw.subtotal) || 0 },
          valid: false,
          errors: result.error.issues.map((i) => i.message)
        };
      });
      setRows(validated);
      setParsing(false);
    };
    reader.readAsText(f);
  }, []);

  const reset = useCallback(() => {
    setRows([]);
    setFileName("");
    setFile(null);
  }, []);

  return { rows, fileName, parsing, processFile, reset, file };
}
