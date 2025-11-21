'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { checkAdminSession, getAllInvestorPersonas, deleteInvestorPersona } from '@/lib/admin-actions';
import { InvestorPersona } from '@/lib/types';
import { InvestorFormDialog } from '@/components/admin/investor-form-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash, LogOut, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ThemeSwitcher } from '@/components/theme-switcher';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [personas, setPersonas] = useState<InvestorPersona[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<InvestorPersona | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [personaToDelete, setPersonaToDelete] = useState<InvestorPersona | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      const response = await fetch('/api/admin/check-session');
      const result = await response.json();

      if (!result.success || !result.hasAccess) {
        router.push('/404');
        return;
      }
    } catch (error) {
      console.error('Session check failed:', error);
      router.push('/404');
      return;
    }
    loadPersonas();
  };

  const loadPersonas = async () => {
    setLoading(true);
    try {
      const data = await getAllInvestorPersonas();
      setPersonas(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load investor personas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedPersona(null);
    setIsFormOpen(true);
  };

  const handleEdit = (persona: InvestorPersona) => {
    setSelectedPersona(persona);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (persona: InvestorPersona) => {
    setPersonaToDelete(persona);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!personaToDelete) return;

    setDeleting(true);
    try {
      const result = await deleteInvestorPersona(personaToDelete.id);
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Investor persona deleted successfully',
        });
        loadPersonas();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to delete investor persona',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred while deleting',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setPersonaToDelete(null);
    }
  };

  const handleFormSuccess = () => {
    toast({
      title: 'Success',
      description: selectedPersona
        ? 'Investor persona updated successfully'
        : 'Investor persona created successfully',
    });
    loadPersonas();
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'logout',
        }),
      });

      const result = await response.json();

      if (result.success) {
        router.push('/secret-admin');
        router.refresh();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to logout',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold neon-text mb-2">Admin Dashboard</h1>
            <p className="text-gray-400">Manage investor personas</p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Investor Personas</CardTitle>
                <CardDescription>
                  Create, edit, and manage investor personas
                </CardDescription>
              </div>
              <Button
                onClick={handleCreate}
                className="bg-primary hover:bg-primary/90 text-black font-bold"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Investor
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Check Size</TableHead>
                    <TableHead>Target Sector</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {personas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-gray-400 py-8">
                        No investor personas found. Create one to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    personas.map((persona) => (
                      <TableRow key={persona.id}>
                        <TableCell className="font-medium">{persona.name}</TableCell>
                        <TableCell>{persona.role}</TableCell>
                        <TableCell>{persona.region}</TableCell>
                        <TableCell>{persona.check_size}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {persona.target_sector}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              onClick={() => handleEdit(persona)}
                              variant="ghost"
                              size="sm"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => handleDeleteClick(persona)}
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <InvestorFormDialog
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSuccess={handleFormSuccess}
          investor={selectedPersona}
        />

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the investor persona "{personaToDelete?.name}".
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="bg-destructive hover:bg-destructive/90"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
