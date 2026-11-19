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
merges de branches temporaires, faits par pull request une fois l'intégration continue passée.
Le dépôt protège les deux branches pour que la règle ne repose pas sur la discipline (voir
« Réglages du dépôt »).

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

- Une branche entre dans `main` ou `develop` par une **pull request**, mergée seulement quand
  les vérifications de l'intégration continue sont au vert. On ne merge jamais `main` ni
  `develop` en local.
- Toujours un **commit de merge** (l'équivalent de `git merge --no-ff`) : méthode « Create a
  merge commit » de la pull request. Chaque branche laisse un commit de merge, l'historique
  garde la trace de ce qui a été livré ensemble.
- Message de merge par défaut de git (`Merge branch 'feature/xxx' into develop`,
  `Merge branch 'release/X.Y.Z'` sur `main`), sans corps, comme un `git merge`. Il est imposé au
  merge avec `--subject` et `--body ""` : sinon la plateforme écrit son propre message
  (`Merge pull request #N from …`) et ajoute le titre de la pull request en corps.
- Une `release/*` ou un `hotfix/*` se merge par **deux pull requests** : vers `main`, puis vers
  `develop` (ou la `release/*` en cours).
- Supprimer la branche, locale et distante, une fois fusionnée partout.

## Réglages du dépôt

Réglages de la plateforme d'hébergement que ce flux suppose :

- **Méthodes de merge** : commit de merge seul ; squash et rebase désactivés, car ils
  effaceraient le commit de merge.
- **Suppression automatique des branches mergées désactivée** : elle fermerait la seconde pull
  request d'une `release/*` ou d'un `hotfix/*` dès le merge de la première.
- **Protection de `main` et de `develop`** :
  - pull request obligatoire ;
  - vérifications de l'intégration continue exigées, sans exiger que la branche soit à jour
    avec sa cible (le retour d'une release ou d'un hotfix dans `develop` demanderait des merges
    supplémentaires, hors du modèle) ;
  - ni force push ni suppression ;
  - aucun contournement, administrateurs compris ;
  - nombre d'approbations au choix de l'équipe (0 pour un développeur seul, qui ne peut pas
    approuver sa propre pull request).

Le nom des vérifications exigées et les autres réglages propres au projet (déploiement,
environnements) se documentent dans son `CLAUDE.md` ou son README.

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

Commandes git standard et [GitHub CLI](https://cli.github.com/) (`gh`), sans l'outil
`git-flow`. Sur une autre plateforme, les étapes sont les mêmes avec son interface ou son
outil.

### Feature

```bash
# démarrer
git switch develop
git pull
git switch -c feature/<nom>

# ... commits ...

# proposer : pull request en brouillon, pour un retour précoce de l'intégration continue
git push -u origin feature/<nom>
gh pr create --draft --base develop --title "<titre>" --body "<description>"

# terminer, une fois les vérifications au vert
gh pr ready
gh pr merge --merge --subject "Merge branch 'feature/<nom>' into develop" --body ""
git switch develop
git pull
git branch -d feature/<nom>
git push origin --delete feature/<nom>
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
git push -u origin release/X.Y.Z

# terminer : première pull request, vers main, puis tag sur le commit de merge
gh pr create --base main --title "Release X.Y.Z" --body "<description>"
gh pr merge <numéro> --merge --subject "Merge branch 'release/X.Y.Z'" --body ""
git switch main
git pull
git tag -a vX.Y.Z -m "vX.Y.Z"
git push origin vX.Y.Z

# seconde pull request, vers develop
gh pr create --base develop --head release/X.Y.Z --title "Release X.Y.Z dans develop" \
    --body "<description>"
gh pr merge <numéro> --merge --subject "Merge branch 'release/X.Y.Z' into develop" --body ""
git switch develop
git pull
git branch -d release/X.Y.Z
git push origin --delete release/X.Y.Z
```

### Hotfix

```bash
# démarrer
git switch main
git pull
git switch -c hotfix/<nom>
# correctif + commit dédié de passage de version et de changelog (correctif X.Y.Z+1)
git push -u origin hotfix/<nom>

# terminer : première pull request, vers main, puis tag sur le commit de merge
gh pr create --base main --title "Hotfix X.Y.Z" --body "<description>"
gh pr merge <numéro> --merge --subject "Merge branch 'hotfix/<nom>'" --body ""
git switch main
git pull
git tag -a vX.Y.Z -m "vX.Y.Z"
git push origin vX.Y.Z

# seconde pull request, vers develop (ou la branche release/* en cours s'il y en a une)
gh pr create --base develop --head hotfix/<nom> --title "Hotfix X.Y.Z dans develop" \
    --body "<description>"
gh pr merge <numéro> --merge --subject "Merge branch 'hotfix/<nom>' into develop" --body ""
git switch develop
git pull
git branch -d hotfix/<nom>
git push origin --delete hotfix/<nom>
```

Le numéro de chaque pull request est affiché par `gh pr create` : le donner à `gh pr merge`
évite toute ambiguïté quand deux pull requests partent de la même branche.

## Règles pour un agent IA

- Vérifier la branche courante (`git status`) avant toute modification.
- Si elle est sur `main` ou `develop`, créer la branche `feature/*` (ou `hotfix/*`) **avant** de
  modifier le moindre fichier.
- Les opérations suivantes ne se font **que sur confirmation explicite** de l'utilisateur :
  commit, push, ouverture d'une pull request ou passage en « prête », merge, création de tag,
  suppression de branche.
- Ne jamais merger `main` ni `develop` en local, ni contourner une protection de branche
  (`gh pr merge --admin`), ni merger une pull request dont les vérifications ne sont pas au
  vert.
- Ne jamais réécrire l'historique d'une branche partagée (`rebase`, `reset`, `push --force` sur
  `main`, `develop` ou une branche déjà poussée).
