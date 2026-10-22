# Önéletrajz készítő

Ingyenes, magyar önéletrajz készítő. Nincs szerver, nincs adatbázis, nincs AI, nincs regisztráció. Minden a látogató böngészőjében fut, az adatok sehova nem kerülnek.

## Mit tud

- Élő előnézet, 3 sablon (Klasszikus, Modern, Tömör)
- PDF (böngészői nyomtatás, "Mentés PDF-ként") és HTML letöltés
- "Csak az elmúlt 5 év" szűrő a munkahelyekre
- Szabályalapú tippek: hiányzó adatok, túl hosszú szöveg, gyenge kezdőigék, számok hiánya, oldalszám, stb.
- Helyesírás-ellenőrzés a böngésző beépített magyar szótárával
- Külső betűtípus, süti, követő script nincs

## Fájlok

| Fájl | Mire jó |
|---|---|
| `index.html` | az oldal, benne az önéletrajz lap stílusa (`<style id="sheet-css">`) |
| `style.css` | az űrlap és az oldal kinézete |
| `app.js` | az egész működés |
| `adatvedelem.html` | adatvédelmi tájékoztató (hirdetéshez kötelező) |

## Kipróbálás a gépeden

Duplán kattints az `index.html`-re, nincs mit telepíteni.

## Kitelepítés GitHub Pages-re

1. GitHub → **New repository** → pl. `oneletrajz-keszito`, **Public**.
2. Töltsd fel a 4 fájlt (Add file → Upload files), vagy parancssorból:
   ```
   git init
   git add .
   git commit -m "Első verzió"
   git branch -M main
   git remote add origin https://github.com/FELHASZNALONEV/oneletrajz-keszito.git
   git push -u origin main
   ```
3. Repo → **Settings → Pages** → Source: **Deploy from a branch** → Branch: `main`, mappa: `/ (root)` → Save.
4. 1–2 perc múlva elérhető: `https://FELHASZNALONEV.github.io/oneletrajz-keszito/`

## Hirdetés később

- Az AdSense-hez saját domain kell (a `github.io` aldomain nem fogadható el), ezért a hirdetés az első saját URL megvásárlása után jön.
- A hirdetést az űrlap és a lap **mellé vagy alá** tedd, a lap tartalmába soha, és `no-print` osztállyal, hogy a PDF-ben ne jelenjen meg.
- Az `adatvedelem.html`-ben töltsd ki az e-mail-címet, és hirdetés mellé sütihozzájárulási sáv (CMP) is kell az EU-ban.

## Amit szándékosan nem csinál

- Nem küld e-mailt: egy weboldal nem tud csatolmányt küldeni a felhasználó nevében szerver nélkül, a mailto link pedig csak üres levelet nyit. A letöltött fájlt a felhasználó a saját levelezőjéből küldi.
- Nem ment: se localStorage, se szerver. Ez a "nem tárolunk adatot" ígéret alapja. Ha később mentést akarsz, az adatvédelmi tájékoztatót is át kell írni.
