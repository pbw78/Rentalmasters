import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  Plus,
  UserPlus,
  FileText,
  CreditCard,
  Wrench,
  Calendar,
  CheckCircle,
  Clock
} from "lucide-react";
import PropertyForm from "@/components/PropertyForm";
import TenantForm from "@/components/TenantForm";
import ContractForm from "@/components/ContractForm";
import PaymentForm from "@/components/PaymentForm";
import ServiceRequestForm from "@/components/ServiceRequestForm";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface DashboardStats {
  totalProperties: number;
  activeTenants: number;
  monthlyRevenue: number;
  pendingIssues: number;
  occupancyRate: number;
}

export default function Dashboard() {
  const { t } = useLanguage();
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
  });

  const { data: properties } = useQuery({
    queryKey: ['/api/properties'],
  });

  const { data: tenants } = useQuery({
    queryKey: ['/api/tenants'],
  });

  const quickActions = [
    {
      id: 'property',
      title: t('quickActions.addProperty'),
      description: t('quickActions.addPropertyDesc'),
      icon: Plus,
      bgColor: 'bg-blue-100',
      iconColor: 'text-primary',
    },
    {
      id: 'tenant',
      title: t('quickActions.addTenant'),
      description: t('quickActions.addTenantDesc'),
      icon: UserPlus,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      id: 'contract',
      title: t('quickActions.createContract'),
      description: t('quickActions.createContractDesc'),
      icon: FileText,
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      id: 'payment',
      title: t('quickActions.recordPayment'),
      description: t('quickActions.recordPaymentDesc'),
      icon: CreditCard,
      bgColor: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
    },
    {
      id: 'service',
      title: t('quickActions.addServiceRequest'),
      description: t('quickActions.addServiceRequestDesc'),
      icon: Wrench,
      bgColor: 'bg-red-100',
      iconColor: 'text-red-600',
    },
  ];

  const renderModal = () => {
    const modalComponents: Record<string, JSX.Element> = {
      property: <PropertyForm onClose={() => setActiveModal(null)} />,
      tenant: <TenantForm onClose={() => setActiveModal(null)} />,
      contract: <ContractForm onClose={() => setActiveModal(null)} />,
      payment: <PaymentForm onClose={() => setActiveModal(null)} />,
      service: <ServiceRequestForm onClose={() => setActiveModal(null)} />,
    };

    return modalComponents[activeModal || ''] || null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('stats.properties')}</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalProperties || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Home className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium">+12%</span>
              <span className="text-gray-600 ml-2">{t('stats.fromLastMonth')}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('stats.activeTenants')}</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.activeTenants || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium">+3</span>
              <span className="text-gray-600 ml-2">{t('stats.newThisMonth')}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('stats.monthlyRevenue')}</p>
                <p className="text-3xl font-bold text-gray-900">
                  {new Intl.NumberFormat('pl-PL', {
                    style: 'currency',
                    currency: 'PLN',
                    minimumFractionDigits: 0,
                  }).format(stats?.monthlyRevenue || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium">+8.2%</span>
              <span className="text-gray-600 ml-2">{t('stats.fromLastMonth')}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('stats.pendingIssues')}</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.pendingIssues || 0}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-red-600 font-medium">2</span>
              <span className="text-gray-600 ml-2">{t('stats.urgent')}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>{t('quickActions.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.id}
                    variant="ghost"
                    className="w-full justify-start p-3 h-auto"
                    onClick={() => setActiveModal(action.id)}
                  >
                    <div className={`w-10 h-10 ${action.bgColor} rounded-lg flex items-center justify-center mr-3`}>
                      <Icon className={`h-5 w-5 ${action.iconColor}`} />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">{action.title}</p>
                      <p className="text-sm text-gray-500">{action.description}</p>
                    </div>
                  </Button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Activity</CardTitle>
              <Button variant="ghost" size="sm">View All</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-4 p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    Payment received for <span className="font-medium">Apartment 15/3</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-green-600">2,500 PLN</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    New contract created for <span className="font-medium">Studio 22/1</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">4 hours ago</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Wrench className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    Service request: <span className="font-medium">Bathroom sink repair</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">6 hours ago</p>
                </div>
                <div className="text-right">
                  <Badge variant="destructive">High Priority</Badge>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <UserPlus className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    New tenant added: <span className="font-medium">Anna Kowalska</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">1 day ago</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Properties & Tenants Tables Preview */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Properties Preview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Properties Overview</CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">{t('common.filter')}</Button>
              <Button variant="outline" size="sm">{t('common.export')}</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rent
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {properties?.slice(0, 5).map((property: any) => (
                    <tr key={property.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{property.address}</p>
                          <p className="text-sm text-gray-500">
                            {property.rooms} rooms, {property.area}m²
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Badge 
                          variant={property.status === 'rented' ? 'default' : 
                                  property.status === 'available' ? 'secondary' : 'destructive'}
                        >
                          {t(`status.${property.status}`)}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {new Intl.NumberFormat('pl-PL', {
                          style: 'currency',
                          currency: 'PLN',
                          minimumFractionDigits: 0,
                        }).format(property.rent)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Tenants Preview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Tenants</CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">{t('common.filter')}</Button>
              <Button variant="outline" size="sm">{t('common.export')}</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {tenants?.slice(0, 5).map((tenant: any) => (
                    <tr key={tenant.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                            <Users className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {tenant.firstName} {tenant.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{tenant.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant={tenant.isActive ? 'default' : 'secondary'}>
                          {tenant.isActive ? t('status.active') : t('status.inactive')}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal */}
      <Dialog open={!!activeModal} onOpenChange={() => setActiveModal(null)}>
        <DialogContent className="max-w-2xl">
          {renderModal()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
