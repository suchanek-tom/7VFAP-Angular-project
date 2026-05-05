# Semestrální projekt – Angular

Frontendová aplikace vytvořená v rámci semestrálního projektu. Implementuje správu položek s JWT autentizací, chráněnými routami a plnohodnotným CRUD rozhraním postaveným nad lokálním mock API serverem.

## Technologie

- **Angular 21** – standalone komponenty, signals, funkcionální interceptory a guards
- **Angular Material 21** – UI komponenty (Material 3 téma)
- **Tailwind CSS 4** – utility třídy pro layout
- **Vitest** – unit testy

## Struktura aplikace

```
src/app/
├── core/
│   ├── guards/        # authGuard – ochrana privátních rout
│   ├── interceptors/  # authInterceptor – přidává Bearer token do HTTP požadavků
│   ├── models/        # Item, User, LoginRequest, LoginResponse
│   └── services/      # AuthService, ApiService
└── features/
    ├── auth/login/    # Přihlašovací stránka
    ├── dashboard/     # Přehled se statistikami a záložkami
    ├── items/
    │   ├── item-list/ # Tabulka s řazením, vyhledáváním a stránkováním
    │   └── item-form/ # Formulář pro vytvoření / úpravu položky
    └── layout/shell/  # Hlavní rozložení – sidenav + toolbar
```

## Splněné požadavky zadání

| Požadavek | Implementace |
|-----------|-------------|
| Přihlašovací stránka s JWT | `POST /api/login` → token uložen do `localStorage` |
| Menu + router | Sidenav s `routerLink`, lazy-loaded routes, wildcard přesměrování |
| Local storage | `auth_token` a `auth_user` klíče v `AuthService` |
| CRUD API volání | `getItems`, `getItem`, `createItem`, `updateItem`, `deleteItem` |
| Tabulka (vyhledávání, řazení, stránkování) | `MatTable` + `MatSort` + `MatPaginator` |
| Datepicker | Pole `created_at` v `ItemForm` |
| Button | `mat-raised-button`, `mat-icon-button` |
| Snackbar | Potvrzení a chyby při přihlášení i ukládání položky |
| Tabs | Dashboard – záložky Přehled, Nedávná aktivita, O aplikaci |

## Přihlašovací údaje (mock)

```
E-mail:   student@univerzita.cz
Heslo:    mojetajneheslo
```

## Spuštění

Nejprve nainstalujte závislosti:

```bash
npm install
```

### 1. Spusťte mock API server (port 3000)

```bash
npm run start:mock
```

Dostupné endpointy:

| Metoda | Endpoint | Popis |
|--------|----------|-------|
| POST | `/login` | Přihlášení, vrací `{ token }` |
| GET | `/items` | Seznam všech položek |
| POST | `/items` | Vytvoření nové položky (201) |
| GET | `/items/:id` | Detail položky |
| PUT | `/items/:id` | Aktualizace položky |
| DELETE | `/items/:id` | Smazání položky (204) |

### 2. Spusťte Angular dev server (port 4200)

```bash
npm start
```

Otevřete prohlížeč na adrese `http://localhost:4200/`.

Angular dev server automaticky přesměrovává požadavky na `/api/*` na mock server přes proxy konfiguraci v `proxy.conf.json`, čímž se obchází CORS omezení prohlížeče.

## Sestavení produkční verze

```bash
npm run build
```

Výsledné soubory jsou uloženy ve složce `dist/`.

## Testy

```bash
npm test
```

Testy jsou spouštěny pomocí [Vitest](https://vitest.dev/).
