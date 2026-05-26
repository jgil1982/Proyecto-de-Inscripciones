# Guía de Despliegue — SPI Social Platform

## Requisitos del Servidor

- Windows Server 2019/2022
- IIS 10+
- .NET 8 Hosting Bundle
- SQL Server Express (o superior)
- Node.js 20+ (solo para build del frontend)
- URL Rewrite Module para IIS
- ARR (Application Request Routing) para IIS

---

## 1. Preparar SQL Server

```sql
-- En SSMS, ejecutar:
-- scripts/create-database.sql
```

---

## 2. Backend — Build y Publicación

```powershell
# Desde la carpeta raíz del backend
cd "SocialPlatform"

# Restaurar paquetes
dotnet restore

# Ejecutar migraciones
dotnet ef database update \
  --project src/SocialPlatform.Infrastructure \
  --startup-project src/SocialPlatform.API

# Publicar en modo Release
dotnet publish src/SocialPlatform.API \
  -c Release \
  -o C:\inetpub\socialplatform\api \
  --self-contained false
```

---

## 3. Frontend — Build

```bash
cd social-platform-frontend
npm install
npm run build
# Los archivos estáticos quedan en: dist/
```

Copiar `dist/` a `C:\inetpub\socialplatform\app\`

---

## 4. Configurar IIS

### App Pool Backend

```
Nombre: SocialPlatform-API
.NET CLR Version: No Managed Code
Pipeline: Integrated
Identity: ApplicationPoolIdentity (o cuenta de dominio)
```

### App Pool Frontend

```
Nombre: SocialPlatform-Frontend
.NET CLR Version: No Managed Code
Pipeline: Integrated
```

### Sitio API

```
Nombre: SocialPlatform-API
Path: C:\inetpub\socialplatform\api
App Pool: SocialPlatform-API
Binding: HTTPS port 443 (certificado SSL requerido)
Hostname: api.spi.ci.org
```

### Sitio Frontend

```
Nombre: SocialPlatform-Frontend
Path: C:\inetpub\socialplatform\app
App Pool: SocialPlatform-Frontend
Binding: HTTPS port 443
Hostname: app.spi.ci.org  (o spi.ci.org)
```

---

## 5. Variables de Entorno Producción

En `appsettings.Production.json` (o User Secrets / Env Vars):

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=.\\SQLEXPRESS;Database=SocialPlatformDB;Trusted_Connection=True;TrustServerCertificate=True"
  },
  "Jwt": {
    "Secret": "CAMBIAR_POR_CLAVE_SEGURA_MINIMO_32_CHARS!!",
    "Issuer": "SocialPlatform",
    "Audience": "SocialPlatformUsers",
    "ExpiryMinutes": "60"
  },
  "Cors": {
    "AllowedOrigins": ["https://app.spi.ci.org", "https://spi.ci.org"]
  }
}
```

**IMPORTANTE:** Nunca commitear `appsettings.Production.json` con credenciales reales.

---

## 6. Frontend — Variable de entorno

Crear `.env.production` antes del build:

```
VITE_API_URL=https://api.spi.ci.org/api
```

Luego: `npm run build`

---

## 7. Permisos IIS

```powershell
# Dar permisos al App Pool sobre la carpeta de la app
icacls "C:\inetpub\socialplatform\api" /grant "IIS AppPool\SocialPlatform-API:(OI)(CI)RW"
icacls "C:\inetpub\socialplatform\api\logs" /grant "IIS AppPool\SocialPlatform-API:(OI)(CI)RW"
```

---

## 8. Usuarios Demo (Seeder automático)

El sistema crea automáticamente al iniciar:

| Usuario | Contraseña | Rol |
|---------|-----------|-----|
| admin@spi.ci.org | Admin@123456! | SuperAdmin |
| iglesia@spi.ci.org | Church@123456! | ChurchAdmin |

**Cambiar contraseñas en producción.**

---

## 9. HTTPS con IIS

1. Generar certificado SSL (Let's Encrypt con win-acme, o certificado corporativo)
2. Importar en IIS → Server Certificates
3. Asociar al binding HTTPS del sitio

---

## 10. Troubleshooting

- **502.5 Process Failure**: Verificar .NET Hosting Bundle instalado
- **403.14 Directory listing**: Verificar `web.config` existe y URL Rewrite está instalado
- **CORS errors**: Verificar `AllowedOrigins` en appsettings incluye el dominio del frontend
- **401 en API**: Verificar JWT Secret coincide entre appsettings de build y producción
- **DB Connection**: Verificar cadena de conexión y que SQL Server Express está corriendo

---

## Estructura Final en Servidor

```
C:\inetpub\socialplatform\
├── api\                    ← Backend publicado
│   ├── SocialPlatform.API.dll
│   ├── web.config
│   ├── appsettings.json
│   └── logs\
└── app\                    ← Frontend compilado
    ├── index.html
    ├── assets\
    └── web.config
```
