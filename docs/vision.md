# Vision

Ce que SalesPulse est, pour qui, et ce qu'il ne fait pas. Le fichier décrit le produit, pas son
implémentation : aucune bibliothèque n'y est nommée. Les outils qui répondent aux principes
ci-dessous sont dans `docs/stack.md`. Règles de tenue : `docs/project-docs-conventions.md`.

## Problème

Un commerçant qui vend en ligne par plusieurs boutiques dispose de ses chiffres éparpillés :
ventes, produits, clients, trafic. Pour savoir si l'activité va bien, il doit rassembler et
interpréter ces données lui-même, boutique par boutique, sans repère pour dire si un chiffre est
bon ou mauvais.

## Utilisateurs

- **Le gérant** veut savoir en un coup d'œil si l'activité va bien : chiffre d'affaires,
  commandes, évolution par rapport à l'an dernier. Il consulte rapidement et n'a pas besoin du
  détail.
- **L'analyste** veut comprendre pourquoi un chiffre bouge : il compare des périodes, isole une
  boutique, descend dans le détail des ventes, des produits, des clients et du trafic.

Les deux consultent le produit aussi bien depuis un téléphone que depuis un ordinateur.

## Proposition de valeur

SalesPulse est un seul tableau de bord pour toutes les boutiques d'un commerçant, qui montre l'état de
l'activité en un coup d'œil et permet d'en comprendre les causes en descendant dans le détail.
Chaque indicateur peut se comparer à la même période un an plus tôt, avec une lecture immédiate
de ce qui est bon ou mauvais. Le produit **observe et analyse** : il aide à décider, il n'agit
pas à la place du commerçant.

## Non-objectifs

Ce que le produit ne fait pas, parce que cela changerait sa nature.

- **Gestion opérationnelle** : traiter une commande, modifier un prix, un stock ou un produit.
  Le produit est en lecture seule : agir relève des outils de gestion de la boutique.
- **Multi-commerçant** : un seul commerçant, avec plusieurs boutiques. Pas de comptes
  distincts, pas de séparation des données entre clients du produit.
- **Temps réel** : les chiffres sont ceux d'une période écoulée, pas un flux en direct. Le
  produit aide à comprendre une tendance, pas à surveiller la minute en cours.
- **Dashboard personnalisable** : les pages et les indicateurs sont choisis par le produit.
  L'utilisateur filtre (boutique, période, comparaison), il ne compose pas son tableau de bord.
- **Multilingue et multi-devises** : le produit est en français et en euros. Un seul
  référentiel évite les conversions et les ambiguïtés de lecture.

## Contraintes et principes techniques

Les exigences durables qui orientent les choix. Chaque principe porte un identifiant, repris par
`docs/stack.md`.

- **P1 — Fonctionner sans service externe** : le produit tourne seul, avec des données de
  démonstration, sans base de données ni service à installer. Une démonstration se lance en deux
  commandes.
- **P2 — Backend branchable sans réécrire l'interface** : une vraie source de données se
  substitue aux données de démonstration en ne remplaçant que la couche d'accès aux données.
  L'interface, les calculs et les pages ne changent pas.
- **P3 — Données de démonstration crédibles et reproductibles** : les jeux de données sont
  réalistes, assez riches pour exercer tous les indicateurs, et identiques d'un lancement à
  l'autre. Deux personnes qui lancent le produit voient les mêmes chiffres.
- **P4 — Contrat de données vérifié aux frontières** : le format des données est défini une seule
  fois et vérifié à chaque passage entre la source et l'interface, pour qu'une dérive soit
  détectée là où elle apparaît.
- **P5 — État de l'interface partagé par lien** : boutique, période et comparaison sont dans
  l'adresse. Copier le lien, recharger la page ou revenir en arrière retrouve la même vue, et le
  choix suit l'utilisateur de page en page.
- **P6 — Calculs vérifiables** : chaque indicateur est une règle de calcul isolée de
  l'affichage, testée avant d'être écrite. Un chiffre faux est un défaut du produit, pas un
  détail.
- **P7 — Un seul vocabulaire de types** : la même description des données sert à la source, aux
  calculs et à l'interface, sans duplication ni conversion manuelle.
- **P8 — Interface sobre et cohérente** : thème sombre unique, composants réutilisés d'une page
  à l'autre, lecture des évolutions identique partout (vert, rouge, gris selon la nature de
  l'indicateur).
- **P9 — Français et euros** : libellés, dates et montants suivent les usages français.
- **P10 — Bureau et mobile** : chaque page reste utilisable sur un téléphone comme sur un grand
  écran, pour le gérant comme pour l'analyste.
