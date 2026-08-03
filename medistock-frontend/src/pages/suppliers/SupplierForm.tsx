import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { CrudService } from "@/api/crudService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";

const supplierSchema = z.object({
  name: z.string().min(1, "Name is required"),
  contact: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
});

type SupplierFormValues = z.infer<typeof supplierSchema>;

export const SupplierForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = Boolean(id);
  
  const supplierService = new CrudService<any>("/suppliers");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: "",
      contact: "",
      email: "",
    }
  });

  useEffect(() => {
    if (isEditMode && id) {
      const loadSupplier = async () => {
        try {
          setIsLoading(true);
          const data = await supplierService.getById(id);
          reset({
            name: data.name,
            contact: data.contact || "",
            email: data.email || "",
          });
        } catch (error) {
          toast.error("Failed to load supplier details");
          navigate("/suppliers");
        } finally {
          setIsLoading(false);
        }
      };
      loadSupplier();
    }
  }, [id, isEditMode, navigate, reset]);

  const onSubmit = async (data: SupplierFormValues) => {
    try {
      setIsSaving(true);
      if (isEditMode && id) {
        await supplierService.update(id, data);
        toast.success("Supplier updated successfully");
      } else {
        await supplierService.create(data);
        toast.success("Supplier created successfully");
      }
      navigate("/suppliers");
    } catch (error) {
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} supplier`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/suppliers")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          {isEditMode ? "Edit Supplier" : "New Supplier"}
        </h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Supplier Details</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Supplier Name <span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  placeholder="Acme Pharma"
                  {...register("name")}
                  className={errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact">Contact Number</Label>
                <Input
                  id="contact"
                  placeholder="+1 (555) 123-4567"
                  {...register("contact")}
                  className={errors.contact ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {errors.contact && <p className="text-sm text-red-500">{errors.contact.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contact@acme.com"
                  {...register("email")}
                  className={errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => navigate("/suppliers")} disabled={isSaving}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditMode ? "Save Changes" : "Create Supplier"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
