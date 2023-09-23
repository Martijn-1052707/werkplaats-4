# Informatie

De 360 Graden Feedback tool is een tool die gebruikt wordt door teamleden om anoniem feedback te geven over hun eigen prestaties en die van hun collega's in relatie tot een project. 

De beheerder kan deze feedback gebruiken om te bepalen hoe de teamleden zich voelen en of er problemen zijn die moeten worden opgelost om het team beter te laten functioneren. 

Door de feedback van alle teamleden te verzamelen, kan de beheerder de belangrijkste punten identificeren en de feedback gemakkelijk bekijken.

# Vereisten

#### Als admin:

- [x] Kan vragen aan de toel toevoegen 
- [x] Kan vragen uit een pool van eerder aangemaakte vragen kiezen
- [x] Kan bestaande vragen aanpassen
- [x] Kan bestaande vragen verwijderen
- [x] Kan ervoor kiezen dat het invullen niet anoniem is, teamlid moet dan zijn/haar naam invullen
- [x] Kan de volgorde van de vragen aanpassen
- [ ] Kan een overzicht bekijken waarin staat hoeveel mensen de vragen in de 360 Graden Feedback tool hebben doorlopen
- [x] Kan uitdraaien maken waarbij elke vraag wordt weergegeven met alle ontvangen antwoorden 

#### Als team-lid:

- [x] Krijgt een link van waaruit de 360 Graden Feedback tool kan worden gestart
- [x] Moet inloggen met zijn/haar e-mailadres. Als de vragen niet anoniem zijn moeten de antwoorden worden gekoppeld aan het teamlid. Andersom, als de vragen wel anoniem moeten zijn dan mag er geen koppeling zijn tussen de antwoorden en het teamlid
- [x] Kan de vragen beantwoorden
- [x] Kan teruggaan naar vorige gestelde vraag.
- [x] Kan zien hoeveel vragen er al zijn beantwoord en hoeveel er nog moeten worden beantwoord
- [x] Kan de antwoorden definitief maken

Er zijn 2 soorten vragen
* Multiple choice
  * a,c,b,d
* Open vraag
  * Het teamlid heeft de mogelijkheid om maximaal 250 tekens te tikken

Elke enquete is een unieke enquete en heeft een eigen unieke link die naar de teamleden wordt verstuurt
De vragen moeten bij de antwoorden worden opgeslagen, zodat we deze later kunnen inzien. Als vragen worden verwijderd moeten deze nog steeds in de database blijven, zodat uitdraaien van vorige antwoorden nog steeds kunnen worden gemaakt

* Tussentijds opslaan is een nice to have

Design moet gebruiksvriendelijke zijn, tijdens het beantwoorden van de vragen, kan je ook terug gaan naar de vorige vraag.

De 360 Graden Feedback tool moet vanaf een ander device zoals mobiel uit te voeren zijn.

# Structuur
    werkplaats-4-react-transformers/
    project/
    ├── backend/
    │   ├── app/
    │   │   └── app.py
    │   ├── static/
    │   └── templates/
    └── transformers/
        ├── public/
        │   ├── index.html
        │   └── favicon.ico
        ├── src/
        │   ├── components/
        │   ├── pages/
        │   ├── styles/
        │   ├── app.css
        │   ├── App.js
        │   ├── breadcrumbs.js
        │   ├── dashboard.js
        │   ├── index.js
        │   ├── logo.svg
        │   ├── reportWebVitals.js
        │   ├── setupProxy.js
        │   ├── survey.js
        │   ├── surveyedit.js
        │   ├── surveylink.js
        │   ├── surveylist.js
        │   ├── surveysubmitted.js 
        │   ├── surveyview.js
        │   └── ...
        ├── package.json
        ├── package-lock.json
        ├── .gitignore
        ├── README.md
        └── ...
# Installatie en setup

Om Flask te kunnen starten zul je eerst de Flask packages moeten installeren. Wil je latere problemen met versies voorkomen, dan raden we je aan een virtual environment te maken en daar de modules in te 
installeren:  

```
pip install virtualenv

virtualenv venv

.\venv\sripts\activate

pip install -r requirements.txt
```
Om de backend applicatie te starten dit zal op `http://localhost:5000` zijn
``` 
.\venv\sripts\activate

python main.py
```

Om de frontend te installeren, moet je de repository klonen naar jouw lokale machine en alle afhankelijkheden installeren met npm. Voer de volgende commando's uit in jouw terminal:

```
git clone https://github.com/jouw-gebruikersnaam/my-awesome-react-app.git
cd my-awesome-react-app
npm install
npm start
```

Dit zal de applicatie starten op `http://localhost:3000`. Je kunt de applicatie bekijken en eventuele wijzigingen aanbrengen in de broncode. Veel plezier!

Inloggen als: `admin@dyflexis.nl` - `test`

# Gebruikte software

- SQLite
- Python
- React.js

# Bronvermelding

- https://reactrouter.com/en/main
- https://python.plainenglish.io/building-a-python-api-and-fetching-it-in-react-a-step-by-step-guide-5024ba4ed9dd
- https://axios-http.com/docs/intro
- https://www.freecodecamp.org/news/how-to-perform-crud-operations-using-react/
- https://stackoverflow.com/questions/45347071/react-survey-js-edit-button-for-survey-items-not-working
- https://www.digitalocean.com/community/tutorials/how-to-add-login-authentication-to-react-applications
- https://stackoverflow.com/questions/60426338/react-js-how-to-handle-authentication
- https://openai.com (ChatGPT werkt goed, geeft wel vaak foute antwoorden terug)
- https://medium.com/how-to-react/create-pagination-in-reactjs-e4326c1b9855
- https://strapi.io/blog/creating-a-survey-application-using-strapi-and-react-js
- https://www.geeksforgeeks.org/how-to-implement-barchart-in-reactjs/
- https://stackoverflow.com/questions/58183221/creating-a-survey-using-react-but-stuck-finding-a-way-to-have-questions-dependen
- https://stackoverflow.com/questions/61029828/how-to-avoid-data-duplication-in-react-forms
- https://legacy.reactjs.org/docs/hooks-intro.html

In de tijdlijn kan ik niet alle bronnen achterhalen

# Credits

Erik, Martijn, Shantelly, Thijs
