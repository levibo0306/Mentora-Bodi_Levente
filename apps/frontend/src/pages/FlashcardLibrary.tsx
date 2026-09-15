import { Flashcards } from "../ui/Flashcards";
import { PageLayout } from "../ui/PageLayout";

export function FlashcardLibrary() {
  return (
    <PageLayout
      title="Flashcards"
      subtitle="Állíts össze fogalomcsomagokat, alakíts kvízt kártyákká, és gyakorolj ütemezetten."
    >
      <Flashcards />
    </PageLayout>
  );
}
