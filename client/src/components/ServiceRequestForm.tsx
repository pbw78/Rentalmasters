import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { insertServiceRequestSchema, type InsertServiceRequest } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface ServiceRequestFormProps {
  serviceRequest?: any;
  onClose: () => void;
}

export default function ServiceRequestForm({ serviceRequest, onClose }: ServiceRequestFormProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: properties } = useQuery({
    queryKey: ['/api/properties'],
  });

  const { data: tenants } = useQuery({
    queryKey: ['/api/tenants'],
  });

  const form = useForm<InsertServiceRequest>({
    resolver: zodResolver(insertServiceRequestSchema),
    defaultValues: serviceRequest || {
      propertyId: undefined,
      tenantId: undefined,
      title: "",
      description: "",
      category: "general",
      priority: "medium",
      status: "open",
      estimatedCost: "",
      actualCost: "",
      assignedTo: "",
      scheduledDate: undefined,
      completedDate: undefined,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertServiceRequest) => {
      const url = serviceRequest ? `/api/service-requests/${serviceRequest.id}` : '/api/service-requests';
      const method = serviceRequest ? 'PUT' : 'POST';
      return apiRequest(method, url, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/service-requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: t('message.success'),
        description: t('message.saved'),
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: t('message.error'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertServiceRequest) => {
    mutation.mutate(data);
  };

  const activeTenants = tenants?.filter((t: any) => t.isActive) || [];

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {serviceRequest ? `${t('common.edit')} Service Request` : `${t('quickActions.addServiceRequest')}`}
        </DialogTitle>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="propertyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.property')}</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(parseInt(value))} 
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select property" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {properties?.map((property: any) => (
                        <SelectItem key={property.id} value={property.id.toString()}>
                          {property.address} - {property.city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tenantId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.tenant')} (Optional)</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)} 
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tenant (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">No tenant</SelectItem>
                      {activeTenants.map((tenant: any) => (
                        <SelectItem key={tenant.id} value={tenant.id.toString()}>
                          {tenant.firstName} {tenant.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.title')}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Bathroom sink repair" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.category')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="plumbing">{t('serviceCategory.plumbing')}</SelectItem>
                      <SelectItem value="electrical">{t('serviceCategory.electrical')}</SelectItem>
                      <SelectItem value="heating">{t('serviceCategory.heating')}</SelectItem>
                      <SelectItem value="general">{t('serviceCategory.general')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.priority')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">{t('priority.low')}</SelectItem>
                      <SelectItem value="medium">{t('priority.medium')}</SelectItem>
                      <SelectItem value="high">{t('priority.high')}</SelectItem>
                      <SelectItem value="urgent">{t('priority.urgent')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="open">{t('status.open')}</SelectItem>
                      <SelectItem value="in_progress">{t('status.inProgress')}</SelectItem>
                      <SelectItem value="completed">{t('status.completed')}</SelectItem>
                      <SelectItem value="cancelled">{t('status.cancelled')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="estimatedCost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.estimatedCost')}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="actualCost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Actual Cost</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="450" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assignedTo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.assignedTo')}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="John Smith Plumbing" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="scheduledDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scheduled Date</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="completedDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Completed Date</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('form.description')}</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={4} placeholder="Detailed description of the issue..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('common.save')}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
