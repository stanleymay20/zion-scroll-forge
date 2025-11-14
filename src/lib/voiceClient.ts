export type VoiceStatus = 'idle' | 'recording' | 'processing';

export class VoiceClient {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private status: VoiceStatus = 'idle';
  private onStatusChange?: (status: VoiceStatus) => void;

  constructor(onStatusChange?: (status: VoiceStatus) => void) {
    this.onStatusChange = onStatusChange;
  }

  async startRecording(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start();
      this.updateStatus('recording');
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw new Error('Microphone access denied or not available');
    }
  }

  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No recording in progress'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.audioChunks = [];
        
        // Stop all tracks
        this.mediaRecorder?.stream.getTracks().forEach(track => track.stop());
        this.mediaRecorder = null;
        
        this.updateStatus('idle');
        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  getStatus(): VoiceStatus {
    return this.status;
  }

  private updateStatus(newStatus: VoiceStatus) {
    this.status = newStatus;
    if (this.onStatusChange) {
      this.onStatusChange(newStatus);
    }
  }

  async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}