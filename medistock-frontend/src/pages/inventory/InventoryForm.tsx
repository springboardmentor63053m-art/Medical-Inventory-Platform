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
import { format } from "date-fns";

const inventorySchema = z.object({
  medicine: z.object({ id: z.coerce.number().min(1, "Medicine is required") }),
  batchNumber: z.string().min(1, "Batch Number is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  expiryDate: z.string().min(1, "Expiry Date is required"),
});

type InventoryFormValues = z.infer<typeof inventorySchema>;

export const InventoryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [medicines, setMedicines] = useState<any[]>([]);
  const isEditMode = Boolean(id);
  
  const inventoryService = new CrudService<any>("/inventories");
  const medicineService = new CrudService<any>("/medicines");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InventoryFormValues>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      batchNumber: "",
      quantity: 0,
      expiryDate: "",
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const medicineData = await medicineService.getAll();
        setMedicines(medicineData);

        if (isEditMode && id) {
          const data = await inventoryService.getById(id);
          // format date for HTML5 date input (YYYY-MM-DD)
          const formattedDate = data.expiryDate ? format(new Date(data.expiryDate), 'yyyy-MM-dd') : "";
          
          reset({
            medicine: { id: data.medicine?.id },
            batchNumber: data.batchNumber || "",
            quantity: data.quantity,
            expiryDate: formattedDate,
          });
        }
      } catch (error) {
        toast.error("Failed to load data");
        navigate("/inventory");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, isEditMode, navigate, reset]);

  const onSubmit = async (data: InventoryFormValues) => {
    try {
      setIsSaving(true);
      if (isEditMode && id) {
        await inventoryService.update(id, data);
        toast.success("Inventory updated successfully");
      } else {
        await inventoryService.create(data);
        toast.success("Stock added successfully");
      }
      navigate("/inventory");
    } catch (error) {
      toast.error(`Failed to ${isEditMode ? 'update' : 'add'} stock`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/inventory")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          {isEditMode ? "Edit Inventory Record" : "Receive New Stock"}
        </h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stock Details</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="space-y-2">
                <Label htmlFor="medicine">Medicine <span className="text-red-500">*</span></Label>
                <select
                  id="medicine"
                  {...register("medicine.id")}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <option value="">Select a medicine...</option>
                  {medicines.map(med => (
                    <option key={med.id} value={med.id}>{med.name}</option>
                  ))}
                </select>
                {errors.medicine?.id && <p className="text-sm text-red-500">{errors.medicine.id.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="batchNumber">Batch Number <span className="text-red-500">*</span></Label>
                  <Input
                    id="batchNumber"
                    placeholder="BATCH-1234"
                    {...register("batchNumber")}
                    className={errors.batchNumber ? "border-red-500 focus-visible:ring-red-500" : ""}
                  />
                  {errors.batchNumber && <p className="text-sm text-red-500">{errors.batchNumber.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity <span className="text-red-500">*</span></Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    placeholder="100"
                    {...register("quantity")}
                    className={errors.quantity ? "border-red-500 focus-visible:ring-red-500" : ""}
                  />
                  {errors.quantity && <p className="text-sm text-red-500">{errors.quantity.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date <span className="text-red-500">*</span></Label>
                <Input
                  id="expiryDate"
                  type="date"
                  {...register("expiryDate")}
                  className={errors.expiryDate ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {errors.expiryDate && <p className="text-sm text-red-500">{errors.expiryDate.message}</p>}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => navigate("/inventory")} disabled={isSaving}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditMode ? "Save Changes" : "Receive Stock"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
