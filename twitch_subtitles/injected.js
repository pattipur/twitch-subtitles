// injected.js - Script injected into page context to access video audio
(function() {
  'use strict';

  class TwitchAudioCapture {
    constructor() {
      this.audioContext = null;
      this.sourceNode = null;
      this.mediaStreamDestination = null;
      this.init();
    }

    async init() {
      try {
        await this.setupAudioCapture();
        this.notifyReady();
      } catch (error) {
        console.error('Failed to setup audio capture:', error);
      }
    }

    async setupAudioCapture() {
      // Wait for video element to be available
      const video = await this.waitForVideo();
      
      if (!video) {
        throw new Error('No video element found');
      }

      // Create audio context
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create media element source from video
      this.sourceNode = this.audioContext.createMediaElementSource(video);
      
      // Create destination for capturing audio
      this.mediaStreamDestination = this.audioContext.createMediaStreamDestination();
      
      // Connect source to destination and also to the original output
      const gainNode = this.audioContext.createGain();
      this.sourceNode.connect(gainNode);
      gainNode.connect(this.audioContext.destination); // Keep original audio
      gainNode.connect(this.mediaStreamDestination); // Capture for speech recognition
      
      // Set up speech recognition with captured audio
      this.setupSpeechRecognition();
    }

    waitForVideo() {
      return new Promise((resolve) => {
        const checkForVideo = () => {
          const video = document.querySelector('video');
          if (video && video.srcObject) {
            resolve(video);
          } else {
            setTimeout(checkForVideo, 500);
          }
        };
        checkForVideo();
      });
    }

    setupSpeechRecognition() {
      // This approach may have limitations in Chrome due to security restrictions
      // Alternative: Use Web Audio API to analyze audio and send data to speech recognition service
      
      // For now, we'll use the default microphone-based speech recognition
      // In a production version, you'd need to implement server-side speech recognition
      // that accepts audio streams from the Web Audio API
      
      this.setupAudioAnalysis();
    }

    setupAudioAnalysis() {
      // Create analyzer for audio visualization/debugging
      const analyser = this.audioContext.createAnalyser();
      analyser.fftSize = 2048;
      
      this.sourceNode.connect(analyser);
      
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const analyzeAudio = () => {
        analyser.getByteFrequencyData(dataArray);
        
        // Calculate average volume
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        
        // Send audio level to content script (for debugging/UI feedback)
        window.postMessage({
          type: 'AUDIO_LEVEL',
          level: average
        }, '*');
        
        requestAnimationFrame(analyzeAudio);
      };
      
      analyzeAudio();
    }

    notifyReady() {
      window.postMessage({
        type: 'AUDIO_CONTEXT_READY',
        hasAudioContext: !!this.audioContext
      }, '*');
    }
  }

  // Initialize audio capture when script loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      new TwitchAudioCapture();
    });
  } else {
    new TwitchAudioCapture();
  }

})();