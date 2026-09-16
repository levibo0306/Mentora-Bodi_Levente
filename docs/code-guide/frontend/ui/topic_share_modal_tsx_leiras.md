# `ui/TopicShareModal.tsx` leírása

Téma megosztási modal. A címzettlistát és továbbosztási engedélyt a `shareTopic` API-nak adja, majd a létrejött tokeneket mutatja és másolhatóvá teszi. Saját `isOpen` propja miatt a szülő `TopicsPanel` nem feltétlenül szereli le, hanem láthatóságot vezérel. Hiba és loading állapotot külön kezel.
