# Vision

Ce que SalesPulse est, pour qui, et ce qu'il ne fait pas. Ce fichier décrit le produit, pas son
implémentation : aucune bibliothèque n'y est nommée. Les outils qui répondent aux principes
ci-dessous sont dans `docs/stack.md`. Règles de tenue : `docs/project-docs-conventions.md`.

> **Transition en cours** : ce fichier décrit le produit visé, un service en ligne
> multi-commerçant. L'implémentation actuelle n'en est qu'une partie : un tableau de bord
> alimenté par des données de démonstration, sans comptes ni synchronisation. Les jalons qui
> mènent de l'un à l'autre sont dans `docs/roadmap.md`.

## Problème

Un commerçant qui vend en ligne par plusieurs boutiques a ses chiffres éparpillés : chaque
boutique a son back-office, ses rapports et sa façon de compter les ventes, les produits et
les clients. Pour savoir si l'activité va bien, il doit rassembler et interpréter ces données
lui-même, boutique par boutique, sans repère pour dire si un chiffre est bon ou mauvais.

Quand plusieurs personnes suivent l'activité, chacune refait ce travail de son côté, ou attend
qu'on lui envoie les chiffres.

## Utilisateurs

- **Le gérant** veut savoir en un coup d'œil si l'activité va bien : chiffre d'affaires,
  commandes, évolution par rapport à l'an dernier. Il consulte rapidement et n'a pas besoin du
  détail.
- **L'analyste** veut comprendre pourquoi un chiffre bouge : il compare des périodes, isole une
  boutique, descend dans le détail des ventes, des produits, des clients et du trafic.
- **L'administrateur du compte** met le produit en service pour son entreprise : il crée le
  compte, connecte les boutiques, invite les personnes qui consultent les chiffres et gère
  l'abonnement. Il veut que le branchement soit rapide, puis ne plus avoir à s'en occuper.
  C'est souvent le gérant lui-même, mais le besoin est distinct.
- **Le visiteur** découvre le produit avant de s'inscrire : il veut voir un tableau de bord
  rempli, sans créer de compte ni connecter de boutique.

Tous consultent le produit aussi bien depuis un téléphone que depuis un ordinateur.

## Proposition de valeur

SalesPulse est un service en ligne, sur abonnement, qui réunit toutes les boutiques d'un
commerçant dans un seul tableau de bord. Le commerçant connecte ses boutiques en quelques
minutes, puis leurs ventes sont synchronisées régulièrement, sans export manuel.

Le tableau de bord montre l'état de l'activité en un coup d'œil et permet d'en comprendre les
causes en descendant dans le détail. Dès le premier jour, chaque indicateur peut se comparer à la
même période un an plus tôt, avec une lecture immédiate de ce qui est bon ou mauvais. Toute
l'équipe du commerçant consulte les mêmes chiffres.

Le produit **observe et analyse** : il aide à décider, il n'agit pas à la place du commerçant.

## Non-objectifs

Ce que le produit ne fait pas, parce que cela changerait sa nature.

- **Gestion opérationnelle** : traiter une commande, modifier un prix, un stock ou un produit.
  Le produit est en lecture seule. Ses accès aux boutiques ne servent qu'à lire leurs données,
  il n'écrit jamais dans une boutique. Agir relève des outils de gestion de la boutique.
- **Temps réel** : les chiffres sont ceux de la dernière synchronisation, faite à intervalle
  régulier ou à la demande, pas un flux en direct. Le produit aide à comprendre une tendance,
  pas à surveiller la minute en cours.
- **Dashboard personnalisable** : les pages et les indicateurs sont choisis par le produit.
  L'utilisateur filtre (boutique, période, comparaison), il ne compose pas son tableau de bord.
- **Multilingue** : le produit est en français. Une seule langue évite de traduire chaque
  libellé et chaque explication d'indicateur, pour un public visé francophone.
- **Accès restreint par boutique** : les rôles d'une organisation décident de ce qu'un membre
  peut gérer, pas de ce qu'il voit. Tout membre voit toutes les boutiques de l'organisation.
  Restreindre la visibilité toucherait chaque filtre et chaque calcul, pour un besoin rare chez
  le commerçant visé.
- **Fichier client nominatif** : le produit n'affiche ni ne conserve le nom, l'e-mail ou
  l'adresse des clients des boutiques. Il analyse des comportements d'achat, pas des personnes.
  La relation client relève des outils de la boutique.

## Contraintes et principes techniques

Les exigences durables qui orientent les choix. Chaque principe porte un identifiant, repris par
`docs/stack.md`.

### Produit et données

- **P1 — Démonstration intégrée** : le produit se découvre sans compte ni boutique. Une
  organisation de démonstration, alimentée par une boutique fictive, s'ouvre en un clic, en
  lecture seule. La boutique fictive passe par la même chaîne de synchronisation que les vraies
  boutiques, si bien que la démonstration exerce tout le produit. En local, le produit se lance
  avec une base de données locale, sans compte chez un service tiers.
- **P2 — Une plateforme se branche sans toucher au reste** : chaque plateforme de boutique en
  ligne a un connecteur dédié, qui traduit ses données vers un modèle commun de commandes, de
  produits et de clients. Ajouter une plateforme ne change ni les calculs, ni l'API, ni
  l'interface.
