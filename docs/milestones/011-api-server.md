# Jalon 011 — Serveur API 🔄

Branche : `feature/api-server` (depuis `develop`). Livré dans : —

## Objectif

`apps/api` démarre un serveur Express qui sert l'API et délègue le reste à Next.js, dans un seul
processus (jalon 007, D22). Sa configuration est validée au démarrage, il écrit des journaux
JSON, et `/health` renvoie la version déployée. Le serveur se lance en local et dans le CI, mais
Render continue de lancer Next.js seul jusqu'au jalon « Déploiement du socle ».

## Contexte

- Le jalon 010 a posé le cœur hexagonal d'`apps/api` (value objects du shared kernel et de
  Ventes), sans serveur ni base. Il a laissé à ce jalon le nom du composition root et
  l'emplacement du point d'entrée (jalon 010, D19).
- Le jalon 007 a fixé le service unique de la phase gratuite (D22) : une application Express,
  exportée par `apps/api`, monte les routes de l'API et délègue le reste à Next.js en serveur
  personnalisé. Il a aussi fixé l'observabilité (D24) : journaux JSON avec un identifiant par
  requête et sans donnée personnelle, et un `/health` qui sert de health check à Render.
- La piste « Tests de bout en bout et vérification après déploiement » attend de `/health` la
  version déployée, pour savoir quand la nouvelle release est en ligne.
- Aujourd'hui, Next.js sert seul l'interface et les routes de démonstration (`/api/orders`,
  `/api/analytics/...`), qui restent en place jusqu'au jalon « Indicateurs côté serveur ».
- `apps/api` est en TypeScript source, avec des imports sans extension (`moduleResolution:
  bundler`), comme `@salespulse/contracts` : Node ne peut pas l'exécuter tel quel.

## Décisions

- **D1 (2026-11-26) — Composition root `src/app.ts`, point d'entrée `src/main.ts`** :
  `apps/api/src/app.ts` exporte `createApp(deps)`, qui instancie les middlewares et monte les
  routes. Ses dépendances (configuration, logger, gestionnaire de repli) sont reçues en
  paramètre. `apps/api/src/main.ts` est le seul module qui a des effets : il lit la
  configuration, crée le logger, prépare Next.js, appelle `createApp` et écoute le port.
  - Raisons : `createApp` se teste sans réseau ni Next.js ; au passage en plan payant, seul
    `main.ts` change (D22), en ne passant plus Next.js comme repli.
  - Alternative écartée : un point d'entrée dans `apps/web` ou dans une troisième app, qui
    importerait `apps/api` alors qu'une app n'en importe jamais une autre.
- **D2 (2026-11-26) — Next.js en repli, sans partage de préfixe** : `createApp` reçoit un
  gestionnaire de repli optionnel, appelé pour toute requête qu'aucune route Express ne prend.
  `main.ts` y passe le gestionnaire de Next.js ; sans repli, la requête reçoit un 404 JSON.
  - Les routes de démonstration de Next.js sous `/api` continuent de fonctionner : Express ne
    répond pas 404 sous `/api`, il passe la main. Les futures routes Express sous `/api` ne
    devront pas reprendre leurs chemins tant qu'elles existent.
  - Les en-têtes posés par Express (identifiant de requête, en-têtes de sécurité plus tard)
    le sont avant l'appel à Next.js, qui commence la réponse dès qu'il la reçoit (documentation
    du serveur personnalisé de Next 16).
- **D3 (2026-11-26) — Dossier `src/server/` pour l'infrastructure transverse** :
  configuration, logger, middlewares communs et route `/health` vivent dans
  `apps/api/src/server/`, qui n'est pas un bounded context et n'en importe aucun. La règle
  d'imports d'ESLint n'est pas modifiée : `server/` n'a ni `domain/` ni `application/`.
- **D4 (2026-11-26) — Exécution de TypeScript par `tsx`** : `main.ts` est lancé par `tsx`, en
  dépendance d'exécution d'`apps/api`, sans étape de build.
  - Raisons : il exécute aussi `@salespulse/contracts` en source, sans toucher aux imports ;
    un seul outil pour le lancement et le mode watch.
  - Alternatives écartées : le retrait des types natif de Node 24, qui demande d'ajouter
    l'extension `.ts` à tous les imports d'`apps/api` et de `@salespulse/contracts` ; un bundle
    esbuild, une étape de build de plus pour un démarrage à peine plus rapide.
  - Pas d'entrée dans `docs/stack.md` : lanceur interchangeable sans toucher au code.
