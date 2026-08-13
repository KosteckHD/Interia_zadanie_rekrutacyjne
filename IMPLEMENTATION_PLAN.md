# Plan implementacji gry Saper

## 1. Cel i zasady realizacji

Celem jest przygotowanie aplikacji Saper zgodnej z treścią zadania rekrutacyjnego, ze szczególnym naciskiem na czystą, niezależną od Reacta logikę w `src/logic/board.ts`. Interfejs ma korzystać wyłącznie z publicznych funkcji logiki, a reguły gry mają być pokryte testami jednostkowymi.

Przez cały czas obowiązują następujące zasady:

- React 18+ i TypeScript w trybie `strict`;
- kod, nazwy plików i komentarze po angielsku;
- README po polsku;
- style wyłącznie w SCSS i klasy zgodne z BEM;
- kolory, rozmiary i odstępy wyłącznie przez zmienne CSS zebrane w jednym pliku;
- zakaz `any`, `as any`, `enum`, dyrektyw wyłączających TypeScript, bibliotek UI, CSS-in-JS i `canvas`;
- logika w `src/logic/board.ts` nie może importować Reacta ani zależeć od DOM;
- nie dodajemy funkcji wykraczających poza treść zadania;
- nie zmieniamy narzuconych nazw ani sygnatur eksportów z `src/logic/board.ts`.

## 2. Obowiązkowy workflow Git po każdym kroku

Każdy krok opisany niżej jest osobną, zamkniętą porcją pracy. Po zakończeniu **każdego** kroku należy:

1. Sprawdzić zmiany:

   ```powershell
   git status
   git diff
   ```

2. Uruchomić kontrole wymagane w danym kroku. Od momentu dodania testów standardem są:

   ```powershell
   npm test
   npm run lint
   npm run build
   ```

3. Dodać wyłącznie pliki dotyczące danego kroku:

   ```powershell
   git add <lista-plików>
   ```

4. Utworzyć commit w konwencji Conventional Commits, używając komunikatu podanego przy kroku:

   ```powershell
   git commit -m "<type>: <description>"
   ```

5. Od razu wypchnąć commit na GitHub:

   ```powershell
   git push origin main
   ```

6. Sprawdzić, czy katalog roboczy jest czysty:

   ```powershell
   git status
   ```

Nie należy łączyć kilku kroków w jeden duży commit. Jeżeli test lub build nie przechodzi, najpierw trzeba naprawić problem, a dopiero potem wykonać commit i push.

## 3. Docelowa struktura projektu

```text
src/
├── components/
│   ├── Board/
│   │   ├── Board.scss
│   │   └── Board.tsx
│   ├── Cell/
│   │   ├── Cell.scss
│   │   └── Cell.tsx
│   ├── Game/
│   │   ├── Game.scss
│   │   └── Game.tsx
│   └── GameControls/
│       ├── GameControls.scss
│       └── GameControls.tsx
├── data/
│   └── saper-plansze.json
├── logic/
│   ├── board.test.ts
│   └── board.ts
├── styles/
│   ├── _variables.scss
│   └── global.scss
├── App.tsx
└── main.tsx
```

Strukturę można minimalnie uprościć, jeżeli komponent okaże się zbyt mały, aby uzasadniał osobny katalog. Nie należy jednak mieszać logiki planszy z komponentami Reacta.

## 4. Kroki implementacji

### Krok 0 — uporządkowanie startera i zapisanie stanu bazowego

Zakres:

- sprawdzić, czy `tsconfig.app.json` ma aktywny tryb `strict`;
- usunąć demonstracyjne elementy Vite, których aplikacja nie będzie używać;
- pozostawić minimalny, uruchamialny komponent aplikacji;
- upewnić się, że `.gitignore` ignoruje przynajmniej `node_modules`, `dist` i lokalne pliki środowiskowe;
- nie nadpisywać jeszcze README docelową dokumentacją;
- uruchomić `npm run lint` i `npm run build`.

