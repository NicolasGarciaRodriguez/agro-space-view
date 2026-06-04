# AgroSpace

Monorepo con **frontend** (Next.js), **API** (Fastify + MongoDB) y paquete **shared** (tipos, conectores y configuración compartida).

Estructura base lista para desarrollar; los módulos de negocio están como plantillas en `server/src/modules/` y las páginas en `frontend/src/app/`.

---

## Requisitos

- [Node.js](https://nodejs.org/) >= 20
- [Yarn](https://yarnpkg.com/) >= 1.22
- [Docker](https://www.docker.com/) (MongoDB en local)

---

## Instalación

```bash
yarn install
```

---

## Desarrollo local

### 1. Base de datos

**Local (por defecto):** MongoDB en `127.0.0.1:27017` sin autenticación. La API usa la base `agrospace` (ver `MONGODB_URI` en `server/.env.example`).

**Alternativa con Docker:**

```bash
yarn db:up
```

Usuario/contraseña/base: `agrospace` — en ese caso ajusta `MONGODB_URI` en `server/.env` con credenciales y `authSource=admin`.

### 2. Variables del servidor

Copia `server/.env.example` a `server/.env` y ajusta si hace falta.

### 3. Arrancar API y frontend

```bash
# Terminal 1
yarn dev:server

# Terminal 2
yarn dev:frontend
```

O ambos a la vez:

```bash
yarn dev
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- API: [http://localhost:3001/v1](http://localhost:3001/v1)

### Parar MongoDB

```bash
yarn db:down
```

---

## Estructura del monorepo

```
agroSpace/
├── frontend/          # Next.js (puerto 3000)
├── server/            # Fastify + Mongoose (puerto 3001)
├── shared/            # DTOs, conectores HTTP, config
├── docker-compose.yml # MongoDB local
└── package.json
```

### Convenciones (igual que Acciparte)

| Capa | Patrón |
|------|--------|
| Server módulo | `*.routes.ts`, `*.controller.ts`, `*.repository.ts`, `*.mapper.ts`, `*.interface.ts`, `*.config.ts` |
| Shared | `dtos/`, `conectors/`, `services/`, `utils/`, `config/` |
| Frontend página | `page.tsx` + `components/<nombre>/` con `.component.tsx`, `.module.scss`, `.interface.ts`, `.config.ts` |

---

## Próximos pasos sugeridos

1. Definir modelos Mongoose en `server/src/db/models/`.
2. Añadir DTOs y conectores en `shared/`.
3. Implementar rutas en `server/src/modules/` y registrarlas en `server/src/app.ts`.
4. Crear páginas y componentes en `frontend/src/app/`.
