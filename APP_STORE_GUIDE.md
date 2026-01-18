# Guía de Publicación en Apple App Store (iOS)

Esta guía detalla los pasos para compilar, configurar y subir tu aplicación RAM al Apple App Store.

## 1. Requisitos Previos

- **Apple Developer Account**: Necesitas una cuenta de desarrollador activa (costo anual ~$99 USD). [Inscribirse aquí](https://developer.apple.com/).
- **Xcode**: Asegúrate de tener instalado Xcode desde la Mac App Store.
- **Dispositivo iOS (Opcional pero recomendado)**: Para probar en un iPhone real antes de subir.

## 2. Configuración de Iconos y Splash Screen (✅ COMPLETADO)

*Antigravity ya ha generado los iconos y pantallas de carga usando tu logo actual.*

## 3. Configuración en Xcode (✅ COMPLETADO)

*Antigravity ya ha realizado las siguientes configuraciones:*
1.  **Bundle Identifier**: Establecido en `app.registroanimal.movil`.
2.  **Permisos de Privacidad**: `Info.plist` actualizado con descripciones para Cámara, Fotos y Ubicación.

Solo necesitas:
1.  Abrir el proyecto en Xcode:
    ```bash
    npx cap open ios
    ```
2.  Verificar que el "Team" en la pestaña **Signing & Capabilities** esté seleccionado (tu cuenta de Apple).

## 4. Crear la App en App Store Connect

1.  Ve a [App Store Connect](https://appstoreconnect.apple.com/).
2.  Mis Apps > Botón (+) > **Nueva App**.
3.  Plataforma: **iOS**.
4.  Nombre: **RAM - Registro Animal**.
5.  Idioma principal: **Español (México)**.
6.  ID del paquete (Bundle ID): Selecciona el que configuraste en Xcode (`app.registroanimal.movil`).
7.  SKU: Un identificador interno (ej. `ram-ios-001`).
8.  Acceso de usuarios: Acceso total.

## 5. Archivar y Subir (Archive & Upload)

1.  En Xcode, selecciona el dispositivo de destino como **"Any iOS Device (arm64)"** (en la barra superior, donde eliges el simulador).
2.  Ve al menú **Product** > **Archive**.
3.  Espera a que termine la compilación.
4.  Se abrirá la ventana "Organizer" con tu archivo.
5.  Haz clic en **Distribute App**.
6.  Selecciona **App Store Connect** > **Upload** > **Next**.
7.  Sigue el asistente (deja las opciones por defecto de gestión de firma automática).
8.  Haz clic en **Upload**.

## 6. Envío a Revisión

1.  Una vez subido, espera unos minutos (Apple procesa el binario).
2.  En **App Store Connect**, ve a la sección **Compilación** (TestFlight o App Store).
3.  Selecciona la compilación que acabas de subir.
4.  Completa toda la información de la ficha de la tienda:
    - **Capturas de pantalla**: Sube capturas del iPhone (puedes tomarlas en el simulador con `Cmd + S` o en tu dispositivo).
    - **Descripción**, **Palabras clave**, **URL de soporte**.
    - **Información de revisión**: Proporciona una cuenta de prueba (usuario/password) para que el revisor de Apple pueda entrar a la app y ver las funciones privadas.
5.  Haz clic en **Enviar para revisión**.

¡Listo! La revisión suele tardar de 24 a 48 horas.
