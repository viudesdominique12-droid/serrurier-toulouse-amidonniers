# Serrurier Toulouse Amidonniers — Site vitrine

Site vitrine one-page, rapide et optimisé pour la conversion (appel téléphonique) et le référencement local.

## Aperçu

```
serrurier amidonier/
├── index.html        # Toutes les sections + données structurées SEO (JSON-LD)
├── styles.css        # Design system (vert #86BFAA) + animations + responsive
├── script.js         # Animations au scroll, compteurs, menu mobile, formulaire
├── assets/
│   ├── favicon.svg
│   ├── logo.svg
│   └── og-image.svg  # Image de partage réseaux sociaux
└── README.md
```

Aucune dépendance, aucun build : le site fonctionne en ouvrant simplement `index.html`.

## Voir le site en local

Double-cliquez sur `index.html`, ou pour un rendu fidèle (polices, etc.) :

```bash
cd "serrurier amidonier"
npx serve .            # puis ouvrez l'URL affichée
# ou
python3 -m http.server 8080   # puis http://localhost:8080
```

## Mettre en ligne (gratuit)

Glissez le dossier sur **Netlify Drop** (app.netlify.com/drop) ou **Cloudflare Pages**.
Pour un nom de domaine type `serruriertoulouseamidonniers.fr`, achetez-le puis reliez-le à l'hébergeur.

## Contenu (issu du Google Business + visuels fournis)

- **Nom :** Serrurier Toulouse Amidonniers — **Quentin**
- **Tél :** 06 69 20 99 71 · **Email :** serruriertoulouseamidonniers@gmail.com
- **Dispo :** 24h/24, 7j/7 · intervention ~15 min · **à partir de 40 € TTC**
- **Services :** ouverture de porte, sécurisation, installation, réparation (portes, vitrages, volets roulants)
- **Signature :** déplacement **exclusivement à vélo** (rapide + écologique)
- **Zones :** Toulouse 31000, 31100, 31200, 31300, 31400, 31500

## À personnaliser quand vous le souhaitez

- **Avis Google** : la fiche est récente, je n'ai pas inventé de note. Quand vous aurez des avis, on peut ajouter une section « Avis clients » + l'étoile dans Google.
- **Photos réelles** (Quentin, interventions, vélo) : remplacent avantageusement les illustrations.
- **Adresse précise** : actuellement « Quartier des Amidonniers, 31000 ». À préciser si besoin.
- **Mentions légales** : à ajouter (SIRET, etc.) pour être 100 % conforme.
- **Domaine** : remplacez `serruriertoulouseamidonniers.fr` dans `index.html` (balises SEO) par le vrai domaine.