- **D5 (2026-11-26) — Express 5, journaux par pino** : Express 5, version stable actuelle.
  Journaux JSON par `pino` et `pino-http`, une ligne par requête : identifiant de requête,
  méthode, chemin **sans query string**, statut, durée. Liste de masquage (`redact`) dès
  maintenant : en-têtes `authorization` et `cookie`.
  - Raisons : la query string portera des jetons (liens de réinitialisation, D21 du
    jalon 007) ; l'identifiant de requête est renvoyé dans l'en-tête `X-Request-Id` pour
    relier une erreur signalée à sa ligne de journal.
  - Raisons du choix de pino (validé par l'utilisateur) : il fait par défaut ce que demande
    D24 du jalon 007, sans configuration : sortie JSON, niveaux filtrés par `LOG_LEVEL`,
    loggers enfants qui portent l'identifiant de requête (puis l'organisation) sur toutes les
    lignes, sérialisation des erreurs, et masquage par chemins déjà éprouvé, la partie où une
    erreur ferait fuir un secret (P15, P16). `pino-http` fournit la ligne par requête. Sa
    vitesse, son argument habituel, n'est pas un besoin du projet.
  - Alternatives écartées : winston, pensé pour plusieurs destinations alors que Render lit la
    sortie standard, et dont JSON et masquage demandent de la configuration ; un logger maison
    (`console.log(JSON.stringify(…))`), sans dépendance mais dont le masquage, les loggers
    enfants et la sérialisation des erreurs seraient à écrire et à tester, et à relire en
    niveau critique ; bunyan, qui n'évolue plus ; consola, conçu pour les outils en ligne de
    commande.
  - `pino-pretty` en dépendance de développement, pour des journaux lisibles avec
    `dev:server` ; JSON brut partout ailleurs.
  - Les journaux de Next.js (`console.log` de `instrumentation.ts`) restent en texte : ils
    disparaîtront avec le store mocké.
  - Pas d'entrée dans `docs/stack.md` pour `pino` : utilitaire interchangeable, cantonné à
    `src/server/`.
- **D6 (2026-11-26) — Configuration validée par Zod au démarrage** : `loadConfig(env)` est une
  fonction pure qui lit les variables d'environnement (`PORT`, `NODE_ENV`, `LOG_LEVEL`) et
  renvoie une configuration typée, ou lève une erreur qui nomme chaque variable invalide sans
  recopier sa valeur (de futurs secrets passeront par là). `main.ts` l'écrit dans le journal et
  quitte avec le code 1.
  - Zod est déjà la bibliothèque de validation du projet (`docs/stack.md`) ; il reste hors de
    `domain/` et d'`application/`.
- **D7 (2026-11-26) — `/health` à la racine, version du `package.json` racine** : `GET /health`
  renvoie `200` et `{ "status": "ok", "version": "X.Y.Z" }`, avec `Cache-Control: no-store`.
  La version est lue une fois au démarrage dans le `package.json` racine, qui porte la version
  du projet, et passée à `createApp`.
  - Il ne vérifie que le processus : la vérification de la base arrive avec elle (jalon « Base
    de données », D24 du jalon 007).
  - Hors de `/api`, pour ne pas dépendre du préfixe de l'API au passage en service séparé.
- **D8 (2026-11-26) — Scripts à part, Render inchangé** : `npm run dev:server` et
  `npm run start:server`, à la racine, lancent le serveur unique (Next.js en mode développement
  ou à partir de son build). `dev` et `start` restent ceux de Next.js : Render lance `start`, et
  le passage au serveur unique est le sujet du jalon « Déploiement du socle ».
- **D9 (2026-11-26) — Arrêt propre** : à `SIGTERM` (envoyé par Render avant de remplacer une
  instance) et `SIGINT`, le serveur cesse d'accepter des connexions, termine les requêtes en
  cours, puis quitte.
