# `ui/TopicsPanel.tsx` leírása

Témák listázása és kezelése. Tanár létrehozhat színezett témát, megoszthatja vagy törölheti; diák kód/link alapján témát vehet fel. A `load` lekéri a listát, a létrehozó és claim műveletek siker után újratöltenek. A téma megnyitása a `/topics/:id` oldalra visz, a megosztást a `TopicShareModal` végzi.
