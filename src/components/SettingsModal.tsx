'use client';

import React from 'react';
import { X, Sparkles, ShieldCheck, Database, Wifi, Music, Smartphone } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4">
      <div className="relative w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-2xl text-slate-800 dark:text-slate-100 transition-colors">
        
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Estado del Sistema EKKLESIA</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Servidor y Motor Inteligente</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Lista de Estados */}
        <div className="py-4 space-y-3 text-xs">
          
          {/* Tarjeta Gemini 3.8 Flash Activo */}
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-500" />
                <span className="font-bold text-slate-900 dark:text-white">Motor Gemini 3.8 Flash</span>
              </div>
              <span className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                CONECTADO
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              La clave oficial de Google Gemini 3.8 está integrada por defecto en el servidor y la app móvil. Puedes buscar canciones, acordes y referencias bíblicas sin tener que ingresar ninguna clave.
            </p>
          </div>

          {/* Tarjeta Servidor Local Wi-Fi */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4 text-amber-500" />
                <span className="font-bold text-slate-900 dark:text-white">Servidor Activo</span>
              </div>
              <span className="text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400">
                {typeof window !== 'undefined' ? window.location.host : 'localhost:3000'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Emisión activa en la red. Los teléfonos y tablets con la app Android EKKLESIA se sincronizan automáticamente con este host sin requerir internet externo.
            </p>
          </div>

          {/* Tarjeta Base de Datos y Motor Musical */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-3.5 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
              <Database className="h-4 w-4 text-purple-500" />
              <span>Base de Datos y Almacenamiento</span>
            </div>
            <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
              <p>• Base de datos SQLite (<code>church-music.db</code>) con respaldo local continuo.</p>
              <p>• Motor bilingüe: Cifrado Americano (C, D) y Claves de Solfa (Do, Re).</p>
              <p>• Canon bíblico Reina Valera 1960 y referencias cruzadas integradas.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 font-bold text-slate-950 transition shadow-md shadow-amber-500/20 text-xs"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
