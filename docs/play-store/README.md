# Soulful Yoga in de Google Play Store

Alles om de app in de Play Console in te vullen. Kopieer de teksten en upload de bestanden uit `afbeeldingen/`.

## 1. Winkelvermelding (Groei → Winkelvermelding → Hoofdvermelding)

**App-naam** (max. 30 tekens)
```
Soulful Yoga
```

**Korte beschrijving** (max. 80 tekens)
```
Je yogalessen in Berghem: rooster, strippenkaart, afmelden en chat met Marjolijn
```

**Volledige beschrijving** (max. 4000 tekens)
```
Meer rust en ruimte voor jezelf. Met de app van Soulful Yoga in Berghem regel je je yogalessen eenvoudig op je telefoon.

ROOSTER
• Bekijk het lesrooster per maand, met een kalender waarin je in één oogopslag ziet wanneer er Yin, Flow of Gentle Yoga is.
• Zie direct hoeveel plekken er nog vrij zijn en vraag een plek aan in een les.

MIJN LESSEN
• Je groepsles staat automatisch voor je klaar.
• Kun je een keer niet? Meld je af in de app. Tot 24 uur van tevoren is dat kosteloos.
• Je ziet welke lessen je hebt gevolgd en hoeveel strippen je nog over hebt.

BERICHTEN
• Chat rechtstreeks met Marjolijn, bijvoorbeeld om een les in te halen of een vraag te stellen.
• Lees het laatste nieuws van de studio, zoals roosterwijzigingen en vakanties.

HERINNERINGEN
• Je krijgt 24 uur voor je les een herinnering, zodat je niets mist.

Een account voor de app krijg je via Soulful Yoga. Nog geen account? Vraag het aan in de app of mail naar info@soulfulyoga.nl.

Soulful Yoga · Runselstraat 18 · 5351 NJ Berghem · www.soulfulyoga.nl
```

**Afbeeldingen** (in `afbeeldingen/`)
| Veld | Bestand |
|---|---|
| App-icoon (512×512) | `icoon-512.png` |
| Grafische weergave / feature graphic (1024×500) | `banner-1024x500.png` |
| Screenshots telefoon (2–8, 9:16) | `screenshot-1-rooster.png` t/m `screenshot-5-chat.png` |

**Categorie en contact** (Groei → Winkelinstellingen)
- App of game: **App** · Categorie: **Gezondheid en fitness**
- Tags (optioneel): Yoga, Fitness
- E-mail: **info@soulfulyoga.nl** · Website: **https://www.soulfulyoga.nl** · Telefoon: optioneel

## 2. App-content (Beleid → App-content)

**Privacybeleid** – webadres van de privacyverklaring, bijv. `https://www.soulfulyoga.nl/privacy` (tekst: `privacyverklaring.md`).

**Toegang tot app** – kies *Alle of sommige functies zijn beperkt* → *Inloggegevens toevoegen*:
- Naam: `Testaccount klant`
- Gebruikersnaam: `review@soulfulyoga.nl`
- Wachtwoord: staat in `.env.local` (`PLAY_REVIEW_PASSWORD`), niet in deze repo
- Instructies: `Open de tab Profiel en log in. Het account heeft 10 strippen en een groepsles op woensdag 9.00. Onder Berichten staan het nieuws en de chat met de studio.`

**Advertenties** – *Nee, mijn app bevat geen advertenties.*

**Inhoudsclassificatie** – vul de vragenlijst in met e-mail info@soulfulyoga.nl:
- Categorie: *Alle andere app-typen* (geen game, geen sociaal netwerk)
- Geweld, seks, grof taalgebruik, drugs, gokken: **nee**
- Kunnen gebruikers met elkaar communiceren of content uitwisselen? **Ja** (chat tussen klant en studio; klanten zien elkaar niet)
- Deelt de app de locatie van gebruikers? **Nee** · Koopt de gebruiker iets in de app? **Nee**

**Doelgroep** – leeftijd **18 jaar en ouder**. De app is niet op kinderen gericht.

**Gegevensveiligheid** – zie hoofdstuk 3.

**Overheidsapps** – nee. **Financiële functies** – geen. **Nieuwsapp** – nee (het nieuws gaat alleen over de studio).

**Gezondheid** – de app plant lessen en houdt strippen bij; hij verwerkt geen gezondheidsgegevens (geen hartslag, gewicht, medische info). Kies bij de gezondheidsverklaring dat de app geen gezondheidsfuncties heeft, tenzij Google bij de categorie *Gezondheid en fitness* iets anders eist; kies dan alleen iets als *activiteit/fitness* en geen medische functies.

**Accountverwijdering** – webadres van de pagina "account verwijderen", bijv. `https://www.soulfulyoga.nl/account-verwijderen` (tekst: `account-verwijderen.md`).

## 3. Gegevensveiligheid (antwoorden)

Algemeen:
- Verzamelt of deelt de app gegevens? **Ja**
- Worden alle gegevens versleuteld tijdens verzending? **Ja** (alles via HTTPS)
- Kunnen gebruikers vragen hun gegevens te verwijderen? **Ja** (in de app: Profiel → Account verwijderen, of via de webpagina)
- Delen met derden: **nee**. De diensten die de app laten werken (database, e-mail, pushmeldingen) zijn dienstverleners en tellen voor Google niet als "delen".

Verzamelde gegevens (alle: *verzameld*, *niet gedeeld*, *niet tijdelijk*, doel: **App-functionaliteit** en **Accountbeheer**):

| Google-categorie | Type | Verplicht? | Waarvoor |
|---|---|---|---|
| Persoonlijke info | Naam | Verplicht | Account, lessen, presentielijst |
| Persoonlijke info | E-mailadres | Verplicht | Inloggen, wachtwoord-mails |
| Persoonlijke info | Telefoonnummer | Optioneel | Contact door de studio |
| Berichten | Andere berichten in de app | Optioneel | Chat met de studio |
| App-activiteit | Andere acties | Verplicht | Reserveringen, afmeldingen, aanwezigheid, strippen |
| Apparaat- of andere ID's | Apparaat- of andere ID's | Optioneel | Pushmeldingen (alleen als je meldingen toestaat) |

Niet verzameld: locatie, financiële gegevens (betalen gaat buiten de app), gezondheid, foto's/video's, contacten, agenda, webgeschiedenis, crashlogs/analytics.

## 4. Release

1. **Testen → Gesloten test** → *Track maken* → testers toevoegen (e-maillijst met minimaal 12 Gmail-adressen).
2. *Nieuwe release maken* → upload de `.aab` uit de production-build → releasenaam bijv. `1.0.0 (1)` → opmerkingen: `Eerste testversie`.
3. Deel de aanmeldlink met de testers. Na 14 dagen met minimaal 12 testers: **Productie → Toegang aanvragen**.

Volgende versies stuurt Claude in met `npx eas-cli submit --platform android` zodra er een service-account van Google is ingesteld. Kleine aanpassingen gaan zonder nieuwe versie via EAS Update.
