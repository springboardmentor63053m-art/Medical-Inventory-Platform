import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CrudService } from "@/api/crudService";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Supplier {
  id: number;
  name: string;
  contact?: string;
  email?: string;
}

export const SuppliersList = () => {

  console.log("SUPPLIERS COMPONENT RENDERED");

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const supplierService = new CrudService<Supplier>("/suppliers");


  // const loadSuppliers = async () => {
  //   try {
  //     console.log("Loading suppliers...");

  //     setLoading(true);

  //     const data = await supplierService.getAll();

  //     console.log("SUPPLIER API RESPONSE:", data);

  //     if (Array.isArray(data)) {
  //       setSuppliers(data);
  //     } else {
  //       console.error("Invalid supplier response:", data);
  //       setSuppliers([]);
  //     }

  //   } catch (error) {

  //     console.error("SUPPLIER LOAD ERROR:", error);

  //     toast.error("Failed to load suppliers");

  //   } finally {

  //     setLoading(false);

  //   }
  // };
  const loadSuppliers = async () => {

  console.log("🔥 LOAD SUPPLIERS FUNCTION STARTED");

  try {

    setLoading(true);

    console.log("Calling API...");

    const data = await supplierService.getAll();

    console.log("API RESPONSE DATA:", data);

    setSuppliers(data);

  } catch (error:any) {

    console.error("FULL ERROR:", error);

    console.error("ERROR RESPONSE:", error.response);

    console.error("ERROR MESSAGE:", error.message);

    toast.error("Failed to load suppliers");

  } finally {

    console.log("Loading finished");

    setLoading(false);

  }
};


  useEffect(() => {

    console.log("Supplier page mounted");

    loadSuppliers();

  }, []);



  const handleDelete = async (id:number)=>{

    if(!window.confirm("Are you sure you want to delete this supplier?"))
      return;


    try{

      await supplierService.delete(id);

      toast.success("Supplier deleted successfully");

      loadSuppliers();

    }catch(error){

      console.error(error);

      toast.error("Failed to delete supplier");

    }

  };


  console.log("CURRENT SUPPLIER STATE:", suppliers);



  return (
    <div className="space-y-6">


      <div className="flex items-center justify-between">

        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Suppliers
        </h2>


        <Button onClick={()=>navigate("/suppliers/new")}>

          <Plus className="mr-2 h-4 w-4"/>

          Add Supplier

        </Button>

      </div>



      <Card>

        <CardHeader>

          <CardTitle>
            Supplier Directory
          </CardTitle>

        </CardHeader>



        <CardContent>


          {loading ? (

            <div className="flex justify-center p-8">

              <Loader2 className="h-8 w-8 animate-spin text-blue-600"/>

            </div>


          ) : suppliers.length === 0 ? (


            <div className="text-center p-8 text-slate-500">

              No suppliers found.

            </div>


          ) : (


            <Table>

              <TableHeader>

                <TableRow>

                  <TableHead>Name</TableHead>

                  <TableHead>Contact</TableHead>

                  <TableHead>Email</TableHead>

                  <TableHead className="text-right">
                    Actions
                  </TableHead>

                </TableRow>

              </TableHeader>



              <TableBody>


                {suppliers.map((supplier)=>(


                  <TableRow key={supplier.id}>


                    <TableCell className="font-medium">

                      {supplier.name}

                    </TableCell>


                    <TableCell>

                      {supplier.contact || "-"}

                    </TableCell>


                    <TableCell>

                      {supplier.email || "-"}

                    </TableCell>


                    <TableCell className="text-right space-x-2">


                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={()=>navigate(`/suppliers/${supplier.id}/edit`)}
                      >

                        <Edit className="h-4 w-4 text-slate-500"/>

                      </Button>



                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={()=>handleDelete(supplier.id)}
                      >

                        <Trash2 className="h-4 w-4 text-slate-500"/>

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