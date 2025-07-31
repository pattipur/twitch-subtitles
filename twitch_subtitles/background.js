// background.js - Service worker for the extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('Twitch Subtitles extension installed');
});

// Handle tab updates to inject content script when needed
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && isTwitchStreamPage(tab.url)) {
    // Inject content script if not already injected
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js']
    }).catch(() => {
      // Script might already be injected, ignore error
    });
  }
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'translateText') {
    handleTranslation(request.text, request.targetLang)
      .then(translation => sendResponse({ translation }))
      .catch(error => sendResponse({ error: error.message }));
    return true; // Indicates async response
  }
});

function isTwitchStreamPage(url) {
  return url.includes('twitch.tv/') && 
         !url.includes('/directory') && 
         !url.includes('/settings') &&
         !url.match(/twitch\.tv\/(p\/|jobs|security|about)/);
}

async function handleTranslation(text, targetLang) {
  try {
    // Using MyMemory Translation API (free tier)
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=auto|${targetLang}&de=extension@twitch-subtitles.com`
    );
    
    if (!response.ok) {
      throw new Error('Translation service unavailable');
    }
    
    const data = await response.json();
    
    if (data.responseStatus === 200) {
      return data.responseData.translatedText;
    } else {
      throw new Error('Translation failed');
    }
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
}

// Set up context menu for quick access (optional)
chrome.contextMenus.create({
  id: "toggle-subtitles",
  title: "Toggle Twitch Subtitles",
  contexts: ["page"],
  documentUrlPatterns: ["*://www.twitch.tv/*", "*://twitch.tv/*"]
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "toggle-subtitles") {
    chrome.tabs.sendMessage(tab.id, { action: 'toggle' });
  }
});