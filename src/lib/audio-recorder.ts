/**
 * Grabadora de Audio para Ensayos Ministeriales
 * Graba audio desde el micrófono o consola USB conectada al atril.
 */

export interface RecordedTrack {
  id: string;
  songTitle?: string;
  setlistTitle?: string;
  blobUrl: string;
  blob: Blob;
  durationSeconds: number;
  timestamp: string;
}

export class RehearsalRecorderEngine {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private startTime: number = 0;
  private timerInterval: any = null;
  private onTimeUpdateCallback?: (seconds: number) => void;

  public isRecording: boolean = false;
  public isPaused: boolean = false;

  public async startRecording(onTimeUpdate?: (seconds: number) => void): Promise<boolean> {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      throw new Error('La grabación de audio no está soportada en este navegador.');
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      });

      this.audioChunks = [];
      this.mediaRecorder = new MediaRecorder(stream);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(250); // trozos de 250ms
      this.isRecording = true;
      this.isPaused = false;
      this.startTime = Date.now();
      this.onTimeUpdateCallback = onTimeUpdate;

      if (this.onTimeUpdateCallback) {
        this.timerInterval = setInterval(() => {
          if (!this.isPaused && this.onTimeUpdateCallback) {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            this.onTimeUpdateCallback(elapsed);
          }
        }, 500);
      }

      return true;
    } catch (err: any) {
      console.error('Error accediendo al micrófono:', err);
      throw new Error('No se pudo acceder al micrófono para la grabación del ensayo.');
    }
  }

  public pauseRecording() {
    if (this.mediaRecorder && this.isRecording && !this.isPaused) {
      this.mediaRecorder.pause();
      this.isPaused = true;
    }
  }

  public resumeRecording() {
    if (this.mediaRecorder && this.isRecording && this.isPaused) {
      this.mediaRecorder.resume();
      this.isPaused = false;
    }
  }

  public async stopRecording(metadata?: { songTitle?: string; setlistTitle?: string }): Promise<RecordedTrack> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        return reject(new Error('No hay grabación activa'));
      }

      if (this.timerInterval) clearInterval(this.timerInterval);

      const durationSeconds = Math.max(1, Math.floor((Date.now() - this.startTime) / 1000));

      this.mediaRecorder.onstop = () => {
        const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
        const audioBlob = new Blob(this.audioChunks, { type: mimeType });
        const blobUrl = URL.createObjectURL(audioBlob);

        // Detener pistas de audio del micrófono
        this.mediaRecorder?.stream.getTracks().forEach(track => track.stop());
        this.isRecording = false;
        this.isPaused = false;
        this.mediaRecorder = null;

        resolve({
          id: `rec-${Date.now()}`,
          songTitle: metadata?.songTitle || 'Ensayo General',
          setlistTitle: metadata?.setlistTitle || 'Culto',
          blobUrl,
          blob: audioBlob,
          durationSeconds,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      };

      this.mediaRecorder.stop();
    });
  }
}

let recorderInstance: RehearsalRecorderEngine | null = null;
export function getRehearsalRecorder(): RehearsalRecorderEngine {
  if (!recorderInstance) {
    recorderInstance = new RehearsalRecorderEngine();
  }
  return recorderInstance;
}
