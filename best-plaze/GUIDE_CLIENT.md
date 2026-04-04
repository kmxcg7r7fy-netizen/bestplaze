# Guide de démarrage — XI BestPlaze

## Première connexion

### Étape 1 : Accédez à la page de configuration

Rendez-vous sur **[URL de votre site]/admin/setup**

Cette page n'est accessible qu'une seule fois, lors de la première utilisation.

---

### Étape 2 : Créez votre compte administrateur

Remplissez le formulaire avec :
- Votre prénom et votre nom
- Votre adresse email professionnelle
- Un mot de passe sécurisé (8 caractères minimum, avec une majuscule et un chiffre)
- Le nom de votre établissement (pré-rempli : XI BestPlaze)
- Votre numéro de téléphone
- L'adresse de votre établissement

Cliquez sur **"Créer mon compte"**.

---

### Étape 3 : Connectez votre compte Stripe

Stripe est le système qui gère les paiements de vos clients.

Cliquez sur **"Créer ou connecter mon compte Stripe"**.

**Si vous n'avez pas encore de compte Stripe :**
Stripe va vous guider pour en créer un gratuitement. Vous aurez besoin de :
- Une pièce d'identité (carte d'identité ou passeport)
- Votre IBAN (numéro de compte bancaire)
- Votre numéro SIRET

**Si vous avez déjà un compte Stripe :**
Connectez-vous simplement avec votre email et mot de passe Stripe.

Après connexion, vous serez automatiquement redirigé vers la suite.

> Vous pouvez passer cette étape et configurer Stripe plus tard dans **Paramètres**.

---

### Étape 4 : Configurez votre acompte

- **Pourcentage d'acompte** : choisissez le pourcentage du total que vos clients payent lors de la réservation (par défaut : 30%)
- **Montant minimum** : le montant minimum demandé même si la pré-sélection est vide (par défaut : 20€)
- **Message de confirmation** : le texte que recevront vos clients après paiement

Cliquez sur **"Terminer la configuration"**.

**C'est prêt !** Vous êtes redirigé vers votre tableau de bord.

---

## Gérer les réservations

### Voir les réservations du jour

Sur le **tableau de bord** (/admin), vous voyez :
- Le nombre de réservations du jour
- Le nombre de personnes attendues
- Les réservations de la semaine
- Les revenus de la semaine

### Consulter toutes les réservations

Cliquez sur **"Réservations"** dans le menu.

- Utilisez la barre de recherche pour trouver un client par nom ou email
- Filtrez par statut (En attente, Confirmée, Annulée, etc.)
- Cliquez sur une réservation pour voir tous les détails

### Changer le statut d'une réservation

Depuis la liste des réservations :
- Cliquez sur la réservation
- Dans la fenêtre qui s'ouvre, cliquez sur le bouton correspondant :
  - **Confirmer** : confirme la réservation
  - **Annuler** : annule la réservation
  - **Terminée** : marque comme passée
  - **No-show** : le client n'est pas venu

---

## Ajouter un événement

1. Cliquez sur **"Événements"** dans le menu
2. Cliquez sur **"Créer un événement"**
3. Remplissez les informations :
   - **Titre** : le nom de votre événement
   - **Description** : les détails pour vos clients
   - **Date et heure** : quand se déroule l'événement
   - **Type** : DJ Set, Afterwork, Soirée à thème, etc.
   - **Prix d'entrée** : 0 si c'est gratuit
   - **Mettre à la une** : affiche l'événement en première position sur le site
4. Cliquez sur **"Enregistrer"**

L'événement apparaît immédiatement sur la page publique **Événements** de votre site.

---

## Gérer la carte

Dans **"Carte"** du menu, vous pouvez :
- Activer ou désactiver un article (cliquez sur l'interrupteur)
- Modifier un prix (cliquez sur le prix, tapez le nouveau montant, appuyez sur Entrée)

---

## Recevoir vos paiements

Les acomptes versés par vos clients lors d'une réservation sont **automatiquement virés sur votre compte bancaire Stripe**.

- **Délai habituel** : 2 à 7 jours ouvrés
- **Tableau de bord** : connectez-vous sur [dashboard.stripe.com](https://dashboard.stripe.com) pour suivre vos revenus

---

## Questions fréquentes

**Un client souhaite annuler, comment rembourser ?**
Connectez-vous sur votre tableau de bord Stripe, trouvez le paiement concerné, et cliquez sur "Rembourser".

**Comment changer le pourcentage d'acompte ?**
Dans **Paramètres** du menu admin, modifiez le champ "Acompte (%)" et cliquez sur "Enregistrer".

**Je ne reçois pas les emails de notification ?**
Vérifiez vos spams. Si le problème persiste, contactez le support.

---

## Support

Développé par **Treeflow Agency**

Contact : [contact@treeflow.fr](mailto:contact@treeflow.fr)

---

*Ce guide est destiné à l'équipe de XI BestPlaze. Ne pas diffuser.*
