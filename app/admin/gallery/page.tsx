// app/admin/gallery/page.tsx
'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function AdminGallery() {
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();

  const uploadImage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);
    
    const formData = new FormData(e.currentTarget);
    const file = formData.get('image') as File;
    const category = formData.get('category') as string;
    const title = formData.get('title') as string;
    
    // 1. Upload to Storage
    const filePath = `${category}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('gallery')
      .upload(filePath, file);
      
    if (uploadError) {
      alert('Upload failed: ' + uploadError.message);
      setUploading(false);
      return;
    }
    
    // 2. Insert metadata
    const { error: dbError } = await supabase
      .from('gallery_images')
      .insert({
        storage_path: filePath,
        title,
        category,
        description: formData.get('description'),
      });
      
    if (dbError) {
      alert('Database error: ' + dbError.message);
    } else {
      alert('Success!');
      e.currentTarget.reset();
    }
    
    setUploading(false);
  };

  return (
    <form onSubmit={uploadImage} className="p-8 max-w-md mx-auto space-y-4">
      <input type="file" name="image" accept="image/*" required />
      <select name="category" required>
        <option value="installations">Installations</option>
        <option value="products">Products</option>
        <option value="events">Events</option>
        <option value="showroom">Showroom</option>
      </select>
      <input name="title" placeholder="Title" required />
      <textarea name="description" placeholder="Description" />
      <button type="submit" disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
    </form>
  );
}