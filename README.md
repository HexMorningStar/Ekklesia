# EKKLESIA Mobile 📱✨
### *La Plataforma Móvil y Atril Digital Autónomo para Directores de Alabanza, Músicos y Bandas en Vivo*

[![Android](https://img.shields.io/badge/Android-14%2B%20%7C%20API%2034--36-3DDC84?style=for-the-badge&logo=android&logoColor=white)](https://developer.android.com)
[![Kotlin](https://img.shields.io/badge/Kotlin-2.3-7F52FF?style=for-the-badge&logo=kotlin&logoColor=white)](https://kotlinlang.org)
[![Jetpack Compose](https://img.shields.io/badge/Jetpack%20Compose-Material%203-4285F4?style=for-the-badge&logo=jetpackcompose&logoColor=white)](https://developer.android.com/jetpack/compose)
[![Offline First](https://img.shields.io/badge/Offline--First-IndexedDB%20%2B%20Assets-00C853?style=for-the-badge&logo=indexeddb&logoColor=white)](https://developer.mozilla.org/es/docs/Web/API/IndexedDB_API)
[![Web Audio API](https://img.shields.io/badge/Web%20Audio%20API-DSP%20%26%20Stems-FF6F00?style=for-the-badge&logo=audio&logoColor=white)](https://developer.mozilla.org/es/docs/Web/API/Web_Audio_API)
[![P2P Sync](https://img.shields.io/badge/P2P%20Sync-QR%20%26%20PIN%20Pairing-673AB7?style=for-the-badge&logo=wifi&logoColor=white)](#-sincronización-p2p-en-vivo-modo-director-y-músico)
[![License: Free Software by Tegra Development](https://img.shields.io/badge/Copyright-2026%20Tegra%20Development-0052CC?style=for-the-badge)](LICENSE)

---

## 📖 Descripción General

**EKKLESIA Mobile** transforma cualquier dispositivo Android (smartphones y tablets como el **Samsung Galaxy S25 Ultra**, Galaxy Tab, Xiaomi Pad o iPads) en un **atril digital inteligente y 100% autosuficiente**. 

A diferencia de otros sistemas que exigen tener una laptop o computadora encendida en la cabina de sonido ejecutando servidores locales, **EKKLESIA funciona directamente desde la APK**:
* **100% Autónoma**: No depende de ningún servidor externo en PC. Cada músico puede usar la app en su casa o en el templo sin conexión a internet.
* **Almacenamiento Local (IndexedDB)**: Canciones personales, tonalidades elegidas, notas privadas, setlists y la Biblia Reina-Valera 1960 residen dentro de la memoria interna del dispositivo.
* **Dirección Descentralizada P2P**: Cualquier miembro del equipo (en su tablet o teléfono) puede ser designado como **Director**. Al pulsar un botón, genera un **Código QR y PIN de 4 dígitos**; los demás músicos se emparejan y sus atriles reciben los cambios de tema y secciones en tiempo real.
* **Autonomía Musical**: Cada músico mantiene su propia transposición con cejilla (Capo), visualización en Cifrado Americano o Solfa Latina, afinador y notas privadas.

---

## 🏛️ Arquitectura Móvil Autónoma y P2P

```
┌────────────────────────────────────────────────────────────────────────┐
│                        DISPOSITIVO INDIVIDUAL                          │
│                          (Cualquier Músico)                            │
├────────────────────────────────────────────────────────────────────────┤
│  [APK EKKLESIA NATIVA] (Kotlin + Jetpack Compose)                      │
│   ├── Activos Embebidos (WebViewAssetLoader: https://appassets/...)    │
│   ├── Base de Datos Local en Dispositivo (IndexedDB)                   │
│   │    ├── Canciones personales y tonos preferidos                     │
│   │    ├── Setlists de estudio privado                                 │
│   │    └── Canon Bíblico RVR 1960 Completo                             │
│   ├── Herramientas DSP: Afinador cromático, Pads, Círculo Armónico    │
│   └── Microservidor HTTP P2P Embebido en Kotlin (Puerto 8080)          │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ Red Wi-Fi Local o Hotspot del Celular
            ┌────────────────────────┴─────────────────────────┐
            ▼                                                   ▼
┌─────────────────────────────┐         ┌───────────────────────────────┐
│     ROL: DIRECTOR / LÍDER   │         │          ROL: MÚSICO          │
├─────────────────────────────┤         ├───────────────────────────────┤
│ 1. Abre Setlist del día     │         │ 1. Escanea QR del Director    │
│ 2. Activa "Modo Director"   │◄──QR───►│ 2. Pestaña Ensayo se enlaza   │
│ 3. Muestra QR y PIN local   │  o PIN  │ 3. Recibe canción y sección   │
│ 4. Comanda cambios de parte │         │ 4. Conserva transposición     │
│    ([Coro], [Puente], etc.) │         │    personal (Capo / Solfa)    │
└─────────────────────────────┘         └───────────────────────────────┘
```

---

## 📡 Sincronización P2P en Vivo (Modo Director y Músico)

### ¿Cómo dirigir un ensayo sin PC?
1. **El Líder activa la sala**: En el menú superior o en Modo Atril, toca el botón de **Ensayo P2P** y pulsa **"Iniciar Sala como Director"**.
2. **Generación de QR y PIN**: La tablet del líder levanta automáticamente un microservidor local ultraligero en el puerto `8080` y muestra en pantalla un código QR con su PIN de 4 dígitos (ej: `5821`).
3. **Los músicos se conectan**: Cada músico abre EKKLESIA en su propio dispositivo, toca **"Soy Músico"**, escanea el código QR o digita el PIN.
4. **Dirección en tiempo real**:
   - Cuando el director avanza a la siguiente canción, **todos los atriles cambian instantáneamente**.
   - Si el director toca el botón de una sección (**`[Coro]`**, **`[Puente]`**, **`🔁 Repetir`**, **`🎹 Suave`**, **`🛑 Corte`**), la pantalla de todos los músicos resalta esa sección con un borde ámbar brillante y emite una sutil vibración háptica.
5. **Autonomía individual**: El guitarrista sigue viendo sus acordes en posición con Cejilla (ej. Capo 2), el tecladista puede ver Solfa Latina (*Do, Re, Mi*) y el corista lee la letra grande, todos en perfecta sincronía.

---

## 🚀 Las 10 Funciones Clave en el Escenario Móvil

### 1. 📴 Modo Fuera de Línea (IndexedDB & Assets Embebidos)
* Todo el repertorio, tonalidades personalizadas, setlists del ensayo y la Biblia RVR 1960 quedan almacenados en la base de datos interna del dispositivo, funcionando al **100% sin internet**.

### 2. 👑 Sincronización P2P en Vivo entre Músicos
* Sistema Master/Slave sin cables ni servidores. El director cambia de canción o repite secciones espontáneamente y todos los músicos le siguen al unísono.

### 3. 🎸 Afinador Cromático Digital con Micrófono
* Detección precisa de tono por autocorrelación con la Web Audio API. Aguja visual con desviación en cents, calibrado a 440 Hz, con presets para **Guitarra (EADGBE)**, **Bajo (EADG)** y **Ukelele (GCEA)**.

### 4. 🎚️ Reproductor de Multi-Pistas (Multitrack Player / Click & Cues)
* Mesa de mezclas móvil con 5 stems (Pads, Clic, Voz Guía "1,2,3,4", Batería y Bajo) con faders independientes, botones Mute/Solo y **Ruteo Estéreo Dividido (In-Ear Split)**:
  - **Canal Izquierdo (L)**: Clic + Voz Guía (a los audífonos *in-ear* de los músicos).
  - **Canal Derecho (R)**: Pads + Batería + Bajo (al sonido general del templo).

### 5. 📊 Analítica y Rotación de Alabanzas
* Gráfica de distribución de tonalidades dominantes (C, G, D, etc.) y detector automático de **canciones estancadas** (>60 días sin tocarse) para diversificar la ministración dominical.

### 6. 🦶 Pedales Bluetooth y Web MIDI (Manos Libres)
* Conexión con pedales inalámbricos Bluetooth (*AirTurn*, *PageFlip*, *Donner*, *iRig BlueTurn*) y pedaleras MIDI USB. Scroll suave, cambio de canción y control de pads sin soltar el instrumento.

### 7. ⚡ Generador de Transiciones y Modulaciones Asistido
* Motor armónico que calcula acordes puente (V7sus4 ➔ V7, cadencias II-V-I y notas pedal) y redacta la guía paso a paso para piano, guitarra y bajo con sintetizador en tiempo real.

### 8. 📄 Exportador de Cancionero Ministerial a PDF (2 Columnas)
* Genera hojas de acordes vectoriales limpias en **2 columnas**, con selector de tamaño de fuente y acordes destacados que caben en una sola página.

### 9. 🎼 Visualizador de Tablaturas y Riffs Icónicos de 6 Cuerdas
* Visor interactivo de tablaturas de 6 cuerdas con reproducción de audio cuerda por cuerda. Incluye intros de *La Bondad de Dios*, *Hermoso Nombre*, *Alaba*, *Gracia Sublime* y *Rey de Reyes*.

### 10. ⏱️ Reloj de Escenario & Cronómetro de Ministración
* Reloj digital en vivo HH:MM:SS y temporizador regresivo de culto con alertas cromáticas: **Verde** (tiempo óptimo), **Ámbar** (últimos minutos) y **Rojo parpadeante** (tiempo cumplido).

---

## 📲 Instalación y Descarga Directa

### Descargar APK Standalone (`EKKLESIA.apk`)
1. Transfiere o descarga el archivo [`public/EKKLESIA.apk`](public/EKKLESIA.apk) (16 MB) en tu smartphone o tablet Android.
2. Pulsa **Instalar** (permite "Instalar aplicaciones de fuentes desconocidas" si Android lo solicita).
3. ¡Listo! La app se abrirá directamente en modo autónomo, cargando todos sus módulos y base de datos local sin pedir IP de ningún servidor.

### Respaldar y Compartir Cancioneros (Exportar / Importar JSON)
* En el menú **Ensayo P2P ➔ Respaldos**:
  * Pulsa **"Exportar mi Cancionero (JSON)"** para generar un archivo con todas tus canciones y setlists.
  * Comparte el archivo por **WhatsApp**, Telegram o Google Drive.
  * Cualquier otro miembro de la banda pulsa **"Importar Cancionero (JSON)"** para cargar todo el repertorio en su propio dispositivo al instante.

---

## 🛠️ Compilación de la APK desde Código Fuente

Para compilar la versión autónoma empaquetada con todos los activos estáticos y el servidor P2P:

```bash
# 1. Clonar el repositorio
git clone https://github.com/HexMorningStar/EKKLESIA.git
cd EKKLESIA

# 2. Instalar dependencias
npm install

# 3. Compilar la APK Standalone (1 solo comando)
npm run build:apk
```

El script `./scripts/build-standalone-apk.sh`:
1. Genera la exportación estática optimizada de la interfaz web con Next.js.
2. Empaqueta los archivos en los activos nativos de Android (`android/app/src/main/assets/www/`).
3. Compila el binario con Gradle (`./gradlew assembleDebug`).
4. Coloca el APK listo en `public/EKKLESIA.apk`.

---

## ⚖️ Derechos de Autor y Términos Legales (Tegra Development)

**EKKLESIA** es un software desarrollado y publicado por **Tegra Development**.

* **Titularidad del Software**: Copyright © 2026 **Tegra Development**. Todos los derechos reservados. Todo el código fuente, la arquitectura de sincronización P2P, los algoritmos de procesamiento digital de audio (afinador cromático por autocorrelación, pads ambientales continuos, metrónomo vocal sintetizado y modulaciones armónicas), la interfaz de usuario y las marcas asociadas son propiedad intelectual exclusiva de Tegra Development.
* **Modelo de Licencia (100% Gratuito)**: Este software se distribuye de forma **gratuita** (Freeware sin costo de suscripción ni licencia) para uso en congregaciones, iglesias, directores de alabanza y músicos. Queda prohibida la venta, reventa o comercialización con fines de lucro del software o sus binarios por terceros ajenos a Tegra Development.
* **Implicancias sobre Obras Musicales de Terceros (Letras, Acordes y CCLI)**: EKKLESIA opera como una herramienta neutral de gestión y atril digital. Las letras, cifrados de acordes, composiciones y partituras que los usuarios agreguen o consulten son propiedad intelectual exclusiva de sus respectivos autores y sociedades de gestión colectiva (CCLI, ASCAP, BMI, SACM, SGAE). Tegra Development no reclama derechos ni titularidad sobre las canciones de terceros introducidas por los usuarios. Cada congregación es responsable de contar con sus licencias correspondientes (ej. licencias CCLI) para la ejecución pública en sus servicios.
* **Atribución Bíblica**: Santa Biblia, Reina-Valera 1960 ® © Sociedades Bíblicas en América Latina, 1960. Renovado © Sociedades Bíblicas Unidas, 1988. Utilizado con fines litúrgicos y de estudio.
* **Garantía y Responsabilidad**: El software se entrega "tal cual" (*as-is*) sin garantías expresas o implícitas de ningún tipo.

Consulta el texto legal íntegro en el archivo [`LICENSE`](LICENSE).

---

**Tegra Development** • *Excelencia en Soluciones Tecnológicas* • 2026
