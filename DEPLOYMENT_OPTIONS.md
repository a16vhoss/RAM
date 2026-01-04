# Cómo Subir tu Aplicación RAM 🚀

Para publicar tu aplicación en internet, tenemos una decisión técnica importante que tomar debido a la base de datos que usamos (**SQLite**).

## El Desafío: SQLite
Actualmente usamos **SQLite**, que guarda los datos en un archivo local (`ram.db`).
- **Problema**: Servicios como Vercel son "serverless" y borran los archivos locales cada vez que se recargan. Si subes la app así, **perderías los datos de los usuarios** constantemente.

## Tienes 2 Opciones:

### Opción A: Vercel + PostgreSQL (Recomendada ⭐️)
La forma profesional y estándar para Next.js.
*   **Pros**:
    *   Nivel Gratuito muy generoso.
    *   Más rápido y escalable.
    *   Base de datos separada y segura.
*   **Contras**:
    *   Requiere **migrar el código** para usar PostgreSQL en lugar de SQLite. (¡Yo puedo hacer esto por ti!)

### Opción B: Railway / VPS (Rápida)
Un servidor que mantiene tus archivos activos.
*   **Pros**:
    *   No hay que cambiar ni una línea de código.
    *   Funciona exactamente igual que en tu PC.
*   **Contras**:
    *   Generalmente **cuesta dinero** ($5/mes apróx) después del periodo de prueba.
    *   Si reinicias el servidor sin configurar un "volumen", también pierdes datos.

---

## 📝 Pasos para Opción A (Vercel) - Si eliges esta:
1.  **Crear Repositorio en GitHub**: Subir tu código.
2.  **Crear Base de Datos**: Usar NeonDB o Vercel Postgres (Gratis).
3.  **Refactorizar Código**: Yo cambiaría `better-sqlite3` por `pg` (Postgres).
4.  **Conectar Vercel**: Se conecta a tu GitHub y se deploya automático.

## 📝 Pasos para Opción B (Railway) - Si eliges esta:
1.  **Crear Repositorio en GitHub**.
2.  **Conectar Railway**: Iniciar proyecto desde GitHub.
3.  **Configurar Variables**: Agregar tus claves de Stripe.
4.  **Listo**: Tu app corre tal cual está.

---

### ¿Cuál prefieres?

*   **"Quiero la opción profesional y gratis (Vercel)"** → Dime esto y comenzaré a migrar el código a PostgreSQL ahora mismo.
*   **"Quiero subirlo ya, sin cambios (Railway)"** → Solo necesitas una cuenta de GitHub y Railway.
