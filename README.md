# UM5 Notes Calculator - Chrome Extension

Cette extension Chrome calcule automatiquement la moyenne générale et les moyennes par semestre pour les étudiants de l'Université Mohammed V de Rabat. La version 2.0 introduit des fonctionnalités avancées d'optimisation pour validation des modules.

## 🎯 Fonctionnalités

### Fonctionnalités de base
- **Calcul automatique de la moyenne générale** : Inclut tous les modules (validés et non validés)
- **Moyennes par semestre** : Calcul séparé pour chaque semestre
- **Affichage du statut étudiant** : Détermine automatiquement si l'étudiant est "Admis" ou "Ajourné"
- **Logique de validation complète** : Prend en compte les statuts "Validé", "Rattrapage", "Non Validé", "Ajourné", "Admis"
- **Interface utilisateur intuitive** : Affichage clair des résultats avec code couleur pour faciliter la lecture
- **Surlignage des notes dans le tableau original** : Mise en évidence des notes utilisées pour le calcul

### Fonctionnalités avancées (Version 2.0)
- **Optimisation pour validation** : Calcul précis des points nécessaires pour valider un module non validé
- **Distribution ultra-équilibrée des points** : Répartition intelligente et équitable des points entre les éléments de module
- **Multi-stratégies adaptatives** : Différentes approches d'optimisation sélectionnées automatiquement selon le contexte
- **Indicateurs d'optimisation avancés** : Affichage des points à ajouter à chaque élément pour validation
- **Analyse des coefficients** : Estimation mathématique des poids des éléments dans chaque module
- **Équité garantie** : Algorithmes avancés assurant que chaque élément reçoit une amélioration substantielle, même avec des coefficients très inégaux
- **Mode persistant** : L'état de l'extension est conservé entre les sessions de navigation
- **Compatibilité SPA** : Fonctionne avec les comportements dynamiques du portail étudiant

## 📋 Logic de Calcul

### Détermination des notes finales

L'extension suit cette logique pour déterminer la note finale de chaque module :

1. **Validé en Session 1** → Utilise la note de la Session 1
2. **Rattrapage + Validé en Session 2** → Utilise la note de la Session 2
3. **Rattrapage + Non Validé en Session 2** → Utilise la note de la Session 2 (inclus dans le calcul)
4. **Ajourné + Admis en Session 2** → Utilise la note de la Session 2
5. **Tous les autres cas** → Utilise la note appropriée selon le contexte

### Algorithme de validation des modules

Pour les modules non validés, l'extension calcule les points nécessaires pour atteindre la validation selon ces principes :

1. **Détection des modules non validés** : Identification des modules ayant une note inférieure à 12/20
2. **Analyse des éléments** : Examen de chaque élément du module pour déterminer sa contribution
3. **Estimation des coefficients** : Calcul intelligent des coefficients de chaque élément basé sur les notes existantes
4. **Calcul des points manquants** : Détermination du nombre exact de points nécessaires pour atteindre 12/20
5. **Distribution équitable** : Répartition des points entre les éléments selon plusieurs stratégies:
   - **Stratégie proportionnelle** : Distribution basée sur les coefficients estimés
   - **Stratégie équilibrée** : Garantie que chaque élément reçoit une amélioration substantielle
   - **Stratégie optimale** : Sélection automatique de la meilleure approche selon le contexte

### Critères de détermination du statut étudiant

L'extension détermine automatiquement si l'étudiant est "Admis" ou "Ajourné" selon ces critères :

1. **Moyenne générale ≥ 12/20** : Condition nécessaire pour être admis
2. **Modules non validés ≤ 25%** : Le nombre de modules non validés ne doit pas dépasser 1/4 du total

## 🚀 Installation

1. Téléchargez tous les fichiers de l'extension
2. Ouvrez Chrome et allez à `chrome://extensions/`
3. Activez le "Mode développeur" en haut à droite
4. Cliquez sur "Charger l'extension non empaquetée"
5. Sélectionnez le dossier contenant les fichiers de l'extension

## 📖 Utilisation

### Fonctionnalités de base
1. Naviguez vers votre page de notes sur le portail étudiant UM5
2. L'extension détectera automatiquement la page et calculera vos moyennes
3. Les résultats apparaîtront dans un encadré distinctif après le tableau de notes avec:
   - Moyenne générale colorée selon validation (vert ≥ 12, rouge < 12)
   - Moyennes par semestre colorées également selon validation
   - Nombre de modules validés et non validés
   - Statut global (Admis ou Ajourné)

