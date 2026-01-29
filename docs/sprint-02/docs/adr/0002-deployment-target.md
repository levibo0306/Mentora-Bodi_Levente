# ADR 0002 – Deployment cél

## Dátum
2025-10-28

## Kontextus
A projekt Next.js alapú, kevés háttérlogikával, preview környezetre van szükség.
Gyors build, automatikus preview URL-ek kellenek.

## Döntés
A Vercel lesz a deploy platform.

## Alternatívák
- Firebase Hosting – lassabb preview, több setup
- Netlify – jó, de Next.js teljes funkcionalitása korlátozott
- VM alapú saját hosting – feleslegesen bonyolult

## Következmények
+ Gyors preview
+ Minimális setup
+ CI könnyű integráció  
- Vercel free tier limitációk
