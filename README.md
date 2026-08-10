
---

## Le pipeline en détail

Le workflow déclenché sur `push` ou `pull_request` vers `main` exécute les étapes suivantes :

1. **Checkout** – récupération du code et de l’historique complet.
2. **Installation des outils** – Python et Semgrep.
3. **Gitleaks** – scan des secrets (via l’action officielle).
4. **Semgrep Custom Rules** – règles bloquantes issues de l’audit (échec si trouvé).
5. **Semgrep OWASP** – scan large des Top 10 OWASP (non bloquant).
6. **Semgrep Quality** – règles de qualité internes (non bloquant).
7. **Installation des dépendances** – `npm ci` pour Next.js et Express.
8. **npm audit** – vérification des vulnérabilités connues (échec si `high`).
9. **Hadolint** – analyse des Dockerfiles (échec si seuil `error`).
10. **Build Docker** – construction des images.
11. **Tests de sécurité** – exécution de `npm test` dans chaque projet (si configuré).
12. **Build de vérification** – `npm run build` Next.js et validation Express.

Le pipeline est volontairement **séquentiel** : si une étape bloquante échoue, les suivantes ne sont pas exécutées, garantissant qu’un secret ou une vulnérabilité critique arrête immédiatement le processus.

---

## Branches de démonstration

Pour visualiser le comportement du pipeline face à différents types de vulnérabilités, des branches séparées ont été créées.  
**Chaque branche** contient **une seule catégorie de défaut** et doit être ouverte en **Pull Request** vers `main`.  
Le pipeline échouera alors **uniquement** à cause de l’outil correspondant, tandis que les autres contrôles resteront verts.

| Branche | Outil déclenché | Résultat attendu |
|---------|-----------------|------------------|
| `demo-semgrep` | Semgrep (règles customs) | ❌ `Semgrep - Custom Security Rules` |
| `demo-gitleaks` | Gitleaks | ❌ `Gitleaks - Secret Detection` (leak détecté) |
| `demo-hadolint` | Hadolint | ❌ `Hadolint - Express Dockerfile` (`DL3007 warning` → error) |
| `demo-security-tests` | Tests Jest/Supertest | ❌ `Run Express Security Tests` (en‑têtes de sécurité manquants) |

### Comment tester

1. Aller sur le dépôt GitHub.
2. Ouvrir l’onglet **Pull requests**.
3. Pour chaque branche de démonstration, créer une **nouvelle Pull Request** pointant vers `main`.
4. Observer le déclenchement du pipeline (onglet **Actions** ou dans la PR elle‑même).
5. Inspecter les logs de l’étape échouée pour voir les findings remontés.
6. **Ne pas fusionner** ces PR – elles servent uniquement de démonstration.

---

## Règles Semgrep customs (issues de l’audit)

Le fichier `.semgrep/blocking-rules.yml` contient 2 règles directement liées aux vulnérabilités découvertes :

| ID de la règle | Constat d’audit correspondant | Description |
|----------------|-------------------------------|-------------|
| `missing-get-server-session` | **A‑09 / A‑14** | Handler d’API sans appel à `getServerSession()` → absence d’authentification |
| `unescaped-regex-param` | **A‑19** | Paramètre utilisateur non échappé dans un `$regex` MongoDB → ReDoS |

Ces règles sont exécutées avec le flag `--error` : toute correspondance fait échouer le pipeline.

---

## Tests de sécurité automatisés

Le fichier `express-app/tests/security.test.js` vérifie :

- Présence des en‑têtes de sécurité HTTP (`X-Content-Type-Options`, `X-Frame-Options`, etc.) – lié au constat **A‑20**.
- Robustesse de l’application (20 requêtes rapides, pas de crash).
- Désactivation de l’en‑tête `X-Powered-By`.

Les tests sont exécutés via `npm test` dans l’étape du pipeline. Si un en‑tête vient à disparaître, le test échoue et bloque le pipeline.

---

## Instructions pour une utilisation continue

- **Pour ajouter une nouvelle règle Semgrep** : éditer `.semgrep/blocking-rules.yml` (bloquant) ou `advisory-rules.yml` (non bloquant), puis pousser sur `main`.
- **Pour ajouter un test de sécurité** : créer un fichier `.test.js` dans `express-app/tests/` (ou `next-app/…`) avec le pattern `it('...', async () => { ... })`.
- **Pour ajuster le seuil Hadolint** : modifier `failure-threshold` dans le workflow (valeurs possibles : `error`, `warning`, `info`, `none`).
- **Pour désactiver temporairement un outil** : commenter l’étape correspondante dans `.github/workflows/ci.yml`.

---

## Note — OWASP ZAP

**OWASP ZAP (Zed Attack Proxy)** a été identifié dans le rapport comme un outil complémentaire pour effectuer des tests de sécurité dynamiques (DAST).

Contrairement à Semgrep, qui analyse le code source sans l'exécuter, ZAP analyse une **application réellement en fonctionnement**. Il envoie des requêtes HTTP à l'application et analyse les réponses afin d'identifier des vulnérabilités observables à l'exécution, telles que :

- des en-têtes de sécurité HTTP manquants ;
- des endpoints accessibles de manière inattendue ;
- des problèmes liés aux sessions et aux cookies ;
- certaines injections et mauvaises configurations ;
- des comportements révélant des problèmes de contrôle d'accès.

### Pourquoi ZAP n'est pas intégré dans cette version

L'intégration de ZAP nécessite un **environnement d'exécution accessible**, généralement un environnement de staging déployé avant le scan. Pour obtenir une couverture pertinente, il peut également être nécessaire de configurer :

- l'URL de l'environnement de staging ;
- les endpoints à scanner ;
- les règles et le niveau de scan ;
- un compte de test pour les zones authentifiées ;
- la gestion des résultats et des faux positifs ;
- les conditions permettant de déterminer si le scan doit bloquer ou non une release.

ZAP propose également différents modes de scan, notamment des analyses passives et actives. Un scan actif peut générer des requêtes destinées à tester le comportement de l'application et doit donc être utilisé avec une configuration et un environnement adaptés.

Pour cette première version du pipeline, l'objectif est de **valider les contrôles CI/CD directement intégrables au cycle de développement** : Gitleaks, Semgrep, npm audit, Hadolint, tests de sécurité et validation des builds.

L'intégration de ZAP est donc considérée comme une **évolution ultérieure**, à réaliser une fois qu'un environnement de staging et une stratégie DAST appropriée sont disponibles.

> **État :** non intégré dans cette version du pipeline.  
> **Position prévue :** après déploiement sur un environnement de staging et avant une mise en production/release majeure.

---

## État actuel

- Branche `main` : **propre et saine** – pipeline vert ✅.
- Branches de démonstration : **prêtes à être utilisées en PR** pour montrer les défaillances.

**Auteur** : Hafsa CHARAFI – Stagiaire cybersécurité  \
**Date** : 10 Août 2026
