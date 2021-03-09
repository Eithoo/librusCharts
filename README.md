# librusCharts
> **librusCharts** - skrypt do Tampermonkey. Dodaje wykres ocen do Librusa (Synergia) - ich oryginalny nie działa i nawet gdyby działał to pokazuje mniej danych (patrzyłem w kod). 
Początkowo miało być to rozszerzenie do przeglądarki, ale pisanie skryptu do Tampermonkey i jego późniejsze zmiany zajmują dużo mniej czasu. Planowane w przyszłości dodać kilka innych wykresów, np. wykres średniej, wykres ocen w poszczególnych tygodniach/miesiącach.


## Jak to zainstalować?

1. Pobierz rozszerzenie **Tampermonkey**. Jest ono dostępne dla największych przeglądarek w ich sklepach z rozszerzeniami. Dla Chrome (na którym było testowane):
https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo
2. Zainstaluj **librusCharts**, wchodząc na ten link. Jeśli posiadasz już Tampermonkey, wyskoczy ci okienko z możliwością zainstalowania skryptu.
https://github.com/Eithoo/librusCharts/raw/main/eitho-librus-synergia-charts.user.js
3. Jeśli zaobserwujesz jakiś błąd, lub masz propozycję zmian lub dodania jakiejś funkcjonalności, napisz korzystając z [**Issues**](https://github.com/Eithoo/librusCharts/issues)

## Jak tego używać?
Wystarczy wejść na stronę [Librusa](https://synergia.librus.pl/) i zalogować się. Następnie kliknąć w **Oceny** i w zielony przycisk **Archiwum**.
Alternatywnie, można też wejść przez link: https://synergia.librus.pl/archiwum

### Screenshot (wersja 0.1)
![ss-v0.1](https://i.imgur.com/FEWcB2T.png)










##### TODO
###### Wykres ocen wystawionych na semestr / koniec roku
- [x] Podstawowe działanie wykresu `(0.1)`
- [x] Pobieranie danych archiwalnych `(0.1)`
- [x] Pobieranie danych z bieżącego roku `(0.1)`
- [ ] Pokazywanie średniej z aktualnie zdobytych ocen, jeśli ocena na semestr nie jest wystawiona przez nauczyciela
- [ ] Proste okienko z ustawieniami, umożliwijące zmianę koloru linii w wykresie (generowane na podstawie nazwy przedmiotu / losowe), włączenie eksperymentalnej opcji *stacked*, która powoduje inne wyświetlanie się wykresu - każda nachodząca na siebie linia jest rozdzielona
- [ ] Zapis aktualnie ukrytych przedmiotów na wykresie do *sessionStorage* i wczytywanie przy ładowaniu wykresu
###### Inne
- [ ] Wykres średniej w bieżącym roku - jeśli jest wystawiona ocena na semestr, to średnia = ocena, jeśli nie, to średnia liczona na podstawie ocen cząstkowych.
- [ ] Wykres średniej w bieżącym roku, ale ze średnią ocen liczoną co tydzień, bez względu na to czy ocena na semestr jest już wystawiona.