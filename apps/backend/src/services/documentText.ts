import mammoth from "mammoth";
import pdfParse from "pdf-parse/lib/pdf-parse.js";

const MAX_SOURCE_CHARACTERS = 7_000;

export type ExtractedDocument = {
  text: string;
  originalCharacters: number;
  truncated: boolean;
};

export class DocumentTextError extends Error {
  constructor(message: string, public readonly statusCode = 400) {
    super(message);
    this.name = "DocumentTextError";
  }
}

function normalizeText(value: string) {
  return value
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function isPdf(fileName: string, mimeType: string) {
  return mimeType === "application/pdf" || fileName.toLowerCase().endsWith(".pdf");
}

function isDocx(fileName: string, mimeType: string) {
  return mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    || fileName.toLowerCase().endsWith(".docx");
}

export async function extractDocumentText(
  buffer: Buffer,
  fileName: string,
  mimeType: string,
): Promise<ExtractedDocument> {
  if (!buffer.length) throw new DocumentTextError("A feltöltött dokumentum üres.");

  let rawText: string;
  try {
    if (isPdf(fileName, mimeType)) {
      const parsed = await pdfParse(buffer);
      rawText = parsed.text;
    } else if (isDocx(fileName, mimeType)) {
      const parsed = await mammoth.extractRawText({ buffer });
      rawText = parsed.value;
    } else {
      throw new DocumentTextError("Csak PDF vagy DOCX dokumentum tölthető fel.", 415);
    }
  } catch (error) {
    if (error instanceof DocumentTextError) throw error;
    throw new DocumentTextError("A dokumentum szövege nem olvasható. Ellenőrizd, hogy a fájl nem sérült vagy jelszóval védett.");
  }

  const normalized = normalizeText(rawText);
  if (normalized.length < 50) {
    throw new DocumentTextError("A dokumentumból nem nyerhető ki legalább 50 karakter szöveg. A szkennelt PDF-ekhez előbb OCR szükséges.");
  }

  return {
    text: normalized.slice(0, MAX_SOURCE_CHARACTERS),
    originalCharacters: normalized.length,
    truncated: normalized.length > MAX_SOURCE_CHARACTERS,
  };
}
