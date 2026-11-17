# Conventions de roadmap

Règles de tenue du fichier `docs/roadmap.md` : un plan de travail découpé en **jalons**, écrit
avant le code et tenu à jour pendant le développement. Ce fichier est **générique** : il peut
être copié tel quel dans n'importe quel projet. Les spécificités d'un projet (commandes de
validation, autres fichiers où vit la version…) se documentent dans son `CLAUDE.md` ou son
README, pas ici.

---

## Structure du fichier roadmap

Dans cet ordre :

1. Titre `# Roadmap <projet>`.
2. Une phrase de présentation et la ligne `Version actuelle : **X.Y.Z**.`, mise à jour à chaque
   passage de version.
3. La légende : `⬜ à faire · 🔄 en cours · ✅ terminé`.
4. Les jalons en cours et terminés, **le plus récent en haut**, séparés par `---`.
5. Une section `## Jalons futurs` : liste à puces `⬜ **Nom** : description`, pour les pistes à
   valider et prioriser avant d'en faire un jalon détaillé.

Un jalon terminé n'est pas supprimé : il garde la trace des décisions et du bilan.

## Structure d'un jalon

| Section                 | Contenu                                                                    |
| ----------------------- | -------------------------------------------------------------------------- |
| Titre                   | `## Jalon <en cours \| terminé> — <nom> <🔄 \| ✅>`                         |
| Branche                 | `feature/<nom>` (depuis `develop`), puis « mergée dans `develop` » à la fin |
| `### Contexte`          | Le problème, ce qui l'a déclenché, l'objectif. Puis `Décisions :` : les choix tranchés et leur raison. |
| `### Phase X — <nom>`   | Une phase par lot cohérent, avec son état (⬜ 🔄 ✅) et des cases à cocher. Chaque case nomme le fichier concerné et le comportement attendu. |
| `### Workflow Git`      | Le découpage prévu des commits (type et périmètre de chacun).              |
| `### Critères de validation` | Les vérifications objectives qui disent que le jalon est terminé (commandes, comportements visibles). |
| `### Bilan`             | Rempli à la clôture : ce qui a été fait, chiffres (tests, couverture…), écarts avec le plan, découvertes en cours de route. |

Une phase optionnelle ou reportée le dit dans son titre (`⬜ (reprise dans le jalon …)`)
plutôt que de disparaître.

## Cycle de vie d'un jalon

1. **Planifier** : rédiger le jalon (état 🔄, phases ⬜), dans un commit `docs:` dédié, en
   premier commit de la branche.
2. **Développer** : cocher les cases et passer les phases à ✅ au fil des commits de travail.
3. **Clore** : passer le titre à « terminé ✅ », indiquer « mergée dans `develop` », remplir le
   Bilan, dans un commit `docs:` dédié, en dernier commit de la branche.
4. **Merger** la branche.

Une décision qui change en cours de route est corrigée dans le jalon (Contexte, Décisions) et
expliquée dans le Bilan, pas seulement dans un message de commit.

## Règles pour un agent IA

- Avant de démarrer un jalon, rédiger le plan dans la roadmap et le faire valider.
- Tenir les cases à cocher à jour dans les commits de travail, pas toutes à la fin.
- Dans le Bilan, rapporter fidèlement les écarts et les vérifications réellement faites.

## Modèle de jalon

```markdown
## Jalon en cours — <Nom> 🔄

Branche : `feature/<nom>` (depuis `develop`).

### Contexte

<Problème, déclencheur, objectif.>

Décisions :

- **<Sujet>** : <choix et raison>.

### Phase A — <Nom> ⬜

- [ ] `<fichier>` : <comportement attendu>.

### Workflow Git

Un `docs:` pour ce plan, <commits de travail>, puis un `docs:` pour clore le jalon.

### Critères de validation

- <Vérification objective>.

### Bilan

<Rempli à la clôture.>
```
