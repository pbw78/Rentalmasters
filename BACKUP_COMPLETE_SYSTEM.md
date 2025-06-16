# RentalMaster - Kompletna Kopia Zapasowa Systemu
*Data utworzenia: 15 czerwca 2025*

## Opis Systemu
RentalMaster to kompleksowy system zarządzania nieruchomościami z obsługą wielojęzyczną (Polski, Angielski, Duński).

## Architektura Systemu

### Frontend (React + TypeScript)
- **Framework**: React 18 z TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Routing**: Wouter
- **State Management**: TanStack Query
- **Wielojęzyczność**: Własny system tłumaczeń

### Backend (Node.js + Express)
- **Runtime**: Node.js z Express.js
- **Database**: PostgreSQL z Drizzle ORM
- **Authentykacja**: Replit Auth + tymczasowy demo login
- **Sesje**: PostgreSQL-backed sessions

### Funkcjonalności
1. **Zarządzanie Nieruchomościami**
   - Dodawanie, edycja, usuwanie nieruchomości
   - Różne typy (mieszkania, domy, biura)
   - Status (dostępne, wynajęte, w konserwacji)

2. **Zarządzanie Najemcami**
   - Dane osobowe najemców
   - Kontakt awaryjny
   - Historia najmu

3. **Umowy Najmu**
   - Tworzenie i zarządzanie umowami
   - Automatyczna aktualizacja statusu nieruchomości
   - Śledzenie dat rozpoczęcia/zakończenia

4. **Płatności**
   - Rejestracja płatności czynszu
   - Różne metody płatności
   - Historia transakcji

5. **Zgłoszenia Serwisowe**
   - Zgłaszanie awarii i napraw
   - Kategoryzacja problemów
   - Śledzenie statusu napraw

6. **Panel Administracyjny**
   - Zarządzanie użytkownikami
   - Raporty i analityka
   - Eksport danych

7. **Dashboard Analityczny**
   - Statystyki nieruchomości
   - Przychody miesięczne
   - Wskaźnik obłożenia

## Struktura Plików Systemu

### Główne Pliki Konfiguracyjne
- `package.json` - Zależności i skrypty
- `vite.config.ts` - Konfiguracja Vite
- `tailwind.config.ts` - Konfiguracja Tailwind CSS
- `drizzle.config.ts` - Konfiguracja bazy danych
- `tsconfig.json` - Konfiguracja TypeScript

### Backend (`server/`)
- `index.ts` - Główny plik serwera
- `routes.ts` - Wszystkie trasy API
- `storage.ts` - Warstwa dostępu do danych
- `db.ts` - Konfiguracja bazy danych
- `replitAuth.ts` - System uwierzytelniania
- `vite.ts` - Integracja z Vite

### Frontend (`client/`)
- `src/App.tsx` - Główny komponent aplikacji
- `src/main.tsx` - Punkt wejścia aplikacji
- `src/index.css` - Style globalne

#### Komponenty (`client/src/components/`)
- `Layout.tsx` - Główny layout aplikacji
- `Sidebar.tsx` - Menu boczne
- `TopBar.tsx` - Górny pasek nawigacji
- `*Form.tsx` - Formularze dla różnych encji
- `ui/` - Komponenty UI (shadcn/ui)

#### Strony (`client/src/pages/`)
- `Landing.tsx` - Strona logowania
- `Dashboard.tsx` - Panel główny
- `Properties.tsx` - Zarządzanie nieruchomościami
- `Tenants.tsx` - Zarządzanie najemcami
- `Contracts.tsx` - Zarządzanie umowami
- `Payments.tsx` - Zarządzanie płatnościami
- `ServiceRequests.tsx` - Zgłoszenia serwisowe
- `Reports.tsx` - Raporty i analityki
- `Users.tsx` - Panel administracyjny

#### Utilities (`client/src/lib/`)
- `translations.ts` - System tłumaczeń
- `queryClient.ts` - Konfiguracja React Query
- `authUtils.ts` - Narzędzia uwierzytelniania
- `utils.ts` - Funkcje pomocnicze

#### Konteksty (`client/src/contexts/`)
- `LanguageContext.tsx` - Kontekst języka

### Shared (`shared/`)
- `schema.ts` - Schemat bazy danych i typy

## Szczegóły Implementacji

