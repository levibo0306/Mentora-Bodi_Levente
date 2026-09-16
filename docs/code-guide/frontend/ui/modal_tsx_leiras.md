# `ui/Modal.tsx` leírása

## Miért van itt?

Újrahasznosítható modális ablak, jelenleg főként a kvíz létrehozásához és szerkesztéséhez.

## Props

- `isOpen`: látható-e.
- `onClose`: bezárási callback.
- `title`: fejléc szövege.
- `children`: a modal belső tartalma.

## Működés

Nyitáskor Escape billentyűfigyelőt telepít és letiltja a body görgetését. Bezáráskor vagy unmountkor visszaállítja ezeket. A háttérre kattintás bezár, de a belső panel `stopPropagation` miatt nem. `isOpen === false` esetén `null`-t ad vissza, tehát nincs a DOM-ban.

## Kapcsolatok

Az `index.tsx` a `CreateQuizForm` köré teszi. A megjelenést a `.modal-overlay`, `.modal-content` és kapcsolódó CSS szabályok adják.