- **D10 (2026-11-26) — Démarrage vérifié dans le CI** : après `npm run build`, le job `checks`
  lance `npm run start:server`, attend que `/health` réponde `200` avec la version du
  `package.json`, puis arrête le serveur.
  - Raison : `main.ts` reste hors des tests unitaires (branchement de Next.js et du réseau) ;
    cette étape prouve à chaque pull request que le point d'entrée démarre.
- **D11 (2026-11-27) — Tests HTTP par `supertest`, assertions de Vitest** : les tests de la
  phase C passent l'application à `request(app)`, qui l'écoute sur un port local éphémère,
  envoie la requête et referme le serveur ; les assertions s'écrivent avec `expect` de Vitest,
  jamais avec celles de `supertest` (`.expect(200)`), pour garder un seul style.
  - Raisons : outil habituel des tests d'Express, qui gère seul le cycle de vie du serveur
    (port libre, fermeture, connexions keep-alive) ; dépendance de développement seulement.
  - Alternative écartée : `fetch` natif de Node 24 et un helper maison (`app.listen(0)`, lecture
    du port, fermeture), sans dépendance, mais avec ce cycle de vie à écrire et à maintenir.

## Phase A — Paquet et outillage ✅ (relecture légère)

- [x] `apps/api/package.json` : dépendances `express`, `pino`, `pino-http`, `zod`, `next`,
  `tsx` ; développement : `@types/express`, `supertest`, `@types/supertest`, `@types/node`,
  `pino-pretty` (D5).
- [x] `apps/api/package.json` et `package.json` racine : scripts `dev:server` et `start:server`
  (D8).
- [x] `apps/api/tsconfig.json` : types de Node.
- [x] Vérifier dans la documentation de Render que le health check est disponible en offre
  gratuite ; noter le résultat au Journal et, s'il change le plan, dans le jalon « Déploiement
  du socle ».

## Phase B — Configuration ⬜ (relecture standard)

- [ ] `apps/api/src/server/config.ts` : `loadConfig(env)` applique les valeurs par défaut
  (`PORT` 3000, `NODE_ENV` `development`, `LOG_LEVEL` `info`), refuse un port non entier ou
  hors de 1 à 65535, un `NODE_ENV` ou un `LOG_LEVEL` inconnu, et nomme chaque variable
  invalide sans recopier sa valeur (D6).
- [ ] `apps/api/src/server/version.ts` : lit la version du `package.json` racine ; refuse un
  fichier sans version (D7).

## Phase C — Application Express ⬜ (relecture standard)

Tests par `supertest` sur `createApp`, sans port fixe ni Next.js (D11).

- [ ] `apps/api/src/server/logger.ts` : logger pino au niveau configuré, en-têtes
  `authorization` et `cookie` masqués (D5).
- [ ] `apps/api/src/server/requestLogging.ts` : une ligne par requête, chemin sans query
  string, identifiant renvoyé dans `X-Request-Id` (D5).
- [ ] `apps/api/src/server/health.ts` : `GET /health` renvoie `200`, `status` et `version`,
  `Cache-Control: no-store` (D7).
- [ ] `apps/api/src/server/errorHandler.ts` : une erreur non gérée donne un `500` JSON sans pile
  d'appels ni message interne, et une ligne de journal qui les contient.
- [ ] `apps/api/src/app.ts` : `createApp({ version, logger, fallback })` monte ce qui précède,
  désactive `X-Powered-By`, délègue au repli toute requête non prise (y compris sous `/api`),
  et répond 404 JSON sans repli (D1, D2).

## Phase D — Serveur unique ⬜ (relecture standard)

`main.ts` est un branchement, gardé aussi fin que possible (`docs/tdd.md`, « Code difficile à
tester »), et vérifié par le CI (D10) et à la main.

- [ ] `apps/api/src/main.ts` : configuration et version, logger, Next.js préparé sur
  `apps/web` (mode développement selon `NODE_ENV`), `createApp` avec Next.js en repli, écoute
  du port, arrêt propre à `SIGTERM` et `SIGINT` (D1, D9) ; configuration invalide : journal et
  code de sortie 1 (D6).
- [ ] `.github/workflows/ci.yml` : étape de démarrage après le build, qui attend `/health` et
  vérifie la version (D10) ; le job garde son nom `checks`.
