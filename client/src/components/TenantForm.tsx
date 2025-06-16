import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { insertTenantSchema, type InsertTenant } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface TenantFormProps {
  tenant?: any;
  onClose: () => void;
}

export default function TenantForm({ tenant, onClose }: TenantFormProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertTenant>({
    resolver: zodResolver(insertTenantSchema),
    defaultValues: tenant || {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      birthDate: undefined,
      nationalId: "",
      emergencyContact: "",
      notes: "",
      isActive: true,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertTenant) => {
      const url = tenant ? `/api/tenants/${tenant.id}` : '/api/tenants';
      const method = tenant ? 'PUT' : 'POST';
      return apiRequest(method, url, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tenants'] });
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

  const onSubmit = (data: InsertTenant) => {
    mutation.mutate(data);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {tenant ? `${t('common.edit')} ${t('nav.tenants')}` : `${t('common.add')} ${t('nav.tenants')}`}
        </DialogTitle>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.firstName')}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Jan" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.lastName')}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Kowalski" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.email')}</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="jan@example.com" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.phone')}</FormLabel>
                  <FormControl>
                    <Input {...field} type="tel" placeholder="+48 123 456 789" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="birthDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.birthDate')}</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nationalId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.nationalId')}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="12345678901" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="emergencyContact"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('form.emergencyContact')}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Name, phone number" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('form.notes')}</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={3} placeholder="Additional notes..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Active Tenant</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Is this tenant currently active in the system?
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
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