### Fonctionnalités d'optimisation (Version 2.0)
1. Pour les modules non validés, l'extension affiche automatiquement:
   - Des indicateurs colorés à côté de chaque élément du module
   - Le nombre de points à ajouter à chaque élément pour valider le module
   - Une répartition optimisée et équitable des points nécessaires

### Contrôle de l'extension
1. Cliquez sur l'icône de l'extension dans la barre d'outils
2. Utilisez l'interrupteur pour activer/désactiver l'extension
3. L'état de l'extension est conservé entre les sessions de navigation

## 📁 Structure des Fichiers

```
note-etu-um5/
├── manifest.json          # Configuration de l'extension (v2.0)
├── content.js             # Script principal de calcul des moyennes
├── module-validation.js   # Algorithmes avancés d'optimisation pour validation
├── popup.js               # Logique de l'interface popup et contrôles
├── styles.css             # Styles pour l'affichage des moyennes
├── validation-styles.css  # Styles pour les indicateurs d'optimisation
├── popup.html             # Interface utilisateur du popup
├── README.md              # Documentation complète
├── INSTALLATION.md        # Guide d'installation détaillé
├── privacy-policy.md      # Politique de confidentialité
├── ALGORITHM_DOCUMENTATION.md # Documentation technique des algorithmes
├── icon.svg               # Icône source vectorielle
└── icons/                 # Icônes optimisées pour le Chrome Web Store
    ├── icon16.png         # Icône 16x16
    ├── icon48.png         # Icône 48x48
    └── icon128.png        # Icône 128x128
```

## 🔧 Développement

Pour modifier l'extension :

1. Éditez les fichiers selon vos besoins
2. Rechargez l'extension dans `chrome://extensions/`
3. Actualisez la page de notes pour voir les changements

## 📊 Exemple d'Affichage

### Panneau principal
L'extension affiche un panneau complet avec :
- **En-tête distinctif** avec le titre "Moyennes Calculées"
- **Moyenne Générale** affichée en grand format avec code couleur (vert/rouge)
- **Moyennes par semestre** pour chaque semestre détecté dans le relevé
- **Statistiques des modules** : nombre de validés, non validés et total
- **Statut étudiant** : "Admis" ou "Ajourné" avec explication des critères

### Tableau de notes amélioré
- **Surlignage des notes finales** utilisées pour le calcul (vert ≥ 12, rouge < 12)
- **Indicateurs d'optimisation** pour les éléments des modules non validés
- **Points manquants** affichés clairement pour chaque élément à améliorer

## 🔄 Mise à jour de l'extension

### Pour les utilisateurs de la version 1.0
Si vous utilisez déjà la version 1.0 de l'extension UM5 Notes Calculator :
1. La mise à jour sera automatique via le Chrome Web Store
2. Aucune action n'est requise de votre part
3. Les nouvelles fonctionnalités d'optimisation seront immédiatement disponibles

### Vérification de la version
1. Cliquez sur l'icône de l'extension dans la barre d'outils
2. La version actuelle est affichée en bas du popup (Version 2.0)
3. Si vous voyez encore la version 1.0, essayez de:
   - Redémarrer votre navigateur
   - Forcer une mise à jour dans la page des extensions (chrome://extensions/)

## ⚠️ Notes Importantes

- L'extension inclut **tous** les modules dans le calcul de la moyenne générale, même ceux marqués "Non Validé"
- Les moyennes sont calculées avec une précision de 2 décimales
- L'extension fonctionne uniquement sur les pages contenant un tableau de notes au format UM5
- Les algorithmes d'optimisation sont des **suggestions** et ne garantissent pas la validation officielle
- La version 2.0 introduit une analyse avancée des coefficients, mais ceux-ci restent des estimations
- L'extension fonctionne même si certains modules n'ont pas d'éléments détaillés
- Compatibilité garantie avec le nouveau format du portail étudiant UM5

## 🤝 Support

Pour toute question ou problème, contactez le développeur ou créez une issue sur le repository du projet.

---

**Version :** 2.0  
**Développé pour :** Université Mohammed V de Rabat  
**Compatible avec :** Chrome, Edge, et autres navigateurs basés sur Chromium
