import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Edit, Trash } from 'lucide-react';

interface Field {
  id: string;
  name: string;
  description: string | null;
  price_per_slot: number;
  image_url: string | null;
  is_active: boolean;
}

const AdminFields = () => {
  const [fields, setFields] = useState<Field[]>([]);
  const [editingField, setEditingField] = useState<Field | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price_per_slot: '',
    image_url: '',
  });

  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    const { data } = await supabase.from('fields').select('*').order('created_at', { ascending: false });
    if (data) setFields(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      description: formData.description || null,
      price_per_slot: parseInt(formData.price_per_slot),
      image_url: formData.image_url || null,
    };

    if (editingField) {
      const { error } = await supabase.from('fields').update(payload).eq('id', editingField.id);
      if (error) {
        toast.error('Gagal mengupdate lapangan');
      } else {
        toast.success('Lapangan berhasil diupdate');
        setDialogOpen(false);
        fetchFields();
        resetForm();
      }
    } else {
      const { error } = await supabase.from('fields').insert(payload);
      if (error) {
        toast.error('Gagal menambahkan lapangan');
      } else {
        toast.success('Lapangan berhasil ditambahkan');
        setDialogOpen(false);
        fetchFields();
        resetForm();
      }
    }
  };

  const handleEdit = (field: Field) => {
    setEditingField(field);
    setFormData({
      name: field.name,
      description: field.description || '',
      price_per_slot: field.price_per_slot.toString(),
      image_url: field.image_url || '',
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus lapangan ini?')) return;

    const { error } = await supabase.from('fields').delete().eq('id', id);
    if (error) {
      toast.error('Gagal menghapus lapangan');
    } else {
      toast.success('Lapangan berhasil dihapus');
      fetchFields();
    }
  };

  const resetForm = () => {
    setEditingField(null);
    setFormData({ name: '', description: '', price_per_slot: '', image_url: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manajemen Lapangan</h1>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Lapangan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingField ? 'Edit Lapangan' : 'Tambah Lapangan'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nama Lapangan</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="price">Harga per Jam (Rp)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price_per_slot}
                  onChange={(e) => setFormData({ ...formData, price_per_slot: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="image">URL Gambar</Label>
                <Input
                  id="image"
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <Button type="submit" className="w-full">
                {editingField ? 'Update' : 'Tambah'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fields.map((field) => (
          <Card key={field.id} className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <span>{field.name}</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(field)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(field.id)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {field.description || 'Tidak ada deskripsi'}
              </p>
              <p className="text-2xl font-bold text-primary">
                Rp {field.price_per_slot.toLocaleString('id-ID')}
              </p>
              <p className="text-xs text-muted-foreground">per jam</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminFields;