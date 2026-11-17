'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Users, 
  Copy, 
  Check, 
  Send, 
  Share2, 
  Calendar, 
  Music,
  CheckCircle2
} from 'lucide-react';

interface TeamRosterModalProps {
  isOpen: boolean;
  setlist: any;
  onClose: () => void;
}

export interface TeamMember {
  role: string;
  name: string;
}

const DEFAULT_ROLES = [
  'Voz Líder / Director',
  'Piano / Teclado',
  'Batería',
  'Bajo Eléctrico',
  'Guitarra Acústica',
  'Guitarra Eléctrica',
  'Coros / Segunda Voz',
  'Sonido y Proyección'
];

export default function TeamRosterModal({
  isOpen,
  setlist,
  onClose
}: TeamRosterModalProps) {
  const [roster, setRoster] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState<boolean>(false);
  const [rehearsalTime, setRehearsalTime] = useState<string>('08:00 AM');

  useEffect(() => {
    if (setlist?.id) {
      const saved = localStorage.getItem(`ekklesia_roster_${setlist.id}`);
      if (saved) {
        try {
          setRoster(JSON.parse(saved));
        } catch (e) {
          // ignore
        }
      }
    }
  }, [setlist?.id]);

  if (!isOpen || !setlist) return null;

  const handleUpdateMember = (role: string, name: string) => {
    const next = { ...roster, [role]: name };
    setRoster(next);
    localStorage.setItem(`ekklesia_roster_${setlist.id}`, JSON.stringify(next));
  };

  const generateWhatsAppMessage = () => {
    const lines: string[] = [];
    lines.push(`🏛️ *EKKLESIA MUSIC - PROGRAMA DE ALABANZA*`);
    lines.push(`📋 *${setlist.title?.toUpperCase() || 'CULTO'}*`);
    lines.push(`📅 *Fecha:* ${setlist.event_date || 'Domingo'} • ${setlist.service_type || 'Culto'}`);
    lines.push(`⏰ *Cita / Ensayo:* ${rehearsalTime}`);
    lines.push(``);
    lines.push(`👥 *EQUIPO MINISTERIAL ASIGNADO:*`);

    DEFAULT_ROLES.forEach(r => {
      if (roster[r]?.trim()) {
        lines.push(`• *${r}:* ${roster[r].trim()}`);
      }
    });

    lines.push(``);
    lines.push(`🎶 *ORDEN DE CANCIONES Y TONOS:*`);
    (setlist.items || []).forEach((it: any, idx: number) => {
      const chosenKey = it.chosen_key || it.original_key || 'G';
      lines.push(`${idx + 1}. *${it.title}* | Tono: *${chosenKey}* (${it.item_bpm || it.tempo || 72} BPM)`);
      if (it.performance_notes?.trim()) {
        lines.push(`   ↳ _Nota: ${it.performance_notes.trim()}_`);
      }
    });

    if (setlist.description?.trim()) {
      lines.push(``);
      lines.push(`💡 *Propósito espiritual:* ${setlist.description.trim()}`);
    }

    lines.push(``);
    lines.push(`*"Alabad a Dios en su santuario... todo lo que respira alabe a Jehová. ¡Aleluya!" (Salmos 150)*`);

    return lines.join('\n');
  };

  const handleCopyWhatsApp = () => {
    const text = generateWhatsAppMessage();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4">
      <div className="relative flex flex-col w-full max-w-2xl max-h-[96vh] sm:max-h-[90vh] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden text-slate-800 dark:text-slate-100 transition-colors">
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-amber-500 dark:text-amber-400" />
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">Planificador de Equipo y WhatsApp</h3>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                {setlist.title} • {setlist.event_date}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Contenido dividido en 2 columnas: Asignación de Músicos y Previsualización WhatsApp */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-xs">
          {/* Asignación de Músicos */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                Asignación por Instrumento
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Hora Ensayo:</span>
                <input
                  type="text"
                  value={rehearsalTime}
                  onChange={(e) => setRehearsalTime(e.target.value)}
                  className="rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2 py-0.5 text-xs text-slate-900 dark:text-white w-20 text-center"
                />
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {DEFAULT_ROLES.map((role) => (
                <div key={role} className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    {role}
                  </label>
                  <input
                    type="text"
                    placeholder="Nombre del músico..."
                    value={roster[role] || ''}
                    onChange={(e) => handleUpdateMember(role, e.target.value)}
                    className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Previsualización del Mensaje para WhatsApp */}
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                Vista Previa para WhatsApp
              </span>
              <button
                onClick={handleCopyWhatsApp}
                className="flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1 text-xs font-bold text-white transition shadow"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? '¡Copiado!' : 'Copiar Texto'}</span>
              </button>
            </div>

            <div className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3.5 font-mono text-[11px] leading-relaxed overflow-y-auto whitespace-pre-wrap select-all text-slate-700 dark:text-slate-300 shadow-inner">
              {generateWhatsAppMessage()}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-6 py-3">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Guarda automáticamente los nombres asignados en tu navegador.
          </span>
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 px-4 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 transition"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
}