Warunek ukończenia: czysty starter uruchamia się, lint i build przechodzą.

Commit i push:

```powershell
git add .gitignore eslint.config.js index.html package.json package-lock.json public src tsconfig.app.json tsconfig.json tsconfig.node.json vite.config.ts
git commit -m "chore: initialize React TypeScript project"
git push origin main
```

### Krok 1 — dodanie zależności SCSS i testów

Zakres:

- zainstalować `sass` jako zależność developerską;
- zainstalować `vitest` jako runner testów;
- dodać skrypty `test` i `test:watch` do `package.json`;
- jeżeli Vitest wymaga konfiguracji, dodać ją do konfiguracji Vite albo osobnego pliku;
- utworzyć jeden tymczasowy test kontrolny lub od razu minimalny test `createBoard`, aby potwierdzić działanie runnera;
- uruchomić test, lint i build.

Polecenia instalacyjne:

```powershell
npm install -D sass vitest
```

Oczekiwane skrypty:

```json
"test": "vitest run",
"test:watch": "vitest"
```

Warunek ukończenia: `npm test`, `npm run lint` i `npm run build` kończą się powodzeniem.

Commit i push:

```powershell
git add package.json package-lock.json vite.config.ts src
git commit -m "chore: configure Sass and unit tests"
git push origin main
```

### Krok 2 — dodanie i analiza danych poziomów

Aktualnie w repozytorium brakuje pliku `saper-plansze.json`. Przed rozpoczęciem tego kroku trzeba pobrać oryginalny załącznik i zapisać go jako `src/data/saper-plansze.json`.

Zakres analizy każdego poziomu:

- dodatnie, całkowite `width` i `height`;
- poprawna struktura `mines` jako par `[x, y]`;
- całkowite współrzędne;
- współrzędne mieszczące się w planszy;
- duplikaty współrzędnych min;
- zgodność `mineCount` z liczbą unikalnych i poprawnych min;
- poziomy bez wolnego pola;
- duplikaty `id`;
- wszystkie inne anomalie obecne w rzeczywistym pliku.

Należy zanotować wyniki analizy do późniejszego umieszczenia w README. Nie należy zgadywać, jakie błędy zawiera plik — opis ma wynikać z rzeczywistych danych.

Strategia obsługi danych:

- importowany JSON traktować jako dane runtime, a nie bezwarunkowo poprawny `Level[]`;
- zawężać dane z `unknown` za pomocą własnych type guardów lub funkcji normalizującej;
- odrzucać współrzędne poza planszą;
- usuwać duplikaty min;
- liczbę pozostałych min opierać na minach faktycznie obecnych w utworzonej planszy;
- nieprawidłowe wymiary obsłużyć czytelnym komunikatem zamiast wyjątku aplikacji;
- nie używać `any` ani zewnętrznej biblioteki walidacyjnej, jeśli prosty walidator wystarcza.

Warunek ukończenia: każdy wpis z pliku może zostać przeanalizowany bez awarii, a wykryte anomalie są spisane.

Commit i push:

```powershell
git add src/data
git commit -m "feat: add and validate predefined levels"
git push origin main
```

### Krok 3 — utworzenie modelu planszy i `createBoard`

Utworzyć `src/logic/board.ts` z dokładnie wymaganymi eksportami:

```ts
export type Level = {
  id: string
  name: string
  width: number
  height: number
  mineCount: number
  mines: [number, number][]
}

export type Cell = {
  mine: boolean
  revealed: boolean
  flagged: boolean
  adjacent: number
}

export type Board = {
  width: number
  height: number
  cells: Cell[]
  state: 'idle' | 'playing' | 'won' | 'lost'
}

export function createBoard(level: Level): Board
export function revealCell(board: Board, index: number): Board
export function toggleFlag(board: Board, index: number): Board
```

`createBoard` ma:

