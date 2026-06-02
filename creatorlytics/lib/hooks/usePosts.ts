'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from './useUser';
import type { Post } from '@/types';

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const supabase = createClient();

  useEffect(() => {
    if (user) {
      fetchPosts();
    } else {
      setPosts([]);
      setLoading(false);
    }
  }, [user]);

  async function fetchPosts() {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('date', { ascending: false });

    if (!error && data) {
      setPosts(data);
    }
    setLoading(false);
  }

  async function createPost(post: Omit<Post, 'id' | 'created_at'>) {
    if (!user) return null;

    const { data, error } = await supabase
      .from('posts')
      .insert([{ ...post, user_id: user.id }])
      .select()
      .single();

    if (!error && data) {
      setPosts([data, ...posts]);
      return data;
    }
    return null;
  }

  async function updatePost(id: string, updates: Partial<Post>) {
    const { error } = await supabase
      .from('posts')
      .update(updates)
      .eq('id', id);

    if (!error) {
      setPosts(posts.map(p => p.id === id ? { ...p, ...updates } : p));
    }
  }

  async function deletePost(id: string) {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (!error) {
      setPosts(posts.filter(p => p.id !== id));
    }
  }

  async function importPosts(newPosts: Omit<Post, 'id' | 'created_at'>[]) {
    if (!user) return 0;

    const postsWithUser = newPosts.map(p => ({ ...p, user_id: user.id }));
    const { data, error } = await supabase
      .from('posts')
      .insert(postsWithUser)
      .select();

    if (!error && data) {
      setPosts([...posts, ...data]);
      return data.length;
    }
    return 0;
  }

  return {
    posts,
    loading,
    createPost,
    updatePost,
    deletePost,
    importPosts,
    getPost: (id: string) => posts.find(p => p.id === id),
  };
}
