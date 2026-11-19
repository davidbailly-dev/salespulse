# Jalon 008 — Intégration continue 🔄

Branche : `feature/continuous-integration` (depuis `develop`). Livré dans : —

## Objectif

Chaque changement est vérifié automatiquement par GitHub Actions (lint, types, tests, build)
avant d'entrer dans `develop` ou `main`. Les branches se mergent par pull request, et une pull
request dont les vérifications échouent ne peut pas être mergée. Render ne déploie `main` que si
ces vérifications sont passées.

## Contexte

- Aujourd'hui, Render déploie `main` à chaque commit, mais rien ne lance les tests
  automatiquement : une release part même si un test échoue (jalon 007, D23). Le principe P21 de
  `docs/vision.md` demande l'inverse : une version qui échoue aux vérifications n'est pas
  déployée.
- Les merges se font en local, puis on pousse. Un CI seul détecterait donc un échec une fois le
  merge fait dans `develop`. Le jalon 007 a laissé ouvert le choix entre une variante légère
  (pousser `feature/*`, attendre le vert, puis merger en local) et une variante complète (merge
  par pull request et protection de branche).
- Premier jalon de la suite « Backend, dans l'ordre » de `docs/roadmap.md`, sans prérequis : le
  Socle API en dépend, et y ajoutera une PostgreSQL de service.
- Le dépôt est public sur GitHub : Actions et protection de branche sont gratuits.

## Décisions

- **D1 (2026-11-19) — Variante complète** : les branches se mergent par pull request, avec une
  protection de branche qui exige le CI au vert sur `develop` et `main` — décision de
  l'utilisateur. Le modèle GitFlow ne change pas (mêmes branches, merge `--no-ff` via « Create a
  merge commit », tag sur le commit de merge dans `main`) : seul l'endroit du merge change.
  `docs/gitflow.md` est adapté.
- **D2 (2026-11-19) — Le CI lance aussi `npm run build`** : en plus de `npm ci`, `npm run lint`,
  `npm run typecheck` et `npm test` prévus par D23 — décision de l'utilisateur. Le build détecte
  les erreurs que seul `next build` voit (frontière serveur / client, pré-rendu), avant que
  Render n'échoue à déployer.
- **D3 (2026-11-19) — Déclencheurs** : `pull_request` vers `develop` et `main`, et `push` sur
  `develop` et `main` — la pull request vérifie le résultat du merge, le push sur `main` donne à
  Render le statut qu'il attend pour déployer. Pas de déclenchement sur chaque push de
  `feature/*` : il doublerait les exécutions d'une branche qui a sa pull request ; pour un retour
  précoce, on ouvre la pull request en brouillon.
- **D4 (2026-11-19) — Un seul job, `checks`** : une installation, puis les cinq étapes à la
  suite — un seul nom de vérification à rendre obligatoire, une installation au lieu de cinq.
  Paralléliser ne vaut pas la complexité tant que l'exécution reste de l'ordre de quelques
  minutes.
- **D5 (2026-11-19) — Configuration du workflow** : actions officielles `actions/checkout` et
  `actions/setup-node` seulement, épinglées sur leur version majeure ; Node lu dans
  `.node-version` (une seule source de vérité) ; cache npm de `setup-node` ;
  `permissions: contents: read` ; une exécution plus récente sur la même référence annule la
  précédente (`concurrency`) ; durée limitée (`timeout-minutes`).
- **D6 (2026-11-19) — Réglages du dépôt GitHub** :
  - merge commits seuls : squash et rebase désactivés, car ils effaceraient le `--no-ff` ;
  - suppression automatique des branches mergées **désactivée** : une `release/*` ou un
    `hotfix/*` se merge par deux pull requests (vers `main` puis vers `develop`), et la
    suppression après la première fermerait la seconde ; les branches se suppriment à la main
    une fois mergées partout, comme aujourd'hui ;
  - protection de `develop` et `main` : pull request obligatoire, vérification `checks` exigée,
    sans exiger que la branche soit à jour (le retour d'une release dans `develop` demanderait
    des merges supplémentaires, hors du modèle), aucune approbation exigée (développeur seul,
    on ne peut pas approuver sa propre pull request), ni force push ni suppression, sans
    contournement, administrateur compris.
- **D7 (2026-11-19) — Message de merge inchangé** : `gh pr merge --merge --subject "Merge branch
  'feature/xxx' into develop"` garde le message par défaut de git exigé par `docs/gitflow.md`,
  au lieu du `Merge pull request #N from …` de GitHub — l'historique reste homogène avec les
  merges passés.