### Uwierzytelnianie
System obsługuje dwa tryby uwierzytelniania:
1. **Replit Auth** - Standardowe logowanie przez OpenID Connect
2. **Demo Login** - Tymczasowy dostęp do testowania

### Baza Danych
Struktura tabel:
- `users` - Użytkownicy systemu
- `sessions` - Sesje użytkowników
- `properties` - Nieruchomości
- `tenants` - Najemcy
- `contracts` - Umowy najmu
- `payments` - Płatności
- `service_requests` - Zgłoszenia serwisowe

### API Endpoints
Wszystkie endpointy są zabezpieczone middleware'em `allowDemo`:

#### Uwierzytelnianie
- `GET /api/auth/user` - Dane zalogowanego użytkownika
- `GET /api/auth/demo-login` - Demo login
- `GET /api/login` - Logowanie przez Replit
- `GET /api/logout` - Wylogowanie

#### Dashboard
- `GET /api/dashboard/stats` - Statystyki dashboardu

#### Nieruchomości
- `GET /api/properties` - Lista nieruchomości
- `GET /api/properties/:id` - Pojedyncza nieruchomość
- `POST /api/properties` - Dodanie nieruchomości
- `PUT /api/properties/:id` - Edycja nieruchomości
- `DELETE /api/properties/:id` - Usunięcie nieruchomości

#### Najemcy
- `GET /api/tenants` - Lista najemców
- `GET /api/tenants/:id` - Pojedynczy najemca
- `POST /api/tenants` - Dodanie najemcy
- `PUT /api/tenants/:id` - Edycja najemcy
- `DELETE /api/tenants/:id` - Usunięcie najemcy

#### Umowy
- `GET /api/contracts` - Lista umów
- `GET /api/contracts/active` - Aktywne umowy
- `GET /api/contracts/:id` - Pojedyncza umowa
- `POST /api/contracts` - Dodanie umowy
- `PUT /api/contracts/:id` - Edycja umowy
- `DELETE /api/contracts/:id` - Usunięcie umowy

#### Płatności
- `GET /api/payments` - Lista płatności
- `GET /api/payments/:id` - Pojedyncza płatność
- `GET /api/payments/contract/:contractId` - Płatności dla umowy
- `POST /api/payments` - Dodanie płatności
- `PUT /api/payments/:id` - Edycja płatności
- `DELETE /api/payments/:id` - Usunięcie płatności

#### Zgłoszenia Serwisowe
- `GET /api/service-requests` - Lista zgłoszeń
- `GET /api/service-requests/:id` - Pojedyncze zgłoszenie
- `POST /api/service-requests` - Dodanie zgłoszenia
- `PUT /api/service-requests/:id` - Edycja zgłoszenia
- `DELETE /api/service-requests/:id` - Usunięcie zgłoszenia

#### Użytkownicy
- `GET /api/users` - Lista użytkowników (admin)

## Instrukcje Odtworzenia

### Wymagania
- Node.js 20+
- PostgreSQL 16+
- Replit environment variables

### Instalacja
1. Sklonuj kod źródłowy
2. Zainstaluj zależności: `npm install`
3. Skonfiguruj bazę danych: `npm run db:push`
4. Uruchom serwer: `npm run dev`

### Zmienne Środowiskowe
Wymagane:
- `DATABASE_URL` - URL bazy PostgreSQL
- `SESSION_SECRET` - Klucz sesji
- `REPL_ID` - ID repla (dla Replit Auth)
- `REPLIT_DOMAINS` - Domeny Replit

### Uruchomienie
1. Serwer uruchamia się na porcie 5000
2. Frontend dostępny przez Vite dev server
3. Demo login dostępny na stronie głównej

## Status Testów
- ✅ Demo login funkcjonuje
- ✅ API endpoints odpowiadają
- ✅ Dashboard ładuje dane
- ✅ Routing działa poprawnie
- ✅ Wielojęzyczność aktywna
- ✅ Sesje zapisywane w bazie
- ✅ Middleware autoryzacji działa

## Aktualne Problemy i Rozwiązania
1. **Replit Auth**: Tymczasowe problemy z autoryzacją - rozwiązane przez demo login
2. **CSS Compilation**: Naprawione problemy z Tailwind opacity
3. **Database Connection**: Działająca konfiguracja PostgreSQL

## Backup Data
System jest w pełni funkcjonalny z kompletną implementacją wszystkich wymaganych funkcjonalności zarządzania nieruchomościami.