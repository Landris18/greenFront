# greenFront

Interface de GreenSI. Vite, React 19, TypeScript strict, MUI 7, TanStack Query, ApexCharts.

**Ce dépôt ne se lance pas seul.** L'orchestration de la pile complète vit dans
[`greenBack`](https://github.com/Landris18/greenBack), dont le `docker-compose.yml` construit cette
image depuis `../greenFront`. Les deux dépôts doivent donc être clonés côte à côte :

```bash
git clone https://github.com/Landris18/greenBack.git
git clone https://github.com/Landris18/greenFront.git
cd greenBack && ./scripts/initialiser.sh
```

## Cinq écrans

| Route | Écran | Contenu |
|---|---|---|
| `/` | Tableau de bord | KPI, historique de consommation, priorités, répartition par projet |
| `/conteneurs` | Conteneurs | projets auto-détectés, groupés, valeurs vivantes, tri et recherche |
| `/comparaison` | Comparaison | courbes cumulées à la seconde pour deux projets, plus l'écart mesuré |
| `/optimiser/:id` | Optimisation | recommandations et diffs applicables au `Dockerfile` / compose |
| `/parametres` | Paramètres | seuils et facteur d'émission, réservé aux administrateurs |

Plus `/conteneurs/:id` pour le détail d'un conteneur.

## Organisation

```
src/
  app/providers/{auth,query}/ , app/router/{routes.tsx,guards/}
  features/{auth,dashboard,projects,live,optimize,containers,settings}/
      api/<x>-service.ts   components/{views,charts,cards}/
  layouts/dashboard/{layout,nav,header}.tsx + nav-config.tsx
  pages/                    entrees de route, export default, lazy
  shared/{components,types,utils}
  styles/theme/
```

Fichiers en kebab-case, composants en exports nommés, imports en `src/...`, `sx` plutôt que `styled`.

## Conventions

**`<MeasurementBadge />` qualifie toute valeur énergie ou carbone.** Il affiche `mesuré` ou
`estimé` selon la source réellement utilisée par le collecteur, et `mesuré · réparti` pour une valeur
par conteneur, avec une infobulle décrivant la chaîne de mesure.

**Unités uniformes** : kWh pour l'énergie, gCO2e pour le carbone, W pour la puissance, avec un nombre
de décimales adapté à l'ordre de grandeur (`decimalesUtiles` dans `shared/utils/format.ts`).

**Le rafraîchissement à la seconde** est un simple `refetchInterval: 1000` de TanStack Query sur
`/api/live`. Pas de WebSocket : une requête par seconde sur une table qui ne dépasse jamais quelques
milliers de lignes.

**Graphiques** : remplissages solides, jamais de dégradé, segments droits. La palette catégorielle a
été validée (bande de clarté, plancher de chroma, séparation en vision des couleurs déficiente,
contraste). Les deux séries de la comparaison reprennent les teintes de leurs panneaux respectifs.

**Diffs** : lignes ajoutées en vert, retirées en rouge, rendues à partir du diff unifié produit par
l'API. GreenSI ne modifie jamais les fichiers — un bouton copie le diff.

**Aucun emoji, aucun dégradé, aucun commentaire dans le code.** Icônes via Iconify.

## Commandes

```bash
npm install
npm run dev          # http://localhost:5173
npm run build
npx tsc --noEmit
```