- **P3 — Données de démonstration crédibles et reproductibles** : la boutique fictive produit
  des données réalistes, assez riches pour exercer tous les indicateurs, et identiques d'un
  lancement à l'autre. Deux personnes qui ouvrent la démonstration voient les mêmes chiffres.
- **P4 — Contrat de données vérifié aux frontières** : le format des données est défini une seule
  fois et vérifié à chaque passage, de la plateforme vers le modèle commun, de l'interface vers
  le serveur et du serveur vers l'interface. Une dérive est détectée là où elle apparaît.
- **P5 — État de l'interface partagé par lien** : boutique, période et comparaison sont dans
  l'adresse. Copier le lien, recharger la page ou revenir en arrière retrouve la même vue, et le
  choix suit l'utilisateur de page en page.
- **P6 — Calculs vérifiables, faits par le serveur** : chaque indicateur est une règle de calcul
  isolée de l'affichage, exécutée par le serveur et testée avant d'être écrite. L'interface
  affiche des résultats, elle ne recalcule pas, et le volume de données d'un commerçant ne pèse
  pas sur le navigateur. Un chiffre faux est un défaut du produit, pas un détail.
- **P7 — Un seul vocabulaire de types** : la même description des données sert aux connecteurs,
  au serveur, aux calculs et à l'interface, sans duplication ni conversion manuelle.

### Interface

- **P8 — Interface sobre et cohérente** : thème sombre unique, composants réutilisés d'une page
  à l'autre, lecture des évolutions identique partout (vert, rouge, gris selon la nature de
  l'indicateur).
- **P9 — Français et euros** : libellés, dates et montants suivent les usages français, et les
  indicateurs s'expriment en euros. Chaque montant est conservé avec sa devise, pour que
  d'autres devises puissent s'ajouter sans reprendre les données. Tant que la conversion entre
  devises n'existe pas, une boutique qui ne vend pas en euros ne peut pas être connectée.
- **P10 — Bureau et mobile** : chaque page reste utilisable sur un téléphone comme sur un grand
  écran, pour tous les utilisateurs.

### Comptes et synchronisation

- **P11 — Isolation des commerçants** : chaque donnée appartient à une organisation. Aucune
  requête ne peut lire ou modifier les données d'une autre organisation. L'isolation est
  vérifiée par des tests, pas seulement supposée.
- **P12 — Accès authentifié et rôles** : les données d'une organisation ne sont accessibles
  qu'à ses membres connectés, par e-mail vérifié et mot de passe. Trois rôles :
  **propriétaire** (organisation, membres, abonnement), **administrateur** (boutiques et
  synchronisations) et **lecteur** (consultation). Seule exception : l'organisation de
  démonstration, ouverte à tous en lecture.
- **P13 — Fraîcheur visible** : les boutiques se synchronisent automatiquement à intervalle
  régulier, et un administrateur peut relancer une synchronisation à la demande. La date de la
  dernière synchronisation réussie est affichée, et un échec est signalé : des chiffres périmés
  ne passent jamais pour des chiffres à jour.
- **P14 — Historique dès le branchement** : l'import initial d'une boutique couvre tout
  l'historique consultable et l'année qui le précède, pour que la comparaison à l'an dernier
  fonctionne dès le premier jour.

### Confiance et conformité

- **P15 — Pseudonymisation des clients finaux** : un client est reconnu d'une commande à l'autre,
  et d'une boutique à l'autre, par un identifiant et une empreinte de son e-mail, jamais par son
  nom ou son e-mail en clair. Sa localisation n'est conservée qu'au niveau dont un indicateur a
  besoin (pays, ville).
- **P16 — Secrets protégés** : les identifiants d'accès aux boutiques sont chiffrés, jamais
  renvoyés à l'interface ni écrits dans les journaux, et limités à la lecture quand la
  plateforme le permet. Les mots de passe des utilisateurs ne sont jamais conservés en clair.
- **P17 — Hébergement dans l'Union européenne** : les données et leurs traitements restent dans
  l'Union européenne.
- **P18 — Traçabilité** : les actions sensibles sont inscrites dans un journal d'audit
  (connexions, ajout ou retrait d'une boutique, changement de membre ou de rôle,
  synchronisations, changement d'abonnement), pour retracer qui a fait quoi et quand.
- **P19 — Abonnement sans perte brutale** : un essai gratuit précède l'abonnement payant. À la fin
  de l'essai ou en cas d'impayé, le tableau de bord reste consultable mais la synchronisation est
  suspendue. À la résiliation ou à la suppression d'une organisation, toutes ses données sont
  effacées au terme d'un délai annoncé.
- **P20 — Protection contre les abus** : chaque point d'accès public ou coûteux (connexion,
  inscription, réinitialisation du mot de passe, démonstration, synchronisation) est limité en
  fréquence. L'inscription résiste aux robots sans dépendre d'un service tiers, et ne révèle pas
  si une adresse a déjà un compte. Des quotas encadrent les comptes en essai, pour qu'aucun
  compte ne puisse épuiser les ressources communes.
- **P21 — Défauts détectés avant l'utilisateur** : chaque changement est vérifié
  automatiquement avant d'être mis en ligne, et une version qui échoue à ces vérifications
  n'est pas déployée. Une erreur en production remonte automatiquement au développeur, avec son
  contexte, sans attendre qu'un utilisateur la signale. Données personnelles et secrets n'en
  font jamais partie.
