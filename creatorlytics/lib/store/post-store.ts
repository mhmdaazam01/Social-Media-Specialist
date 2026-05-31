import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import type { Post } from '@/types';
import { STORAGE_PREFIX } from '@/lib/constants';

interface PostState {
  posts: Post[];
  getPosts: () => Post[];
  getPost: (id: string) => Post | undefined;
  createPost: (data: Omit<Post, 'id' | 'created_at'>) => Post;
  updatePost: (id: string, data: Partial<Post>) => void;
  deletePost: (id: string) => void;
  importPosts: (posts: Omit<Post, 'id' | 'created_at'>[]) => number;
}

export const usePostStore = create<PostState>()(
  persist(
    (set, get) => ({
      posts: [],
      getPosts: () => get().posts,
      getPost: (id) => get().posts.find(p => p.id === id),
      createPost: (data) => {
        const post: Post = { ...data, id: uuid(), created_at: new Date().toISOString() };
        set(s => ({ posts: [post, ...s.posts] }));
        return post;
      },
      updatePost: (id, data) => {
        set(s => ({ posts: s.posts.map(p => p.id === id ? { ...p, ...data } : p) }));
      },
      deletePost: (id) => {
        set(s => ({ posts: s.posts.filter(p => p.id !== id) }));
      },
      importPosts: (posts) => {
        const newPosts = posts.map(p => ({ ...p, id: uuid(), created_at: new Date().toISOString() }));
        set(s => ({ posts: [...s.posts, ...newPosts] }));
        return newPosts.length;
      },
    }),
    { name: `${STORAGE_PREFIX}:posts` }
  )
);