1. Utworzyć `width * height` komórek w kolejności wierszowej.
2. Umieścić miny według wzoru `index = y * width + x`.
3. Policzyć miny w ośmiu sąsiednich polach każdej komórki.
4. Ustawić wszystkie pola jako zakryte i nieoflagowane.
5. Ustawić stan planszy na `idle`.

Prywatne funkcje pomocnicze mogą obejmować:

- sprawdzanie poprawności indeksu;
- przeliczanie indeksu na współrzędne;
- pobieranie poprawnych indeksów sąsiadów;
- ponowne wyliczanie wartości `adjacent`.

Należy szczególnie uważać na zawijanie sąsiadów między lewą i prawą krawędzią planszy.

Warunek ukończenia: plansza ma poprawną długość, pozycje min i wartości `adjacent`, potwierdzone testami.

Commit i push:

```powershell
git add src/logic/board.ts src/logic/board.test.ts
git commit -m "feat: implement board creation"
git push origin main
```

### Krok 4 — flagowanie pól

Zaimplementować `toggleFlag(board, index)`.

Reguły:

- nieprawidłowy indeks nie zmienia planszy;
- zakończona gra nie przyjmuje ruchów;
- odkrytego pola nie można oflagować;
- flaga może zostać postawiona i zdjęta;
- postawienie flagi nie zmienia `idle` na `playing`;
- funkcja nie mutuje wejściowego obiektu ani jego komórek.

Testy tego kroku:

- postawienie flagi;
- zdjęcie flagi;
- próba oflagowania odkrytego pola;
- próba ruchu po zakończeniu gry;
- nieprawidłowy indeks;
- brak mutacji wejściowej planszy.

Warunek ukończenia: wszystkie reguły flag przechodzą w testach.

Commit i push:

```powershell
git add src/logic/board.ts src/logic/board.test.ts
git commit -m "feat: implement cell flagging"
git push origin main
```

### Krok 5 — odkrywanie pól i pierwsze bezpieczne kliknięcie

Rozpocząć implementację `revealCell(board, index)` od warunków ochronnych:

- nieprawidłowy indeks;
- stan `won` albo `lost`;
- pole oflagowane.

Pierwsze odkrycie:

1. Jeżeli kliknięte pole w stanie `idle` nie ma miny, rozpocząć zwykłe odkrywanie.
2. Jeżeli ma minę, znaleźć pole o najniższym indeksie, które nie ma miny i nie jest klikniętym polem.
3. Przenieść minę na znalezione pole.
4. Ponownie obliczyć `adjacent` dla planszy.
5. Odkryć pierwotnie kliknięte, już bezpieczne pole.
6. Jeżeli nie istnieje miejsce docelowe, pozostawić minę, odkryć ją i ustawić `lost`.

Po pierwszym bezpiecznym odkryciu stan przechodzi z `idle` do `playing`, chyba że ten sam ruch od razu spełnia warunek wygranej. Wtedy stan końcowy to `won`.

Testy tego kroku:

- pierwsze kliknięcie bez miny;
- relokacja miny na najniższy możliwy indeks;
- ponowne przeliczenie `adjacent` po relokacji;
- brak miejsca na relokację i przegrana;
- brak odkrycia pola oflagowanego;
- brak mutacji wejściowej planszy.

Warunek ukończenia: pierwsze kliknięcie zachowuje się dokładnie według specyfikacji.

Commit i push:

```powershell
git add src/logic/board.ts src/logic/board.test.ts
git commit -m "feat: implement safe first reveal"
git push origin main
```

### Krok 6 — kaskada oraz warunek wygranej

Kaskadę zaimplementować iteracyjnie za pomocą kolejki albo stosu, aby nie ryzykować przepełnienia stosu wywołań.

Algorytm:

