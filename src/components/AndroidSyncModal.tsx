'use client';

import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Download, 
  Wifi, 
  QrCode, 
  Copy, 
  Check, 
  ShieldCheck, 
  Zap, 
  Volume2, 
  Globe,
  Share2
} from 'lucide-react';

interface AndroidSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  serverUrl?: string;
  tunnelUrl?: string;
}

export default function AndroidSyncModal({
  isOpen,
  onClose,
  serverUrl,
  tunnelUrl
}: AndroidSyncModalProps) {
  const [copied, setCopied] = useState(false);
  const detectedOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const [currentHost, setCurrentHost] = useState(serverUrl || detectedOrigin);
  const [activeChannel, setActiveChannel] = useState<'tunnel' | 'local'>(tunnelUrl ? 'tunnel' : 'local');

  if (!isOpen) return null;

  const currentDownloadUrl = activeChannel === 'tunnel' && tunnelUrl
    ? `${tunnelUrl}/api/download-apk`
    : `${currentHost}/api/download-apk`;

  const handleCopyUrl = (urlToCopy: string) => {
    navigator.clipboard.writeText(urlToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(currentDownloadUrl)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="relative flex flex-col w-full max-w-2xl max-h-[96vh] sm:max-h-[92vh] rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl text-slate-800 dark:text-slate-100 overflow-hidden transition-colors">
        
        {/* Cabecera */}
        <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">
              <Smartphone className="h-5 w-5 stroke-[2.4]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  Descargar e Instalar EKKLESIA en Android
                </h3>
                <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400">
                  APK v1.0
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Instalador directo para celulares y tablets de los músicos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">

          {/* Selector de Canal de Descarga */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-1">
            <button
              onClick={() => setActiveChannel('tunnel')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-bold text-xs transition ${
                activeChannel === 'tunnel'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Globe className="h-4 w-4" />
              <span>Canal Seguro HTTPS (Escaneo Universal)</span>
            </button>
            <button
              onClick={() => setActiveChannel('local')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-bold text-xs transition ${
                activeChannel === 'local'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Wifi className="h-4 w-4" />
              <span>Red Wi-Fi Local (IP Directa)</span>
            </button>
          </div>
          
          {/* Campo editable de IP para red local si el usuario abrió en localhost */}
          {activeChannel === 'local' && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 shrink-0">
                <Wifi className="h-4 w-4 text-amber-500" />
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">IP / Host Local:</span>
              </div>
              <input
                type="text"
                value={currentHost}
                onChange={(e) => setCurrentHost(e.target.value)}
                placeholder="http://192.168.1.100:3000"
                className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={() => setCurrentHost(detectedOrigin)}
                className="text-[10px] text-amber-600 dark:text-amber-400 font-bold hover:underline self-end sm:self-auto shrink-0"
              >
                Detectar auto
              </button>
            </div>
          )}
          
          {/* Grilla: Código QR y Descarga Directa */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
            
            {/* Columna QR */}
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-center">
              <span className="font-bold text-slate-900 dark:text-white text-xs mb-1 flex items-center gap-1.5">
                <QrCode className="h-4 w-4 text-emerald-500" />
                Escanea con la Cámara de tu Celular
              </span>
              <p className="text-[10px] text-slate-500 mb-3">
                {activeChannel === 'tunnel' 
                  ? 'Descarga directa e instantánea sobre enlace seguro HTTPS' 
                  : 'Requiere que el celular esté en el mismo Wi-Fi del servidor'}
              </p>

              <div className="p-2.5 rounded-2xl bg-white shadow-md border border-slate-200 inline-block">
                <img
                  src={qrImageUrl}
                  alt="QR Descarga APK"
                  className="w-48 h-48 object-contain rounded-xl"
                />
              </div>

              <div className="mt-2.5 flex items-center gap-2">
                <button
                  onClick={() => handleCopyUrl(currentDownloadUrl)}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition"
                >
                  {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                  <span>{copied ? '¡Copiado!' : 'Copiar enlace de descarga'}</span>
                </button>
              </div>
            </div>

            {/* Columna Métodos de Instalación */}
            <div className="space-y-3">
              <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] block">
                3 Formas Fáciles de Llevar el APK a tu Teléfono:
              </span>

              {/* Opción 1: Enviar por WhatsApp o Mensajería */}
              <div className="p-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400">
                  <Share2 className="h-4 w-4" />
                  <span>Opción 1: Enviar por WhatsApp o Mensajería</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  Descarga el APK en tu computadora con el botón de abajo y envíalo por WhatsApp Web a los miembros del ministerio para instalarlo en un solo toque.
                </p>
              </div>

              {/* Opción 2: Descarga Directa con este Navegador */}
              <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">Opción 2: Descargar instalador</span>
                  <a
                    href="/api/download-apk"
                    download="EKKLESIA.apk"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Descargar APK</span>
                  </a>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Guarda el archivo APK en tu equipo para distribuirlo por USB, Bluetooth o nube a las tablets del escenario.
                </p>
              </div>

              {/* Opción 3: Escaneo QR */}
              <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">Opción 3: Escaneo directo</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Apunta con Google Lens o la cámara de cualquier teléfono o tablet al código QR para iniciar la descarga directamente en el dispositivo móvil.
                </p>
              </div>
            </div>

          </div>

          {/* Recordatorio de Funcionamiento */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 space-y-1 text-slate-600 dark:text-slate-400">
            <h5 className="font-bold text-slate-900 dark:text-white text-xs">
              💡 Una vez instalado en el teléfono:
            </h5>
            <p className="text-[11px] leading-relaxed">
              La app EKKLESIA se conectará al servidor de la iglesia. Todos los cambios que realices en canciones, tonos, o notas bíblicas se sincronizarán en vivo en los celulares sin tener que volver a instalar nada.
            </p>
          </div>

        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-5 py-3">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            Canal activo: {activeChannel === 'tunnel' && tunnelUrl ? 'HTTPS Universal' : currentHost}
          </span>
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 px-5 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 transition"
          >
            Cerrar
          </button>
        </footer>

      </div>
    </div>
  );
}
