# Jalon 012 — Instructions de l'agent allégées 🔄

Branche : `feature/agent-instructions` (depuis `develop`). Livré dans : —

## Objectif

Au début d'une session, l'agent ne charge plus que ce qui sert partout : un `CLAUDE.md` de moins
de 200 lignes et les conventions utilisées à chaque commit. Les règles d'un paquet ou d'un type
de fichier se chargent quand l'agent lit ou modifie un fichier concerné. Aucune règle n'est
perdue en route.

## Contexte

- À la clôture du jalon 011, le `CLAUDE.md` fait 222 lignes (24 232 caractères). Il importe sept
  conventions génériques de `docs/` (36 433 caractères), chargées avec lui à chaque session :
  environ 60 000 caractères d'instructions avant le premier message.
- La documentation de Claude Code (page « Memory ») recommande moins de 200 lignes par
  `CLAUDE.md` : au-delà, le contexte se remplit et les consignes sont moins bien suivies. Elle
  conseille de déplacer ce qui ne concerne qu'une partie du code dans des règles filtrées par
  chemin.
- Fonctionnement des règles, d'après cette page (lue le 2026-11-27) :
  - tout fichier `.md` de `.claude/rules/` est une règle, sous-dossiers compris ;
  - une règle sans en-tête se charge au démarrage, comme le `CLAUDE.md` ;
  - une règle dont l'en-tête YAML déclare `paths:` (liste de globs, relatifs à la racine du
    dépôt) se charge quand l'agent lit, crée ou modifie un fichier correspondant avec les
    outils Read, Write ou Edit, ou le lit par `cat` ou `head` dans Bash ;
  - après un `/compact`, une telle règle ne revient qu'au prochain fichier correspondant ;
  - les liens symboliques sont suivis dans `.claude/rules/` ;
  - la page ne dit pas si un import `@chemin` fonctionne dans une règle.
- Un `CLAUDE.md` dans un sous-dossier (`apps/api/CLAUDE.md`) se charge aussi à la demande, mais
  seulement pour les fichiers de ce sous-dossier : il ne peut pas viser `README.md` ou
  `changelog.txt`, à la racine.
- Les conventions génériques de `docs/` sont copiées telles quelles d'un projet à l'autre, et
  les skills du projet (`next-task`, `security-audit`) les citent par leur chemin.

## Décisions

- **D1 (2026-11-27) — Règles `.claude/rules/` plutôt que des `CLAUDE.md` de sous-dossier** :
  tout ce qui ne sert pas à chaque session devient une règle filtrée par `paths:`.
  - Raison : un glob vise aussi bien un paquet (`apps/api/**`) qu'un fichier de la racine
    (`changelog.txt`) ou un type de fichier (`**/package.json`), le tout dans un seul dossier.
  - Alternative écartée : un `CLAUDE.md` par paquet, qui ne couvre pas les fichiers de la racine.
- **D2 (2026-11-27) — Une règle par paquet** : `.claude/rules/api.md` (`apps/api/**`,
  `eslint.config.mjs`), `.claude/rules/web.md` (`apps/web/**`) et `.claude/rules/contracts.md`
  (`packages/contracts/**`) reprennent les sections d'architecture et les spécificités de TDD de
  leur paquet. Le « Serveur unique » va dans `api.md`.
