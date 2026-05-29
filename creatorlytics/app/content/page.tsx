'use client';

import { useState, useCallback } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PostModal } from '@/components/posts/PostModal';
import { ContentTimeline } from '@/components/posts/ContentTimeline';
import { PostRow } from '@/components/posts/PostRow';
import { CSVImport } from '@/components/posts/CSVImport';
import { usePostStore } from '@/lib/store/post-store';
import { postsToCSV } from '@/lib/utils/export';
import { PlusIcon, DownloadIcon } from 'lucide-react';
import type { Post } from '@/types';

export default function ContentPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editPost, setEditPost] = useState<Post | null>(null);
  const { posts, deletePost } = usePostStore();
  const [view, setView] = useState<'timeline' | 'table'>('timeline');
  const sorted = [...posts].sort((a, b) => b.date.localeCompare(a.date));

  function handleAddPost() {
    setEditPost(null);
    setModalOpen(true);
  }

  function handleEditPost(post: Post) {
    setEditPost(post);
    setModalOpen(true);
  }

  function handleCloseModal(open: boolean) {
    setModalOpen(open);
    if (!open) setEditPost(null);
  }

  const handleImport = useCallback(() => {
    // Refresh after import
  }, []);

  return (
    <AppShell title="Konten">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button onClick={handleAddPost}>
              <PlusIcon />
              Post
            </Button>
            <Button variant="outline" onClick={() => postsToCSV(posts)}>
              <DownloadIcon />
              Export CSV
            </Button>
          </div>
          <CSVImport onImport={handleImport} />
        </div>

        <Tabs value={view} onValueChange={v => setView(v as 'timeline' | 'table')}>
          <TabsList>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="table">Tabel</TabsTrigger>
          </TabsList>

          <TabsContent value="timeline">
            <ContentTimeline onEditPost={handleEditPost} />
          </TabsContent>

          <TabsContent value="table">
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8 text-center">#</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead className="text-right">Reach</TableHead>
                    <TableHead className="text-right">ER</TableHead>
                    <TableHead className="w-20 text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sorted.length === 0 ? (
                    <TableRow>
                      <TableHead colSpan={7} className="text-center text-muted-foreground h-24">
                        Belum ada postingan.
                      </TableHead>
                    </TableRow>
                  ) : (
                    sorted.map((post, i) => (
                      <PostRow
                        key={post.id}
                        post={post}
                        index={i}
                        onEdit={handleEditPost}
                        onDelete={deletePost}
                      />
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>

        <PostModal
          open={modalOpen}
          onOpenChange={handleCloseModal}
          editPost={editPost}
        />
      </div>
    </AppShell>
  );
}
