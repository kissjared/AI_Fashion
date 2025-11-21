/**
 * Converts a File object to a Base64 string.
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Fetches an image from a URL and converts it to a Base64 string.
 * Note: This often triggers CORS issues if the server doesn't allow it.
 * We attempt to use the native fetch with 'cors' mode.
 */
export const urlToBase64 = async (url: string): Promise<string> => {
  try {
    // Try fetching with CORS mode
    const response = await fetch(url, { mode: 'cors', credentials: 'omit' });
    
    if (!response.ok) {
       if (response.status === 404) throw new Error("图片未找到 (404)");
       throw new Error(`图片加载失败: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error: any) {
    console.error("CORS or Fetch error converting URL to base64:", error);
    
    // Provide a user-friendly error message
    if (error.message && error.message.includes("Failed to fetch")) {
       throw new Error("图片无法跨域加载，请尝试下载图片后手动上传。");
    }
    throw new Error(error.message || "无法加载该图片");
  }
};

/**
 * Clean base64 string for Gemini API (remove data:image/xxx;base64, prefix)
 */
export const cleanBase64 = (dataUrl: string): string => {
  if (!dataUrl) return '';
  const parts = dataUrl.split(',');
  return parts.length > 1 ? parts[1] : dataUrl;
};

/**
 * Extract mime type from base64 string
 */
export const getMimeType = (dataUrl: string): string => {
  if (!dataUrl) return 'image/png';
  const match = dataUrl.match(/^data:(.*);base64,/);
  return match ? match[1] : 'image/png';
};