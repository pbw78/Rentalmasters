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
import ContractForm from "@/components/ContractForm";
import { Plus, Search, Filter, FileText, Edit, Trash2, Eye, Calendar } from "lucide-react";

export default function Contracts() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingContract, setEditingContract] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: contracts, isLoading } = useQuery({
    queryKey: ['/api/contracts'],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/contracts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contracts'] });
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

  const handleEdit = (contract: any) => {
    setEditingContract(contract);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm(t('message.confirmDelete'))) {
      deleteMutation.mutate(id);
    }
  };

  const filteredContracts = contracts?.filter((contract: any) =>
    contract.tenant?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.tenant?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.property?.address?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: 'default',
      expired: 'destructive',
      terminated: 'outline'
    };
    
    return (
      <Badge variant={variants[status] as any}>
        {status === 'active' ? t('status.active') : status}
      </Badge>
    );
  };

  const isContractExpiringSoon = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return end <= thirtyDaysFromNow && end > now;
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
          <h1 className="text-3xl font-bold text-gray-900">{t('nav.contracts')}</h1>
          <p className="text-gray-600 mt-1">Manage lease agreements</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {t('quickActions.createContract')}
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search contracts..."
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

      {/* Contracts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredContracts.map((contract: any) => (
          <Card key={contract.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      Contract #{contract.id}
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      {contract.tenant?.firstName} {contract.tenant?.lastName}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getStatusBadge(contract.status)}
                  {isContractExpiringSoon(contract.endDate) && contract.status === 'active' && (
                    <Badge variant="destructive" className="text-xs">
                      Expiring Soon
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-700">Property</span>
                <p className="text-lg text-gray-900">{contract.property?.address}</p>
                <p className="text-sm text-gray-600">{contract.property?.city}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wider">Monthly Rent</span>
                  <p className="text-lg font-semibold text-green-600">
                    {new Intl.NumberFormat('pl-PL', {
                      style: 'currency',
                      currency: 'PLN',
                      minimumFractionDigits: 0,
                    }).format(parseFloat(contract.monthlyRent))}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wider">Payment Day</span>
                  <p className="text-lg font-semibold">{contract.paymentDay}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wider">Start Date</span>
                  <div className="flex items-center gap-1 mt-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{new Date(contract.startDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wider">End Date</span>
                  <div className="flex items-center gap-1 mt-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{new Date(contract.endDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {contract.deposit && (
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wider">Deposit</span>
                  <p className="text-sm text-gray-700">
                    {new Intl.NumberFormat('pl-PL', {
                      style: 'currency',
                      currency: 'PLN',
                      minimumFractionDigits: 0,
                    }).format(parseFloat(contract.deposit))}
                  </p>
                </div>
              )}

              {contract.terms && (
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wider">Terms</span>
                  <p className="text-sm text-gray-700 mt-1 line-clamp-2">{contract.terms}</p>
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
                  onClick={() => handleEdit(contract)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  {t('common.edit')}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleDelete(contract.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredContracts.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No contracts found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'No contracts match your search criteria.' : 'Get started by creating your first contract.'}
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {t('quickActions.createContract')}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Form Modal */}
      <Dialog open={showForm} onOpenChange={(open) => {
        setShowForm(open);
        if (!open) setEditingContract(null);
      }}>
        <DialogContent className="max-w-3xl">
          <ContractForm 
            contract={editingContract} 
            onClose={() => {
              setShowForm(false);
              setEditingContract(null);
            }} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
