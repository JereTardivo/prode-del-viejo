# El PRODE del Viejo

Liga de Fútbol Fantasía · Historial Completo

## Estructura del proyecto

```
prodeElviejo/
├── index.html              # Shell HTML principal
├── css/
│   └── styles.css          # Todos los estilos
├── js/
│   ├── config.js           # Firebase config + inicialización
│   ├── data-history.js     # Datos históricos de todas las temporadas
│   ├── render.js           # buildSeason(), buildGlobalStats(), helpers
│   ├── nav.js              # Navegación de tabs y temporadas
│   ├── admin.js            # Panel admin (Firebase Auth + CRUD)
│   └── app.js              # Init y orquestación
├── firebase-rules.json     # Reglas de Realtime Database (copiar en Firebase Console)
└── index.backup.html       # Backup del archivo original monolítico
```

---

## Setup inicial (hacer UNA sola vez)

### 1. Actualizar Firebase Realtime Database Rules

En [Firebase Console](https://console.firebase.google.com/) → proyecto `prode-del-viejo` → **Realtime Database** → **Reglas**:

```json
{
  "rules": {
    ".read": true,
    ".write": false,
    "prode_fechas": {
      ".write": "auth != null"
    }
  }
}
```

Esto asegura que solo usuarios autenticados pueden escribir fechas.

### 2. Habilitar Firebase Authentication

En Firebase Console → **Authentication** → **Sign-in method**:
- Activar **Email/Password**

### 3. Crear el usuario admin

En Firebase Console → **Authentication** → **Users** → **Add user**:
- Email: el email que quieras (ej: `admin@prodeelviejo.com`)
- Password: una contraseña segura

Ese email/contraseña son los que se usan en el panel Admin de la web.

---

## Deploy en GitHub Pages

### Primera vez

1. Crear un repositorio en GitHub (ej: `prodeElviejo`)
2. Subir todos los archivos:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/prodeElviejo.git
   git push -u origin main
   ```
3. En GitHub → Settings → **Pages** → Source: `Deploy from a branch` → Branch: `main` → Folder: `/ (root)` → **Save**

La URL quedará: `https://TU_USUARIO.github.io/prodeElviejo/`

### Actualizar datos (nuevas fechas via código)

```bash
git add .
git commit -m "Agrega fecha 13 Apertura 2026"
git push
```

GitHub Pages actualiza automáticamente en ~1 minuto.

### Actualizar datos (via panel Admin en la web)

Entrá a la web → ⚙️ → ingresá con email/contraseña → cargá la fecha → **Guardar**.  
Los datos se sincronizan en tiempo real en todos los dispositivos.

---

## Agregar una nueva temporada

1. En `js/data-history.js`: agregar el objeto `dataNUEVA` con la misma estructura
2. En `js/data-history.js`: agregar la entrada en `seasonDataMap`, `seasonPrefixMap` y `cupMap`
3. En `index.html`: agregar el botón en `.season-nav` y el bloque `.season-panel`
4. En `js/admin.js`: agregar el botón `.admin-season-btn` en el panel admin
5. En `js/app.js`: agregar `buildSeason(...)` para la nueva temporada
