// types/gallery.ts
export interface GalleryImage {
  id: string;
  url: string;
  title: string;
  category: 'installations' | 'products' | 'events' | 'showroom';
  description?: string;
  created_at: string;
  width?: number;
  height?: number;
}

export type GalleryCategory = 'all' | GalleryImage['category'];