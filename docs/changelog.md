# Changelog

Règles de tenue du journal des modifications `changelog.txt`. Ce fichier est **générique** : il
peut être copié tel quel dans n'importe quel projet. Les spécificités d'un projet (fichiers qui
portent la version, langue…) se documentent dans son `CLAUDE.md`, pas ici.

---

## Public

Comme le README, le changelog s'adresse **à l'utilisateur** : il dit ce qui change pour lui d'une
version à l'autre. Ce n'est pas une copie du `git log` : le détail technique se lit dans
l'historique Git et dans les jalons (`docs/milestones/`).

## Fichier et format

`changelog.txt` à la racine du dépôt, en texte brut, lignes de 100 caractères au plus.

```
<Projet> — Journal des modifications

Les versions les plus récentes sont en haut. Chaque entrée décrit ce qui change pour
l'utilisateur.


Version X.Y.Z — AAAA-MM-JJ
--------------------------

Ajouté
- Nouvelle fonctionnalité, décrite par ce que l'utilisateur voit ou peut faire.

Modifié
- Comportement existant qui change.

Corrigé
- Bug corrigé, décrit par son symptôme côté utilisateur.
```

- Une entrée par version publiée, **la plus récente en haut**, séparée de la précédente par deux
  lignes vides.
- Titre `Version X.Y.Z — AAAA-MM-JJ`, souligné de tirets sur toute sa longueur. La date est celle
  de la release (le jour du merge dans `main` et du tag).
- Catégories, dans cet ordre, en ne gardant que celles qui ont du contenu : `Ajouté`, `Modifié`,
  `Corrigé`, `Supprimé`, `Sécurité`.
- Une puce par changement ; une ligne trop longue continue à la ligne suivante, indentée de deux
  espaces.
- Une version sans changement visible a une seule ligne : `Maintenance interne, sans changement
  visible.`
- Pas de section « Non publié » : le changelog ne bouge qu'aux releases.

## Quand le mettre à jour

**Avant chaque release**, sur la branche `release/X.Y.Z` (ou `hotfix/<nom>` pour un correctif),
dans le **commit de passage de version** (`chore: passe la version à X.Y.Z`) : l'entrée porte le
numéro de version, elle change avec lui.

Une entrée publiée n'est plus modifiée, sauf pour corriger une coquille.

## Comment rédiger une entrée

1. Lister ce qui a été livré depuis la dernière version :
   `git log --no-merges --format='%s' vPRÉCÉDENTE..HEAD`, et relire le Bilan des jalons livrés
   s'il y en a.
2. Trier :
   - `feat:` et `fix:` visibles → `Ajouté`, `Modifié`, `Corrigé` ou `Supprimé` ;
   - mise à jour de dépendances qui corrige une faille → `Sécurité` ;
   - nouveau prérequis (version du runtime, outil à installer) → `Modifié` ;
   - `test:`, `refactor:`, `docs:`, `chore:`, `ci:`, `build:` sans effet visible → ignorés.
3. Reformuler en langage utilisateur et **regrouper** : plusieurs commits d'une même
   fonctionnalité donnent une seule puce. Un bug introduit et corrigé dans la même version
   n'apparaît pas.

## Règles pour un agent IA

- À la préparation d'une release ou d'un hotfix, rédiger l'entrée et la soumettre à l'utilisateur
  **avec** le message du commit de passage de version, avant de commiter.
- Ne jamais réécrire les entrées des versions déjà publiées.
- En cas de doute sur la visibilité d'un changement, le mentionner à l'utilisateur plutôt que de
  l'omettre en silence.
