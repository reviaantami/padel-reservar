import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Plus, Edit, Trash, Upload } from 'lucide-react';
import { uploadImage } from '@/lib/upload';

interface Article {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  image_path?: string | null;
  is_published: boolean;
}

const AdminArticles = () => {
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image_url: '',
    is_published: true,
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    const { data } = await supabase.from('articles').select('*').order('created_at', { ascending: false });
    if (data) setArticles(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let imageUrl = formData.image_url;
      let imagePath = null;

      if (selectedImage) {
        const uploadResult = await uploadImage(selectedImage);
        imageUrl = uploadResult.url;
        imagePath = uploadResult.path;
      }

      const payload = {
        title: formData.title,
        content: formData.content,
        image_url: imageUrl || null,
        image_path: imagePath,
        is_published: formData.is_published,
        ...(editingArticle ? {} : { created_by: user?.id }),
      };

    if (editingArticle) {
      const { error } = await supabase.from('articles').update(payload).eq('id', editingArticle.id);
      if (error) {
        toast.error('Gagal mengupdate artikel');
      } else {
        toast.success('Artikel berhasil diupdate');
        setDialogOpen(false);
        fetchArticles();
        resetForm();
      }
    } else {
      const { error } = await supabase.from('articles').insert(payload);
      if (error) {
        toast.error('Gagal menambahkan artikel');
      } else {
        toast.success('Artikel berhasil ditambahkan');
        setDialogOpen(false);
        fetchArticles();
        resetForm();
      }
    }
  };

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      content: article.content,
      image_url: article.image_url || '',
      is_published: article.is_published,
    });
    setSelectedImage(null);
    setImagePreview(article.image_url);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus artikel ini?')) return;

    const { error } = await supabase.from('articles').delete().eq('id', id);
    if (error) {
      toast.error('Gagal menghapus artikel');
    } else {
      toast.success('Artikel berhasil dihapus');
      fetchArticles();
    }
  };

  const resetForm = () => {
    setEditingArticle(null);
    setFormData({ title: '', content: '', image_url: '', is_published: true });
    setSelectedImage(null);
    setImagePreview(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manajemen Artikel</h1>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Artikel
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingArticle ? 'Edit Artikel' : 'Tambah Artikel'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Judul</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="content">Konten</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={10}
                  required
                />
              </div>
              <div className="space-y-4">
                <Label htmlFor="image">Gambar Artikel</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSelectedImage(file);
                        setImagePreview(URL.createObjectURL(file));
                      }
                    }}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold hover:file:bg-accent"
                  />
                </div>
                {(imagePreview || formData.image_url) && (
                  <div className="relative w-full aspect-video">
                    <img
                      src={imagePreview || formData.image_url}
                      alt="Preview"
                      className="rounded-lg object-cover w-full h-full"
                    />
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="published"
                  checked={formData.is_published}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                />
                <Label htmlFor="published">Publikasikan</Label>
              </div>
              <Button type="submit" className="w-full">
                {editingArticle ? 'Update' : 'Tambah'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {articles.map((article) => (
          <Card key={article.id} className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <div>
                  <span>{article.title}</span>
                  {article.is_published ? (
                    <span className="ml-2 text-xs text-green-600">Dipublikasikan</span>
                  ) : (
                    <span className="ml-2 text-xs text-muted-foreground">Draft</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(article)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(article.id)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3">{article.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminArticles;