'use client';

import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  ShieldCheck, 
  Database, 
  Wifi, 
  Building2, 
  FileText, 
  Scale, 
  Heart, 
  CheckCircle2, 
  Info,
  Radio
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'system' | 'legal'>('legal');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="relative flex flex-col w-full max-w-lg max-h-[94vh] rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl text-slate-800 dark:text-slate-100 overflow-hidden transition-colors">
        
        {/* Cabecera */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">EKKLESIA Music</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Desarrollado por <strong className="text-amber-500">Tegra Development</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Selector de Pestañas */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/50 p-1.5 gap-1.5 text-xs">
          <button
            onClick={() => setActiveTab('legal')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-bold transition ${
              activeTab === 'legal'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Scale className="h-4 w-4" />
            <span>Derechos de Autor & Tegra</span>
          </button>

          <button
            onClick={() => setActiveTab('system')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-bold transition ${
              activeTab === 'system'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Wifi className="h-4 w-4" />
            <span>Estado del Sistema</span>
          </button>
        </div>

        {/* Contenido Desplazable */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          
          {/* ========================================================================= */}
          {/* TAB 1: DERECHOS DE AUTOR & TEGRA DEVELOPMENT                             */}
          {/* ========================================================================= */}
          {activeTab === 'legal' && (
            <div className="space-y-3.5">
              
              {/* Tarjeta de Titularidad y Licencia Gratuita */}
              <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-amber-600/5 to-transparent p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-amber-500" />
                    <div>
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                        Tegra Development
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        Titular de Derechos de Autor & Propiedad Intelectual
                      </p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] font-black uppercase text-amber-700 dark:text-amber-400 bg-amber-500/20 px-2.5 py-1 rounded-full border border-amber-500/30">
                    <Heart className="h-3 w-3 text-red-500 fill-red-500" />
                    Software Gratuito
                  </span>
                </div>
                
                <p className="text-[11px] text-slate-700 dark:text-slate-200 leading-relaxed pt-1">
                  <strong>EKKLESIA</strong> es un software diseñado y desarrollado por <strong>Tegra Development</strong>, distribuido de forma <strong>100% gratuita</strong> para la edificación de congregaciones, iglesias, directores de alabanza, bandas y ministerios musicales.
                </p>

                <div className="p-2 rounded-xl bg-slate-900/10 dark:bg-black/30 font-mono text-[10px] text-slate-700 dark:text-slate-300">
                  © 2026 Tegra Development. Todos los derechos reservados.
                </div>
              </div>

              {/* Implicancias Legales: Propiedad del Software */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-3.5 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <span>Propiedad Intelectual del Software</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Todo el código fuente original, algoritmos de procesamiento digital de audio (afinador cromático por autocorrelación, pads ambientales, metrónomo vocal, transiciones armónicas), arquitectura P2P, interfaces de usuario y marcas son propiedad intelectual exclusiva de <strong>Tegra Development</strong>.
                </p>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 pt-1 space-y-0.5">
                  <p>• <strong>Uso Gratuito Ilimitado</strong>: Permitido en cualquier número de dispositivos personales o de la iglesia.</p>
                  <p>• <strong>Prohibición Comercial</strong>: Queda prohibida la venta, alquiler o monetización con fines de lucro por terceros de este software o sus instaladores (APK).</p>
                </div>
              </div>

              {/* Implicancias sobre Repertorios Musicales de Terceros (CCLI) */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-3.5 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  <Scale className="h-4 w-4 text-emerald-500" />
                  <span>Contenidos y Obras Musicales de Terceros</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  EKKLESIA opera como una herramienta tecnológica y atril digital neutral. Las letras, partituras, canciones y progresiones armónicas introducidas, editadas o consultadas por los usuarios pertenecen a sus respectivos autores, compositores y sociedades de gestión (CCLI, ASCAP, BMI, SACM, SGAE).
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 italic">
                  * Tegra Development no reclama derechos de autor sobre las canciones de terceros gestionadas por los músicos en la plataforma.
                </p>
              </div>

              {/* Atribución Bíblica */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-3.5 space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  <Info className="h-4 w-4 text-purple-500" />
                  <span>Texto Bíblico Reina-Valera 1960</span>
                </div>
                <p className="leading-relaxed">
                  Santa Biblia, Reina-Valera 1960 ® © Sociedades Bíblicas en América Latina, 1960. Renovado © Sociedades Bíblicas Unidas, 1988. Utilizado para fines de adoración, liturgia y estudio espiritual.
                </p>
              </div>

              {/* Deslinde de Garantía */}
              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                <strong>Aviso Legal "Tal Cual" (As-Is):</strong> El software se entrega de manera libre y gratuita sin garantías directas de comerciabilidad o idoneidad para un fin específico. Tegra Development no se responsabiliza por fallas de redes locales externas o interrupciones en eventos en vivo.
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: ESTADO DEL SISTEMA & RED                                          */}
          {/* ========================================================================= */}
          {activeTab === 'system' && (
            <div className="space-y-3.5">
              
              {/* Tarjeta Gemini 3.8 Flash Activo */}
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-emerald-500" />
                    <span className="font-bold text-slate-900 dark:text-white">Motor Gemini IA Flash</span>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    ACTIVO
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  La integración con Google Gemini permite extraer canciones, cifrados y pasajes bíblicos automáticamente con inteligencia artificial.
                </p>
              </div>

              {/* Tarjeta Modo Autónomo & Red P2P */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-3.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Radio className="h-4 w-4 text-amber-500" />
                    <span className="font-bold text-slate-900 dark:text-white">Red P2P & Modo Autónomo</span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400">
                    Puerto 8080
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  La aplicación funciona 100% offline mediante activos embebidos y base de datos local IndexedDB. Para ensayos en grupo, cualquier dispositivo puede ser Director mediante emparejamiento QR.
                </p>
              </div>

              {/* Tarjeta Base de Datos y Motor Musical */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-3.5 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  <Database className="h-4 w-4 text-purple-500" />
                  <span>Almacenamiento Local en Dispositivo</span>
                </div>
                <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                  <p>• Base de datos <strong>IndexedDB (EkklesiaLocalDB)</strong> integrada en el dispositivo.</p>
                  <p>• Motor armónico bilingüe: Cifrado Americano (C, D) y Claves de Solfa (Do, Re).</p>
                  <p>• Respaldos exportables en formato JSON para compartir por WhatsApp.</p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer con Atribución Permanente */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <div className="text-[10px] text-slate-500 dark:text-slate-400 text-center sm:text-left">
            <span>© 2026 <strong>Tegra Development</strong></span>
            <span className="mx-1.5">•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">App Gratuita para el Ministerio</span>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 font-bold text-slate-950 transition shadow-md shadow-amber-500/20 text-xs"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
