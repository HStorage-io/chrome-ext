document.getElementById("fullScreenshot").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "captureFullScreenshot" });
});

document.getElementById("partialScreenshot").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "capturePartialScreenshot" });
});
