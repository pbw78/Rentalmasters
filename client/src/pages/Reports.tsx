import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Download, Calendar, DollarSign, Home, Users, FileText, Wrench } from "lucide-react";

export default function Reports() {
  const { t } = useLanguage();

  const { data: stats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });

  const { data: properties } = useQuery({
    queryKey: ['/api/properties'],
  });

  const { data: payments } = useQuery({
    queryKey: ['/api/payments'],
  });

  const { data: contracts } = useQuery({
    queryKey: ['/api/contracts'],
  });

  const { data: serviceRequests } = useQuery({
    queryKey: ['/api/service-requests'],
  });

  // Calculate monthly revenue trend
  const getMonthlyRevenue = () => {
    if (!payments) return [];
    
    const monthlyData: Record<string, number> = {};
    payments.forEach((payment: any) => {
      if (payment.status === 'paid') {
        const month = new Date(payment.paymentDate).toISOString().slice(0, 7);
        monthlyData[month] = (monthlyData[month] || 0) + parseFloat(payment.amount);
      }
    });
    
    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6); // Last 6 months
  };

  // Property status distribution
  const getPropertyStatusDistribution = () => {
    if (!properties) return {};
    
    const distribution: Record<string, number> = {};
    properties.forEach((property: any) => {
      distribution[property.status] = (distribution[property.status] || 0) + 1;
    });
    
    return distribution;
  };

  // Service request statistics
  const getServiceStats = () => {
    if (!serviceRequests) return { byStatus: {}, byPriority: {}, totalCost: 0 };
    
    const byStatus: Record<string, number> = {};
    const byPriority: Record<string, number> = {};
    let totalCost = 0;
    
    serviceRequests.forEach((request: any) => {
      byStatus[request.status] = (byStatus[request.status] || 0) + 1;
      byPriority[request.priority] = (byPriority[request.priority] || 0) + 1;
      if (request.actualCost) {
        totalCost += parseFloat(request.actualCost);
      }
    });
    
    return { byStatus, byPriority, totalCost };
  };

  // Contract expiration analysis
  const getExpiringContracts = () => {
    if (!contracts) return [];
    
    const now = new Date();
    const threeMonthsFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    
    return contracts.filter((contract: any) => {
      const endDate = new Date(contract.endDate);
      return contract.status === 'active' && endDate <= threeMonthsFromNow && endDate > now;
    });
  };

  const monthlyRevenue = getMonthlyRevenue();
  const propertyDistribution = getPropertyStatusDistribution();
  const serviceStats = getServiceStats();
  const expiringContracts = getExpiringContracts();

  const handleExportReport = (type: string) => {
    // This would typically generate and download a PDF report
    console.log(`Exporting ${type} report...`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('nav.reports')}</h1>
          <p className="text-gray-600 mt-1">Analytics and business insights</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExportReport('financial')}>
            <Download className="h-4 w-4 mr-2" />
            Financial Report
          </Button>
          <Button variant="outline" onClick={() => handleExportReport('occupancy')}>
            <Download className="h-4 w-4 mr-2" />
            Occupancy Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Properties</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalProperties || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Home className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600 font-medium">
                {((stats?.occupancyRate || 0)).toFixed(1)}% occupancy
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Tenants</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.activeTenants || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-600">
                {contracts?.filter((c: any) => c.status === 'active').length || 0} active contracts
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-3xl font-bold text-gray-900">
                  {new Intl.NumberFormat('pl-PL', {
                    style: 'currency',
                    currency: 'PLN',
                    minimumFractionDigits: 0,
                  }).format(stats?.monthlyRevenue || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-600">
                Avg per property: {new Intl.NumberFormat('pl-PL', {
                  style: 'currency',
                  currency: 'PLN',
                  minimumFractionDigits: 0,
                }).format((stats?.monthlyRevenue || 0) / Math.max(stats?.totalProperties || 1, 1))}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Service Requests</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.pendingIssues || 0}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Wrench className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-red-600 font-medium">
                {serviceRequests?.filter((r: any) => r.priority === 'urgent').length || 0} urgent
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Monthly Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyRevenue.map(([month, amount]) => (
                <div key={month} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{month}</span>
                  <span className="text-lg font-semibold text-green-600">
                    {new Intl.NumberFormat('pl-PL', {
                      style: 'currency',
                      currency: 'PLN',
                      minimumFractionDigits: 0,
                    }).format(amount)}
                  </span>
                </div>
              ))}
              {monthlyRevenue.length === 0 && (
                <p className="text-center text-gray-500 py-8">No payment data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Property Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Property Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(propertyDistribution).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={`status-${status}`}>
                      {t(`status.${status}`)}
                    </Badge>
                  </div>
                  <span className="text-lg font-semibold">{count}</span>
                </div>
              ))}
              {Object.keys(propertyDistribution).length === 0 && (
                <p className="text-center text-gray-500 py-8">No property data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Service Request Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Service Request Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">By Status</h4>
                <div className="space-y-2">
                  {Object.entries(serviceStats.byStatus).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <Badge variant="outline">{t(`status.${status}`)}</Badge>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">By Priority</h4>
                <div className="space-y-2">
                  {Object.entries(serviceStats.byPriority).map(([priority, count]) => (
                    <div key={priority} className="flex items-center justify-between">
                      <Badge className={`priority-${priority}`}>
                        {t(`priority.${priority}`)}
                      </Badge>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Total Service Costs</h4>
                <p className="text-2xl font-bold text-blue-600">
                  {new Intl.NumberFormat('pl-PL', {
                    style: 'currency',
                    currency: 'PLN',
                    minimumFractionDigits: 0,
                  }).format(serviceStats.totalCost)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expiring Contracts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Expiring Contracts (Next 3 Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expiringContracts.map((contract: any) => (
                <div key={contract.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {contract.tenant?.firstName} {contract.tenant?.lastName}
                      </p>
                      <p className="text-sm text-gray-600">{contract.property?.address}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-red-600">
                        {new Date(contract.endDate).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {Math.ceil((new Date(contract.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {expiringContracts.length === 0 && (
                <p className="text-center text-gray-500 py-8">No contracts expiring soon</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Total Collected</h3>
              <p className="text-3xl font-bold text-green-600">
                {new Intl.NumberFormat('pl-PL', {
                  style: 'currency',
                  currency: 'PLN',
                  minimumFractionDigits: 0,
                }).format(
                  payments?.filter((p: any) => p.status === 'paid')
                    .reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0) || 0
                )}
              </p>
            </div>
            
            <div className="text-center p-6 bg-yellow-50 rounded-lg">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">Pending Payments</h3>
              <p className="text-3xl font-bold text-yellow-600">
                {new Intl.NumberFormat('pl-PL', {
                  style: 'currency',
                  currency: 'PLN',
                  minimumFractionDigits: 0,
                }).format(
                  payments?.filter((p: any) => p.status === 'pending')
                    .reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0) || 0
                )}
              </p>
            </div>
            
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Service Costs</h3>
              <p className="text-3xl font-bold text-blue-600">
                {new Intl.NumberFormat('pl-PL', {
                  style: 'currency',
                  currency: 'PLN',
                  minimumFractionDigits: 0,
                }).format(serviceStats.totalCost)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
