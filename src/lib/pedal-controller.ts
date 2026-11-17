/**
 * Controlador de Pedales Bluetooth (Page Turners) y Web MIDI
 * Soporta pedales inalámbricos para atril (AirTurn, PageFlip, Donner, iRig BlueTurn)
 * y pedaleras MIDI USB (Line 6, Behringer, Morningstar, etc.)
 */

export interface PedalActionCallbacks {
  onNext?: () => void;
  onPrevious?: () => void;
  onToggleScroll?: () => void;
  onTogglePad?: () => void;
  onToggleMetronome?: () => void;
}

export class PedalController {
  private midiAccess: any = null;
  private callbacks: PedalActionCallbacks = {};
  private isListening: boolean = false;
  private keydownHandler: ((e: KeyboardEvent) => void) | null = null;

  public init(callbacks: PedalActionCallbacks) {
    this.callbacks = callbacks;
    if (typeof window === 'undefined') return;

    // 1. Escuchar teclas de pedales Bluetooth Page-Turners
    this.keydownHandler = (e: KeyboardEvent) => {
      // Ignorar si el usuario está escribiendo en un input o textarea
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      // Pedales Bluetooth simulan flechas, PageUp/Down, espacio o enter
      switch (e.key) {
        case 'PageDown':
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          this.callbacks.onNext?.();
          break;
        case 'PageUp':
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          this.callbacks.onPrevious?.();
          break;
        case ' ': // Espaciador
          e.preventDefault();
          this.callbacks.onToggleScroll?.();
          break;
        case 'm':
        case 'M':
          this.callbacks.onToggleMetronome?.();
          break;
        case 'p':
        case 'P':
          this.callbacks.onTogglePad?.();
          break;
      }
    };

    window.addEventListener('keydown', this.keydownHandler);
    this.isListening = true;

    // 2. Conectar a Web MIDI si está disponible
    if ('requestMIDIAccess' in navigator) {
      (navigator as any).requestMIDIAccess().then(
        (access: any) => {
          this.midiAccess = access;
          for (const input of access.inputs.values()) {
            input.onmidimessage = (msg: any) => this.handleMidiMessage(msg);
          }
          access.onstatechange = (e: any) => {
            if (e.port.type === 'input' && e.port.state === 'connected') {
              e.port.onmidimessage = (msg: any) => this.handleMidiMessage(msg);
            }
          };
        },
        () => {
          // MIDI no disponible o denegado, pedales de teclado siguen funcionando
        }
      );
    }
  }

  private handleMidiMessage(event: any) {
    const [status, noteOrCC, velocity] = event.data;
    const command = status >> 4;

    // Note On (command 9 con velocidad > 0) o Control Change (command 11 con valor > 0)
    if ((command === 9 && velocity > 0) || (command === 11 && velocity > 0)) {
      // Pedal común: CC 64 (Sustain) o notas de pedalera
      if (noteOrCC === 64 || noteOrCC === 65 || noteOrCC === 1) {
        this.callbacks.onNext?.();
      } else if (noteOrCC === 66 || noteOrCC === 2) {
        this.callbacks.onPrevious?.();
      } else if (noteOrCC === 67 || noteOrCC === 3) {
        this.callbacks.onToggleScroll?.();
      }
    }
  }

  public destroy() {
    if (typeof window !== 'undefined' && this.keydownHandler) {
      window.removeEventListener('keydown', this.keydownHandler);
    }
    this.isListening = false;
  }
}

import { useEffect, useRef } from 'react';

export interface UsePedalOptions {
  onNext?: () => void;
  onPrevious?: () => void;
  onNextSong?: () => void;
  onPrevSong?: () => void;
  onScrollDown?: () => void;
  onScrollUp?: () => void;
  onToggleScroll?: () => void;
  onTogglePad?: () => void;
  onToggleMetronome?: () => void;
}

export function usePedalController(options: UsePedalOptions) {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    const controller = new PedalController();
    controller.init({
      onNext: () => {
        if (optionsRef.current.onNextSong) {
          optionsRef.current.onNextSong();
        } else if (optionsRef.current.onNext) {
          optionsRef.current.onNext();
        } else if (optionsRef.current.onScrollDown) {
          optionsRef.current.onScrollDown();
        }
      },
      onPrevious: () => {
        if (optionsRef.current.onPrevSong) {
          optionsRef.current.onPrevSong();
        } else if (optionsRef.current.onPrevious) {
          optionsRef.current.onPrevious();
        } else if (optionsRef.current.onScrollUp) {
          optionsRef.current.onScrollUp();
        }
      },
      onToggleScroll: () => optionsRef.current.onToggleScroll?.(),
      onTogglePad: () => optionsRef.current.onTogglePad?.(),
      onToggleMetronome: () => optionsRef.current.onToggleMetronome?.(),
    });

    return () => {
      controller.destroy();
    };
  }, []);
}

