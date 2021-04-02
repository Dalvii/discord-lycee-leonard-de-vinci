# Bot Discord pour le Lycée Léonard de Vinci
Bot Discord en liaison avec Atrium/Pronote pour des rôles automatisés en fonctions des classes, un renommage des pseudo Discord avec le vrai nom, ce qui empeche ceux qui n'appartiennent pas au lycée de s'introduire dans les classes virtuelles, un systeme de rendu de devoirs sécurisé, ainsi que d'autres fonctionnalités à venir...


## Installer Node.JS
Vous devez installer Node.JS: [Télécharger](https://nodejs.org/en/download/)
Puis télécharger le repo,
et taper dans la console:
```
npm install
```

## Executer
```
npm run start
// or
node main.js
```

## Configuration
Vous devez modifier le fichier de configuration `config.json` et y mettre le Token de votre Bot Discord pour faire fonctionner ce programme sur votre serveur.
```json
{
	"token": "Votre Token"
}
```

Vous devez modifier les informations dans le fichier `main.js` pour la liason avec Pronote/Atrium:

```js
const url = 'URL_PRONOTE'; // L'url du site Pronote
const cas = 'cas'	// Le nom du systeme d'authentifacation que votre Pronote utilise, pour le trouver: https://github.com/Litarvan/pronote-api#comptes-r%C3%A9gion-support%C3%A9s

const eleve_channel = 'channel_inscription_des_eleves',
    news = 'channels_annonce_nouveaux_arrivants',	// completer avec les ID correspondants
    eleve_role = 'role_eleve',
    nouveau_role = 'role_arrivants',
    serv = 'id_serveur',
    prof_role = 'role_profs',
    admin = 'role_admin',
    nom_du_lycee = 'nom_du_lycee'

```

### Système de devoirs à rendre
Ce procédé se base sur 2 channels liés, l'un sert au élèves à poster leur devoirs à rendre, l'autre sert au professeur à récupérer ces devoirs.
L'un est accessible uniquement par les élèves, et supprime automatiquement les messages qui y sont postés pour éviter que d'autres élèves se servent de ce qu’ils trouvent.
Pour que ce procédé fonctionne, il faut que le channel servant à récupérer les devoirs soit nommée : `#déposer-devoirs` et doit IMPÉRATIVEMENT contenir en `sujet du salon` (légende/topic) l'ID du channel ou doivent être rediriger les devoirs remis.


![channels devoirs](https://raw.githubusercontent.com/Dalvii/discord-lycee-leonard-de-vinci/main/img/4.PNG)
![channels settings](https://raw.githubusercontent.com/Dalvii/discord-lycee-leonard-de-vinci/main/img/5.PNG)


## Images
![Atrium Setup](https://raw.githubusercontent.com/Dalvii/discord-lycee-leonard-de-vinci/main/img/3.PNG)

![Rendu devoirs](https://raw.githubusercontent.com/Dalvii/discord-lycee-leonard-de-vinci/main/img/2.PNG)

![Arrivants](https://raw.githubusercontent.com/Dalvii/discord-lycee-leonard-de-vinci/main/img/1.PNG)
