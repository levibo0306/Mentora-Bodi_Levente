# Sprint 2 – Mentora quiz MVP szelet

## Összefoglaló

Ez a sprint egy egyszerű kvíz MVP szeletet valósít meg:

- üres állapot („Nincs még kvízed”),
- új kvíz létrehozása (valid/invalid input),
- lista nézet meglévő kvízekkel,
- hibaállapot (API hiba esetén „Hiba történt” + „Próbáld újra”).

A sprinthez tartozik Spec v0.2, user story + AC, ADR-ek, wireframe-ek, Terraform plan, AI-napló, tesztek coverage-szel és scriptelt smoke teszt.

---

## Fő deliverable-ok

- Spec v0.2:  
  [`sprints/02/docs/spec/product_spec_v0.2.md`](sprints/02/docs/spec/product_spec_v0.2.md)
- User Story + AC:  
  [`sprints/02/docs/stories/user_stories.md`](sprints/02/docs/stories/user_stories.md)
- ADR-ek:
  - Deployment target: [`sprints/02/docs/adr/0002-deployment-target.md`](sprints/02/docs/adr/0002-deployment-target.md)
  - IaC stratégia: [`sprints/02/docs/adr/0003-iac-strategy.md`](sprints/02/docs/adr/0003-iac-strategy.md)
- Wireframe-ek:  
  képek: `sprints/02/wireframes/*.jpg`  
  leírás: [`sprints/02/wireframes/README.md`](sprints/02/wireframes/README.md)
- Traceability tábla:  
  [`sprints/02/docs/traceability.md`](sprints/02/docs/traceability.md)
- DoR / DoD:  
  [`sprints/02/docs/process/dor_dod.md`](sprints/02/docs/process/dor_dod.md)
- AI-napló:  
  [`sprints/02/ai/ai_log.jsonl`](sprints/02/ai/ai_log.jsonl)
- Terraform (IaC):  
  [`sprints/02/infra/terraform/`](sprints/02/infra/terraform)

---

## Futtatás / ellenőrzés

### Node / app

```bash
npm ci
npm run test:ci      # Vitest + JUnit + coverage (sprints/02/reports/junit.xml, sprints/02/reports/coverage.xml)
npm run build        # Vite build -> dist/
npm run preview      # http://localhost:4173
```

## Smoke teszt:
- YAML alapú smoke specifikáció:
  [`sprints/02/scripts/smoke.yaml`](sprints/02/scripts/smoke.yaml)

- HTTP (REST Client) smoke:
  [`sprints/02/scripts/smoke.http`](sprints/02/scripts/smoke.http)

- Elvárás:

  GET / → HTTP 200
  a HTML tartalom tartalmazza a <div id="root"></div> snippetet (index oldal sikeres betöltése).

## Terraform (IaC):

```bash
cd infra/terraform
terraform init
terraform validate
terraform plan -out=plan.out
```
- Artefakt:

  [Plan kimenet](sprints/02/infra/terraform/plan.out)

## Jelentések / artefaktok

- JUnit tesztriport:
  [`sprints/02/reports/junit.xml`](sprints/02/reports/junit.xml)

  → 5 teszt, 0 failure, 0 error.

- Coverage riport (Cobertura XML):
  [`sprints/02/reports/coverage.xml`](sprints/02/reports/coverage.xml)

  → line-rate ≈ 0.66 (≈66% line coverage a core logikán).


## Known issues:

A kvízek jelenleg in-memory tárolódnak a sprints/02/src/api/quizzes.ts fájlban, nincs valódi backend/perzisztens adatbázis.

A UI minimális, nincsenek dedikált styling komponensek / reszponzív layout; a fókusz most az MVP flow, a logika és a tesztelhetőség volt.

A coverage elsősorban a core/domain logikára (sprints/02/src/core/quizLogic.ts) koncentrál; a React komponensekre nincs külön unit/komponens teszt.


## Next steps (jövőbeli fejlesztés):

Valódi backend/API integráció és perzisztens adattárolás a kvízekhez.

További unit/komponens tesztek a UI rétegre (CreateQuizForm, QuizList, ErrorState, stb.).

Alap design/styling és reszponzív nézetek bevezetése.

Esetleges E2E tesztek (Playwright/Cypress) az end-to-end kvíz flow-ra.

### Fő flow – lista nézet
![01 – Main flow](sprints/02/wireframes/01-main-flow.jpg)

### Üres állapot
![02 – Empty state](sprints/02/wireframes/02-empty-state.jpg)

### Hibaállapot
![03 – Error state](sprints/02/wireframes/03-error-state.jpg)

### Form validáció
![04 – Form validation](sprints/02/wireframes/04-form-validation.jpg)
