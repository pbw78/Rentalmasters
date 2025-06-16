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
import ServiceRequestForm from "@/components/ServiceRequestForm";
import { Plus, Search, Filter, Edit, Trash2, Wrench, AlertTriangle, Clock, CheckCircle, User, MapPin } from "lucide-react";

export default function ServiceRequests() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingRequest, setEditingRequest] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: serviceRequests, isLoading } = useQuery({
    queryKey: ['/api/service-requests'],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/service-requests/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/service-requests'] });
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

  const handleEdit = (request: any) => {
    setEditingRequest(request);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm(t('message.confirmDelete'))) {
      deleteMutation.mutate(id);
    }
  };

  const filteredRequests = serviceRequests?.filter((request: any) =>
    request.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.property?.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.assignedTo?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      open: { variant: 'destructive', icon: AlertTriangle },
      in_progress: { variant: 'secondary', icon: Clock },
      completed: { variant: 'default', icon: CheckCircle },
      cancelled: { variant: 'outline', icon: null }
    };
    
    const config = variants[status];
    const Icon = config?.icon;
    
    return (
      <Badge variant={config?.variant || 'outline'} className="flex items-center gap-1">
        {Icon && <Icon className="h-3 w-3" />}
        {t(`status.${status}`)}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    return (
      <Badge className={`priority-${priority}`}>
        {t(`priority.${priority}`)}
      </Badge>
    );
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, any> = {
      plumbing: '🔧',
      electrical: '⚡',
      heating: '🔥',
      general: '🏠'
    };
    return icons[category] || '🏠';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">{t('common.loading')}</div>
      </div>
    );
  }

  // Summary statistics
  const openRequests = serviceRequests?.filter((r: any) => r.status === 'open').length || 0;
  const inProgressRequests = serviceRequests?.filter((r: any) => r.status === 'in_progress').length || 0;
  const urgentRequests = serviceRequests?.filter((r: any) => r.priority === 'urgent').length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('nav.service')}</h1>
          <p className="text-gray-600 mt-1">Manage maintenance and service requests</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {t('quickActions.addServiceRequest')}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Open Requests</p>
                <p className="text-3xl font-bold text-red-600">{openRequests}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-3xl font-bold text-yellow-600">{inProgressRequests}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Urgent</p>
                <p className="text-3xl font-bold text-orange-600">{urgentRequests}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search service requests..."
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Requests Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredRequests.map((request: any) => (
          <Card key={request.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{getCategoryIcon(request.category)}</div>
                  <div>
                    <CardTitle className="text-lg">{request.title}</CardTitle>
                    <p className="text-sm text-gray-600">Request #{request.id}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getStatusBadge(request.status)}
                  {getPriorityBadge(request.priority)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-gray-700">{request.property?.address}, {request.property?.city}</span>
              </div>

              {request.tenant && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700">
                    {request.tenant.firstName} {request.tenant.lastName}
                  </span>
                </div>
              )}

              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wider">Description</span>
                <p className="text-sm text-gray-700 mt-1 line-clamp-3">{request.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wider">Category</span>
                  <p className="text-sm font-medium">{t(`serviceCategory.${request.category}`)}</p>
                </div>
                {request.assignedTo && (
                  <div>
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Assigned To</span>
                    <p className="text-sm font-medium">{request.assignedTo}</p>
                  </div>
                )}
              </div>

              {(request.estimatedCost || request.actualCost) && (
                <div className="grid grid-cols-2 gap-4">
                  {request.estimatedCost && (
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wider">Estimated Cost</span>
                      <p className="text-sm font-semibold text-blue-600">
                        {new Intl.NumberFormat('pl-PL', {
                          style: 'currency',
                          currency: 'PLN',
                          minimumFractionDigits: 0,
                        }).format(parseFloat(request.estimatedCost))}
                      </p>
                    </div>
                  )}
                  {request.actualCost && (
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wider">Actual Cost</span>
                      <p className="text-sm font-semibold text-green-600">
                        {new Intl.NumberFormat('pl-PL', {
                          style: 'currency',
                          currency: 'PLN',
                          minimumFractionDigits: 0,
                        }).format(parseFloat(request.actualCost))}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-2 border-t">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleEdit(request)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  {t('common.edit')}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleDelete(request.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRequests.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No service requests found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'No service requests match your search criteria.' : 'Get started by creating your first service request.'}
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {t('quickActions.addServiceRequest')}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Form Modal */}
      <Dialog open={showForm} onOpenChange={(open) => {
        setShowForm(open);
        if (!open) setEditingRequest(null);
      }}>
        <DialogContent className="max-w-3xl">
          <ServiceRequestForm 
            serviceRequest={editingRequest} 
            onClose={() => {
              setShowForm(false);
              setEditingRequest(null);
            }} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
