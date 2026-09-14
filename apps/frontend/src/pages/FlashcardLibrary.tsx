import { Flashcards } from "../ui/Flashcards";
import { PageLayout } from "../ui/PageLayout";

export function FlashcardLibrary() {
  return (
    <PageLayout
      title="Kártyapackek"
      subtitle="Állíts össze fogalomcsomagokat, alakíts kvízt kártyákká, és gyakorolj ütemezetten."
    >
      <Flashcards />
    </PageLayout>
  );
}
