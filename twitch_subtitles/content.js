// content.js - Main content script for Twitch subtitle overlay
class TwitchSubtitles {
  constructor() {
    this.isActive = false;
    this.recognition = null;
    this.translationEnabled = true;
    this.targetLanguage = 'en';
    this.subtitleContainer = null;
    this.currentSubtitle = null;
    this.settings = {
      fontSize: '18px',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      textColor: '#ffffff',
      position: 'bottom'
    };
    
    this.init();
  }

  async init() {
    await this.loadSettings();
    this.createSubtitleContainer();
    this.setupMessageListener();
    this.waitForVideoPlayer();
  }

  async loadSettings() {
    const result = await chrome.storage.sync.get(['subtitleSettings']);
    if (result.subtitleSettings) {
      this.settings = { ...this.settings, ...result.subtitleSettings };
    }
  }

  createSubtitleContainer() {
    this.subtitleContainer = document.createElement('div');
    this.subtitleContainer.id = 'twitch-subtitles-container';
    this.subtitleContainer.className = 'twitch-subtitles-overlay';
    
    // Apply styling
    Object.assign(this.subtitleContainer.style, {
      position: 'absolute',
      bottom: '60px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: '9999',
      pointerEvents: 'none',
      width: '80%',
      textAlign: 'center',
      fontSize: this.settings.fontSize,
      color: this.settings.textColor,
      fontFamily: 'Arial, sans-serif',
      textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
      display: 'none'
    });

    document.body.appendChild(this.subtitleContainer);
  }

  waitForVideoPlayer() {
    const observer = new MutationObserver((mutations) => {
      const videoPlayer = document.querySelector('[data-a-target="video-player"]');
      if (videoPlayer && !videoPlayer.querySelector('#twitch-subtitles-container')) {
        videoPlayer.style.position = 'relative';
        videoPlayer.appendChild(this.subtitleContainer);
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      switch (request.action) {
        case 'toggle':
          this.toggle();
          sendResponse({ status: this.isActive });
          break;
        case 'updateSettings':
          this.updateSettings(request.settings);
          sendResponse({ status: 'updated' });
          break;
        case 'getStatus':
          sendResponse({ 
            isActive: this.isActive,
            isSupported: this.isSpeechRecognitionSupported()
          });
          break;
      }
    });
  }

  isSpeechRecognitionSupported() {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }

  async toggle() {
    if (this.isActive) {
      this.stop();
    } else {
      await this.start();
    }
  }

  async start() {
    if (!this.isSpeechRecognitionSupported()) {
      this.showError('Speech recognition not supported in this browser');
      return;
    }

    try {
      // Inject script to capture audio from video
      await this.injectAudioCapture();
      
      this.isActive = true;
      this.subtitleContainer.style.display = 'block';
      this.startSpeechRecognition();
      
      this.showStatus('Subtitles activated');
    } catch (error) {
      console.error('Failed to start subtitles:', error);
      this.showError('Failed to start subtitle recognition');
    }
  }

  stop() {
    this.isActive = false;
    this.subtitleContainer.style.display = 'none';
    
    if (this.recognition) {
      this.recognition.stop();
      this.recognition = null;
    }
    
    this.showStatus('Subtitles deactivated');
  }

  async injectAudioCapture() {
    // Inject script to access video audio
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('injected.js');
    document.head.appendChild(script);
    
    return new Promise((resolve) => {
      const listener = (event) => {
        if (event.data.type === 'AUDIO_CONTEXT_READY') {
          window.removeEventListener('message', listener);
          resolve();
        }
      };
      window.addEventListener('message', listener);
    });
  }

  startSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'auto'; // Auto-detect language
    
    this.recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      if (finalTranscript) {
        this.processFinalTranscript(finalTranscript);
      } else if (interimTranscript) {
        this.displaySubtitle(interimTranscript, true);
      }
    };
    
    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'no-speech') {
        // Restart recognition after brief pause
        setTimeout(() => {
          if (this.isActive) {
            this.recognition.start();
          }
        }, 1000);
      }
    };
    
    this.recognition.onend = () => {
      if (this.isActive) {
        // Restart recognition to keep it continuous
        setTimeout(() => {
          this.recognition.start();
        }, 100);
      }
    };
    
    this.recognition.start();
  }

  async processFinalTranscript(text) {
    let displayText = text;
    
    if (this.translationEnabled && this.targetLanguage !== 'auto') {
      try {
        displayText = await this.translateText(text, this.targetLanguage);
      } catch (error) {
        console.error('Translation failed:', error);
        // Fall back to original text
      }
    }
    
    this.displaySubtitle(displayText, false);
    
    // Clear subtitle after 5 seconds
    setTimeout(() => {
      this.clearSubtitle();
    }, 5000);
  }

  async translateText(text, targetLang) {
    // Using a simple translation API (you might want to use Google Translate API or similar)
    // For demo purposes, this is a placeholder
    const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=auto|${targetLang}`);
    const data = await response.json();
    return data.responseData.translatedText || text;
  }

  displaySubtitle(text, isInterim) {
    if (!this.subtitleContainer) return;
    
    // Create or update subtitle element
    if (!this.currentSubtitle) {
      this.currentSubtitle = document.createElement('div');
      this.currentSubtitle.className = 'subtitle-text';
      Object.assign(this.currentSubtitle.style, {
        backgroundColor: this.settings.backgroundColor,
        padding: '8px 16px',
        borderRadius: '4px',
        margin: '4px 0',
        display: 'inline-block',
        maxWidth: '100%',
        wordWrap: 'break-word',
        opacity: isInterim ? '0.7' : '1'
      });
      this.subtitleContainer.appendChild(this.currentSubtitle);
    }
    
    this.currentSubtitle.textContent = text;
    this.currentSubtitle.style.opacity = isInterim ? '0.7' : '1';
  }

  clearSubtitle() {
    if (this.currentSubtitle) {
      this.currentSubtitle.remove();
      this.currentSubtitle = null;
    }
  }

  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    
    if (this.subtitleContainer) {
      Object.assign(this.subtitleContainer.style, {
        fontSize: this.settings.fontSize,
        color: this.settings.textColor
      });
    }
    
    chrome.storage.sync.set({ subtitleSettings: this.settings });
  }

  showStatus(message) {
    // Create temporary status message
    const status = document.createElement('div');
    status.textContent = message;
    status.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #9146ff;
      color: white;
      padding: 10px;
      border-radius: 4px;
      z-index: 10000;
      font-family: Arial, sans-serif;
    `;
    
    document.body.appendChild(status);
    setTimeout(() => status.remove(), 3000);
  }

  showError(message) {
    const error = document.createElement('div');
    error.textContent = message;
    error.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #ff4444;
      color: white;
      padding: 10px;
      border-radius: 4px;
      z-index: 10000;
      font-family: Arial, sans-serif;
    `;
    
    document.body.appendChild(error);
    setTimeout(() => error.remove(), 5000);
  }
}

// Initialize when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new TwitchSubtitles();
  });
} else {
  new TwitchSubtitles();
}