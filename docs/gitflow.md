# GitFlow

Règles de gestion des branches, des versions et des livraisons. Ce fichier est **générique** : il
peut être copié tel quel dans n'importe quel projet. Les spécificités d'un projet (fichiers qui
portent la version, CI, environnements…) se documentent dans son `CLAUDE.md` ou son README, pas
ici.

---

## Branches permanentes

| Branche   | Rôle                                                                    |
| --------- | ----------------------------------------------------------------------- |
| `main`    | Production. Chaque commit de merge correspond à une version taguée.     |
| `develop` | Intégration. Contient les fonctionnalités terminées de la prochaine version. |

**On ne commit jamais directement sur `main` ni sur `develop`** : elles n'évoluent que par des
merges de branches temporaires.

## Branches temporaires

| Type      | Nommage                | Part de   | Fusionnée dans                                   |
| --------- | ---------------------- | --------- | ------------------------------------------------ |
| Feature   | `feature/<kebab-case>` | `develop` | `develop`                                        |
| Release   | `release/X.Y.Z`        | `develop` | `main`, puis `develop`                           |
| Hotfix    | `hotfix/<kebab-case>`  | `main`    | `main`, puis `develop` (ou la `release/*` en cours) |

- Les noms de `feature/*` et `hotfix/*` décrivent le sujet (`feature/unit-tests`,
  `hotfix/default-date-preset`), en anglais et en kebab-case.
- Les noms de `release/*` portent le numéro de version, sans préfixe `v` (`release/1.4.0`).
- Toute modification du code, même minime, passe par une branche `feature/*` (ou `hotfix/*` pour
  un correctif urgent en production).

## Règles de merge

- Toujours `git merge --no-ff` : chaque branche laisse un commit de merge, l'historique garde la
  trace de ce qui a été livré ensemble.
- Message de merge par défaut de git (`Merge branch 'feature/xxx' into develop`,
  `Merge branch 'release/X.Y.Z'` sur `main`).
- Supprimer la branche locale une fois fusionnée partout (`git branch -d`).

## Versions et tags

- Numérotation [SemVer](https://semver.org/lang/fr/) `MAJEURE.MINEURE.CORRECTIF` :
  - correctif : corrections sans changement de comportement attendu ;
  - mineure : nouvelles fonctionnalités rétrocompatibles ;
  - majeure : changement incompatible.
- Le passage de version se fait dans un **commit dédié** sur la branche `release/*` ou `hotfix/*`
  (par exemple `chore: passe la version à X.Y.Z`). Les fichiers à modifier sont définis par le
  projet. Ce même commit ajoute l'entrée de la version au journal des modifications (voir
  `docs/changelog.md`).
- Une release n'est pas nécessaire pour des changements sans effet pour l'utilisateur
  (documentation interne, outillage, tests) : ils partent avec la prochaine release qui en a un.
- Un **tag annoté** `vX.Y.Z` est posé sur le commit de merge dans `main`, jamais ailleurs.

## Cycles pas à pas

Commandes git standard, sans l'outil `git-flow`.

### Feature

```bash
# démarrer
git switch develop
git pull
git switch -c feature/<nom>

# ... commits ...

# terminer
git switch develop
git pull
git merge --no-ff feature/<nom>
git branch -d feature/<nom>
git push origin develop
```

### Release

```bash
# démarrer
git switch develop
git pull
git switch -c release/X.Y.Z
# passer la version et compléter le changelog, puis commit dédié
# (ex. « chore: passe la version à X.Y.Z »)
# seuls des correctifs de stabilisation sont admis sur cette branche

# terminer
git switch main
git pull
git merge --no-ff release/X.Y.Z
git tag -a vX.Y.Z -m "vX.Y.Z"

git switch develop
git merge --no-ff release/X.Y.Z
git branch -d release/X.Y.Z

git push origin main develop --follow-tags
```

### Hotfix

```bash
# démarrer
git switch main
git pull
git switch -c hotfix/<nom>
# correctif + commit dédié de passage de version et de changelog (correctif X.Y.Z+1)

# terminer
git switch main
git merge --no-ff hotfix/<nom>
git tag -a vX.Y.Z -m "vX.Y.Z"

git switch develop          # ou la branche release/* en cours s'il y en a une
git merge --no-ff hotfix/<nom>
git branch -d hotfix/<nom>

git push origin main develop --follow-tags
```

## Règles pour un agent IA

- Vérifier la branche courante (`git status`) avant toute modification.
- Si elle est sur `main` ou `develop`, créer la branche `feature/*` (ou `hotfix/*`) **avant** de
  modifier le moindre fichier.
- Les opérations suivantes ne se font **que sur confirmation explicite** de l'utilisateur :
  commit, merge, création de tag, push, suppression de branche.
- Ne jamais réécrire l'historique d'une branche partagée (`rebase`, `reset`, `push --force` sur
  `main`, `develop` ou une branche déjà poussée).