1. Dodać indeks odkrywanego pola do kolejki.
2. Pomijać komórki już odkryte lub oflagowane.
3. Odkryć bieżącą komórkę.
4. Jeżeli ma `adjacent === 0`, dodać do kolejki jej poprawnych sąsiadów.
5. Nigdy nie odkrywać pól oflagowanych.
6. Po kaskadzie sprawdzić, czy każde pole bez miny jest odkryte.
7. Jeżeli tak, ustawić `won`; w przeciwnym razie pozostawić `playing`.

Testy tego kroku:

- kaskada pustych pól;
- odkrycie cyfr graniczących z pustym obszarem;
- zatrzymanie kaskady na polach z cyframi;
- pominięcie oflagowanego pola;
- wygrana po odkryciu wszystkich bezpiecznych pól;
- natychmiastowa wygrana na planszy bez min.

Warunek ukończenia: kaskada i warunek zwycięstwa przechodzą w testach dla środka oraz krawędzi planszy.

Commit i push:

```powershell
git add src/logic/board.ts src/logic/board.test.ts
git commit -m "feat: add reveal cascade and win detection"
git push origin main
```

### Krok 7 — chording i pełne zachowanie przegranej

Chording zaimplementować jako zachowanie `revealCell` wywołanego na już odkrytej komórce z `adjacent > 0`.

Algorytm:

1. Pobrać wszystkich sąsiadów odkrytej komórki.
2. Policzyć sąsiadów z flagą.
3. Jeżeli liczba flag nie jest równa `adjacent`, zwrócić planszę bez zmian.
4. Jeżeli jest równa, odkryć wszystkich nieodkrytych i nieoflagowanych sąsiadów.
5. Dla pustych sąsiadów uruchomić tę samą kaskadę.
6. Jeżeli którykolwiek odkrywany sąsiad zawiera minę, ustawić `lost`.

Źle postawiona flaga spowoduje przegraną naturalnie: prawdziwa mina pozostanie nieoflagowana i zostanie odkryta przez chording.

Testy tego kroku:

- brak chordowania przy zbyt małej liczbie flag;
- brak chordowania przy zbyt dużej liczbie flag;
- poprawne odkrycie sąsiadów przy prawidłowych flagach;
- uruchomienie kaskady przez chording;
- przegrana przy nieprawidłowo ustawionej fladze;
- zablokowanie dalszych ruchów po przegranej.

Warunek ukończenia: komplet wymaganych reguł gry działa bez Reacta i przechodzi w testach.

Commit i push:

```powershell
git add src/logic/board.ts src/logic/board.test.ts
git commit -m "feat: implement cell chording"
git push origin main
```

### Krok 8 — połączenie danych, logiki i stanu Reacta

Utworzyć komponent `Game`, który przechowuje:

- identyfikator wybranego poziomu;
- aktualny obiekt `Board`;
- ewentualny komunikat o błędnych danych poziomu.

Zachowania:

- wybór poziomu tworzy nową planszę przez `createBoard`;
- restart ponownie tworzy planszę z obecnego poziomu;
- lewy przycisk wywołuje `revealCell`;
- prawy przycisk blokuje menu kontekstowe i wywołuje `toggleFlag`;
- komponenty nie powielają reguł gry z `board.ts`;
- licznik korzysta z liczby faktycznych min w `board.cells` minus liczba flag;
- po przegranej wszystkie pola zawierające miny są widoczne w interfejsie, bez mutowania planszy tylko na potrzeby renderowania.

Warunek ukończenia: można wybrać poziom, rozpocząć grę, flagować, restartować oraz zobaczyć wynik.

Commit i push:

```powershell
git add src/App.tsx src/components src/data src/main.tsx
git commit -m "feat: build playable Minesweeper interface"
git push origin main
```

### Krok 9 — SCSS, BEM i dostępność interfejsu

Utworzyć centralny plik `src/styles/_variables.scss` z CSS custom properties dla:

- tła aplikacji i planszy;
- pól zakrytych, odkrytych, oflagowanych i min;
- tekstu oraz obramowań;
- cyfr od 1 do 8;
- wszystkich odstępów;
- rozmiaru komórki;
- promieni zaokrągleń;
- rozmiarów tekstu;
- innych użytych wymiarów wizualnych.

