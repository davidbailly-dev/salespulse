# TDD (Test Driven Development)

Règles d'écriture des tests et du code. Ce fichier est **générique** : il peut être copié tel quel
dans n'importe quel projet. Les spécificités d'un projet (outil de test, commande pour lancer un
seul fichier, emplacement des fixtures, parties du code pas encore outillées…) se documentent dans
ses instructions d'agent (`CLAUDE.md`, règles) ou son README, pas ici.

---

## Cycle rouge → vert → refactor

Tout changement de comportement suit ce cycle :

1. **Rouge** : écrire (ou modifier) d'abord le test qui décrit le comportement attendu, le lancer
   et vérifier qu'il échoue **pour la bonne raison** : une assertion qui échoue, pas une erreur
   d'import, de syntaxe ou de configuration.
2. **Vert** : écrire le minimum de code qui fait passer le test.
3. **Refactor** : nettoyer le code et les tests, la suite restant toujours au vert.

## Règles

- Une correction de bug commence par un test qui **reproduit le bug** et échoue.
- Le test et le code vont dans le **même commit** : chaque commit garde la suite au vert.
- La règle couvre tout le code : logique métier, points d'entrée (routes, contrôleurs,
  commandes), générateurs de données, composants d'interface.
- **Hors TDD** : les changements sans comportement (styles, libellés, documentation,
  configuration).

## Code difficile à tester

Quand une partie du code n'est pas encore outillée pour les tests (interface, framework,
entrées/sorties), on n'abandonne pas le TDD : on **extrait la logique dans une fonction pure**,
testée d'abord, et on garde la partie non testée aussi fine que possible (simple branchement de
la fonction pure).

## Pratiques de test

- **Colocalisation** : le fichier de test est à côté du code testé (`revenue.ts` et
  `revenue.test.ts`).
- **Fixtures par builders** : une fonction par type de donnée (`buildOrder(overrides)`…)
  fournit un objet valide par défaut, que chaque test surcharge avec les seuls champs qui
  l'intéressent. Les builders sont eux-mêmes testés contre le contrat des données (schéma,
  types), pour qu'une fixture ne puisse pas dériver du format réel.
- **Déterminisme** : dates fixes, aucun tirage aléatoire, aucune date courante non injectée
  (passer `now` en paramètre plutôt que d'appeler l'horloge dans la fonction testée).
- **Code aléatoire** (générateurs, données de démonstration avec seed) : tests d'**invariants**
  (respect du contrat des données, même seed = même résultat, bornes, cohérence entre champs),
  jamais de valeurs exactes qui casseraient au moindre changement de séquence.
- **Cas limites explicites** : liste vide, division par zéro, valeur sentinelle (`null` vs 0),
  bornes exactes des seuils (juste sous, pile au seuil), dates particulières (29 février,
  changement d'année).
- **Noms de tests** : une phrase qui décrit le comportement vérifié, et qui reste vraie quand on
  lit l'assertion.

## Règles pour un agent IA

- Lancer le test rouge et **montrer sa sortie** avant d'écrire le code de production.
- Ne jamais modifier un test existant pour le faire passer sans expliquer pourquoi le
  comportement attendu change.
- Lancer la suite complète avant de proposer un commit.
