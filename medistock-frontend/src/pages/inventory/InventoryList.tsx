import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CrudService } from "@/api/crudService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Inventory {
  id: number;
  medicine: { id: number; name: string };
  batchNumber: string;
  quantity: number;
  expiryDate: string;
}

export const InventoryList = () => {
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const inventoryService = new CrudService<Inventory>("/inventories");
  const navigate = useNavigate();

  const loadInventories = async () => {
    try {
      setLoading(true);
      const data = await inventoryService.getAll();
      setInventories(data);
    } catch (error) {
      toast.error("Failed to load inventory data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventories();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this inventory record?")) return;
    try {
      await inventoryService.delete(id);
      toast.success("Inventory record deleted successfully");
      loadInventories();
    } catch (error) {
      toast.error("Failed to delete inventory record");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Inventory Tracking</h2>
        <Button onClick={() => navigate("/inventory/new")}>
          <Plus className="mr-2 h-4 w-4" /> Receive Stock
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Stock</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : inventories.length === 0 ? (
            <div className="text-center p-8 text-slate-500">
              No inventory records found. Add stock to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medicine</TableHead>
                  <TableHead>Batch Number</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventories.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">{inv.medicine?.name || '-'}</TableCell>
                    <TableCell>{inv.batchNumber}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${inv.quantity < 20 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {inv.quantity} units
                      </span>
                    </TableCell>
                    <TableCell>
                      {inv.expiryDate ? format(new Date(inv.expiryDate), 'MMM dd, yyyy') : '-'}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => navigate(`/inventory/${inv.id}/edit`)}>
                        <Edit className="h-4 w-4 text-slate-500 hover:text-blue-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(inv.id)}>
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
