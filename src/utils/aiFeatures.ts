import { removeBackground } from '@imgly/background-removal';

export async function removeImageBackground(imageSource: string | HTMLImageElement | Blob): Promise<string> {
  try {
    const blob = await removeBackground(imageSource, {
      progress: (key, current, total) => {
        console.log(`Downloading AI Model ${key}: ${Math.round((current / total) * 100)}%`);
      }
    });
    
    // Create a new object URL for the transparent image
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('AI Background Removal failed:', error);
    throw new Error('Failed to remove background. Please try again.');
  }
}
