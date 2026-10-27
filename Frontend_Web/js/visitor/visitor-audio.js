/**
 * Visitor Audio Controller
 * Manages HTML5 Audio playback, seek bar, time tracking, speed, and Web Speech fallback (PRD FR-02, US-03)
 */
import { VisitorApi } from '../api/visitor-api.js';
import { visitorState } from './visitor-state.js';

class VisitorAudio {
  constructor() {
    this.audioElement = new Audio();
    this.currentBlobUrl = null;
    this.isPlaying = false;
    this.currentAnimal = null;
    this.currentLang = 'vi';
    this.playbackRate = 1.0;
    this.onStateChange = null;

    this.bindEvents();
  }

  bindEvents() {
    this.audioElement.addEventListener('play', () => {
      this.isPlaying = true;
      visitorState.set({ isPlaying: true });
      this.notifyState();
    });

    this.audioElement.addEventListener('pause', () => {
      this.isPlaying = false;
      visitorState.set({ isPlaying: false });
      this.notifyState();
    });

    this.audioElement.addEventListener('ended', () => {
      this.isPlaying = false;
      visitorState.set({ isPlaying: false });
      this.notifyState();
    });

    this.audioElement.addEventListener('timeupdate', () => {
      this.notifyTime();
    });

    this.audioElement.addEventListener('error', (e) => {
      console.warn('Lỗi phần tử Audio:', e);
      this.isPlaying = false;
      visitorState.set({ isPlaying: false });
      this.notifyState();
    });
  }

  notifyState() {
    if (this.onStateChange) {
      this.onStateChange({
        isPlaying: this.isPlaying,
        animal: this.currentAnimal,
        currentTime: this.audioElement.currentTime,
        duration: this.audioElement.duration || 0,
      });
    }
  }

  notifyTime() {
    const cur = this.audioElement.currentTime || 0;
    const dur = this.audioElement.duration || 0;
    const slider = document.getElementById('player-seek-slider');
    const curTimeEl = document.getElementById('player-cur-time');
    const totalTimeEl = document.getElementById('player-total-time');

    if (slider && dur > 0) {
      slider.value = (cur / dur) * 100;
    }
    if (curTimeEl) {
      curTimeEl.innerText = this.formatTime(cur);
    }
    if (totalTimeEl && dur > 0) {
      totalTimeEl.innerText = this.formatTime(dur);
    }
  }

  formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  seek(percent) {
    if (this.audioElement.duration) {
      this.audioElement.currentTime = (percent / 100) * this.audioElement.duration;
    }
  }

  seekRelative(seconds) {
    if (this.audioElement.duration) {
      this.audioElement.currentTime = Math.max(
        0,
        Math.min(this.audioElement.duration, this.audioElement.currentTime + seconds)
      );
    }
  }

  setSpeed(rate) {
    this.playbackRate = rate;
    this.audioElement.playbackRate = rate;
    const speedEl = document.getElementById('player-speed-btn');
    if (speedEl) speedEl.innerText = `${rate}x`;
  }

  cycleSpeed() {
    const rates = [1.0, 1.25, 1.5, 0.75];
    const nextIdx = (rates.indexOf(this.playbackRate) + 1) % rates.length;
    this.setSpeed(rates[nextIdx]);
  }

  async playAnimal(animal, lang = 'vi') {
    if (!animal) return;
    this.stop();

    this.currentAnimal = animal;
    this.currentLang = lang;

    // Determine narrative script
    let narrative = animal.narrative || '';
    if (lang !== 'vi' && animal.multilingual && animal.multilingual[lang]) {
      narrative = animal.multilingual[lang];
    }

    // Try fetching audio from Narration Microservice
    try {
      const blob = await VisitorApi.getNarrationAudio(narrative, lang);
      if (this.currentBlobUrl) {
        URL.revokeObjectURL(this.currentBlobUrl);
      }
      this.currentBlobUrl = URL.createObjectURL(blob);
      this.audioElement.src = this.currentBlobUrl;
      this.audioElement.playbackRate = this.playbackRate;
      await this.audioElement.play();
      return;
    } catch (err) {
      console.warn('Microservice Narration không khả dụng, sử dụng Web Speech fallback:', err);
    }

    // Fallback: Web Speech API
    this.playWebSpeech(narrative, lang);
  }

  playWebSpeech(text, lang) {
    if (!('speechSynthesis' in window)) {
      alert('Trình duyệt không hỗ trợ phát giọng đọc âm thanh.');
      return;
    }

    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    const langMap = {
      vi: 'vi-VN',
      en: 'en-US',
      ko: 'ko-KR',
      ja: 'ja-JP',
      zh: 'zh-CN',
    };
    utter.lang = langMap[lang] || 'vi-VN';
    utter.rate = this.playbackRate;

    utter.onstart = () => {
      this.isPlaying = true;
      visitorState.set({ isPlaying: true });
      this.notifyState();
    };

    utter.onend = () => {
      this.isPlaying = false;
      visitorState.set({ isPlaying: false });
      this.notifyState();
    };

    utter.onerror = () => {
      this.isPlaying = false;
      visitorState.set({ isPlaying: false });
      this.notifyState();
    };

    window.speechSynthesis.speak(utter);
  }

  togglePlayPause() {
    if (this.isPlaying) {
      this.pause();
    } else if (this.audioElement.src) {
      this.audioElement.play();
    } else if (this.currentAnimal) {
      this.playAnimal(this.currentAnimal, this.currentLang);
    }
  }

  pause() {
    this.audioElement.pause();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.pause();
    }
    this.isPlaying = false;
    visitorState.set({ isPlaying: false });
  }

  resume() {
    if (this.audioElement.src) {
      this.audioElement.play();
    } else if ('speechSynthesis' in window && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  }

  stop() {
    this.audioElement.pause();
    this.audioElement.currentTime = 0;
    if (this.currentBlobUrl) {
      URL.revokeObjectURL(this.currentBlobUrl);
      this.currentBlobUrl = null;
    }
    this.audioElement.removeAttribute('src');
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isPlaying = false;
    visitorState.set({ isPlaying: false });
    this.notifyState();
  }
}

export const visitorAudio = new VisitorAudio();
