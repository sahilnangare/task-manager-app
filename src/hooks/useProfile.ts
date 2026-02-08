import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  const updateDisplayName = async (displayName: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName })
      .eq('user_id', user.id);

    if (error) {
      toast.error('Failed to update display name');
      throw error;
    }

    setProfile((prev) => prev ? { ...prev, display_name: displayName } : prev);
    toast.success('Display name updated!');
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return;

    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/avatar.${fileExt}`;

    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast.error('Failed to upload avatar');
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // Add cache buster
    const avatarUrl = `${publicUrl}?t=${Date.now()}`;

    // Update profile with avatar URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl })
      .eq('user_id', user.id);

    if (updateError) {
      toast.error('Failed to update profile');
      throw updateError;
    }

    setProfile((prev) => prev ? { ...prev, avatar_url: avatarUrl } : prev);
    toast.success('Avatar updated!');
  };

  const removeAvatar = async () => {
    if (!user || !profile?.avatar_url) return;

    // Update profile to remove avatar URL
    const { error } = await supabase
      .from('profiles')
      .update({ avatar_url: null })
      .eq('user_id', user.id);

    if (error) {
      toast.error('Failed to remove avatar');
      throw error;
    }

    setProfile((prev) => prev ? { ...prev, avatar_url: null } : prev);
    toast.success('Avatar removed!');
  };

  return { profile, loading, updateDisplayName, uploadAvatar, removeAvatar };
}
