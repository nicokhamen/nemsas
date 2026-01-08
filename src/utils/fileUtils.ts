// utils/fileUtils.ts
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Remove the data URL prefix (e.g., "data:image/png;base64,")
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
};

// Alternative: Get base64 with full data URL if your server needs it
export const fileToDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

// Utility to get file metadata
export interface Base64File {
  base64: string;
  filename: string;
  mimeType: string;
  size: number;
}

export const fileToBase64WithMetadata = async (file: File): Promise<Base64File> => {
  const base64 = await fileToBase64(file);
  return {
    base64,
    filename: file.name,
    mimeType: file.type,
    size: file.size
  };
};