const container = document.head || document.documentElement;
const scriptTag = document.createElement('script');
scriptTag.setAttribute('async', 'false');
scriptTag.src = chrome.runtime.getURL('script.js');
container.insertBefore(scriptTag, container.children[0]);
container.removeChild(scriptTag);

// Store event handler reference for cleanup
const messageHandler = (event) => {
  chrome.runtime.sendMessage(
    {
      channel: 'ccai_contentscript_background_channel',
      data: event.detail,
    },
    (response) => {
      // Can return null response if window is killed
      if (!response) {
        return;
      }
      window.dispatchEvent(
        new CustomEvent('ccai_contentscript_message', { detail: response }),
      );
    },
  );
};

window.addEventListener('ccai_injected_script_message', messageHandler);

// Cleanup event listener when extension is unloaded
window.addEventListener('beforeunload', () => {
  window.removeEventListener('ccai_injected_script_message', messageHandler);
});
