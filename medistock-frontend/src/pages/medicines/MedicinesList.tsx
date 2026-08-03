import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CrudService } from "@/api/crudService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Medicine {
  id: number;
  name: string;
  description: string;
  price: number;
  supplier?: { id: number; name: string };
}

export const MedicinesList = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const medicineService = new CrudService<Medicine>("/medicines");
  const navigate = useNavigate();

  const loadMedicines = async () => {
    try {
      setLoading(true);
      const data = await medicineService.getAll();
      setMedicines(data);
    } catch (error) {
      toast.error("Failed to load medicines");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedicines();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this medicine?")) return;
    try {
      await medicineService.delete(id);
      toast.success("Medicine deleted successfully");
      loadMedicines();
    } catch (error) {
      toast.error("Failed to delete medicine");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Medicines</h2>
        <Button onClick={() => navigate("/medicines/new")}>
          <Plus className="mr-2 h-4 w-4" /> Add Medicine
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventory List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : medicines.length === 0 ? (
            <div className="text-center p-8 text-slate-500">
              No medicines found. Add one to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {medicines.map((med) => (
                  <TableRow key={med.id}>
                    <TableCell className="font-medium">{med.name}</TableCell>
                    <TableCell className="text-slate-500 truncate max-w-xs">{med.description || '-'}</TableCell>
                    <TableCell>${med.price?.toFixed(2)}</TableCell>
                    <TableCell>{med.supplier?.name || '-'}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => navigate(`/medicines/${med.id}/edit`)}>
                        <Edit className="h-4 w-4 text-slate-500 hover:text-blue-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(med.id)}>
                        <Trash2 className="h-4 w-4 text-slate-500 hover:text-red-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