- **D8 (2026-11-19) — `docs/gitflow.md` reste générique** : il décrit le merge par pull request
  et les réglages de dépôt nécessaires (D6), avec les commandes `gh` ; le nom de la vérification
  exigée et le réglage de Render sont propres au projet et vont dans `CLAUDE.md`.
- **D9 (2026-11-19) — Pas de release** : outillage et documentation interne, sans effet visible
  pour l'utilisateur (`docs/gitflow.md`) ; le jalon part avec la prochaine release qui en a un.
- **D10 (2026-11-19) — Hors périmètre** :
  - branche de base Neon par branche Git : il n'y a pas encore de base, l'option passe au Socle
    API ;
  - `npm audit` dans le CI : les 17 vulnérabilités relevées au jalon 006 le rendraient rouge
    d'emblée, elles relèvent d'un correctif séparé ;
  - Dependabot, badge de statut dans le README (le README ne parle pas de l'outillage :
    `docs/readme.md`).
- **D11 (2026-11-19) — Réglages GitHub faits par l'utilisateur** : l'utilisateur applique
  lui-même les réglages du dépôt et des protections (D6) dans l'interface de GitHub, guidé pas à
  pas ; l'agent ne les modifie pas et se limite à les relire avec `gh api` en lecture pour
  vérifier qu'ils correspondent à D6 — décision de l'utilisateur.

## Phase A — Workflow ✅