W plikach komponentów nie wpisywać bezpośrednio kolorów, odstępów ani rozmiarów. Wszystkie takie wartości mają pochodzić ze zmiennych CSS.

Konwencja klas:

```text
game
game__header
game__controls
game__status
board
board__cell
board__cell--revealed
board__cell--flagged
board__cell--mine
board__cell--number-1
...
board__cell--number-8
```

Dostępność:

- komórki planszy powinny być elementami `button` w DOM;
- każda komórka powinna mieć czytelny `aria-label` zależny od stanu;
- komunikat wygranej lub przegranej powinien być jednoznaczny;
- kontrolki powinny działać z klawiatury w podstawowym zakresie;
- focus powinien być widoczny;
- plansza powinna być czytelna na mniejszym ekranie, np. przez przewijany kontener.

Warunek ukończenia: UI spełnia ograniczenia stylistyczne, ma BEM i pozostaje czytelny dla wszystkich poziomów.

Commit i push:

```powershell
git add src/components src/styles src/App.tsx src/main.tsx
git commit -m "style: add responsive BEM game styling"
git push origin main
```

### Krok 10 — testy przypadków brzegowych i audyt ograniczeń

Rozszerzyć testy do co najmniej następującego zestawu:

1. Poprawne wartości `adjacent`.
2. Sąsiedzi na rogach i krawędziach.
3. Kaskada.
4. Kaskada omijająca flagę.
5. Pierwsze bezpieczne odkrycie.
6. Relokacja na najniższy dostępny indeks.
7. Niemożliwa relokacja.
8. Warunek wygranej.
9. Postawienie i zdjęcie flagi.
10. Brak flagowania odkrytego pola.
11. Brak odkrywania oflagowanego pola.
12. Poprawny chording.
13. Chording z błędną flagą.
14. Brak ruchów po wygranej.
15. Brak ruchów po przegranej.
16. Bezpieczna obsługa indeksów ujemnych i zbyt dużych.
17. Brak mutacji wejściowych obiektów.

Następnie wykonać audyt zakazanych konstrukcji:

```powershell
rg "\bany\b|as any|@ts-ignore|@ts-expect-error|@ts-nocheck|\benum\b" src
```

Ręcznie sprawdzić również:

- brak bibliotek UI i bibliotek do gier siatkowych;
- brak CSS-in-JS;
- brak `canvas`;
- brak Reacta w `src/logic/board.ts`;
- wymagane eksporty mają dokładne sygnatury;
- komórki planszy są elementami DOM;
- brak błędów oraz ostrzeżeń w konsoli przeglądarki;
- każdy poziom z JSON można wybrać bez awarii;
- licznik, restart, wygrana i przegrana są czytelne.

Warunek ukończenia: pełny test, lint i build przechodzą, a audyt nie wykazuje naruszeń.

Commit i push:

```powershell
git add src
git commit -m "test: cover board rules and edge cases"
git push origin main
```

### Krok 11 — przygotowanie kompletnego README po polsku

Zastąpić README startera dokumentem zawierającym dokładnie wymagane informacje:

1. **Jak uruchomić** — wymagania i dokładne komendy `npm install`, `npm run dev`, `npm test`, `npm run build`.
2. **Co zostało wykonane** — pełny zakres oraz elementy świadomie pominięte.
3. **Co znaleziono w danych** — rzeczywiste anomalie z JSON i sposób ich obsługi.
4. **Co było najtrudniejsze** — konkretny problem, analiza i rozwiązanie.
5. **Wykorzystane biblioteki** — po jednym zdaniu o React, Vite, TypeScript, Sass i Vitest oraz uzasadnienie wyboru.
6. **Co można zrobić dalej** — tylko pomysły produkcyjne, bez rozszerzania bieżącego zakresu.
7. **Wykorzystanie AI** — zgodny z prawdą opis pomocy AI przy planowaniu, analizie przypadków brzegowych lub implementacji.

