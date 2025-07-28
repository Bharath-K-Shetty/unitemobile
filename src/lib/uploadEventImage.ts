import * as FileSystem from 'expo-file-system';
import { supabase } from '../utils/supabaseClient';

export const uploadEventImage = async (imageUri: string, eventPubkey: string) => {
  if (!imageUri) return null;

  const fileName = `${eventPubkey}_${Date.now()}.jpg`;

  const fileUri = FileSystem.documentDirectory + fileName;


  const { data, error } = await supabase.storage
    .from('eventimages')
    .upload(fileName, imageUri, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (error) {
    console.error('Image Upload Failed:', error.message);
    return null;
  }

  const { data: publicUrlData } = supabase
    .storage
    .from('eventimages')
    .getPublicUrl(fileName);

  const imageUrl = publicUrlData.publicUrl;

  await supabase
    .from('eventtable')
    .upsert({
      event_key: eventPubkey,
      image_url: imageUrl,
    });

  return imageUrl;
};
