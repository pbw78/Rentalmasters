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
import PaymentForm from "@/components/PaymentForm";
import { Plus, Search, Filter, Download, Edit, Trash2, CreditCard, Calendar, AlertTriangle } from "lucide-react";

export default function Payments() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: payments, isLoading } = useQuery({
    queryKey: ['/api/payments'],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/payments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payments'] });
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

  const handleEdit = (payment: any) => {
    setEditingPayment(payment);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm(t('message.confirmDelete'))) {
      deleteMutation.mutate(id);
    }
  };

  const handleExport = () => {
    window.open('/api/export/payments', '_blank');
  };

  const filteredPayments = payments?.filter((payment: any) =>
    payment.contract?.tenant?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.contract?.tenant?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.contract?.property?.address?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getStatusBadge = (status: string, dueDate?: string) => {
    if (status === 'overdue' || (status === 'pending' && dueDate && new Date(dueDate) < new Date())) {
      return <Badge variant="destructive">{t('status.overdue')}</Badge>;
    }
    
    const variants: Record<string, string> = {
      pending: 'secondary',
      paid: 'default',
    };
    
    return (
      <Badge variant={variants[status] as any}>
        {t(`status.${status}`)}
      </Badge>
    );
  };

  const getPaymentMethodIcon = (method: string) => {
    return <CreditCard className="h-4 w-4" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">{t('common.loading')}</div>
      </div>
    );
  }

  // Summary statistics
  const totalPaid = payments?.filter((p: any) => p.status === 'paid')
    .reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0) || 0;
  
  const totalPending = payments?.filter((p: any) => p.status === 'pending')
    .reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0) || 0;
  
  const totalOverdue = payments?.filter((p: any) => 
    p.status === 'overdue' || (p.status === 'pending' && new Date(p.dueDate) < new Date()))
    .reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('nav.payments')}</h1>
          <p className="text-gray-600 mt-1">Track rent payments and transactions</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {t('quickActions.recordPayment')}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Paid</p>
                <p className="text-2xl font-bold text-green-600">
                  {new Intl.NumberFormat('pl-PL', {
                    style: 'currency',
                    currency: 'PLN',
                    minimumFractionDigits: 0,
                  }).format(totalPaid)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {new Intl.NumberFormat('pl-PL', {
                    style: 'currency',
                    currency: 'PLN',
                    minimumFractionDigits: 0,
                  }).format(totalPending)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">
                  {new Intl.NumberFormat('pl-PL', {
                    style: 'currency',
                    currency: 'PLN',
                    minimumFractionDigits: 0,
                  }).format(totalOverdue)}
                </p>
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
                placeholder="Search payments..."
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

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tenant</th>
                  <th>Property</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Payment Date</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment: any) => (
                  <tr key={payment.id}>
                    <td>
                      <div>
                        <p className="font-medium">
                          {payment.contract?.tenant?.firstName} {payment.contract?.tenant?.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{payment.contract?.tenant?.email}</p>
                      </div>
                    </td>
                    <td>
                      <div>
                        <p className="font-medium">{payment.contract?.property?.address}</p>
                        <p className="text-sm text-gray-500">{payment.contract?.property?.city}</p>
                      </div>
                    </td>
                    <td>
                      <span className="font-semibold text-lg">
                        {new Intl.NumberFormat('pl-PL', {
                          style: 'currency',
                          currency: 'PLN',
                          minimumFractionDigits: 0,
                        }).format(parseFloat(payment.amount))}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{new Date(payment.dueDate).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td>
                      {payment.paymentDate ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{new Date(payment.paymentDate).toLocaleDateString()}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        {getPaymentMethodIcon(payment.paymentMethod)}
                        <span>{t(`paymentMethod.${payment.paymentMethod}`)}</span>
                      </div>
                    </td>
                    <td>{getStatusBadge(payment.status, payment.dueDate)}</td>
                    <td>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleEdit(payment)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleDelete(payment.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPayments.length === 0 && (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'No payments match your search criteria.' : 'Get started by recording your first payment.'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('quickActions.recordPayment')}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Modal */}
      <Dialog open={showForm} onOpenChange={(open) => {
        setShowForm(open);
        if (!open) setEditingPayment(null);
      }}>
        <DialogContent className="max-w-2xl">
          <PaymentForm 
            payment={editingPayment} 
            onClose={() => {
              setShowForm(false);
              setEditingPayment(null);
            }} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
