import { createClient } from '@/lib/supabase/client';
import { GalleryImage } from '@/types/gallery';

export async function fetchGalleryImages(category?: string): Promise<GalleryImage[]> {
  const supabase = createClient();
  
  let query = supabase
    .from('gallery_images')
    .select('*')
    .order('created_at', { ascending: false });

  if (category && category !== 'all') {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching gallery:', error);
    return [];
  }

  return data?.map((item: any) => ({
    ...item,
    url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/gallery/${item.storage_path}`
  })) || [];
}

export async function getGalleryImageById(id: string): Promise<GalleryImage | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('gallery_images')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;

  return {
    ...data,
    url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/gallery/${data.storage_path}`
  };
}