async function uploadFile(dataUrl) {
  try {
    const config = await getConfig();
    const signedUrl = await getPresignedUrl(config);

    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const file = new File([blob], config.file_name, { type: "image/png" });

    const uploadResponse = await fetch(signedUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": "image/png",
      },
    });

    if (uploadResponse.ok) {
      return btoa(config.file_name);
    } else {
      throw new Error("ファイルのアップロードに失敗しました");
    }
  } catch (error) {
    console.error("アップロードエラー:", error);
    throw error;
  }
}

async function getPresignedUrl(config) {
  try {
    const requestBody = {
      file_name: config.file_name,
    };

    const response = await fetch("https://api.hstorage.io/upload/presigned", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    throw new Error(`署名付きURLの取得に失敗しました: ${error.message}`);
  }
}

async function getConfig() {
  const url = "https://api.hstorage.io/upload/config";
  const fileName = `chrome_ext_screenshot_${Date.now()}.png`;

  const requestBody = {
    file_name: fileName,
    is_encrypt: false,
    is_guest: true,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    return await response.json();
  } catch (error) {
    console.error("Error getting presigned URL:", error);
    throw error;
  }
}