- [x] `.github/workflows/ci.yml` : déclencheurs (D3), job `checks` (D4) configuré selon D5,
      étapes `npm ci`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` (D2).
- [x] Même séquence lancée en local sur un clone propre de la branche : tout passe.
- [x] Branche poussée et pull request brouillon ouverte vers `develop` (sur confirmation) : le
      workflow passe au vert ; durée de l'exécution notée dans le Journal.

## Phase B — Réglages GitHub ✅

Réglages faits par l'utilisateur dans l'interface de GitHub, guidé pas à pas (D11), puis
relus par l'agent avec `gh api` en lecture ; le résultat est reporté dans le Journal.

- [x] Dépôt : merge commits seuls, suppression automatique des branches mergées désactivée
      (D6).
- [x] Protection de `develop` et de `main` selon D6, vérification `checks` exigée. Elle ne peut
      être choisie qu'après une première exécution du workflow (phase A).
- [x] Relecture par `gh api` : les réglages correspondent à D6.
- [x] Preuve du blocage : pull request jetable avec un test volontairement cassé, vers
      `develop` ; `checks` échoue et `gh pr merge` refuse le merge. Pull request fermée et
      branche jetable supprimée ensuite.

## Phase C — Render ⬜

- [ ] Auto-déploiement du service passé de *On Commit* à *After CI Checks Pass*, dans le back
      office Render (réglage hors dépôt, jalon 006 D9), par l'utilisateur. L'effet ne s'observe
      qu'au prochain push sur `main`, donc à la prochaine release (D9) : à vérifier à ce
      moment-là.

## Phase D — Documentation ⬜

- [ ] `docs/gitflow.md` : merge par pull request (D1, D8) ; cycles Feature, Release et Hotfix
      réécrits avec `gh pr create` et `gh pr merge --merge --subject …` (D7) ; une release ou
      un hotfix passe par deux pull requests ; tag posé après le merge dans `main`, puis poussé ;
      réglages de dépôt requis (D6) ; règles pour un agent IA (ouvrir ou merger une pull
      request seulement sur confirmation).
- [ ] `CLAUDE.md` : spécificités du workflow Git — vérification exigée `checks`, mêmes
      commandes que les critères de validation des jalons, Render en *After CI Checks Pass*.
- [ ] `docs/stack.md` : entrée GitHub Actions passée de « prévu » à « en place » ; entrée Render
      relue.
- [ ] `.claude/skills/next-task/SKILL.md` : la marche à suivre mentionne la pull request.
- [ ] `README.md` : relu, aucune modification attendue (outillage, `docs/readme.md`).

## Journal

- 2026-11-19 : plan rédigé, en attente de validation. Variante complète (D1) et build dans le CI
  (D2) choisis par l'utilisateur.
- 2026-11-19 : l'utilisateur fera lui-même les réglages GitHub de la phase B (D11).
- 2026-11-19 : workflow écrit, avec `actions/checkout@v7` et `actions/setup-node@v7` (dernières
  versions majeures publiées, v7.0.1 et v7.1.0). `cache: npm` est explicite : sans champ
  `packageManager` dans le `package.json`, le cache automatique de `setup-node` reste désactivé.
  `persist-credentials: false` sur le checkout, le job n'ayant pas à pousser.
- 2026-11-19 : séquence du workflow lancée sur un clone propre de la branche, Node 24.22.1 :
  `npm ci` (6 s), `npm run lint` (5 s), `npm run typecheck` (4 s), `npm test` (58 fichiers,
  620 tests, 2 s), `npm run build` (10 s), soit 27 s au total, sans erreur.
- 2026-11-19 : découverte : `npm audit` ne trouve plus aucune vulnérabilité, sur le clone comme
  dans le dépôt, alors que le jalon 006 en relevait 17 « high ». La raison donnée par D10 pour
  laisser `npm audit` hors du CI ne tient plus ; la question est soumise à l'utilisateur.
- 2026-11-19 : surprise : le premier push de la branche est refusé par GitHub (`refusing to
  allow an OAuth App to create or update workflow … without workflow scope`). Le remote est en
  HTTPS et git s'identifie avec le jeton de `gh`, qui n'avait pas le scope `workflow`, exigé
  pour tout push qui touche `.github/workflows/`. Corrigé par l'utilisateur avec
  `gh auth refresh -h github.com -s workflow`, puis push réussi.
- 2026-11-19 : pull request brouillon #1 ouverte vers `develop` par l'utilisateur ; `checks`
  passe au vert en 55 s : installation de Node 24.22.1 lue dans `.node-version` (5 s),
  `npm ci` (13 s), lint (5 s), typecheck (5 s), tests (58 fichiers, 4 s), build (14 s). Phase A
  terminée.
- 2026-11-19 : réglages GitHub faits par l'utilisateur (D11), relus avec `gh api` :
  - dépôt : `allow_merge_commit` vrai, `allow_squash_merge`, `allow_rebase_merge`,
    `delete_branch_on_merge`, `allow_update_branch` et `allow_auto_merge` faux ;
  - ruleset « develop et main » (actif, cible `refs/heads/develop` et `refs/heads/main`, aucun
    contournement, `current_user_can_bypass: never`) : `deletion`, `non_fast_forward`,
    `pull_request` (0 approbation, méthode `merge` seule), `required_status_checks` (`checks`
    de GitHub Actions, `strict` faux) ; pas d'historique linéaire.
  - Les rulesets ont été préférés à la protection de branche classique : un seul ensemble de
    règles pour les deux branches, et le choix des méthodes de merge y est possible.
  - Le ruleset limite déjà les merges vers `develop` et `main` à la méthode `merge` ; le
    réglage du dépôt est gardé en plus, comme prévu par D6, pour le cas où le ruleset serait
    modifié.
  - Option « Require an additional approval for unattributed Copilot pull requests » laissée
    cochée par défaut : sans effet avec 0 approbation exigée.
- 2026-11-19 : preuve du blocage. Branche jetable `feature/ci-blocking-probe` (depuis la branche
  du jalon, pour avoir le workflow) avec un test qui échoue (`expect(1).toBe(2)`), pull request
  #2 vers `develop` : `checks` échoue en 32 s à l'étape `npm test` seulement (1 test en échec,
  620 au vert), `mergeStateStatus` vaut `BLOCKED`, et `gh pr merge --merge` est refusé : « the
  base branch policy prohibits the merge ». Le message suggère `--admin`, non tenté : le ruleset
  n'a aucun contournement (`current_user_can_bypass: never`), et un essai réussi mettrait un
  test cassé dans `develop`.
- 2026-11-19 : pull request #2 fermée, branche jetable supprimée en local et sur `origin` par
  l'utilisateur ; vérifié : plus aucune branche `feature/ci-*`, test sonde absent de la branche
  du jalon. Phase B terminée.

## Workflow Git

Un `docs:` pour ce plan, un `ci:` pour le workflow (phase A), un `docs:` pour la documentation
(phase D), puis un `docs:` pour clore le jalon. Les phases B et C sont des réglages hors dépôt, faits
par l'utilisateur et tracés dans le Journal. La branche est la première mergée dans `develop` par pull request, avec
le message de D7 : ce merge vérifie le nouveau cycle de bout en bout.

## Critères d'acceptation

- `npm test`, `npm run lint`, `npm run typecheck` et `npm run build` sans erreur en local.
- Le workflow `checks` passe au vert sur la pull request de la branche.
- Sur la pull request jetable au test cassé, `checks` échoue et le merge est refusé.
- Les réglages lus par `gh api` (dépôt et protections de `develop` et `main`) correspondent à
  D6.
- L'utilisateur confirme le réglage *After CI Checks Pass* de Render.
- `docs/gitflow.md`, `CLAUDE.md` et `docs/stack.md` décrivent le merge par pull request et le CI ;
  plus aucune commande documentée ne merge `develop` ou `main` en local.

## Bilan

<Rempli à la clôture.>
