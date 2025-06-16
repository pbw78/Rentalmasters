import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import TenantForm from "@/components/TenantForm";
import { Plus, Search, Filter, Download, Edit, Trash2, User, Mail, Phone, Eye } from "lucide-react";

export default function Tenants() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingTenant, setEditingTenant] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: tenants, isLoading } = useQuery({
    queryKey: ['/api/tenants'],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/tenants/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tenants'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: t('message.success'),
        description: t('message.deleted'),
      });
    },
    onError: (error) => {
      toast({
        title: t('message.error'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = (tenant: any) => {
    setEditingTenant(tenant);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm(t('message.confirmDelete'))) {
      deleteMutation.mutate(id);
    }
  };

  const handleExport = () => {
    window.open('/api/export/tenants', '_blank');
  };

  const filteredTenants = tenants?.filter((tenant: any) =>
    `${tenant.firstName} ${tenant.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('nav.tenants')}</h1>
          <p className="text-gray-600 mt-1">Manage your tenants</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {t('quickActions.addTenant')}
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search tenants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                {t('common.filter')}
              </Button>
              <Button variant="outline" onClick={handleExport} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                {t('common.export')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tenants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTenants.map((tenant: any) => (
          <Card key={tenant.id} className="tenant-card">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {tenant.firstName} {tenant.lastName}
                    </CardTitle>
                    {tenant.birthDate && (
                      <p className="text-sm text-gray-500">
                        Age: {calculateAge(tenant.birthDate)}
                      </p>
                    )}
                  </div>
                </div>
                <Badge variant={tenant.isActive ? 'default' : 'secondary'}>
                  {tenant.isActive ? t('status.active') : t('status.inactive')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {tenant.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{tenant.email}</span>
                  </div>
                )}
                {tenant.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{tenant.phone}</span>
                  </div>
                )}
              </div>

              {tenant.emergencyContact && (
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wider">Emergency Contact</span>
                  <p className="text-sm text-gray-700 mt-1">{tenant.emergencyContact}</p>
                </div>
              )}

              {tenant.notes && (
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wider">Notes</span>
                  <p className="text-sm text-gray-700 mt-1 line-clamp-2">{tenant.notes}</p>
                </div>
              )}

              {/* Active Contracts */}
              {tenant.contracts && tenant.contracts.length > 0 && (
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wider">Current Property</span>
                  {tenant.contracts
                    .filter((contract: any) => contract.status === 'active')
                    .map((contract: any) => (
                      <p key={contract.id} className="text-sm text-primary mt-1">
                        {contract.property?.address}
                      </p>
                    ))}
                </div>
              )}

              <div className="flex gap-2 pt-2 border-t">
                <Button size="sm" variant="outline" className="flex-1">
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleEdit(tenant)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  {t('common.edit')}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleDelete(tenant.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTenants.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tenants found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'No tenants match your search criteria.' : 'Get started by adding your first tenant.'}
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {t('quickActions.addTenant')}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Form Modal */}
      <Dialog open={showForm} onOpenChange={(open) => {
        setShowForm(open);
        if (!open) setEditingTenant(null);
      }}>
        <DialogContent className="max-w-2xl">
          <TenantForm 
            tenant={editingTenant} 
            onClose={() => {
              setShowForm(false);
              setEditingTenant(null);
            }} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
