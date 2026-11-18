'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Users, 
  Crown, 
  QrCode, 
  Smartphone, 
  Radio, 
  Check, 
  Copy, 
  LogOut, 
  Download, 
  Upload, 
  Wifi, 
  Sparkles,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { getP2PSyncEngine, RehearsalRole, RehearsalSessionState } from '@/lib/p2p-sync-engine';
import { exportLocalData, importLocalData } from '@/lib/data-repository';

interface RehearsalSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoleChanged?: (role: RehearsalRole) => void;
  currentSetlist?: any[];
  currentSongTitle?: string;
}

export default function RehearsalSyncModal({
  isOpen,
  onClose,
  onRoleChanged,
  currentSetlist,
  currentSongTitle
}: RehearsalSyncModalProps) {
  const syncEngine = getP2PSyncEngine();
  const [activeTab, setActiveTab] = useState<'director' | 'musician' | 'backup'>('director');
  const [currentRole, setCurrentRole] = useState<RehearsalRole>(syncEngine.getRole());
  const [session, setSession] = useState<RehearsalSessionState | null>(syncEngine.getSession());
  const [inputPin, setInputPin] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [directorName, setDirectorName] = useState<string>('Líder de Alabanza');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = syncEngine.subscribe((updatedSession) => {
      setSession(updatedSession);
      setCurrentRole(syncEngine.getRole());
      if (onRoleChanged) {
        onRoleChanged(syncEngine.getRole());
      }
    });
    return () => unsubscribe();
  }, [syncEngine, onRoleChanged]);

  if (!isOpen) return null;

  // Iniciar sala como Director
  const handleStartDirector = () => {
    const newSession = syncEngine.startDirectorSession(directorName, currentSetlist);
    setSession(newSession);
    setCurrentRole('director');
    if (onRoleChanged) onRoleChanged('director');
  };

  // Unirse como Músico
  const handleJoinSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPin.trim()) return;
    syncEngine.joinSession(inputPin.trim());
    setCurrentRole('musician');
    if (onRoleChanged) onRoleChanged('musician');
  };

  // Desvincularse
  const handleLeaveSession = () => {
    syncEngine.leaveSession();
    setCurrentRole('solo');
    setSession(null);
    if (onRoleChanged) onRoleChanged('solo');
  };

  const directorIp = syncEngine.getLocalDirectorIp();
  const qrPayload = session 
    ? `http://${directorIp}:8080?pin=${session.pin}&session=${session.sessionId}` 
    : 'http://127.0.0.1:8080';

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(qrPayload)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`http://${directorIp}:8080 (PIN: ${session?.pin || '1234'})`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Exportar respaldo de canciones
  const handleExportBackup = async () => {
    setIsExporting(true);
    try {
      const jsonStr = await exportLocalData();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ekklesia-cancionero-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exportando:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Importar respaldo
  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const res = await importLocalData(text);
      setImportMessage(`¡Éxito! Se importaron ${res.songsAdded} canciones y ${res.setlistsAdded} repertorios.`);
      setTimeout(() => setImportMessage(null), 4000);
    } catch (err: any) {
      setImportMessage(`Error importando archivo: ${err.message || 'Formato no válido'}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="relative flex flex-col w-full max-w-xl max-h-[94vh] rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl text-slate-800 dark:text-slate-100 overflow-hidden transition-colors">
        
        {/* Cabecera */}
        <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-500 border border-amber-500/30">
              <Radio className="h-5 w-5 stroke-[2.4]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  Sincronización en Vivo de Ensayo (P2P)
                </h3>
                <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  Sin Servidor PC
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Conecta las tablets y celulares del equipo en el altar mediante código QR
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

        {/* Selector de Rol */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 p-1.5 gap-1.5 text-xs">
          <button
            onClick={() => setActiveTab('director')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold transition ${
              activeTab === 'director'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Crown className="h-4 w-4" />
            <span>1. Soy el Director</span>
          </button>

          <button
            onClick={() => setActiveTab('musician')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold transition ${
              activeTab === 'musician'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>2. Soy Músico</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-semibold transition ${
              activeTab === 'backup'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Respaldo de Canciones"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Respaldos</span>
          </button>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">

          {/* TAB 1: MODO DIRECTOR */}
          {activeTab === 'director' && (
            <div className="space-y-4">
              {currentRole === 'director' && session ? (
                <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/30 text-center space-y-3">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
                    <Crown className="h-4 w-4" />
                    <span>Sala de Ensayo Activa</span>
                  </div>

                  {/* Código QR y PIN */}
                  <div className="p-3 rounded-2xl bg-white shadow-md border border-slate-200 inline-block">
                    <img
                      src={qrImageUrl}
                      alt="Código QR Ensayo"
                      className="w-44 h-44 object-contain rounded-xl"
                    />
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-500 uppercase tracking-wider block">PIN de Entrada</span>
                    <div className="text-3xl font-mono font-black tracking-widest text-slate-900 dark:text-white mt-0.5">
                      {session.pin}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-300">
                    <Radio className="h-3.5 w-3.5 text-amber-500 animate-pulse shrink-0" />
                    <span>IP Local: <strong>http://{directorIp}:8080</strong></span>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-300 max-w-sm">
                    Pide a los músicos de tu equipo que apunten su cámara a este código QR o ingresen el PIN <strong>{session.pin}</strong> en su app.
                  </p>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={handleCopyLink}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:text-slate-900 dark:hover:text-white transition"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copied ? '¡PIN Copiado!' : 'Copiar PIN'}</span>
                    </button>

                    <button
                      onClick={handleLeaveSession}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold border border-red-500/30 transition"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Cerrar Sala</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 space-y-2">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                      <Crown className="h-4 w-4 text-amber-500" />
                      ¿Cómo funciona el Modo Director?
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      Al iniciar como Director, este dispositivo (tablet o teléfono) se convierte en el <strong>maestro de escenario</strong>. Todos los saltos de canción, coros repetidos y señales de dinámica se transmitirán automáticamente a las tablets de los demás músicos.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                      Nombre o Identificador del Líder:
                    </label>
                    <input
                      type="text"
                      value={directorName}
                      onChange={(e) => setDirectorName(e.target.value)}
                      placeholder="Ej: Director de Alabanza"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <button
                    onClick={handleStartDirector}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition"
                  >
                    <Zap className="h-4 w-4" />
                    <span>Iniciar Sala de Ensayo y Generar QR</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MODO MÚSICO */}
          {activeTab === 'musician' && (
            <div className="space-y-4">
              {currentRole === 'musician' ? (
                <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
                  <div className="h-10 w-10 rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                    <Check className="h-5 w-5 stroke-[2.4]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                      ¡Sincronizado con el Director!
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Tu atril cambiará de canción y resaltará las secciones marcadas por el líder.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 space-y-1 w-full text-left">
                    <p>• Conservas tu propia transposición de cejilla (Capo) o Solfa.</p>
                    <p>• Tu afinador y notas personales siguen disponibles.</p>
                    <p>• Recibirás una vibración háptica cuando el director repita una parte.</p>
                  </div>

                  <button
                    onClick={handleLeaveSession}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:text-slate-900 dark:hover:text-white transition"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Desvincularme (Volver a Modo Solo)</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleJoinSession} className="space-y-4">
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 space-y-1.5">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                      <QrCode className="h-4 w-4 text-emerald-500" />
                      Unirse al Ensayo del Director
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      Ingresa el PIN de 4 dígitos que aparece en la tablet del director de alabanza para sincronizar tu pantalla al instante.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                      PIN de 4 Dígitos o IP de la Tablet del Director:
                    </label>
                    <input
                      type="text"
                      value={inputPin}
                      onChange={(e) => setInputPin(e.target.value)}
                      placeholder="Ej: 5821 o 192.168.1.45"
                      className="w-full text-center text-xl font-mono font-bold tracking-wider rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition"
                  >
                    <Check className="h-4 w-4 stroke-[2.4]" />
                    <span>Conectar con el Director</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: RESPALDOS Y MIGRACIÓN */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 space-y-1.5">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-purple-500" />
                  Autonomía y Respaldo Personal
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Todas tus canciones, tonos elegidos y notas están guardadas en el almacenamiento interno de este dispositivo. Puedes exportarlas a un archivo para enviártelas por WhatsApp o pasarlas a otro teléfono.
                </p>
              </div>

              {importMessage && (
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-700 dark:text-purple-300 text-[11px] font-semibold text-center">
                  {importMessage}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleExportBackup}
                  disabled={isExporting}
                  className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-purple-500 text-center transition"
                >
                  <Download className="h-5 w-5 text-purple-500" />
                  <span className="font-bold text-slate-900 dark:text-white text-xs">Exportar Mi Cancionero</span>
                  <span className="text-[10px] text-slate-500">Descargar copia de seguridad en JSON</span>
                </button>

                <label className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 hover:border-purple-500 text-center cursor-pointer transition">
                  <Upload className="h-5 w-5 text-emerald-500" />
                  <span className="font-bold text-slate-900 dark:text-white text-xs">Importar Cancionero</span>
                  <span className="text-[10px] text-slate-500">Cargar archivo JSON desde WhatsApp o Drive</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportBackup}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-5 py-3">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-mono">
            Estado: {currentRole === 'director' ? '👑 Director Activo' : currentRole === 'musician' ? '🎸 Músico Enlazado' : '📱 Modo Autónomo'}
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
