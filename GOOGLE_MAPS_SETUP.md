# Configuración de Google Maps API

Este archivo contiene las instrucciones para configurar la API key de Google Maps necesaria para el mapa de veterinarias.

## Paso 1: Crear una API Key de Google Maps

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Ve a "APIs & Services" → "Credentials"
4. Haz clic en "Create Credentials" → "API Key"
5. Copia la API key generada

## Paso 2: Habilitar APIs Necesarias

En Google Cloud Console, habilita las siguientes APIs:

- **Maps JavaScript API**
- **Places API**
- **Geocoding API**

Busca cada una en "APIs & Services" → "Library" y haz clic en "Enable".

## Paso 3: Configurar Restricciones de Seguridad (IMPORTANTE)

Para proteger tu API key:

1. En "Credentials", haz clic en tu API key
2. En "Application restrictions":
   - Selecciona "HTTP referrers (web sites)"
   - Agrega: `localhost:*`
   - Agrega: `*.vercel.app/*`
   - Agrega tu dominio personalizado si tienes uno
3. En "API restrictions":
   - Selecciona "Restrict key"
   - Marca: Maps JavaScript API
   - Marca: Places API
   - Marca: Geocoding API
4. Guarda los cambios

## Paso 4: Configurar la Variable de Entorno

### Para desarrollo local:

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_api_key_aqui
```

### Para producción (Vercel):

1. Ve al dashboard de Vercel
2. Selecciona tu proyecto
3. Ve a "Settings" → "Environment Variables"
4. Agrega:
   - **Name**: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
   - **Value**: Tu API key
   - **Environment**: Production, Preview, Development
5. Redeploy el proyecto

## Costos

Google Maps tiene un tier gratuito generoso:

- **$200 USD de crédito mensual gratis**
- Maps JavaScript API: $7 por cada 1,000 cargas
- Places API: $17 por cada 1,000 búsquedas

Para uso normal (< 500 usuarios/mes), deberías mantenerte en el tier gratuito.

## Verificación

Después de configurar la API key:

1. Reinicia el servidor de desarrollo: `npm run dev`
2. Navega a `/directory`
3. Concede permiso de ubicación
4. Deberías ver veterinarias cercanas en el mapa

## Solución de Problemas

### "API key no configurada"
- Verifica que el archivo `.env.local` existe
- Verifica que la variable se llama exactamente `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- Reinicia el servidor de desarrollo

### "This API project is not authorized to use this API"
- Verifica que Maps JavaScript API y Places API están habilitadas
- Espera unos minutos después de habilitar las APIs

### "RefererNotAllowedMapError"
- Configura las restricciones HTTP referrer en la API key
- Asegúrate de incluir `localhost:*` para desarrollo local
