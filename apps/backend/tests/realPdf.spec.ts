import { readFile } from "node:fs/promises";
import { expect, test } from "vitest";
import { extractDocumentText } from "../src/services/documentText";

test("extracts text from an actual uploaded PDF buffer", async () => {
  const file = await readFile(new URL("./fixtures/text-layer.pdf", import.meta.url));
  const result = await extractDocumentText(file, "text-layer.pdf", "application/pdf");
  expect(result.text).toContain("Students can practise with shared quizzes.");
});
