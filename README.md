# EKKLESIA Mobile 📱✨
### *La Plataforma Móvil y Atril Digital Definitivo para Directores de Alabanza, Músicos y Bandas en Vivo*

[![Android](https://img.shields.io/badge/Android-14%2B%20%7C%20API%2034--36-3DDC84?style=for-the-badge&logo=android&logoColor=white)](https://developer.android.com)
[![Kotlin](https://img.shields.io/badge/Kotlin-2.3-7F52FF?style=for-the-badge&logo=kotlin&logoColor=white)](https://kotlinlang.org)
[![Jetpack Compose](https://img.shields.io/badge/Jetpack%20Compose-Material%203-4285F4?style=for-the-badge&logo=jetpackcompose&logoColor=white)](https://developer.android.com/jetpack/compose)
[![Next.js PWA](https://img.shields.io/badge/Next.js%2015-PWA%20Offline-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![Web Audio API](https://img.shields.io/badge/Web%20Audio%20API-DSP%20%26%20Stems-FF6F00?style=for-the-badge&logo=audio&logoColor=white)](https://developer.mozilla.org/es/docs/Web/API/Web_Audio_API)
[![Web MIDI](https://img.shields.io/badge/Web%20MIDI-Bluetooth%20Pedals-00C853?style=for-the-badge&logo=bluetooth&logoColor=white)](https://developer.mozilla.org/es/docs/Web/API/Web_MIDI_API)

---

## 📖 Descripción General

**EKKLESIA Mobile** transforma cualquier dispositivo Android (smartphones y tablets como el **Samsung Galaxy S25 Ultra**, Galaxy Tab, Xiaomi Pad o iPads) en un **atril digital inteligente de escenario**. 

Diseñado específicamente para las demandas de un ministerio musical contemporáneo, combina un **APK nativo en Kotlin y Jetpack Compose** con un **núcleo PWA ultra-optimizado**, garantizando latencia cero, visualización de acordes en Cifrado Americano o Solfa Latina, pads de adoración continuos, metrónomo con voz guía, sincronización inalámbrica en vivo entre músicos y herramientas avanzadas de audio.

---

## 🏛️ Arquitectura Móvil Híbrida

```
┌────────────────────────────────────────────────────────────────────────┐
│                   DISPOSITIVO MÓVIL (ATRIL DIGITAL)                    │
├────────────────────────────────────────────────────────────────────────┤
│  [EKKLESIA.apk] - Shell Nativo Android (Kotlin + Jetpack Compose)     │
│   ├─ Wake-Lock Permanente (FLAG_KEEP_SCREEN_ON)                       │
│   ├─ Intercepción de Gestos Predictivos (OnBackPressedCallback)       │
│   ├─ Edge-to-Edge Display (Safe Area Insets en status bar y notch)    │
│   └─ Web MIDI API & Puente Bluetooth para Pedales de Pie              │
├────────────────────────────────────────────────────────────────────────┤
│  [PWA Engine & Service Worker] (Cache Stale-While-Revalidate)          │
│   ├─ Cancionero y Tonos (100% Offline en templos sin internet)        │
│   ├─ Biblia Reina-Valera 1960 Completa integrada                       │
│   └─ Web Audio DSP (Afinador cromático, Pads y Secuencias Multipistas) │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ Wi-Fi Local (Latencia 0 ms)
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 SERVIDOR DE CONGREGACIÓN (PC O LAPTOP)                 │
├────────────────────────────────────────────────────────────────────────┤
│  • Next.js 15 Server + Base de Datos SQLite (church-music.db)          │
│  • WebSocket / Polling Live Sync (/api/live-sync)                      │
│  • Transmisor de Letras a Proyector / Beamer & OBS Chroma Verde        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Las 10 Funciones Clave en el Escenario Móvil

### 1. 📴 Modo Fuera de Línea (PWA & Service Worker)
* **El problema**: En templos con muros gruesos, sótanos o retiros campestres suele no haber señal celular ni Wi-Fi estable.
* **La solución**: Service Worker (`sw.js`) con estrategia *Stale-While-Revalidate*. Todo el repertorio, tonalidades personalizadas, setlists del ensayo y la Biblia RVR 1960 quedan cacheados en el almacenamiento local del teléfono, funcionando al **100% sin internet**.

### 2. 👑 Sincronización en Vivo entre Músicos (Live Stage Sync)
* **El problema**: Cuando el director de alabanza decide repetir un coro espontáneamente o alargar un puente, los músicos suelen perderse.
* **La solución**: Sistema Master/Slave en tiempo real. Cuando el director toca un chip en su teléfono (**`[Coro]`**, **`[Puente]`**, **`🔥 Al Coro`**, **`🔁 Repetir`**, **`🎹 Suave`**, **`🛑 Corte`**), **todas las pantallas de los atriles en el escenario cambian y resaltan la sección simultáneamente**.

### 3. 🎸 Afinador Cromático Digital con Micrófono
* **El problema**: Salir de la app de música para abrir una app de afinador en pleno servicio rompe la fluidez.
* **La solución**: Detección de tono por autocorrelación de micrófono con la Web Audio API. Aguja visual con desviación en cents, calibrado a 440 Hz, con presets táctiles para **Guitarra (EADGBE)**, **Bajo (EADG)** y **Ukelele (GCEA)**.

### 4. 🎚️ Reproductor de Multi-Pistas (Multitrack Player / Click & Cues)
* **El problema**: Las bandas necesitan tocar con secuencias y clic, pero no pueden enviar el clic al sonido general de la congregación.
* **La solución**: Mesa de mezclas móvil con 5 stems (Pads, Clic, Voz Guía "1,2,3,4", Batería y Bajo) con faders independientes, botones Mute/Solo y **Ruteo Estéreo Dividido (In-Ear Split)**:
  - **Canal Izquierdo (L)**: Clic + Voz Guía (a los audífonos *in-ear* de los músicos).
  - **Canal Derecho (R)**: Pads + Batería + Bajo (a la consola principal del templo).

### 5. 📊 Analítica y Rotación de Alabanzas
* **El problema**: Los grupos suelen cantar siempre las mismas 5 canciones y agotan la voz del líder en tonalidades muy exigentes.
* **La solución**: Gráfica de distribución de tonalidades dominantes (C, G, D, etc.) y detector automático de **canciones estancadas** (>60 días sin tocarse) para diversificar la ministración dominical.

### 6. 🦶 Pedales Bluetooth y Web MIDI (Manos Libres)
* **El problema**: Guitarristas, pianistas y bateristas tienen las manos ocupadas tocando sus instrumentos y no pueden tocar la pantalla para pasar hojas.
* **La solución**: Conexión nativa con pedales inalámbricos Bluetooth (*AirTurn*, *PageFlip*, *Donner*, *iRig BlueTurn*) y pedaleras MIDI USB (Line 6, Behringer FCB1010). Permite scroll suave, pasar de canción y activar pads sin soltar el instrumento.

### 7. ⚡ Generador de Transiciones y Modulaciones Asistido
* **El problema**: Pasar de una canción en **Sol Mayor (G)** a 72 BPM a otra en **Re Mayor (D)** a 125 BPM sin cortar la atmósfera de adoración.
* **La solución**: Motor armónico que calcula acordes puente (V7sus4 ➔ V7, cadencias II-V-I y notas pedal) y redacta la guía compás por compás para cada músico (piano, guitarra, batería, bajo), con botón **`▶ Escuchar Progresión`** sintetizado en tiempo real.

### 8. 📄 Exportador de Cancionero Ministerial a PDF (2 Columnas)
* **El problema**: Pastores o miembros del coro que requieren carpetas físicas de partituras y hojas de acordes sin saltos de página incómodos.
* **La solución**: Genera con 1 clic hojas de acordes vectoriales limpias en **2 columnas**, con selector de tamaño de fuente y acordes en negrita que caben exactamente en una sola plana.

### 9. 🎼 Visualizador de Tablaturas y Riffs Icónicos de 6 Cuerdas
* **El problema**: Olvidar cómo arranca el arreglo de introducción de temas contemporáneos.
* **La solución**: Visor interactivo de tablaturas de 6 cuerdas (`e, B, G, D, A, E`) con **motor de audio que pulsa las notas cuerda por cuerda** con sonido de guitarra real. Incluye biblioteca con las intros de *La Bondad de Dios*, *Hermoso Nombre*, *Alaba*, *Gracia Sublime* y *Rey de Reyes*.

### 10. ⏱️ Reloj de Escenario & Cronómetro de Ministración
* **El problema**: Extenderse en el tiempo de alabanza y retrasar la predicación o el programa dominical.
* **La solución**: Reloj digital en vivo HH:MM:SS y temporizador regresivo de culto (15, 20, 30, 45 min) con cambio sutil de coloración: **Verde** (tiempo óptimo), **Ámbar** (últimos minutos) y **Rojo parpadeante** (tiempo cumplido).

---

## 📱 Ergonomía Móvil y Experiencia de Usuario (Samsung Galaxy S25 Ultra y Smartphones)

| Característica Móvil | Implementación Técnica | Beneficio en el Escenario |
|---|---|---|
| **Gestos de Regreso** | `OnBackPressedCallback` + `popstate` + Swipe desde el borde izquierdo (`> 65px`) con vibración háptica | El músico puede retroceder con el gesto natural de Android sin salirse accidentalmente de la app. |
| **Wake-Lock Pantalla Activa** | `window.addFlags(FLAG_KEEP_SCREEN_ON)` | La pantalla del atril nunca se apaga a mitad de un canto o ministración. |
| **Borde a Borde (Safe Areas)** | `enableEdgeToEdge()` + `env(safe-area-inset-top)` | La barra de estado y notch de la cámara no tapan los botones superiores. |
| **Barra Inferior Táctil** | `<MobileBottomNav />` fija con altura táctil ergonómica de 48px | Acceso instantáneo con el pulgar a Canciones, Ensayos, Biblia RVR, Círculo Armónico y Gemini IA. |
| **Pitch-Black Dark Mode** | `bg-black` puro en Modo Atril | Cero fatiga visual en escenarios oscuros y ahorro masivo de batería en pantallas AMOLED. |

---

---

## 🚀 Inicio Rápido desde Cero (Cualquier Iglesia o Usuario)

Para desplegar EKKLESIA en tu congregación sin depender de servidores externos ni configuraciones previas:

```bash
# 1. Clonar el repositorio
git clone https://github.com/HexMorningStar/EKKLESIA.git
cd EKKLESIA

# 2. Configurar variables de entorno (Opcional)
cp .env.example .env.local
# Si deseas búsqueda y extracción inteligente de acordes con IA, coloca tu clave de Gemini:
# GEMINI_API_KEY=tu_clave_aqui

# 3. Instalar dependencias
npm install

# 4. Iniciar el servidor local
npm run dev
# O para producción con alto rendimiento:
# npm run build && npm start

# 5. Abrir en el navegador
# http://localhost:3000
```

> [!NOTE]
> La base de datos SQLite se inicializa de forma automática en el primer arranque, limpia y vacía, lista para que comiences desde cero agregando las canciones y repertorios propios de tu ministerio. Si deseas canciones de prueba para familiarizarte con las herramientas, puedes pulsar **"Cargar 4 canciones de demostración"** en el catálogo.

---

## 📲 Métodos de Instalación en el Celular / Tablet

### Método 1: APK Nativo para Android (`EKKLESIA.apk`)
1. Descarga directa en el dispositivo:
   - **Desde la web de la app**: Abre el menú de sincronización móvil en la barra superior o escanea el código QR en pantalla para descargar el APK directamente en el celular o tablet.
   - **Vía USB o WhatsApp**: Transfiere el archivo `EKKLESIA.apk` generado en tu equipo a tu teléfono.
2. Abre el archivo descargado en tu celular y pulsa **Instalar** (permite "Instalar aplicaciones de fuentes desconocidas" en los ajustes de seguridad si Android lo solicita).
3. Abre **EKKLESIA**: en el primer inicio ingresa la URL o IP de tu servidor (ej: `http://192.168.1.100:3000` o `https://tu-dominio.com`). La app recordará la configuración y se conectará en pantalla completa con pantalla siempre activa (*wake-lock*).

### Método 2: Instalación Directa PWA (Sin Instalar APK)
1. Conecta el celular a la red Wi-Fi del templo o abre la URL del servidor en **Google Chrome**, **Samsung Internet** o **Safari**.
2. Toca el menú de opciones (tres puntos verticales `⋮` o botón compartir en iOS).
3. Selecciona **"Agregar a la pantalla principal"** o **"Instalar aplicación"**.
4. ¡Listo! Se creará el ícono de **EKKLESIA** en el cajón de aplicaciones de tu celular con capacidades offline completas.

---

## 🛠️ Compilación del APK Nativo desde Código Fuente

El código fuente nativo de Android se encuentra en el directorio [`android/`](android).

### Requisitos
* JDK 17 o superior (`openjdk-17-jdk`)
* Android SDK Platform 34+ y Build Tools

### Pasos de Compilación
```bash
# 1. Entrar al directorio del proyecto Android
cd android

# 2. Compilar el APK de depuración firmado automáticamente
./gradlew assembleDebug

# 3. El archivo APK generado se ubicará en:
# android/app/build/outputs/apk/debug/app-debug.apk
```

El binario compilado puede copiarse a `public/EKKLESIA.apk` para permitir su descarga directa vía navegador o código QR desde la propia aplicación.

---

## 🌐 Configuración de Red en el Templo

Para que los celulares y tablets de los músicos se sincronicen con la computadora central del sonido:

1. **Conexión por Red Wi-Fi Local (Recomendado para Latencia Cero)**:
   - Conecta la computadora del servidor y los celulares de los músicos a la misma red Wi-Fi del templo.
   - Consulta la IP local de la computadora servidora (`ip a` en Linux/Mac o `ipconfig` en Windows, ej: `192.168.1.50`).
   - Abre en los celulares del atril: `http://TU_IP_LOCAL:3000`.
2. **Conexión Remota / Datos Móviles (Túnel Cloudflare o Nube)**:
   - Si no dispones de un router en el lugar o los músicos utilizan datos móviles 4G/5G, puedes exponer el servidor con un túnel seguro:
     ```bash
     cloudflared tunnel --url http://localhost:3000
     ```
   - Los músicos pueden ingresar mediante la URL HTTPS generada o escaneando el código QR en pantalla.

---

## 📄 Licencia

Desarrollado para la edificación y excelencia de los ministerios de música y alabanza congregacional.
Distribución libre para iglesias y bandas cristianas.
