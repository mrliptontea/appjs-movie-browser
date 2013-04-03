AppJS Movie Browser
===================

[PL] Przeglądarka filmów znalezionych we wskazanych katalogach.

Wyświetla okładki filmów oraz podstawowe dane (tytuł oryginalny, tytuł polski, rok produkcji, gatunki, opis fabuły) i oceny społeczności __[Filmweb](http://www.filmweb.pl)__ i __[IMDb](http://www.imdb.com)__.

Bezpośrednio z przeglądarki film można uruchomić w ulubionym odtwarzaczu.

Wyszukiwane rozszerzenia: .mkv, .mp4, .avi, .divx, .mov, .wmv, .mpeg, .mpg

---


Wymagania:
----------

* __[node.js](http://nodejs.org)__
* Moduły node.js:
 * __[AppJS](http:appjs.org)__
 * __[open](https://npmjs.org/package/open)__
 * __[simple-ini](https://npmjs.org/package/simple-ini)__
 * __[ini](https://npmjs.org/package/ini)__


Instalacja
----------

* `$ git clone git://github.com/mrliptontea/appjs-movie-browser.git MovieBrowser`
* `$ cd MovieBrowser`
* Utworzyć katalog *node_modules* i umieścić w nim wymienione wyżej moduły.
* Utworzyć plik *config.ini* i wypełnić go  (przykład podany poniżej)
* Uruchomić `$ node app.js`

	Notka: pod Windows powyżej opisany katalog *MovieBrowser* nazwać ***data***, wówczas całość przenieść do katalogu *MovieBrowser* i umieścić w nim *app.exe*, a obok niego *config.ini*.


Konfiguracja
------------

Przykładowy plik **config.ini** (Windows)
  
```ini
[crawler]
; użyj %X% jako litery dysku, z którego uruchomiono app
folders[] = D:\Filmy
folders[] = F:\Filmy

; opcjonalna sekcja - jeśli nie zostania podana,
; użyty zostanie domyślny (systemowy) odtwarzacz
[player]
bin = C:\Programy\Media Player Classic\mpc-hc64.exe
options[] = /fullscreen
options[] = /play
```

Używanie
--------

Po prawidłowej konfiguracji lista znalezionych filmów pojawi się od razu.
Górny pasek zawiera wszystkie ogólnodostępne opcje.

Każdy film posiada menu kontekstowe z opcjami, edytorem danych z wbudowaną wyszukiwarką w Filmweb i IMDb (aby wyszukać, należy kliknąć na etykiecie pola *Strona Filmweb* lub *Strona IMDb*).

### Klawiszologia

- `F5` = odśwież listę
- `F8` = skopiuj do schowka listę plików (w wyświetlanej kolejności)
- `F9` = skopiuj do schowka listę w formacie HTML (\<ul\>)
- `F11` = przełącza tryb pełnoekranowy
- `F12` = włącza webkit devtools
- `Ctrl + f` = skup kursor w polu wyszukiwania
- `ESC` = wyczyść wyszukiwanie

Licencja
--------

Aplikacja pod warunkami licencji __[BEERWARE](http://pl.wikipedia.org/wiki/Beerware)__. 