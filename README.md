# Captain Coach — site vitrine

Site vitrine statique pour **Tanor** (« Captain Coach »), préparateur physique multi-sports.

## Voir le site en local

Dans un terminal, à la racine du projet :

```powershell
npm start
```

Puis ouvrez **http://localhost:3000** dans le navigateur.

Sur téléphone (même Wi‑Fi) : `http://VOTRE_IP_LOCALE:3000` (ex. `http://172.16.12.43:3000`).

---

## Déployer en ligne (accessible à tous)

Le site est **100 % statique** (HTML, CSS, JS, images). Aucun serveur à gérer. Deux options gratuites :

### Option A — Netlify (recommandé, le plus simple)

1. Créez un compte sur [netlify.com](https://www.netlify.com/).
2. **Glisser-déposer** le dossier du projet sur [app.netlify.com/drop](https://app.netlify.com/drop).
3. Netlify vous donne une URL du type `https://random-name.netlify.app`.
4. Renommez le site dans **Site settings → Domain management** (ex. `captain-coach.netlify.app`).

**Mise à jour après déploiement :** remplacez `https://captain-coach.netlify.app` par votre vraie URL dans :

- `index.html` (balises `canonical`, `og:url`, `og:image`, `twitter:image`)
- `robots.txt` (ligne `Sitemap`)
- `sitemap.xml` (balise `loc`)

### Option B — GitHub + Netlify (mises à jour automatiques)

```powershell
cd "C:\Users\abdoulaye.seck\Desktop\captain coatch"
git init
git add .
git commit -m "Site vitrine Captain Coach"
git branch -M main
git remote add origin https://github.com/VOTRE_COMPTE/captain-coach.git
git push -u origin main
```

Puis sur Netlify : **Add new site → Import from Git** → choisissez le dépôt. Les paramètres sont déjà dans `netlify.toml` (dossier racine, pas de build).

### Option C — GitHub Pages

1. Poussez le code sur GitHub (commandes ci-dessus).
2. **Settings → Pages → Source :** branche `main`, dossier `/ (root)`.
3. URL : `https://VOTRE_COMPTE.github.io/captain-coach/`
4. Mettez à jour les URLs dans `index.html`, `robots.txt` et `sitemap.xml`.

---

## Nom de domaine personnalisé (optionnel)

Sur Netlify ou GitHub Pages, vous pouvez ajouter un domaine acheté (ex. `captaincoach.com`) dans les paramètres du site. Netlify configure le HTTPS automatiquement.

---

## Structure du projet

```
captain coatch/
├── index.html          # Page principale
├── styles.css          # Styles et couleurs
├── script.js           # Menu mobile, diaporama hero
├── favicon.svg         # Icône du site
├── images/             # Photos et logos
├── netlify.toml        # Config déploiement Netlify
├── robots.txt          # Référencement
├── sitemap.xml         # Plan du site
└── package.json        # Serveur local (npm start)
```

---

## Modifier les contacts

Dans `index.html`, section **Contact** (`id="contact"`) : WhatsApp, Instagram, TikTok et Facebook. Mettez à jour les `href` si les liens changent.

## Ajouter des photos

1. Copiez vos images dans le dossier **`images/`**.
2. Dans `index.html`, section **Galerie**, dupliquez un bloc existant :

```html
<figure class="gallery-item">
  <img src="images/votre-photo.jpg" alt="Description courte" loading="lazy" width="1200" height="900" />
  <figcaption>Votre légende</figcaption>
</figure>
```

Classes optionnelles : `gallery-item-tall` (portrait), `gallery-item-wide` (bandeau).

## Personnaliser le texte

Les blocs **À propos**, **Réalisations** et les légendes de la galerie sont modifiables dans `index.html`. Couleurs et mise en page : variables en tête de `styles.css` (`--accent`, `--bg`, etc.).
