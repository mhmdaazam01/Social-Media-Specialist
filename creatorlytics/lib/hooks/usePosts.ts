'use client';

import { useData } from '@/lib/context/DataContext';

export function usePosts() {
  const {
    posts,
    postsLoading: loading,
    createPost,
    updatePost,
    deletePost,
    importPosts,
    getPost,
  } = useData();

  return {
    posts,
    loading,
    createPost,
    updatePost,
    deletePost,
    importPosts,
    getPost,
  };
}
