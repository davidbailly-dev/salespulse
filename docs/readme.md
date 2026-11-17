# README

Règles de tenue du `README.md`. Ce fichier est **générique** : il peut être copié tel quel dans
n'importe quel projet. Les spécificités d'un projet (langue, captures d'écran, lien de démo…) se
documentent dans son `CLAUDE.md`, pas ici.

---

## Public

Le README s'adresse **uniquement à l'utilisateur** du projet : la personne qui veut comprendre ce
qu'il fait, l'installer, le lancer et s'en servir.

Il ne s'adresse ni aux contributeurs ni à l'agent IA. Ce qui les concerne vit ailleurs :

| Sujet                                              | Emplacement                       |
| -------------------------------------------------- | --------------------------------- |
| Architecture, conventions de code, workflow Git, TDD | `CLAUDE.md` et `docs/`          |
| Plan de travail, jalons                            | `docs/roadmap.md`, `docs/milestones/` |
| Historique des versions                            | `changelog.txt` (voir `docs/changelog.md`) |

## Contenu

Ce qu'on attend dans le README, dans cet ordre quand la section a lieu d'être :

1. Nom du projet et présentation en quelques phrases : ce qu'il fait, pour qui.
2. Capture d'écran ou lien de démo, s'il y en a.
3. Fonctionnalités : ce que l'utilisateur voit et peut faire (pages, écrans, commandes, options).
4. Prérequis : runtime et version, outils à installer.
5. Installation et démarrage : les commandes, copiables telles quelles.
6. Configuration utile à l'utilisateur : variables d'environnement, paramètres, fichiers.
7. Licence, s'il y en a une.

On décrit **ce que l'utilisateur voit et fait**, pas comment c'est implémenté.

## Quand le mettre à jour

| Mettre à jour le README                                  | Ne pas y toucher                             |
| -------------------------------------------------------- | -------------------------------------------- |
| Nouvelle fonctionnalité, page, écran ou commande visible | Refactor sans changement visible             |
| Changement d'un comportement décrit dans le README       | Ajout ou correction de tests                 |
| Fonctionnalité supprimée                                 | Optimisation invisible pour l'utilisateur    |
| Nouveau prérequis ou changement de version du runtime    | Documentation interne, roadmap, jalons       |
| Commande d'installation, de lancement ou option modifiée | Mise à jour de dépendances sans effet visible |
| Configuration ajoutée, renommée ou supprimée             | Outillage de développement (lint, CI, agent) |
| Lien de démo ou capture d'écran devenue fausse           |                                              |

La mise à jour se fait **sur la branche du changement, avant son merge** : dans le commit du
changement s'il reste petit, sinon dans un commit `docs:` dédié juste après.

## Style

- Même langue que l'interface du projet.
- Phrases courtes, orientées usage ; pas de jargon interne (noms de fichiers, de fonctions, de
  composants) sauf s'il sert à l'utilisateur (commande, paramètre d'URL, variable
  d'environnement).
- Les commandes données fonctionnent réellement : les vérifier quand on les modifie.
- Le README décrit l'état actuel, pas l'historique : « désormais », « nouveau », « depuis la
  v1.2 » vont dans le changelog.

## Règles pour un agent IA

- Après tout changement de comportement visible, vérifier si le README le décrit et le mettre à
  jour **sans attendre qu'on le demande**, en suivant le tableau ci-dessus.
- Avant de proposer le merge d'une branche (ou à la clôture d'un jalon), relire le README contre
  les changements de la branche.
- Signaler dans le compte rendu que le README a été mis à jour, ou qu'il n'avait pas besoin de
  l'être et pourquoi en cas de doute.
- Ne jamais y ajouter de contenu destiné aux contributeurs ou à l'agent : le placer dans
  `CLAUDE.md` ou `docs/`.
- Une capture d'écran devenue fausse se signale à l'utilisateur plutôt que d'être supprimée.