- [ ] Vérification à la main, sortie notée au Journal : `npm run build` puis
  `npm run start:server` ; le dashboard s'affiche, `/api/orders` répond (Next.js),
  `/health` renvoie la version, les journaux sont en JSON, le jeu de données mocké est généré au
  démarrage (`instrumentation.ts`), et `SIGTERM` arrête le serveur proprement.
- [ ] Même vérification avec `npm run dev:server` (rechargement de l'interface compris).

## Phase E — Documentation ⬜ (relecture légère)

- [ ] `CLAUDE.md` : commandes `dev:server` et `start:server`, structure d'`apps/api`
  (`app.ts`, `main.ts`, `server/`), serveur lancé dans le CI mais pas par Render.
- [ ] `docs/domain-model.md` : nom du composition root et point d'entrée (D1), à la place de
  « tranchés au jalon Serveur API ».
- [ ] `docs/stack.md` : Express passe de « prévu » à « en place, pas encore déployé ».
- [ ] `docs/roadmap.md` : « Déploiement du socle » reprend le passage de `start` et de Render
  au serveur unique (D8).
- [ ] README inchangé : le serveur unique n'est pas encore ce que l'utilisateur lance ni ce que
  la démo sert. À relire à la clôture.

## Journal

- 2026-11-26 : plan rédigé.
- 2026-11-27 : health check de Render : la documentation (`/docs/health-checks`, `/docs/free`)
  ne le réserve à aucune offre et ne le cite pas parmi les limites de l'offre gratuite, sans
  pour autant le lister comme inclus. HTTP en `GET`, succès sur un `2xx` ou `3xx` en moins de
  5 secondes ; au déploiement, le trafic ne bascule qu'une fois les nouvelles instances saines
  (déploiement annulé après 15 minutes) ; en marche, trafic coupé après 15 secondes d'échecs et
  redémarrage après 60 secondes ; chemin réglé dans les Settings ou par `healthCheckPath` dans
  `render.yaml`. Plan inchangé ; à confirmer dans l'interface de Render (section *Health
  Checks* du service) au jalon « Déploiement du socle ».
- 2026-11-27 : TypeScript 6 vide `types` par défaut : `apps/api/tsconfig.json` déclare `node`
  explicitement. npm bloque le script d'installation d'esbuild (dépendance de `tsx`), non
  couvert par `allowScripts` : `tsx` fonctionne sans, le binaire venant de la dépendance
  optionnelle de la plateforme (`@esbuild/linux-x64`), donc `allowScripts` n'est pas élargi.
- 2026-11-27 : `dev:server` passe la sortie par `pino-pretty` dans le script (pipe), ce qui
  garde le logger sans transport ; `start:server` fixe `NODE_ENV=production`, la valeur par
  défaut de `loadConfig` étant `development` (D6).

## Workflow Git

- `docs:` pour ce plan (fichier du jalon, index de la roadmap) ;
- `chore:` pour les dépendances et les scripts (phase A) ;
- `feat:` pour la configuration et la version (phase B) ;
- `feat:` pour l'application Express, journaux, `/health` et erreurs (phase C) ;
- `feat:` pour le point d'entrée du serveur unique (phase D) ;
- `ci:` pour l'étape de démarrage du CI (phase D) ;
- `docs:` pour la documentation durable (phase E) ;
- `docs:` pour clore le jalon.

Point d'arrêt de relecture en fin de phase B, C et D (relecture standard). Merge par pull
request une fois `checks` au vert. Aucun changement visible pour l'utilisateur, Render lançant
toujours Next.js seul : pas de release pour ce jalon.

Taille estimée : environ 250 lignes de code de production et 350 lignes de tests, sous les
seuils de `CLAUDE.md`.

## Critères d'acceptation

- `npm test`, `npm run lint`, `npm run typecheck` et `npm run build` sans erreur en local.
- `npm run start:server` après le build : le dashboard s'affiche, les routes de démonstration
  répondent, `GET /health` renvoie `200` et la version du `package.json` racine.
- Une variable d'environnement invalide empêche le démarrage, avec un message qui la nomme.
- Les journaux sont des lignes JSON, sans query string ni en-tête `authorization` ou `cookie`.
- `checks` au vert sur la pull request, étape de démarrage comprise.

## Bilan

<Rempli à la clôture.>
