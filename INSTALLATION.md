# Guide d'Installation - UM5 Notes Calculator

## 📋 Prérequis

- Google Chrome ou un navigateur basé sur Chromium (Edge, Brave, etc.)
- Accès au portail étudiant UM5

## 🛠️ Installation

### Étape 1 : Télécharger l'extension

1. Téléchargez tous les fichiers de l'extension dans un dossier sur votre ordinateur
2. Assurez-vous que tous ces fichiers sont présents :
   - `manifest.json`
   - `content.js`
   - `styles.css`
   - `popup.html`
   - `README.md`
   - `icon.svg`

### Étape 2 : Activer le mode développeur

1. Ouvrez Google Chrome
2. Tapez `chrome://extensions/` dans la barre d'adresse
3. Activez le bouton **"Mode développeur"** en haut à droite de la page

### Étape 3 : Charger l'extension

1. Cliquez sur le bouton **"Charger l'extension non empaquetée"**
2. Sélectionnez le dossier contenant tous les fichiers de l'extension
3. Cliquez sur **"Sélectionner le dossier"**

### Étape 4 : Vérification

1. L'extension devrait maintenant apparaître dans votre liste d'extensions
2. Vous devriez voir l'icône de l'extension dans la barre d'outils de Chrome
3. Si l'icône n'est pas visible, cliquez sur l'icône de puzzle dans la barre d'outils et épinglez l'extension

## 🎯 Première Utilisation

1. **Connectez-vous** à votre compte étudiant UM5
2. **Naviguez** vers la page "Notes et résultats"
3. **Attendez** que la page se charge complètement
4. **Recherchez** l'encadré vert avec vos moyennes calculées qui apparaît automatiquement

## 🔍 Résolution des Problèmes

### L'extension ne se charge pas
- Vérifiez que tous les fichiers sont dans le même dossier
- Assurez-vous que le mode développeur est activé
- Essayez de recharger l'extension dans `chrome://extensions/`

### Les moyennes ne s'affichent pas
- Vérifiez que vous êtes sur la bonne page de notes
- Actualisez la page (F5)
- Ouvrez la console développeur (F12) pour voir s'il y a des erreurs

### L'extension ne fonctionne pas sur certaines pages
- L'extension est conçue spécifiquement pour les pages de notes UM5
- Assurez-vous que la page contient un tableau de notes

## 🔧 Mise à Jour de l'Extension

1. Remplacez les anciens fichiers par les nouveaux
2. Allez à `chrome://extensions/`
3. Cliquez sur l'icône de rechargement à côté de l'extension
4. Actualisez vos pages de notes ouvertes

## 📞 Support Technique

Si vous rencontrez des problèmes :

1. **Vérifiez la console** : Appuyez sur F12 et regardez l'onglet "Console" pour les erreurs
2. **Testez sur différentes pages** : Essayez sur différentes pages de notes
3. **Redémarrez le navigateur** : Fermez et rouvrez Chrome
4. **Réinstallez l'extension** : Supprimez et réinstallez l'extension

## ⚙️ Configuration Avancée

### Personnalisation des couleurs
Éditez le fichier `styles.css` pour changer l'apparence :
- Ligne 2 : `background: linear-gradient(135deg, #4CAF50, #45a049);` pour la couleur de fond
- Ligne 3 : `border: 3px solid #2E7D32;` pour la couleur de bordure

### Modification de la logique de calcul
Éditez le fichier `content.js` dans la fonction `calculateGeneralAverage()` pour changer la méthode de calcul.

---

**Note :** Cette extension est développée de manière indépendante et n'est pas officiellement affiliée à l'Université Mohammed V de Rabat.
