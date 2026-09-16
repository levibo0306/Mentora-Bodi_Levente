# `backend/src/seed.ts` leírása

Fejlesztői mintaadatokat hoz létre, főként előre meghatározott tanár- és diákfiókokat. A jelszavakat bcrypttel hasheli, és ütközésbiztos SQL-lel dolgozik, ezért ismételt futtatáskor nem kellene duplikálnia az alapfelhasználókat. Nem fut automatikusan éles kérés során; külön npm scriptből használható helyi teszteléshez.
