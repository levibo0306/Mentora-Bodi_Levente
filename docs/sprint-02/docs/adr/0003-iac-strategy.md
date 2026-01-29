# ADR 0003 – IaC stratégia

## Dátum
2025-10-28

## Kontextus
Terraform szükséges a környezet visszajátszhatóságához. Apply nem kötelező.

## Döntés
Terraform validate + plan használata, egy minimál statikus host infrastruktúrára.

## Alternatívák
- Pulumi – TypeScript alapú, de tulzás
- Kézi deployment – nem visszajátszható
- Docker compose – nem IaC

## Következmények
+ Egyszerű setup
+ CI kompatibilis  
- Később bővíteni kell modulokra
