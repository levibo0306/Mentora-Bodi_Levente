import { beforeEach, describe, expect, test, vi } from "vitest";

const pdfMock = vi.fn();
const docxMock = vi.fn();

vi.mock("pdf-parse/lib/pdf-parse.js", () => ({ default: pdfMock }));
vi.mock("mammoth", () => ({ default: { extractRawText: docxMock } }));

describe("document text extraction", () => {
  beforeEach(() => {
    pdfMock.mockReset();
    docxMock.mockReset();
  });

  test("normalizes and truncates extracted PDF text", async () => {
    pdfMock.mockResolvedValue({ text: `  ${"tananyag ".repeat(1000)}  ` });
    const { extractDocumentText } = await import("../src/services/documentText");
    const result = await extractDocumentText(Buffer.from("pdf"), "anyag.pdf", "application/pdf");

    expect(result.text).toHaveLength(7000);
    expect(result.truncated).toBe(true);
  });

  test("extracts DOCX text", async () => {
    docxMock.mockResolvedValue({ value: "Ez egy megfelelően hosszú dokumentum szövege, amelyből már készíthetők kérdések a tanuláshoz." });
    const { extractDocumentText } = await import("../src/services/documentText");
    const result = await extractDocumentText(Buffer.from("docx"), "anyag.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");

    expect(result.text).toContain("megfelelően hosszú");
    expect(result.truncated).toBe(false);
  });

  test("rejects unsupported files", async () => {
    const { extractDocumentText, DocumentTextError } = await import("../src/services/documentText");
    await expect(extractDocumentText(Buffer.from("text"), "anyag.txt", "text/plain"))
      .rejects.toEqual(expect.objectContaining<DocumentTextError>({ statusCode: 415 }));
  });
});
