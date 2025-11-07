// src/utils/audioManager.js

class AudioManager {
  constructor() {
    this.currentAudio = null;
    this.isPlaying = false;
    this.volume = 1.0;
    this.playbackRate = 1.0;
  }

  // Ses çal
  play(url, onEnd = null) {
    this.stop(); // Önceki sesi durdur

    this.currentAudio = new Audio(url);
    this.currentAudio.volume = this.volume;
    this.currentAudio.playbackRate = this.playbackRate;

    this.currentAudio.play();
    this.isPlaying = true;

    this.currentAudio.onended = () => {
      this.isPlaying = false;
      if (onEnd) onEnd();
    };

    return this.currentAudio;
  }

  // Sesi durdur
  stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
      this.isPlaying = false;
    }
  }

  // Pause/Resume
  togglePlayPause() {
    if (!this.currentAudio) return;

    if (this.isPlaying) {
      this.currentAudio.pause();
      this.isPlaying = false;
    } else {
      this.currentAudio.play();
      this.isPlaying = true;
    }
  }

  // Ses seviyesi ayarla (0.0 - 1.0)
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.currentAudio) {
      this.currentAudio.volume = this.volume;
    }
  }

  // Hız ayarla (0.5 - 2.0)
  setPlaybackRate(rate) {
    this.playbackRate = Math.max(0.5, Math.min(2, rate));
    if (this.currentAudio) {
      this.currentAudio.playbackRate = this.playbackRate;
    }
  }

  // Mevcut zaman
  getCurrentTime() {
    return this.currentAudio ? this.currentAudio.currentTime : 0;
  }

  // Toplam süre
  getDuration() {
    return this.currentAudio ? this.currentAudio.duration : 0;
  }

  // Zaman atlama
  seekTo(time) {
    if (this.currentAudio) {
      this.currentAudio.currentTime = time;
    }
  }

  // Çalıyor mu?
  getIsPlaying() {
    return this.isPlaying;
  }
}

// Singleton instance
const audioManager = new AudioManager();

export default audioManager; 
