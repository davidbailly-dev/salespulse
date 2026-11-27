---
paths:
  - "apps/api/**"
  - "eslint.config.mjs"
  - "/package.json"
---

# Backend (`apps/api/`)

Règle chargée avec les fichiers d'`apps/api`, `eslint.config.mjs` et le `package.json` racine.

## Serveur

- `apps/api` a un serveur mais pas encore de base : le CI le teste et vérifie qu'il démarre, sans qu'il soit déployé ; Render lance Next.js seul (`npm start`) jusqu'au jalon « Déploiement du socle » (`docs/roadmap.md`).
- **Serveur unique** (jalon 007, D22 ; jalon 011) : `start:server` lance `node --import tsx` (jamais la commande `tsx`, dont le relais des signaux tue le serveur par `SIGKILL` pendant une requête : jalon 011, D12), précédé d'`exec` à chaque niveau pour que `SIGTERM` traverse le `sh` des scripts npm (`dash` sous Ubuntu et Render ne s'efface pas de lui-même) ; `dev:server` lance `tsx watch` en excluant `apps/web`, rechargée par Next.js lui-même (sinon les fichiers générés dans `.next/` le relancent en boucle). Variables : `PORT` (3000), `NODE_ENV` (`production`, posé à `development` par `dev:server` : jalon 011, D13), `LOG_LEVEL` (`info`), validées au démarrage.

## Tests

- **Tests de `apps/api`** : Vitest (`apps/api/vitest.config.mts`) en `node`, `*.test.ts` seulement. Couverture de `apps/api/src/**`, hors helpers de test (`src/testing/`), sans seuil.
- Un seul fichier : `npm test -w @salespulse/api -- src/shared/domain/money.test.ts` (chemin relatif à `apps/api`).
- Spécificités de TDD :
  - value objects : une fonction de fabrique par value object, testée par ce qu'elle accepte et par le code de la `DomainError` de chaque refus, lu avec `errorCodeOf` (`apps/api/src/testing/`) ;
  - use cases : testés avec les adapters en mémoire (`InMemoryOrderRepository`…, dans `infrastructure/`), jamais avec une base ; les adapters de lecture SQL, contre une vraie PostgreSQL (`docs/domain-model.md`, « Écriture et lecture ») ;
  - fuseaux horaires : changements d'heure attendus choisis dans le passé, que les mises à jour de la base tz embarquée par Node ne changent pas, et vérifiés avec une seconde base, celle du système (`TZ=Europe/Paris date -d …`) ;
  - règle d'imports : une interdiction ajoutée à `eslint.config.mjs` se prouve par un import interdit temporaire qui fait échouer `npm run lint`, sortie montrée, puis retiré.

## Architecture

Le modèle du domaine est décrit dans `docs/domain-model.md` (bounded contexts, entities, value objects, invariants, écriture et lecture, correspondance des statuts des plateformes) : le lire avant de toucher à `apps/api`. Les décisions et leurs raisons sont dans le jalon 010 (`docs/milestones/010-data-model.md`), citées par leur numéro (D3, D31…). L'essentiel au quotidien :

- Architecture hexagonale : `apps/api/src/<contexte>/{domain,application,infrastructure}` et un `index.ts` par contexte (`organizations`, `shops`, `sales`, `analytics`, `billing` à venir), plus un shared kernel `apps/api/src/shared/domain/` (`Money`, `CurrencyCode`, `IanaTimezone`, `LocalDay`, `DomainError`).
- Serveur (jalon 011) : `apps/api/src/app.ts` est le composition root (`createApp({ version, logger, fallback })`, sans effet de bord, testé par `supertest`) ; `apps/api/src/main.ts`, le point d'entrée, seul module à effets (configuration, Next.js en repli, écoute, arrêt propre), vérifié par le CI. `apps/api/src/server/` porte l'infrastructure transverse (configuration, logger pino, ligne de journal par requête, `/health`, gestionnaire d'erreurs, arrêt propre) et n'importe aucun contexte. Les routes Express sous `/api` ne doivent pas reprendre les chemins des routes de démonstration de Next.js tant qu'elles existent : Express passe la main à Next.js pour tout ce qu'il ne prend pas.
- Règle d'imports, vérifiée par `eslint.config.mjs` (`apiLayers`) : `domain/` n'importe que son dossier et `shared/domain/`, aucun paquet externe ; `application/` ajoute son domaine et l'`index.ts` d'un autre contexte, aucun paquet externe ; `infrastructure/` importe tout sauf l'intérieur d'un autre contexte. Les `*.test.ts` sont exemptés. Ses expressions régulières supposent `domain/` à plat (un fichier par entity ou value object, nommé en camelCase) : les revoir avec des sous-dossiers par aggregate.
- `domain/` est pur et déterministe : ni entrée/sortie, ni horloge (`now` en paramètre), ni bibliothèque. Les fuseaux horaires passent par `Intl`.
- Value objects : types en lecture seule et marqués (branded), produits par une fonction de fabrique qui vérifie l'invariant (`money()` produit un `Money`), sans classes ; une liste fermée de valeurs (`OrderStatus`) est une union de littéraux tirée d'un tableau figé, sans marque. Une valeur invalide lève une `DomainError` avec un code stable (`invalid-money`, `currency-mismatch`…).
- Les règles métier n'existent qu'une fois, en TypeScript : les champs dont la lecture a besoin (« compte dans les indicateurs », jour local, ventes nettes HT) sont calculés à l'écriture, et le SQL ne fait que filtrer, additionner et regrouper.
