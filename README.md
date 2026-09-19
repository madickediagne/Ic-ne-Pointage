# Icône Pointage

Application web de gestion du pointage du personnel — Icône Groupe Thiès

---

## Stack technique

| Couche | Technologie |
|---|---|
| Framework | Next.js 15 (App Router) |
| Langage | TypeScript |
| Design | Tailwind CSS |
| Auth | Auth.js v5 |
| ORM | Prisma |
| BDD | PostgreSQL (Neon) |
| Hébergement | Vercel |
| PWA | Service Worker + manifest.json |

---

## Installation en local

### 1. Cloner le projet
```bash
git clone https://github.com/votre-repo/icone-pointage.git
cd icone-pointage
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configurer les variables d'environnement
```bash
cp .env.example .env.local
# Remplir les valeurs dans .env.local
```

### 4. Configurer la base de données
```bash
npm run db:generate   # Générer le client Prisma
npm run db:migrate    # Créer les tables
npm run db:seed       # Insérer les données initiales
```

### 5. Lancer le serveur de développement
```bash
npm run dev
# → http://localhost:3000
```

---

## Commandes disponibles

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run start` | Démarrer en production |
| `npm run db:generate` | Générer le client Prisma |
| `npm run db:migrate` | Appliquer les migrations |
| `npm run db:push` | Push schema (sans migration) |
| `npm run db:seed` | Insérer les données initiales |
| `npm run db:studio` | Ouvrir Prisma Studio |

---

## Compte administrateur par défaut

Après `npm run db:seed` :

| Champ | Valeur |
|---|---|
| Matricule | `ICN001` |
| Mot de passe | `Admin@2026` *(à changer après la première connexion)* |
| Rôle | Super Administrateur |

---

## Déploiement (Vercel + Neon)

1. Créer un projet sur [neon.tech](https://neon.tech) → copier `DATABASE_URL`
2. Push le code sur GitHub
3. Importer le repo sur [vercel.com](https://vercel.com)
4. Ajouter les variables d'environnement dans Vercel
5. Deploy → URL automatique

---

## Architecture

```
src/
├── app/              # Pages et routes API (Next.js App Router)
│   ├── (auth)/       # Pages publiques (login)
│   ├── (employee)/   # Espace employé
│   ├── (admin)/      # Espace administration
│   └── api/          # Routes API REST
├── components/       # Composants React
├── lib/              # Logique métier
├── hooks/            # Hooks React
├── types/            # Types TypeScript
├── validations/      # Schémas Zod
└── config/           # Configuration globale
```

---

## Sécurité

- Mots de passe hashés avec bcrypt
- Sessions Auth.js avec cookies sécurisés HttpOnly
- Toutes les vérifications de pointage côté serveur
- GPS validé côté serveur (pas côté client uniquement)
- Limitation des tentatives de connexion
- Headers de sécurité HTTPS/CSP

---

*Version 1.0 — Icône Groupe Thiès*
