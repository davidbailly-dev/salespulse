# Conventions de commit

Format et découpage des commits. Ce fichier est **générique** : il peut être copié tel quel dans
n'importe quel projet. Les spécificités d'un projet (fichiers de version, hooks de commit…) se
documentent dans ses instructions d'agent (`CLAUDE.md`, règles) ou son README, pas ici.

---

## Format

Messages au format [Conventional Commits](https://www.conventionalcommits.org/fr/) :

```
<type>: <description>
```

- **En français**, description au **présent de l'indicatif, 3ᵉ personne** : le message complète
  « ce commit… » (`ajoute`, `corrige`, `met à jour`, `passe la version à`).
- Première lettre en minuscule, pas de point final.
- Une seule ligne quand elle suffit ; sinon une ligne vide puis un corps qui explique le
  **pourquoi** (le quoi se lit dans le diff).
- Pas de portée `type(scope):` par défaut : la description nomme ce qui change.

Exemples :

```
feat: ajoute l'export CSV de la liste des commandes
fix: corrige l'arrondi des montants négatifs
test: couvre le calcul des remises
docs: planifie le jalon d'authentification
chore: passe la version à 1.4.0
```

## Types

| Type       | Usage                                                                  |
| ---------- | ---------------------------------------------------------------------- |
| `feat`     | Nouvelle fonctionnalité visible ou nouveau comportement.               |
| `fix`      | Correction d'un comportement incorrect.                                |
| `refactor` | Restructuration sans changement de comportement.                       |
| `test`     | Ajout ou correction de tests seuls, sans changement du code testé.     |
| `docs`     | Documentation, plans, roadmap.                                         |
| `chore`    | Outillage, dépendances, configuration, passage de version.             |
| `perf`     | Amélioration de performance sans changement de comportement.           |
| `style`    | Mise en forme du code (indentation, espaces), sans effet sur l'exécution. |
| `ci`       | Configuration de l'intégration continue.                               |
| `build`    | Système de build et empaquetage.                                       |

Un changement incompatible le signale par un `!` après le type (`feat!: …`) et un corps qui
décrit la migration.

## Granularité

- **Un commit = un changement cohérent**, compréhensible et réversible seul. Un commit qui
  mélange deux sujets se découpe.
- **Chaque commit garde la suite de tests au vert** : un test et le code qu'il couvre vont dans
  le même commit.
- Le **passage de version** se fait dans un commit dédié (`chore: passe la version à X.Y.Z`).
- Un travail planifié (jalon, roadmap) commence par un commit `docs:` qui écrit le plan et se
  termine par un commit `docs:` qui le clôt.

## Règles pour un agent IA

- Vérifier `git status` et le diff indexé avant de rédiger le message.
- Proposer le message de commit et attendre une confirmation explicite avant de commiter.
- Ne jamais indexer en bloc (`git add -A`) sans avoir vérifié la liste des fichiers modifiés.