- **D3 (2026-11-27) — Conventions génériques chargées par leurs fichiers** : chacune des quatre
  conventions qui portent sur des fichiers précis reçoit un en-tête `paths:` et un lien
  symbolique dans `.claude/rules/conventions/` :

  | Convention                          | `paths:`                                  |
  | ----------------------------------- | ----------------------------------------- |
  | `docs/readme.md`                    | `README.md`                               |
  | `docs/changelog.md`                 | `changelog.txt`                           |
  | `docs/roadmap-conventions.md`       | `docs/roadmap.md`, `docs/milestones/**`   |
  | `docs/project-docs-conventions.md`  | `docs/vision.md`, `docs/stack.md`, `**/package.json` |

  - Raisons : ces chemins sont ceux que la convention elle-même nomme, donc l'en-tête reste
    générique et le fichier se copie toujours tel quel ; il reste dans `docs/`, où les skills et
    les jalons le citent ; une seule source, sans copie à tenir à jour. `**/package.json` couvre
    l'ajout d'une dépendance, avant lequel `docs/stack.md` doit être lu.
  - Alternatives écartées : déplacer les fichiers dans `.claude/rules/`, ce qui casse les
    chemins cités par les skills et l'historique ; une règle qui renvoie au fichier de `docs/`
    par un import `@`, que la documentation ne garantit pas dans une règle ; une règle qui
    demande de lire le fichier, ce qui repose sur la discipline de l'agent.
  - Limite : sous Windows, Git écrit un lien symbolique comme un fichier texte tant que
    `core.symlinks` est faux (par défaut), et la règle ne se charge plus, sans erreur. Les deux
    postes de travail sont sous Linux (Fedora) ; à reprendre si un poste Windows arrive.
  - Point à vérifier en phase D : un lien symbolique vers un fichier du dépôt est bien suivi
    avec son `paths:` (la documentation ne restreint que les cibles hors du dépôt).
- **D4 (2026-11-27) — Spécificités du projet dans des règles de même chemin** : ce que le
  `CLAUDE.md` ajoute aujourd'hui sous chaque import (« Spécificités du projet ») va dans une
  règle du projet aux mêmes `paths:` que la convention : `.claude/rules/readme.md` (capture du
  Dashboard, lien Render), `.claude/rules/roadmap.md` (critères de validation, niveau de
  relecture par phase, Journal), `.claude/rules/release.md` (`changelog.txt`, `package.json`
  racine, `docs/roadmap.md` : fichiers qui portent la version). Les spécificités du CI, de
  Render et du scope `workflow` de `gh` vont dans `.claude/rules/ci.md` (`.github/**`,
  `render.yaml`).
- **D5 (2026-11-27) — `docs/tdd.md` et `docs/commits.md` restent importés** : ils servent à
  chaque modification de code et à chaque commit, et sont courts (6 303 caractères à eux deux).
  - Alternative écartée : un `paths:` sur les fichiers de code pour `tdd.md`, dont les globs
    (`**/*.{ts,tsx}`) dépendent du langage du projet et rendraient la convention moins
    générique.
- **D6 (2026-11-27) — `docs/gitflow.md` n'est plus importé** : aucune opération Git ne passe par
  un fichier, donc aucun `paths:` ne peut le charger. Le `CLAUDE.md` garde un résumé de ses
  « Règles pour un agent IA » (branche avant toute modification, confirmation explicite avant
  commit, push, pull request, merge, tag ou suppression de branche, ni rebase ni force push sur
  une branche partagée) et demande de lire `docs/gitflow.md` avant d'ouvrir ou de merger une
  pull request, de démarrer une release ou un hotfix.
  - Raison : 8 523 caractères chargés à chaque session pour des cycles qui servent une ou deux
    fois par jalon, alors que ses règles critiques tiennent en quelques lignes.
- **D7 (2026-11-27) — Contenu du `CLAUDE.md`** : projet, commandes, structure du dépôt, résumé
  du workflow Git (D6), relecture du code, vocabulaire technique, renvoi à `docs/vision.md`
  avant de proposer une fonctionnalité et à `docs/domain-model.md` avant de toucher à
  `apps/api`, et la liste des règles avec ce qui les charge. Cible : moins de 120 lignes.
- **D8 (2026-11-27) — Mention des règles dans les conventions génériques** : la formule « les
  spécificités d'un projet se documentent dans son `CLAUDE.md` » devient « dans ses instructions
  d'agent (`CLAUDE.md`, règles) ». Les conventions restent génériques.
- **D9 (2026-11-27) — Relecture de la phase C en standard** : documentation interne, donc
  relecture légère d'après `CLAUDE.md` ; mais une consigne perdue (confirmation avant commit,
  TDD) coûte cher. Point d'arrêt en fin de phase C : l'utilisateur relit le nouveau `CLAUDE.md`
  et la table de correspondance (phase D).

## Phase A — Règles par paquet ⬜ (relecture légère)

