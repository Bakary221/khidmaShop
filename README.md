# KHIDMA SHOP

KHIDMA SHOP est une application e-commerce construite avec Next.js 14, TypeScript et Tailwind CSS.  
Le projet inclut une boutique client, un panier, un checkout, un espace profil/commandes, ainsi qu’un vrai dashboard admin pour gérer les produits, catégories, commandes et utilisateurs.

## Aperçu

- Boutique client moderne et mobile-first
- Catalogue avec filtres, recherche, catégories rapides et cartes produits
- Page détail produit avec galerie, sélection de taille/couleur et produits similaires
- Panier latéral et checkout simple
- Dashboard admin avec statistiques, gestion du catalogue et suivi des commandes
- Interface bilingue de fait principalement en français
- Données de démonstration intégrées pour tester l’application sans backend

## Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Zustand
- TanStack Query
- Framer Motion
- Lucide React
- jsPDF

## Fonctionnalités

### Côté client

- Accueil avec hero visuel
- Catalogue produits avec recherche, catégories et marques
- Fiche produit détaillée avec galerie
- Ajout au panier avec toast de confirmation
- Panier en drawer
- Checkout avec géolocalisation
- Historique des commandes
- Profil utilisateur

### Côté admin

- Connexion administrateur
- Tableau de bord avec statistiques
- Gestion des produits
- Gestion des catégories
- Gestion des commandes
- Gestion des utilisateurs
- Détail commande avec facture et partage WhatsApp de la géolocalisation

## Structure principale

- [`app/(public)`](app/(public)) - pages client
- [`app/(admin)`](app/(admin)) - pages admin
- [`components`](components) - composants UI, layout et e-commerce
- [`services`](services) - logique de données simulées
- [`stores`](stores) - stores Zustand
- [`hooks`](hooks) - hooks utilitaires
- [`utils`](utils) - helpers partagés
- [`types`](types) - types TypeScript
- [`public/assets`](public/assets) - images locales utilisées dans l’interface

## Routes importantes

### Public

- `/` - accueil
- `/products` - catalogue
- `/products/[id]` - détail produit
- `/cart` - panier
- `/checkout` - commande
- `/orders` - commandes client
- `/profile` - profil
- `/auth` - connexion client

### Admin

- `/admin` - connexion admin
- `/admin/dashboard` - tableau de bord
- `/admin/products` - gestion produits
- `/admin/categories` - gestion catégories
- `/admin/orders` - gestion commandes
- `/admin/users` - gestion utilisateurs

## Compte de démonstration

### Admin

- Login: `admin@khidma.shop`
- Mot de passe: `khidma123`

### Client

- Se connecter depuis `/auth`
- OTP de démonstration: `123456`

## Installation

```bash
npm install
```

## Lancer le projet

```bash
npm run dev
```

Puis ouvre:

```bash
http://localhost:3000
```

## Scripts

- `npm run dev` - lancer en mode développement
- `npm run build` - générer la version de production
- `npm run start` - démarrer la version de production
- `npm run lint` - lancer ESLint
- `npm run zip` - créer une archive du projet

## Données et persistance

- Les données sont simulées localement pour le prototype.
- Les produits et certaines préférences sont persistés côté navigateur via `localStorage`.
- Les comptes de démonstration utilisent des cookies pour la session.

## Images

Le projet utilise des images locales dans `public/assets` pour éviter de dépendre d’un service externe.

## Notes de développement

- Le middleware protège les routes `/admin`
- Le panier s’ouvre en drawer sur le site public
- Les écrans admin ont été pensés pour rester utilisables sur mobile et tablette

## Export ZIP

```bash
npm run zip
```
