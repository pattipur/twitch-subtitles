# Twitch Live Subtitles Chrome Extension

Real-time subtitles with English translation for Twitch streams using Web Speech API and translation services.

## Features

- **Real-time Speech Recognition**: Automatically transcribes audio from Twitch streams
- **Multi-language Translation**: Translates subtitles to English or other supported languages
- **Customizable Appearance**: Adjust font size, colors, and positioning
- **Responsive Design**: Works on desktop and mobile browsers
- **Privacy-focused**: All processing happens locally in your browser

## Installation

### From Source (Developer Mode)

1. **Download/Clone** this repository to your computer
2. **Open Chrome** and navigate to `chrome://extensions/`
3. **Enable Developer Mode** (toggle in top-right corner)
4. **Click "Load unpacked"** and select the extension folder
5. **Pin the extension** to your toolbar for easy access

Install via ZIP

[![Download ZIP](https://img.shields.io/badge/Download-ZIP-blue?logo=google-drive)](https://github.com/pattipur/twitch-subtitles-extension/archive/refs/heads/main.zip)

> Click the button above to download the extension. Then:
> 1. Extract the ZIP.
> 2. Open Chrome and go to `chrome://extensions/`
> 3. Enable "Developer mode"
> 4. Click "Load unpacked" and select the extracted folder.
### File Structure

```
twitch-subtitles-extension/
├── manifest.json          # Extension configuration
├── content.js            # Main subtitle logic
├── popup.html            # Extension popup interface
├── popup.js              # Popup functionality
├── background.js         # Service worker
├── injected.js           # Audio capture script
├── styles.css            # Subtitle styling
├── icons/                # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

## Usage

### Getting Started

1. **Navigate to Twitch**: Go to any live stream on twitch.tv
2. **Click Extension Icon**: Find the Twitch Subtitles icon in your toolbar
3. **Enable Subtitles**: Click the "Enable" button in the popup
4. **Allow Microphone**: Grant microphone permission when prompted
5. **Watch**: Subtitles will appear over the video player

### Features Overview

#### Subtitle Display
- Subtitles appear at the bottom of the video player
- Text is displayed with a semi-transparent background for readability
- Interim results show in lighter opacity while processing
- Final transcriptions appear in full opacity

#### Translation Options
- **Enable/Disable Translation**: Toggle translation on/off
- **Target Languages**: English, Spanish, French, German, Italian, Portuguese, Japanese, Korean, Chinese, Russian
- **Auto-detect Source**: Automatically detects the source language

#### Customization Settings
- **Font Size**: Small, Medium, Large, Extra Large
- **Text Color**: Choose any color for subtitle text
- **Background Opacity**: Adjust transparency (0-100%)
- **Live Preview**: See changes in real-time

### Keyboard Shortcuts

Currently, the extension uses the popup interface for all controls. Future versions may include keyboard shortcuts.

## Technical Details

### How It Works

1. **Audio Capture**: The extension injects a script to access the video's audio stream using Web Audio API
2. **Speech Recognition**: Uses the browser's built-in Web Speech API (Chrome's speech recognition)
3. **Translation**: Sends recognized text to MyMemory Translation API for translation
4. **Display**: Overlays subtitles on the video player with customizable styling

### Browser Compatibility

- **Chrome/Chromium**: Full support (recommended)
- **Edge**: Full support
- **Firefox**: Limited (Web Speech API support varies)
- **Safari**: Not supported (no Web Speech API)

### Limitations

- **Internet Required**: Both speech recognition and translation require internet connection
- **Audio Quality**: Performance depends on stream audio quality and background noise
- **Language Detection**: May not always correctly identify the source language
- **Rate Limits**: Translation service has usage limits on free tier

## Privacy & Security

- **Local Processing**: Speech recognition happens in your browser
- **No Audio Storage**: Audio is not recorded or stored anywhere
- **Translation API**: Text is sent to MyMemory API for translation only
- **No Tracking**: Extension doesn't track or store personal information

## Troubleshooting

### Common Issues

**Subtitles not appearing:**
- Ensure you're on a live Twitch stream (not VODs)
- Check that microphone permission is granted
- Refresh the page and try again
- Verify Web Speech API support in your browser

**Poor accuracy:**
- Check stream audio quality
- Ensure minimal background noise
- Try adjusting your system's microphone sensitivity
- Some accents/languages may have lower accuracy

**Translation not working:**
- Check internet connection
- Try selecting a different target language
- Translation service may have temporary issues

**Extension not loading:**
- Refresh the Twitch page
- Disable and re-enable the extension
- Check Chrome's developer console for errors

### Debug Mode

For developers, open Chrome DevTools on the Twitch page to see:
- Speech recognition events
- Translation requests/responses
- Audio level indicators
- Error messages

## Development

### Setting Up Development Environment

1. Clone the repository
2. Make changes to the source files
3. Reload the extension in `chrome://extensions/`
4. Test on Twitch streams

### API Keys (Optional)

For better translation quality, you can:
1. Get a Google Translate API key
2. Replace the translation function in `background.js`
3. Add your API key to the extension

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Future Enhancements

- **Offline Mode**: Local speech recognition without internet
- **Custom Dictionaries**: Improve accuracy for specific terms/streamers
- **Multiple Languages**: Simultaneous translation to multiple languages
- **Subtitle Export**: Save transcriptions for later reference
- **Streamer Integration**: API for streamers to customize subtitle appearance
- **Accessibility Features**: Screen reader compatibility and keyboard navigation

## Support

For issues, suggestions, or contributions:
- Create an issue on GitHub
- Check existing issues for solutions
- Review the troubleshooting section above

## License

MIT License

Author

Created by Marisombra — the shadow tide.
Also known as Patricia, a developer, game designer, and bilingual dreamer.
Check out more projects at https://github.com/marisombra-dev

## Disclaimer

This extension is not affiliated with Twitch Interactive, Inc. It's an independent project designed to improve accessibility for Twitch viewers.