- [ ] `.claude/rules/api.md` : `paths:` `apps/api/**` et `eslint.config.mjs` ; reprend
      « Backend (`apps/api/`) », « Serveur unique », les tests d'`apps/api` (commande, couverture,
      spécificités de TDD) et la règle d'imports.
- [ ] `.claude/rules/web.md` : `paths:` `apps/web/**` ; reprend « Interface (`apps/web/`) »,
      les tests d'`apps/web` (projects `unit` et `dom`, builders, doubles de test, routes API),
      `agentRules: false` et `transpilePackages`.
- [ ] `.claude/rules/contracts.md` : `paths:` `packages/contracts/**` ; reprend « Contrat entre
      l'API et l'interface » et l'indépendance du paquet (Zod seul, ni React, ni Next, ni Faker).
- [ ] `CLAUDE.md` : sections déplacées retirées dans le même commit, sans doublon.

## Phase B — Conventions chargées par leurs fichiers ⬜ (relecture légère)

- [ ] `docs/readme.md`, `docs/changelog.md`, `docs/roadmap-conventions.md`,
      `docs/project-docs-conventions.md` : en-tête `paths:` (D3) et formule de D8.
- [ ] `.claude/rules/conventions/` : un lien symbolique relatif par convention.
- [ ] `.claude/rules/readme.md`, `roadmap.md`, `release.md`, `ci.md` : spécificités du projet
      (D4).
- [ ] `docs/gitflow.md`, `docs/commits.md`, `docs/tdd.md` : formule de D8.
- [ ] `CLAUDE.md` : imports et « Spécificités du projet » correspondants retirés.

## Phase C — `CLAUDE.md` réduit ⬜ (relecture standard)

- [ ] `CLAUDE.md` : contenu de D7, moins de 120 lignes ; résumé du workflow Git (D6) ; table
      des règles et de leurs `paths:`.

## Phase D — Vérification ⬜ (relecture légère)

- [ ] Table de correspondance, dans la pull request : chaque consigne de l'ancien `CLAUDE.md` et
      son nouvel emplacement (`CLAUDE.md`, règle, convention), aucune ligne orpheline.
- [ ] Chargement vérifié dans une session neuve, par l'utilisateur :
  - `/context all` ne liste plus que `CLAUDE.md`, `docs/tdd.md`, `docs/commits.md` et la
    mémoire ;
  - un hook `InstructionsLoaded` temporaire dans `.claude/settings.local.json` (non commité)
    journalise les règles chargées : lire un fichier d'`apps/api`, d'`apps/web`, de
    `packages/contracts`, `README.md`, `changelog.txt`, un jalon et un `package.json` charge la
    règle attendue, y compris par les liens symboliques (D3).
- [ ] Taille mesurée avant et après (lignes et caractères chargés au démarrage), notée au Bilan.

## Journal

- 2026-11-27 : plan rédigé.

## Workflow Git

- `docs:` pour ce plan (fichier du jalon, index de la roadmap : la piste quitte « Autres
  pistes » pour « En cours ») ;
- `docs:` pour les règles par paquet (phase A) ;
- `docs:` pour les conventions chargées par leurs fichiers et les règles du projet (phase B) ;
- `docs:` pour le `CLAUDE.md` réduit (phase C) ;
- `docs:` pour clore le jalon (phase D au Bilan).

Chaque commit déplace des consignes sans les dupliquer : ce qui entre dans une règle sort du
`CLAUDE.md` dans le même commit. Point d'arrêt de relecture en fin de phase C. Merge par pull
request une fois `checks` au vert. Aucun changement visible pour l'utilisateur : pas de release
pour ce jalon. Documentation seulement, hors des seuils de lignes.

## Critères d'acceptation

- `CLAUDE.md` sous 200 lignes (cible : 120), imports limités à `docs/tdd.md` et
  `docs/commits.md`.
- Toute consigne de l'ancien `CLAUDE.md` se retrouve dans la table de correspondance.
- Dans une session neuve, chaque règle se charge sur un fichier de ses `paths:` et pas au
  démarrage.
- `npm test`, `npm run lint`, `npm run typecheck` et `npm run build` sans erreur ; `checks` au
  vert sur la pull request.

## Bilan

<Rempli à la clôture.>
