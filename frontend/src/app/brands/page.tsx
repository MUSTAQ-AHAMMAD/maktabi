'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Pencil, Trash2, Tag, X, Check, Building2 } from 'lucide-react';
import api from '@/lib/api';

interface Brand {
  id: string;
  name: string;
  code: string;
  description?: string;
  color: string;
  isActive: boolean;
  createdAt: string;
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', code: '', description: '', color: '#3B82F6' });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchBrands = () => {
    api.get('/brands?includeInactive=true')
      .then(r => setBrands(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBrands(); }, []);

  const resetForm = () => {
    setForm({ name: '', code: '', description: '', color: '#3B82F6' });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim()) {
      toast({ title: 'Error', description: 'Name and code are required.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/brands/${editingId}`, form);
        toast({ title: 'Brand updated', description: `${form.name} has been updated.` });
      } else {
        await api.post('/brands', form);
        toast({ title: 'Brand created', description: `${form.name} has been created.` });
      }
      resetForm();
      fetchBrands();
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to save brand.';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (brand: Brand) => {
    setEditingId(brand.id);
    setForm({ name: brand.name, code: brand.code, description: brand.description || '', color: brand.color });
    setShowForm(true);
  };

  const handleDelete = async (brand: Brand) => {
    try {
      await api.delete(`/brands/${brand.id}`);
      toast({ title: 'Brand deactivated', description: `${brand.name} has been deactivated.` });
      fetchBrands();
    } catch {
      toast({ title: 'Error', description: 'Failed to deactivate brand.', variant: 'destructive' });
    }
  };

  const handleReactivate = async (brand: Brand) => {
    try {
      await api.put(`/brands/${brand.id}`, { isActive: true });
      toast({ title: 'Brand reactivated', description: `${brand.name} has been reactivated.` });
      fetchBrands();
    } catch {
      toast({ title: 'Error', description: 'Failed to reactivate brand.', variant: 'destructive' });
    }
  };

  const activeBrands = brands.filter(b => b.isActive);
  const inactiveBrands = brands.filter(b => !b.isActive);

  return (
    <AppLayout title="Brand Management">
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Manage brands across all modules. Brands help segregate cases, contracts, and other entities.</p>
          </div>
          {!showForm && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />Add Brand
            </Button>
          )}
        </div>

        {/* Create/Edit Form */}
        {showForm && (
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">{editingId ? 'Edit Brand' : 'New Brand'}</h3>
              <button onClick={resetForm} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Brand Name *</Label>
                  <Input
                    placeholder="e.g. IBRAQ"
                    value={form.name}
                    onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Brand Code *</Label>
                  <Input
                    placeholder="e.g. IBRAQ"
                    value={form.code}
                    onChange={e => setForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  placeholder="Optional description"
                  value={form.description}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Brand Color</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.color}
                    onChange={e => setForm(prev => ({ ...prev, color: e.target.value }))}
                    className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                  />
                  <Input
                    value={form.color}
                    onChange={e => setForm(prev => ({ ...prev, color: e.target.value }))}
                    className="w-32"
                  />
                  <div className="flex-1">
                    <div className="h-8 rounded-lg" style={{ backgroundColor: form.color }} />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : editingId ? 'Update Brand' : 'Create Brand'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              </div>
            </form>
          </div>
        )}

        {/* Active Brands */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
          </div>
        ) : (
          <>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-6 py-4 border-b border-border bg-muted/30">
                <Building2 className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-foreground">Active Brands ({activeBrands.length})</h3>
              </div>
              {activeBrands.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Tag className="w-10 h-10 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No brands yet. Create your first brand above.</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {activeBrands.map(brand => (
                    <div key={brand.id} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ backgroundColor: brand.color }}>
                        {brand.code.substring(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-foreground">{brand.name}</p>
                          <span className="px-2 py-0.5 text-xs rounded-full font-medium" style={{ backgroundColor: brand.color + '20', color: brand.color }}>
                            {brand.code}
                          </span>
                        </div>
                        {brand.description && <p className="text-xs text-muted-foreground mt-0.5">{brand.description}</p>}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(brand)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(brand)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Inactive Brands */}
            {inactiveBrands.length > 0 && (
              <div className="bg-card border border-border rounded-xl overflow-hidden opacity-60">
                <div className="flex items-center gap-2 px-6 py-4 border-b border-border bg-muted/30">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  <h3 className="font-semibold text-muted-foreground">Inactive Brands ({inactiveBrands.length})</h3>
                </div>
                <div className="divide-y divide-border">
                  {inactiveBrands.map(brand => (
                    <div key={brand.id} className="flex items-center gap-4 px-6 py-4">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-muted text-muted-foreground font-bold text-sm shrink-0">
                        {brand.code.substring(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-muted-foreground">{brand.name}</p>
                        <p className="text-xs text-muted-foreground">{brand.code}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleReactivate(brand)}>
                        <Check className="w-3.5 h-3.5 mr-1" />Reactivate
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