README ma być notatką z pracy i uzasadnieniem decyzji, nie długą instrukcją użytkownika. Wszystkie deklaracje muszą odpowiadać faktycznie wykonanemu zakresowi.

Warunek ukończenia: osoba po czystym klonie może uruchomić projekt wyłącznie na podstawie README.

Commit i push:

```powershell
git add README.md
git commit -m "docs: document setup and implementation decisions"
git push origin main
```

### Krok 12 — końcowa weryfikacja czystego klona

Wykonać ostatnią kontrolę:

```powershell
npm test
npm run lint
npm run build
git status
git log --oneline --decorate -15
```

Jeżeli czas pozwala, sklonować repozytorium do osobnego katalogu tymczasowego i przejść instrukcję z README od zera. Pozwala to wykryć brakujące pliki, niezapisane zależności i instrukcje działające tylko w obecnym środowisku.

Sprawdzić na GitHubie:

- czy wszystkie commity są widoczne;
- czy repozytorium zawiera `src/logic/board.ts`;
- czy znajduje się w nim JSON z planszami;
- czy README wyświetla się poprawnie;
- czy nie wysłano `node_modules`, `dist`, sekretów ani plików lokalnych;
- czy ostatni commit odpowiada lokalnemu `HEAD`.

Jeżeli weryfikacja nie wymaga żadnych zmian, nie tworzyć pustego commita. Jeżeli wykryto drobną poprawkę, zastosować ją, ponownie uruchomić wszystkie kontrole, a następnie:

```powershell
git add <poprawione-pliki>
git commit -m "fix: address final verification issues"
git push origin main
```

Warunek ukończenia: czysty klon instaluje się zgodnie z README, testy, lint i build przechodzą, a lokalny branch jest zsynchronizowany z GitHubem.

## 5. Kolejność priorytetów przy ograniczeniu czasowym

Jeżeli zacznie brakować czasu, nie należy rezygnować z obowiązkowych ograniczeń ani deklarować niewykonanej funkcji jako gotowej. Priorytety:

1. Dokładny kontrakt i poprawność `src/logic/board.ts`.
2. Testy logiki, szczególnie kaskada, pierwsze bezpieczne odkrycie, wygrana, flagi i chording.
3. Działający minimalny interfejs ze wszystkimi wymaganymi akcjami.
4. Obsługa problematycznych danych z JSON.
5. Kompletne README i przechodzący build.
6. Dopieszczanie wyglądu.

Nie należy poświęcać README, testów ani końcowego buildu na dodatkowe animacje, licznik czasu, ranking, zmianę motywu lub inne funkcje spoza zakresu.

## 6. Definicja ukończenia całego zadania

Zadanie jest gotowe dopiero wtedy, gdy:

- istnieje `src/logic/board.ts` z dokładnie wymaganymi typami i funkcjami;
- logika przechodzi własne testy i jest niezależna od Reacta;
- pierwsze odkrycie, kaskada, flagi, wygrana, przegrana i chording działają zgodnie ze specyfikacją;
- wszystkie poziomy z załącznika są obsługiwane bez awarii;
- można wybrać poziom i zrestartować grę;
- prawy przycisk ustawia flagę bez otwierania menu przeglądarki;
- licznik pozostałych min jest widoczny;
- po przegranej widać położenie min;
- style używają SCSS, BEM i centralnych zmiennych CSS;
- projekt nie zawiera zakazanych konstrukcji ani bibliotek;
- `npm test`, `npm run lint` i `npm run build` przechodzą;
- README zawiera wszystkie siedem wymaganych punktów;
- historia Git składa się z logicznych Conventional Commitów;
- **po każdym wykonanym kroku jego commit został wypchnięty na `origin/main`**;
- repozytorium można uruchomić z czystego klona według README.
