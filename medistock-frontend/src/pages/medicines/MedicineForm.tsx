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

const medicineSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  supplier: z.object({ id: z.coerce.number() }).optional().nullable(),
});

type MedicineFormValues = z.infer<typeof medicineSchema>;

export const MedicineForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const isEditMode = Boolean(id);
  
  const medicineService = new CrudService<any>("/medicines");
  const supplierService = new CrudService<any>("/suppliers");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MedicineFormValues>({
    resolver: zodResolver(medicineSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Load suppliers for the dropdown
        const supplierData = await supplierService.getAll();
        setSuppliers(supplierData);

        if (isEditMode && id) {
          const data = await medicineService.getById(id);
          reset({
            name: data.name,
            description: data.description || "",
            price: data.price,
            supplier: data.supplier ? { id: data.supplier.id } : null,
          });
        }
      } catch (error) {
        toast.error("Failed to load data");
        if (isEditMode) navigate("/medicines");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, isEditMode, navigate, reset]);

  const onSubmit = async (data: MedicineFormValues) => {
    try {
      setIsSaving(true);
      // Clean up supplier if not selected
      const payload = {
        ...data,
        supplier: data.supplier?.id ? { id: data.supplier.id } : null
      };

      if (isEditMode && id) {
        await medicineService.update(id, payload);
        toast.success("Medicine updated successfully");
      } else {
        await medicineService.create(payload);
        toast.success("Medicine created successfully");
      }
      navigate("/medicines");
    } catch (error) {
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} medicine`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/medicines")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          {isEditMode ? "Edit Medicine" : "New Medicine"}
        </h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Medicine Details</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Medicine Name <span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  placeholder="Paracetamol 500mg"
                  {...register("name")}
                  className={errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Pain reliever and a fever reducer"
                  {...register("description")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price ($) <span className="text-red-500">*</span></Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="9.99"
                  {...register("price")}
                  className={errors.price ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {errors.price && <p className="text-sm text-red-500">{errors.price.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <select
                  id="supplier"
                  {...register("supplier.id")}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <option value="">Select a supplier...</option>
                  {suppliers.map(sup => (
                    <option key={sup.id} value={sup.id}>{sup.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => navigate("/medicines")} disabled={isSaving}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditMode ? "Save Changes" : "Create Medicine"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
