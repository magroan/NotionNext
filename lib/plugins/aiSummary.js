/**
 * get Ai summary
 * @returns {Promise<string>}
 * @param aiSummaryAPI
 * @param aiSummaryKey
 * @param truncatedText
 */
export async function getAiSummary(aiSummaryAPI, aiSummaryKey, truncatedText) {
  try {
    console.log("\u8A18\u4E8B\u306E\u8981\u7D04\u3092\u30EA\u30AF\u30A8\u30B9\u30C8\u3057\u307E\u3059\u3002", truncatedText.slice(0, 100));
    const response = await fetch(aiSummaryAPI, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token: aiSummaryKey,
        content: truncatedText
      })
    });

    if (response.ok) {
      const data = await response.json();
      return data.summary;
    } else {
      throw new Error('Response not ok');
    }
  } catch (error) {
    console.error("ChucklePostAI\uFF1A\u30EA\u30AF\u30A8\u30B9\u30C8\u306B\u5931\u6557\u3057\u307E\u3057\u305F", error);
    return null;
  }
}