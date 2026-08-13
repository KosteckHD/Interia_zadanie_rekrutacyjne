# Saper — zadanie rekrutacyjne

## 1. Jak uruchomić

Wymagany jest Node.js z npm.

```powershell
git clone https://github.com/KosteckHD/Interia_zadanie_rekrutacyjne.git
cd Interia_zadanie_rekrutacyjne
npm install
npm run dev
```

Plik `saper-plansze.json` znajduje się w `public/saper-plansze.json`, a aplikacja pobiera go podczas startu.

Dodatkowe komendy:

```powershell
npm test
npm run lint
npm run build
```

## 2. Co zostało zrobione, a czego nie

Zaimplementowałem czysty moduł `src/logic/board.ts` z wymaganymi typami i funkcjami, w tym pierwsze bezpieczne odkrycie, relokację miny, kaskadę, flagowanie, warunek wygranej, przegraną oraz chording. Logika nie importuje Reacta i operuje na niemutowalnych kopiach planszy.

Interfejs umożliwia wybór poziomu, restart, odkrywanie lewym przyciskiem, flagowanie prawym przyciskiem, podgląd licznika min, komunikaty stanu i pokazanie min po przegranej. Dodałem testy jednostkowe logiki oraz parser danych odporny na błędne wpisy.

Nie dodawałem timera, rankingu, zapisu wyników, losowania plansz, animacji ani zmiany motywu, ponieważ nie należą do wymaganego zakresu.

## 3. Co znalazłem w danych i jak to obsługuję

Plik zawiera siedem poziomów. Znalazłem następujące anomalie:

- `rachmistrz` deklaruje 10 min, ale zawiera 12 poprawnych unikalnych współrzędnych;
- `bliznieta` ma dwukrotnie minę `[2, 2]`, więc po usunięciu duplikatu pozostaje 7 min zamiast deklarowanych 8;
- `za-plotem` zawiera `[8, 3]`, poza planszą o szerokości 8, więc pozostaje 5 poprawnych min zamiast 6;
- `ciasno` ma minę na każdym z 9 pól planszy 3×3, więc pierwsze odkrycie nie ma bezpiecznego miejsca do relokacji i zgodnie z regułą kończy się przegraną;
- `laka` ma zero min i służy jako przypadek pełnej kaskady zakończonej wygraną.

Parser w `src/data/levels.ts` obsługuje dane nieoczyszczone: przyjmuje tablicę poziomów oraz obiekt z polem `levels`, odrzuca niepoprawne wymiary, ignoruje współrzędne poza planszą, pomija niepoprawne pary współrzędnych, usuwa duplikaty min i generuje unikalne identyfikatory. `mineCount` jest normalizowane do liczby faktycznie poprawnych, unikalnych min, a wykryte problemy są zgłaszane interfejsowi.

## 4. Co było najtrudniejsze

Najwięcej uwagi wymagało połączenie pierwszego bezpiecznego odkrycia z późniejszym przeliczeniem wartości `adjacent`. Relokowana mina może zmienić liczby na wielu polach, dlatego po przeniesieniu miny przeliczam całą planszę.

Drugim trudnym przypadkiem jest chording. Kliknięcie odkrytej cyfry uruchamia odkrywanie sąsiadów tylko wtedy, gdy liczba flag jest zgodna z cyfrą; błędna flaga pozostawia prawdziwą minę do odkrycia i powoduje przegraną. Kaskada jest iteracyjna, aby nie zależeć od głębokości stosu wywołań.

## 5. Wykorzystane biblioteki

- React i React DOM — renderowanie interfejsu oraz zarządzanie stanem wybranej planszy.
- Vite — szybki bundler i serwer developerski dla aplikacji React.
- TypeScript — ścisłe typowanie kontraktu logiki planszy i komponentów.
- Sass — organizacja stylów SCSS zgodnie z wymaganiami zadania.
- Vitest — szybkie testy jednostkowe funkcji z `src/logic/board.ts` oraz parsera danych.
- ESLint — podstawowa kontrola jakości kodu.

Nie użyłem bibliotek UI, frameworka CSS ani biblioteki do gier siatkowych.

## 6. Co zrobiłbym dalej

Przed użyciem produkcyjnym dodałbym walidację schematu danych wykonywaną również po stronie serwera, testy właściwości dla większej liczby plansz oraz testy komponentów sprawdzające obsługę klawiatury i menu kontekstowego. Rozważyłbym też wydzielenie komunikatów interfejsu do warstwy tłumaczeń i optymalizację renderowania bardzo dużych plansz.

Nie dodawałem tych elementów do zadania, żeby utrzymać zakres zgodny z treścią polecenia.

## 7. Gdzie korzystałem z AI

AI pomogło mi uporządkować plan implementacji, wskazać przypadki brzegowe dla logiki Sapera oraz zaplanować zestaw testów. Kod przeanalizowałem i zweryfikowałem samodzielnie przez testy, lint i kompilację TypeScriptu. Każdą decyzję dotyczącą `board.ts` powinienem umieć wyjaśnić podczas rozmowy technicznej.
