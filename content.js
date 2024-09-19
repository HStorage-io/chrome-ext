let isSelecting = false;
let startX, startY, endX, endY;
let selectionBox, overlay;

function startPartialScreenshot() {
  createOverlay();
  document.body.style.userSelect = "none"; // テキスト選択を防ぐ
  document.addEventListener("mousedown", onMouseDown);
  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
}

function createOverlay() {
  overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  overlay.style.zIndex = "9998";
  document.body.appendChild(overlay);
}

function onMouseDown(e) {
  isSelecting = true;
  startX = e.clientX;
  startY = e.clientY;
  createSelectionBox();
}

function onMouseMove(e) {
  if (!isSelecting) return;
  endX = e.clientX;
  endY = e.clientY;
  updateSelectionBox();
}

function onMouseUp(e) {
  isSelecting = false;
  endX = e.clientX;
  endY = e.clientY;
  captureSelectedArea();
  removeSelectionBox();
  removeOverlay();
  document.body.style.userSelect = ""; // テキスト選択を元に戻す

  document.removeEventListener("mousedown", onMouseDown);
  document.removeEventListener("mousemove", onMouseMove);
  document.removeEventListener("mouseup", onMouseUp);
}

function createSelectionBox() {
  selectionBox = document.createElement("div");
  selectionBox.style.position = "fixed";
  selectionBox.style.border = "2px solid #fff";
  selectionBox.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
  selectionBox.style.pointerEvents = "none";
  selectionBox.style.zIndex = "9999";
  document.body.appendChild(selectionBox);
}

function updateSelectionBox() {
  selectionBox.style.left = `${Math.min(startX, endX)}px`;
  selectionBox.style.top = `${Math.min(startY, endY)}px`;
  selectionBox.style.width = `${Math.abs(endX - startX)}px`;
  selectionBox.style.height = `${Math.abs(endY - startY)}px`;
}

function removeSelectionBox() {
  if (selectionBox) selectionBox.remove();
}

function removeOverlay() {
  if (overlay) overlay.remove();
}

function captureSelectedArea() {
  const width = Math.abs(endX - startX);
  const height = Math.abs(endY - startY);

  html2canvas(document.body, {
    x: Math.min(startX, endX),
    y: Math.min(startY, endY),
    width: width,
    height: height,
    useCORS: true,
    ignoreElements: (element) => {
      return element === overlay || element === selectionBox;
    },
  }).then(async (canvas) => {
    const dataUrl = canvas.toDataURL("image/png");
    const base64EncodedFileName = await uploadFile(dataUrl);
    copyToClipboard("https://hstorage.io/show/" + base64EncodedFileName);
  });
}

function copyToClipboard(text) {
  // まず Clipboard API を試みる
  navigator.clipboard
    .writeText(text)
    .then(() => {
      alert("URLをクリップボードにコピーしました🐶");
    })
    .catch((err) => {
      console.warn("Clipboard API failed, falling back to execCommand", err);

      // Clipboard API が失敗した場合、execCommand を使用
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();

      try {
        const successful = document.execCommand("copy");
        if (successful) {
          alert("URLをクリップボードにコピーしました🐶");
        } else {
          throw new Error("execCommand failed");
        }
      } catch (err) {
        console.error("クリップボードへのコピーに失敗しました:", err);
        alert(
          "クリップボードへのコピーに失敗しました。お手数ですが URL を手動でコピーしてください🙏\n" +
            text
        );
      } finally {
        document.body.removeChild(textArea);
      }
    });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "startFullScreenshot") {
    uploadFile(request.dataUrl).then((base64EncodedFileName) => {
      copyToClipboard("https://hstorage.io/show/" + base64EncodedFileName);
    });
  }
  if (request.action === "startPartialScreenshot") {
    startPartialScreenshot();
  }
});
