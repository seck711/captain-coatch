# Mettre Captain Coatch en ligne (5 minutes)

## Méthode recommandée : Netlify (gratuit)

### Étape 1 — Ouvrir Netlify Drop
👉 https://app.netlify.com/drop

(Créez un compte gratuit si demandé : email + mot de passe.)

### Étape 2 — Envoyer le site
1. Ouvrez l’Explorateur Windows.
2. Allez dans : `C:\Users\abdoulaye.seck\Desktop\captain coatch`
3. **Glissez tout le dossier** `captain coatch` sur la page Netlify Drop (zone « Drag and drop »).

⚠️ Glissez le **dossier entier**, pas seulement `index.html`.

### Étape 3 — Récupérer votre lien
- Netlify affiche une URL du type : `https://something-random.netlify.app`
- Cliquez dessus → le site est **en ligne pour tout le monde**.

### Étape 4 — Nom plus joli (optionnel)
1. Sur Netlify : **Site configuration** → **Domain management**
2. **Options** → **Edit site name**
3. Tapez : `captain-coatch`
4. Votre lien devient : **https://captain-coatch.netlify.app**

### Étape 5 — Mettre à jour les liens SEO (si le nom change)
Si votre URL n’est pas `captain-coatch.netlify.app`, remplacez l’ancienne URL dans :
- `index.html` (lignes canonical, og:url, og:image)
- `robots.txt`
- `sitemap.xml`

Puis re-glissez le dossier sur Netlify pour redéployer.

---

## Partager le site
- WhatsApp, Instagram, TikTok : collez le lien Netlify
- Bio Instagram : mettez ce lien

---

## Modifier le site plus tard
1. Modifiez les fichiers sur votre PC.
2. Retournez sur https://app.netlify.com → votre site → **Deploys**
3. Glissez à nouveau le dossier `captain coatch` (ou utilisez Git si configuré).

---

## Besoin d’aide ?
- Le site ne s’affiche pas : vérifiez que le dossier `images/` est bien inclus.
- Photos manquantes : toutes les images doivent être dans `images/`.
