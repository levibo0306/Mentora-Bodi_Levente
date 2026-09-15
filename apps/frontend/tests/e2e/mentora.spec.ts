import { expect, test, type Page, type Route } from "@playwright/test";

const teacher = { id: "00000000-0000-4000-8000-000000000010", username: "tanar", email: "tanar@example.com", role: "teacher" };
const quiz = {
  id: "00000000-0000-4000-8000-000000000020",
  title: "Dokumentumból készült kvíz",
  description: "",
  mode: "practice",
  owner_id: teacher.id,
  is_owner: true,
  question_count: 1,
  total_attempts: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

async function json(route: Route, body: unknown, status = 200) {
  await route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
}

async function mockTeacherApi(page: Page) {
  let quizzes: typeof quiz[] = [];
  await page.route("http://localhost:3001/api/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;

    if (path === "/api/auth/login" && request.method() === "POST") return json(route, { token: "e2e-token", user: teacher });
    if (path === "/api/users/me/overview") return json(route, {
      role: "teacher", stats: { active_quizzes: quizzes.length, total_students: 0, total_attempts: 0, avg_score: 0 },
      badges: [], xp: 0, level: 0, rank: "Tanár", daily_missions: [],
    });
    if (path === "/api/topics") return json(route, []);
    if (path === "/api/quizzes/importable") return json(route, quizzes);
    if (path === "/api/quizzes" && request.method() === "GET") return json(route, quizzes);
    if (path === "/api/quizzes" && request.method() === "POST") {
      quizzes = [quiz];
      return json(route, quiz, 201);
    }
    if (path === "/api/quizzes/generate-ai-file") return json(route, {
      questions: [{
        prompt: "Mi a személyre szabott tanulás célja?",
        options: ["Az egyéni fejlődés", "A véletlen választás", "A tartalom törlése", "A pontozás mellőzése"],
        correct_index: 0,
        explanation: "Az egyéni szükségletekhez igazodik.",
        difficulty: 3,
      }],
      source: { filename: "tananyag.pdf", characters: 4200, truncated: false },
    });
    if (path === `/api/quizzes/${quiz.id}/questions` && request.method() === "POST") {
      return json(route, { id: "00000000-0000-4000-8000-000000000030" }, 201);
    }
    return json(route, []);
  });
}

test("a teacher can generate and save a quiz from a PDF", async ({ page }) => {
  await mockTeacherApi(page);
  await page.goto("/login");
  await page.getByPlaceholder("email vagy username").fill("tanar@example.com");
  await page.getByPlaceholder("Legalább 6 karakter").fill("Mentora123!");
  await page.getByRole("button", { name: "Bejelentkezés" }).click();

  await page.getByRole("button", { name: "+ Új kvíz" }).first().click();
  await page.locator(".create-quiz-form .input-group input").first().fill(quiz.title);
  await page.getByRole("button", { name: "Következő →" }).click();

  await page.locator('input[type="file"]').setInputFiles({
    name: "tananyag.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("fake e2e pdf"),
  });
  await page.getByRole("button", { name: "5 kérdés generálása" }).click();
  await expect(page.getByText("Mi a személyre szabott tanulás célja?")).toBeVisible();
  await page.getByRole("button", { name: "Következő →" }).click();
  await page.getByRole("button", { name: "Kvíz véglegesítése" }).click();

  await expect(page.getByText(quiz.title).last()).toBeVisible();
});

test("the quiz player requests and completes a personalized question set", async ({ page }) => {
  const student = { ...teacher, id: "00000000-0000-4000-8000-000000000011", role: "student" };
  await page.addInitScript(({ student }) => {
    localStorage.setItem("mentora_user", JSON.stringify(student));
    localStorage.setItem("mentora_token", "e2e-token");
  }, { student });
  await page.route("http://localhost:3001/api/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith("/adaptive-questions")) return json(route, [{
      id: "00000000-0000-4000-8000-000000000031",
      prompt: "Személyre szabott kérdés",
      options: ["Helyes", "Hibás"],
      correct_index: 0,
      difficulty: 3,
    }]);
    if (path.endsWith("/attempt")) return json(route, { score: 100, correct: 1, total: 1 });
    return json(route, {});
  });

  await page.goto(`/play/${quiz.id}`);
  await expect(page.getByText("Személyre szabott kérdés")).toBeVisible();
  await page.getByText("Helyes", { exact: true }).click();
  await page.getByRole("button", { name: "Befejezés" }).click();
  await expect(page.getByText("100%")).toBeVisible();
});
