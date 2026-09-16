# `services/documentText.ts` leírása

PDF és DOCX feltöltések szövegkinyerése. Fájlnév és MIME típus alapján választ feldolgozót: PDF-hez `pdf-parse`, DOCX-hez `mammoth`. A `normalizeText` egységesíti a whitespace-t. Legfeljebb 7000 karaktert ad tovább az AI-nak, és `truncated` jelzővel közli a vágást. Üres, hibás vagy nem támogatott dokumentumnál `DocumentTextError` keletkezik megfelelő státuszkóddal.
