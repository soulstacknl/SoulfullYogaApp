# Livegang Soulful Yoga app

Checklist om de app in de App Store en Google Play te krijgen. ✅ = klaar.

## 1. Achterkant (Supabase)
- ✅ Database, beveiliging en demodata (`supabase/migrations`, `supabase/seed.sql`)
- ✅ App en beheerportaal lezen en schrijven via Supabase
- ✅ **Authentication → URL Configuration → Redirect URLs:** `http://localhost:8081/**`, `exp://**`, `soulfulyogaapp://**`
- ✅ **Eigen mailserver (SMTP):** Hostnet, afzender info@soulfulyoga.nl (`smtp.hostnet.nl`, poort 587)
- ✅ Nederlandse mail voor wachtwoord instellen/vergeten (`supabase/templates/recovery.html`)
- ✅ **Zelf aanmelden uitzetten:** Authentication → Sign In / Providers → "Allow new users to sign up" uit
- ⬜ Demo-wachtwoorden (o.a. `admin123`) vervangen vóór er echte klanten in komen

## 2. Accounts in de app
- ✅ Wachtwoord vergeten / nieuw wachtwoord, wachtwoord wijzigen
- ✅ Account verwijderen in het profiel (eis van Apple)
- ✅ Beheerder voegt klanten toe in het portaal

## 3. App klaarmaken
- ✅ Naam "Soulful Yoga", bundle-ID `nl.soulfulyoga.app` (iOS en Android)
- ✅ Icoon, Android-icoon en splashscreen in bosgroen met het blaadjeslogo
- ✅ `eas.json` met profielen `preview` (testversie) en `production` (winkels)
- ✅ Expo-account `soulfulyogaberghem`, project `soulfulyoga` (gekoppeld via `eas init`)
- ✅ Supabase-gegevens als EAS-omgevingsvariabelen (development, preview, production)
- ✅ Android-keystore in de cloud aangemaakt (beheerd door Expo)
- ⬜ Testversie bouwen:
  ```sh
  npx eas-cli build --profile preview --platform android   # APK om direct te installeren
  npx eas-cli build --profile production --platform ios    # daarna naar TestFlight
  ```

- ✅ Pushbericht 24 uur voor elke les (database-taak `lesson-reminders`, elke 15 minuten)
- ⬜ **Firebase voor Android-push:** project op console.firebase.google.com, Android-app `nl.soulfulyoga.app`; `google-services.json` in de projectmap en de service-account-sleutel (FCM V1) uploaden op expo.dev → Credentials → Android
- ⬜ iPhone-push: push-sleutel (APNs) via het Apple Developer-account, gaat automatisch bij de eerste iOS-build

## 4. Winkelaccounts en documenten
- ⬜ Apple Developer Program (bedrijfsaccount vraagt KvK en D-U-N-S-nummer)
- ⬜ Google Play Console
- ⬜ Privacyverklaring op een webadres (AVG)
- ✅ Algemene voorwaarden in de app (`data/terms.ts`, gebaseerd op soulfulyoga.nl/general-5 plus artikel 14 over de app)
- ⬜ Testaccount voor de beoordelaars van Apple en Google

## 5. Indienen
- ⬜ Testen met een paar echte klanten (TestFlight / interne test)
- ⬜ Winkelpagina's: screenshots, beschrijving, categorie (Gezondheid en fitness), privacy-gegevens
- ⬜ `npx eas-cli submit --platform ios` en `--platform android`
