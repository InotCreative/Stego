import { GalleryFile } from './types';
import fs from 'fs';
import path from 'path';

export async function getGalleryFiles(): Promise<GalleryFile[]> {
  try {
    // Read the gallery.json file directly from the file system
    const filePath = path.join(process.cwd(), 'public', 'gallery.json');
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.warn('gallery.json not found, returning empty gallery');
      return [];
    }
    
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContents);
    return data.files || [];
  } catch (error) {
    console.error('Error loading gallery:', error);
    return [];
  }
}
