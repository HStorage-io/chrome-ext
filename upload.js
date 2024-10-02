const apiURL = "https://api.hstorage.io";
//const apiURL = "http://localhost:3000";

const apiKey = "guest"; // no problem: this key is guest for public
const secretKey = "PUoMNc1V1F0mtCuudQIhleg4dRu4Xf82"; // no problem: this key is guest for public
const email = "guest";

async function uploadFile(dataUrl) {
  try {
    const key = await window.crypto.subtle.importKey(
      "raw",
      new Uint8Array(
        secretKey.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
      ),
      "AES-GCM",
      true,
      ["encrypt"]
    );

    const nonce = window.crypto.getRandomValues(new Uint8Array(12));

    const encryptedApiKey = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: nonce,
      },
      key,
      new TextEncoder().encode(apiKey)
    );

    // Nonceと暗号化されたAPIキーをHexでエンコード
    const encodedNonce = Array.from(nonce)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
    const encodedAPIKey = Array.from(new Uint8Array(encryptedApiKey))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");

    const preSignResp = await getPresignedUrl(encodedAPIKey, encodedNonce);

    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const file = new File([blob], preSignResp.file_name, { type: "image/png" });

    const uploadResponse = await fetch(preSignResp.presigned_url, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": "image/png",
        "Content-Length": file.size.toString(),
      },
    });

    if (uploadResponse.ok) {
      return preSignResp.share_url;
    } else {
      throw new Error("ファイルのアップロードに失敗しました");
    }
  } catch (error) {
    console.error("アップロードエラー:", error);
    throw error;
  }
}

async function getPresignedUrl(encodedAPIKey, encodedNonce) {
  try {
    const requestBody = {
      file_name: `chrome_ext_screenshot_${Date.now()}.png`,
      is_encrypt: false,
      is_guest: true,
    };

    const response = await fetch(`${apiURL}/upload/v1/presigned`, {
      method: "POST",
      headers: {
        "x-eu-api-key": encodedAPIKey,
        "x-eu-nonce": encodedNonce,
        "x-eu-email": email,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    throw new Error(`署名付きURLの取得に失敗しました: ${error.message}`);
  }
}

async function getConfig() {
  const url = `${apiURL}/upload/config`;
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
