# UM5 Notes Calculator - Chrome Extension

Cette extension Chrome calcule automatiquement la moyenne générale et les moyennes par semestre pour les étudiants de l'Université Mohammed V de Rabat.

## 🎯 Fonctionnalités

- **Calcul automatique de la moyenne générale** : Inclut tous les modules (validés et non validés)
- **Moyennes par semestre** : Calcul séparé pour le semestre 1 et 2
- **Logique de validation** : Prend en compte les statuts "Validé", "Rattrapage", "Non Validé", "Ajourné", "Admis"
- **Affichage coloré** : Interface verte distinctive pour identifier les résultats de l'extension
- **Détails complets** : Liste de tous les modules avec leurs notes finales

## 📋 Logic de Calcul

L'extension suit cette logique pour déterminer la note finale de chaque module :

1. **Validé en Session 1** → Utilise la note de la Session 1
2. **Rattrapage + Validé en Session 2** → Utilise la note de la Session 2
3. **Rattrapage + Non Validé en Session 2** → Utilise la note de la Session 2 (inclus dans le calcul)
4. **Ajourné + Admis en Session 2** → Utilise la note de la Session 2
5. **Tous les autres cas** → Utilise la note appropriée selon le contexte

## 🚀 Installation

1. Téléchargez tous les fichiers de l'extension
2. Ouvrez Chrome et allez à `chrome://extensions/`
3. Activez le "Mode développeur" en haut à droite
4. Cliquez sur "Charger l'extension non empaquetée"
5. Sélectionnez le dossier contenant les fichiers de l'extension

## 📖 Utilisation

1. Naviguez vers votre page de notes sur le portail étudiant UM5
2. L'extension détectera automatiquement la page et calculera vos moyennes
3. Les résultats apparaîtront dans un encadré vert distinctif après le tableau de notes
4. Cliquez sur "Voir les détails" pour afficher la liste complète des modules

## 📁 Structure des Fichiers

```
chrome-extension/
├── manifest.json          # Configuration de l'extension
├── content.js            # Script principal de calcul
├── styles.css            # Styles pour l'affichage
├── popup.html            # Interface popup
├── README.md             # Ce fichier
├── icon16.png            # Icône 16x16
├── icon48.png            # Icône 48x48
└── icon128.png           # Icône 128x128
```

## 🔧 Développement

Pour modifier l'extension :

1. Éditez les fichiers selon vos besoins
2. Rechargez l'extension dans `chrome://extensions/`
3. Actualisez la page de notes pour voir les changements

## 📊 Exemple d'Affichage

L'extension affiche :
- Moyenne Générale (tous les modules inclus)
- Moyenne Semestre 1
- Moyenne Semestre 2
- Nombre de modules validés/non validés
- Liste détaillée de tous les modules avec leurs notes finales

## ⚠️ Notes Importantes

- L'extension inclut **tous** les modules dans le calcul de la moyenne générale, même ceux marqués "Non Validé"
- Les moyennes sont calculées avec une précision de 2 décimales
- L'extension fonctionne uniquement sur les pages contenant un tableau de notes au format UM5

## 🤝 Support

Pour toute question ou problème, contactez le développeur ou créez une issue sur le repository du projet.

---

**Version :** 1.0  
**Développé pour :** Université Mohammed V de Rabat  
**Compatible avec :** Chrome, Edge, et autres navigateurs basés sur Chromium
