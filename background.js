chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "captureFullScreenshot") {
    captureFullScreenshot();
  } else if (request.action === "capturePartialScreenshot") {
    capturePartialScreenshot();
  }
});

function captureFullScreenshot() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.captureVisibleTab(
      tabs[0].windowId,
      { format: "png" },
      (dataUrl) => {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "startFullScreenshot",
          dataUrl: dataUrl,
        });
      }
    );
  });
}

function capturePartialScreenshot() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "startPartialScreenshot" });
  });
}
