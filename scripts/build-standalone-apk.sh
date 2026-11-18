#!/usr/bin/env bash
set -e

# Asegurar que src/app/api siempre sea restaurado ante cualquier salida o interrupción
restore_api() {
  if [ -d "src/app/_api_disabled" ]; then
    echo "Restaurando src/app/api..."
    mv src/app/_api_disabled src/app/api
  fi
}
trap restore_api EXIT INT TERM

echo "================================================="
echo "  EKKLESIA: Compilación de APK 100% Autónoma    "
echo "================================================="

# 1. Exportar la aplicación Next.js a HTML/JS/CSS estático
echo "Paso 1: Generando exportación estática de la web..."
if [ -d "src/app/api" ]; then
  mv src/app/api src/app/_api_disabled
fi

NEXT_EXPORT=true npx next build

if [ -d "src/app/_api_disabled" ]; then
  mv src/app/_api_disabled src/app/api
fi

# 2. Copiar archivos estáticos dentro de los assets nativos de Android
echo "Paso 2: Empaquetando activos estáticos en android/app/src/main/assets/www..."
rm -rf android/app/src/main/assets/www
mkdir -p android/app/src/main/assets/www
cp -r out/* android/app/src/main/assets/www/
# Remover APK recursiva si existía en out
rm -f android/app/src/main/assets/www/EKKLESIA.apk

# 3. Compilar APK con Gradle
echo "Paso 3: Compilando APK nativa de Android..."
cd android
./gradlew assembleDebug --no-daemon -Dorg.gradle.jvmargs="-Xmx1024m"
cd ..

# 4. Publicar APK en public/
echo "Paso 4: Copiando APK compilada a public/EKKLESIA.apk..."
cp android/app/build/outputs/apk/debug/app-debug.apk public/EKKLESIA.apk

echo "================================================="
echo "  ¡COMPILACIÓN EXITOSA!                          "
echo "  APK generada: public/EKKLESIA.apk              "
echo "  Tamaño: $(du -h public/EKKLESIA.apk | cut -f1)"
echo "================================================="
