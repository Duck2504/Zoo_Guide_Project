/**
 * audio.js - Thảo Cầm Viên Sài Gòn
 * Unified Audio Controller (HTML5 Audio + Web Speech API multi-language fallback)
 */

class ZooAudioController {
  constructor() {
    this.htmlAudio = new Audio();
    this.currentText = '';
    this.currentLang = 'vi';
    this.playbackRate = 1.0;
    this.state = 'stopped'; // 'playing' | 'paused' | 'stopped'
    this.activeUtterance = null;
    this.onStateChangeCallback = null;
    this.onProgressCallback = null;
    this.progressInterval = null;
    this.simulatedCurrentTime = 0;
    this.simulatedDuration = 60;

    this.bindHtmlAudioEvents();
  }

  bindHtmlAudioEvents() {
    this.htmlAudio.addEventListener('play', () => this.updateState('playing'));
    this.htmlAudio.addEventListener('pause', () => this.updateState('paused'));
    this.htmlAudio.addEventListener('ended', () => this.updateState('ended'));
    this.htmlAudio.addEventListener('timeupdate', () => {
      if (this.onProgressCallback && this.htmlAudio.duration) {
        const cur = this.htmlAudio.currentTime;
        const dur = this.htmlAudio.duration;
        this.onProgressCallback(cur, dur, (cur / dur) * 100);
      }
    });
    this.htmlAudio.addEventListener('error', (e) => {
      console.warn('[AudioController] HTML5 Audio error, switching to SpeechSynthesis fallback.', e);
      if (this.currentText) {
        this.speakWithSpeechSynthesis(this.currentText, this.currentLang);
      }
    });
  }

  updateState(newState) {
    this.state = newState;
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback(this.state);
    }
    // Update visual equalizer elements
    const eqBars = document.querySelectorAll('.equalizer-bar');
    eqBars.forEach(b => {
      if (this.state === 'playing') {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });
  }

  /**
   * Play narration for an animal
   * @param {string} narrativeText 
   * @param {string} audioUrl 
   * @param {string} lang 
   * @param {Function} onStateChange 
   * @param {Function} onProgress 
   */
  async playNarration(narrativeText, audioUrl = null, lang = 'vi', onStateChange = null, onProgress = null) {
    this.stop(); // Stop any active audio first
    this.currentText = narrativeText || '';
    this.currentLang = lang;
    this.onStateChangeCallback = onStateChange;
    this.onProgressCallback = onProgress;

    // 1. If audioUrl is provided and valid mp3
    if (audioUrl && typeof audioUrl === 'string' && audioUrl.startsWith('http')) {
      try {
        this.htmlAudio.src = audioUrl;
        this.htmlAudio.playbackRate = this.playbackRate;
        await this.htmlAudio.play();
        return;
      } catch (err) {
        console.warn('[AudioController] Direct audio URL failed, falling back to TTS.', err);
      }
    }

    // 2. Fallback to Web Speech API
    this.speakWithSpeechSynthesis(this.currentText, this.currentLang);
  }

  speakWithSpeechSynthesis(text, lang) {
    if (!('speechSynthesis' in window)) {
      console.error('[AudioController] Browser does not support Web Speech API.');
      this.updateState('stopped');
      return;
    }

    window.speechSynthesis.cancel();
    if (!text) {
      this.updateState('stopped');
      return;
    }

    const utter = new SpeechSynthesisUtterance(text);
    this.activeUtterance = utter;

    // Map language code
    const langMap = {
      vi: 'vi-VN',
      en: 'en-US',
      ko: 'ko-KR',
      ja: 'ja-JP',
      zh: 'zh-CN'
    };
    utter.lang = langMap[lang] || 'vi-VN';
    utter.rate = this.playbackRate;
    utter.pitch = 1.0;

    // Pick best matching voice if available
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(v => v.lang.replace('_', '-').startsWith(utter.lang));
    if (matchedVoice) {
      utter.voice = matchedVoice;
    }

    this.simulatedCurrentTime = 0;
    // Estimate ~150 words per minute
    const words = text.split(/\s+/).length;
    this.simulatedDuration = Math.max(15, Math.round((words / 2.5) / this.playbackRate));

    utter.onstart = () => {
      this.updateState('playing');
      this.startSimulatedProgress();
    };

    utter.onend = () => {
      this.clearSimulatedProgress();
      this.updateState('ended');
    };

    utter.onerror = (e) => {
      console.warn('[AudioController] SpeechSynthesis utterance error:', e);
      this.clearSimulatedProgress();
      this.updateState('stopped');
    };

    window.speechSynthesis.speak(utter);
  }

  startSimulatedProgress() {
    this.clearSimulatedProgress();
    this.progressInterval = setInterval(() => {
      if (this.state === 'playing') {
        this.simulatedCurrentTime += 0.5;
        if (this.simulatedCurrentTime > this.simulatedDuration) {
          this.simulatedCurrentTime = this.simulatedDuration;
        }
        if (this.onProgressCallback) {
          const pct = (this.simulatedCurrentTime / this.simulatedDuration) * 100;
          this.onProgressCallback(this.simulatedCurrentTime, this.simulatedDuration, pct);
        }
      }
    }, 500);
  }

  clearSimulatedProgress() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  pause() {
    if (this.htmlAudio.src && !this.htmlAudio.paused) {
      this.htmlAudio.pause();
    } else if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      this.updateState('paused');
    }
  }

  resume() {
    if (this.htmlAudio.src && this.htmlAudio.paused) {
      this.htmlAudio.play();
    } else if ('speechSynthesis' in window && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      this.updateState('playing');
    }
  }

  stop() {
    if (this.htmlAudio) {
      this.htmlAudio.pause();
      this.htmlAudio.currentTime = 0;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.clearSimulatedProgress();
    this.simulatedCurrentTime = 0;
    this.updateState('stopped');
  }

  setPlaybackRate(speed) {
    this.playbackRate = parseFloat(speed) || 1.0;
    if (this.htmlAudio) {
      this.htmlAudio.playbackRate = this.playbackRate;
    }
  }
}

// Global audio singleton
const zooAudio = new ZooAudioController();
