# Guía Completa: Configuración de Stripe

## 🎯 Objetivo
Activar los pagos reales en tu aplicación RAM usando Stripe.

---

## Paso 1: Crear Cuenta en Stripe

1. **Ve a**: [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. **Regístrate** con tu email
3. **Completa** el formulario
4. **Activa** el modo TEST (no necesitas tarjeta aún)

---

## Paso 2: Obtener API Keys

1. Una vez en el Dashboard, busca **"Developers"** en el menú lateral
2. Click en **"API keys"**
3. Verás dos keys:
   ```
   Publishable key: pk_test_51...
   Secret key: sk_test_... (click "Reveal" para verla)
   ```
4. **Copia ambas** (las usaremos en el siguiente paso)

---

## Paso 3: Crear Archivo de Variables de Entorno

### En tu terminal:

```bash
cd /Users/a_villehoss/Documents/Antigravity/RAM
touch .env
```

### Abre `.env` y pega esto (reemplaza con tus keys reales):

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_PEGA_TU_SECRET_KEY_AQUI
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_PEGA_TU_PUBLISHABLE_KEY_AQUI

# Application
JWT_SECRET=cambia-esto-por-algo-super-secreto-y-largo
NEXT_PUBLIC_URL=http://localhost:3000
```

**⚠️ IMPORTANTE**: Nunca subas este archivo a GitHub (ya está en .gitignore)

---

## Paso 4: Crear Productos en Stripe

### 4.1 Producto Premium Mensual

1. En el Dashboard → **"Products"** → **"Add product"**
2. Llena los campos:
   ```
   Name: Premium Plan
   Description: Acceso completo a todas las funciones
   ```
3. En "Pricing":
   ```
   Price: 149 MXN
   Billing period: Monthly
   ```
4. Click **"Add product"**
5. **¡IMPORTANTE!** Copia el **Price ID** (empieza con `price_...`)

### 4.2 Producto Lifetime

1. Repite el proceso con:
   ```
   Name: Lifetime Plan
   Description: Acceso de por vida
   Price: 2499 MXN
   Billing period: One time
   ```
2. Copia también este **Price ID**

---

## Paso 5: Actualizar el Código

Una vez que tengas los **Price IDs**, házmelo saber y te ayudo a actualizar el archivo:

`app/api/stripe/checkout/route.js`

Cambia las líneas 15-18 por:

```javascript
const priceIds = {
  premium: 'price_TU_PRICE_ID_PREMIUM_AQUI',
  lifetime: 'price_TU_PRICE_ID_LIFETIME_AQUI'
};
```

---

## Paso 6: Reiniciar el Servidor

```bash
# Detén el servidor (Ctrl+C en la terminal donde corre)
# Luego reinicia:
npm run dev
```

---

## Paso 7: Probar el Pago

1. Ve a: http://localhost:3000/pricing
2. Click en **"Suscribirse"** del plan Premium
3. Deberías ser redirigido a **Stripe Checkout**
4. Usa esta tarjeta de prueba:
   ```
   Número: 4242 4242 4242 4242
   Fecha: Cualquier fecha futura (ej: 12/34)
   CVC: Cualquier 3 dígitos (ej: 123)
   ```

---

## ❓ FAQ - Preguntas Frecuentes

### ¿Stripe cobra por esto?
- **Modo Test**: GRATIS, ilimitado
- **Modo Producción**: 3.6% + $3 MXN por transacción exitosa

### ¿Qué pasa si el pago falla?
La aplicación muestra un mensaje y vuelve a la página de precios.

### ¿Cómo paso a producción?
1. Activa tu cuenta de Stripe (requiere verificación)
2. Obtén las keys de Live (`sk_live_...` y `pk_live_...`)
3. Actualiza el archivo `.env` con las nuevas keys

---

## 🔐 Seguridad

✅ **La `SECRET_KEY` nunca debe ser visible en el código cliente**  
✅ **Todas las transacciones van por HTTPS en producción**  
✅ **Los datos de tarjeta nunca tocan tu servidor** (Stripe los maneja)

---

## 📞 ¿Necesitas Ayuda?

Si tienes los Price IDs pero no sabes cómo actualizarlos, pégalos aquí y lo hago por ti.
