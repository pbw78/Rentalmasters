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
import PropertyForm from "@/components/PropertyForm";
import { Plus, Search, Filter, Download, Edit, Trash2, Home, Eye } from "lucide-react";

export default function Properties() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: properties, isLoading } = useQuery({
    queryKey: ['/api/properties'],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/properties/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
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

  const handleEdit = (property: any) => {
    setEditingProperty(property);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm(t('message.confirmDelete'))) {
      deleteMutation.mutate(id);
    }
  };

  const handleExport = () => {
    window.open('/api/export/properties', '_blank');
  };

  const filteredProperties = properties?.filter((property: any) =>
    property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.city.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      available: 'default',
      rented: 'secondary',
      maintenance: 'destructive',
      unavailable: 'outline'
    };
    
    return (
      <Badge variant={variants[status] as any} className={`status-${status}`}>
        {t(`status.${status}`)}
      </Badge>
    );
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
          <h1 className="text-3xl font-bold text-gray-900">{t('nav.properties')}</h1>
          <p className="text-gray-600 mt-1">Manage your rental properties</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {t('quickActions.addProperty')}
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search properties..."
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

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((property: any) => (
          <Card key={property.id} className="property-card">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Home className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{property.address}</CardTitle>
                    <p className="text-sm text-gray-600">{property.city}</p>
                  </div>
                </div>
                {getStatusBadge(property.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Type:</span>
                  <p className="font-medium">{t(`propertyType.${property.propertyType}`)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Area:</span>
                  <p className="font-medium">{property.area}m²</p>
                </div>
                <div>
                  <span className="text-gray-500">Rooms:</span>
                  <p className="font-medium">{property.rooms}</p>
                </div>
                <div>
                  <span className="text-gray-500">Rent:</span>
                  <p className="font-medium text-green-600">
                    {new Intl.NumberFormat('pl-PL', {
                      style: 'currency',
                      currency: 'PLN',
                      minimumFractionDigits: 0,
                    }).format(parseFloat(property.rent))}
                  </p>
                </div>
              </div>

              {property.description && (
                <p className="text-sm text-gray-600 line-clamp-2">{property.description}</p>
              )}

              <div className="flex gap-2 pt-2 border-t">
                <Button size="sm" variant="outline" className="flex-1">
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleEdit(property)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  {t('common.edit')}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleDelete(property.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProperties.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'No properties match your search criteria.' : 'Get started by adding your first property.'}
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {t('quickActions.addProperty')}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Form Modal */}
      <Dialog open={showForm} onOpenChange={(open) => {
        setShowForm(open);
        if (!open) setEditingProperty(null);
      }}>
        <DialogContent className="max-w-4xl">
          <PropertyForm 
            property={editingProperty} 
            onClose={() => {
              setShowForm(false);
              setEditingProperty(null);
            }} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
