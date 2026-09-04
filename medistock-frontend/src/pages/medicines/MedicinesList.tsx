import { useEffect, useMemo, useState } from "react";
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
import {
  Plus,
  Loader2,
  Edit,
  Trash2,
  Search,
  RefreshCw,
  Package,
  CalendarDays,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  IndianRupee,
} from "lucide-react";
import { toast } from "sonner";

interface Medicine {
  id: number;
  name: string;
  description?: string;
  price: number;

  supplier?: {
    id: number;
    name: string;
  };

  /*
   * These fields are optional so the page will continue
   * working even if some existing medicine records don't
   * contain them yet.
   */
  expiryDate?: string;
  expiry?: string;

  stockQuantity?: number;
  quantity?: number;
  stock?: number;

  status?: string;
  stockStatus?: string;

  category?: string;
}

export const MedicinesList = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState("all");

  const medicineService = new CrudService<Medicine>("/medicines");
  const navigate = useNavigate();

  // =========================================================
  // LOAD MEDICINES
  // =========================================================

  const loadMedicines = async () => {
    try {
      setLoading(true);

      const data = await medicineService.getAll();

      setMedicines(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load medicines");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedicines();
  }, []);

  // =========================================================
  // DELETE MEDICINE
  // =========================================================

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this medicine?"
    );

    if (!confirmed) return;

    try {
      await medicineService.delete(id);

      toast.success("Medicine deleted successfully");

      await loadMedicines();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete medicine");
    }
  };

  // =========================================================
  // GET STOCK
  // =========================================================

  const getStockQuantity = (medicine: Medicine): number => {
    if (typeof medicine.stockQuantity === "number") {
      return medicine.stockQuantity;
    }

    if (typeof medicine.quantity === "number") {
      return medicine.quantity;
    }

    if (typeof medicine.stock === "number") {
      return medicine.stock;
    }

    return 0;
  };

  // =========================================================
  // GET EXPIRY DATE
  // =========================================================

  const getExpiryDate = (medicine: Medicine): string => {
    return medicine.expiryDate || medicine.expiry || "";
  };

  // =========================================================
  // STOCK STATUS
  // =========================================================

  const getStockStatus = (medicine: Medicine) => {
    const quantity = getStockQuantity(medicine);

    const backendStatus =
      medicine.stockStatus?.toLowerCase() ||
      medicine.status?.toLowerCase() ||
      "";

    if (
      backendStatus.includes("out") ||
      backendStatus.includes("unavailable")
    ) {
      return "out";
    }

    if (quantity <= 0) {
      return "out";
    }

    if (quantity <= 10) {
      return "low";
    }

    return "in";
  };

  // =========================================================
  // EXPIRY STATUS
  // =========================================================

  const getExpiryStatus = (medicine: Medicine) => {
    const expiry = getExpiryDate(medicine);

    if (!expiry) {
      return "unknown";
    }

    const expiryDate = new Date(expiry);

    if (Number.isNaN(expiryDate.getTime())) {
      return "unknown";
    }

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    expiryDate.setHours(0, 0, 0, 0);

    const difference =
      expiryDate.getTime() - today.getTime();

    const daysRemaining =
      difference / (1000 * 60 * 60 * 24);

    if (daysRemaining < 0) {
      return "expired";
    }

    if (daysRemaining <= 30) {
      return "soon";
    }

    return "valid";
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date: string) => {
    if (!date) {
      return "Not specified";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =========================================================
  // FORMAT PRICE - INDIAN RUPEES
  // =========================================================

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(price || 0);
  };

  // =========================================================
  // FILTER MEDICINES
  // =========================================================

  const filteredMedicines = useMemo(() => {
    return medicines.filter((medicine) => {
      const search = searchTerm.toLowerCase().trim();

      const matchesSearch =
        !search ||
        medicine.name?.toLowerCase().includes(search) ||
        medicine.description?.toLowerCase().includes(search) ||
        medicine.supplier?.name?.toLowerCase().includes(search) ||
        medicine.category?.toLowerCase().includes(search);

      const stockStatus = getStockStatus(medicine);

      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "in" && stockStatus === "in") ||
        (stockFilter === "low" && stockStatus === "low") ||
        (stockFilter === "out" && stockStatus === "out");

      return matchesSearch && matchesStock;
    });
  }, [medicines, searchTerm, stockFilter]);

  // =========================================================
  // STATISTICS
  // =========================================================

  const totalMedicines = medicines.length;

  const inStockCount = medicines.filter(
    (medicine) => getStockStatus(medicine) === "in"
  ).length;

  const lowStockCount = medicines.filter(
    (medicine) => getStockStatus(medicine) === "low"
  ).length;

  const outOfStockCount = medicines.filter(
    (medicine) => getStockStatus(medicine) === "out"
  ).length;

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div
      className="min-h-full space-y-6"
      style={{
        padding: "6px",
      }}
    >
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div
        className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
      >
        <div>
          <p className="text-sm font-medium text-blue-600">
            Management Center
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Medicines
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage medicines, pricing, stock availability and expiry dates.
          </p>
        </div>

        <Button
          onClick={() => navigate("/admin/medicines/new")}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Medicine
        </Button>
      </div>

      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns:
            "repeat(auto-fit, minmax(190px, 1fr))",
        }}
      >
        {/* Total */}

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Medicines
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {totalMedicines}
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 p-3">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* In Stock */}

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  In Stock
                </p>

                <p className="mt-2 text-3xl font-bold text-emerald-600">
                  {inStockCount}
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50 p-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Low Stock */}

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Low Stock
                </p>

                <p className="mt-2 text-3xl font-bold text-amber-600">
                  {lowStockCount}
                </p>
              </div>

              <div className="rounded-xl bg-amber-50 p-3">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Out of Stock */}

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Out of Stock
                </p>

                <p className="mt-2 text-3xl font-bold text-red-600">
                  {outOfStockCount}
                </p>
              </div>

              <div className="rounded-xl bg-red-50 p-3">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* =====================================================
          MEDICINES CARD
      ===================================================== */}

      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-200 bg-white">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-lg text-slate-900">
                Medicine Inventory
              </CardTitle>

              <p className="mt-1 text-sm text-slate-500">
                View and manage all medicines in your inventory.
              </p>
            </div>

            {/* Search */}

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(e.target.value)
                  }
                  placeholder="Search medicines..."
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-64"
                />
              </div>

              <select
                value={stockFilter}
                onChange={(e) =>
                  setStockFilter(e.target.value)
                }
                className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="all">
                  All Stock
                </option>

                <option value="in">
                  In Stock
                </option>

                <option value="low">
                  Low Stock
                </option>

                <option value="out">
                  Out of Stock
                </option>
              </select>

              <Button
                variant="outline"
                size="icon"
                onClick={loadMedicines}
                title="Refresh"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : filteredMedicines.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
              <div className="rounded-full bg-slate-100 p-4">
                <Package className="h-8 w-8 text-slate-400" />
              </div>

              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                No medicines found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Try changing your search or stock filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead className="whitespace-nowrap px-5 py-4 font-semibold text-slate-600">
                      Medicine
                    </TableHead>

                    <TableHead className="whitespace-nowrap px-5 py-4 font-semibold text-slate-600">
                      Description
                    </TableHead>

                    <TableHead className="whitespace-nowrap px-5 py-4 font-semibold text-slate-600">
                      Category
                    </TableHead>

                    <TableHead className="whitespace-nowrap px-5 py-4 font-semibold text-slate-600">
                      Price
                    </TableHead>

                    <TableHead className="whitespace-nowrap px-5 py-4 font-semibold text-slate-600">
                      Stock
                    </TableHead>

                    <TableHead className="whitespace-nowrap px-5 py-4 font-semibold text-slate-600">
                      Status
                    </TableHead>

                    <TableHead className="whitespace-nowrap px-5 py-4 font-semibold text-slate-600">
                      Expiry Date
                    </TableHead>

                    <TableHead className="whitespace-nowrap px-5 py-4 font-semibold text-slate-600">
                      Supplier
                    </TableHead>

                    <TableHead className="whitespace-nowrap px-5 py-4 text-right font-semibold text-slate-600">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredMedicines.map((medicine) => {
                    const stockQuantity =
                      getStockQuantity(medicine);

                    const stockStatus =
                      getStockStatus(medicine);

                    const expiryStatus =
                      getExpiryStatus(medicine);

                    return (
                      <TableRow
                        key={medicine.id}
                        className="transition hover:bg-slate-50"
                      >
                        {/* Medicine */}

                        <TableCell className="px-5 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                              <IndianRupee className="h-5 w-5 text-blue-600" />
                            </div>

                            <div>
                              <p className="font-semibold text-slate-900">
                                {medicine.name}
                              </p>

                              <p className="text-xs text-slate-400">
                                ID: #{medicine.id}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        {/* Description */}

                        <TableCell className="max-w-[220px] px-5 py-5">
                          <p
                            className="truncate text-sm text-slate-500"
                            title={medicine.description || ""}
                          >
                            {medicine.description || "—"}
                          </p>
                        </TableCell>

                        {/* Category */}

                        <TableCell className="px-5 py-5">
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                            {medicine.category || "General"}
                          </span>
                        </TableCell>

                        {/* Price */}

                        <TableCell className="whitespace-nowrap px-5 py-5">
                          <span className="font-semibold text-slate-900">
                            {formatPrice(medicine.price)}
                          </span>
                        </TableCell>

                        {/* Stock */}

                        <TableCell className="px-5 py-5">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-slate-400" />

                            <span className="font-semibold text-slate-800">
                              {stockQuantity}
                            </span>

                            <span className="text-xs text-slate-400">
                              units
                            </span>
                          </div>
                        </TableCell>

                        {/* Stock Status */}

                        <TableCell className="px-5 py-5">
                          {stockStatus === "in" && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              In Stock
                            </span>
                          )}

                          {stockStatus === "low" && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                              <AlertTriangle className="h-3.5 w-3.5" />
                              Low Stock
                            </span>
                          )}

                          {stockStatus === "out" && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">
                              <XCircle className="h-3.5 w-3.5" />
                              Out of Stock
                            </span>
                          )}
                        </TableCell>

                        {/* Expiry */}

                        <TableCell className="whitespace-nowrap px-5 py-5">
                          <div className="flex items-center gap-2">
                            <CalendarDays
                              className={`h-4 w-4 ${
                                expiryStatus === "expired"
                                  ? "text-red-500"
                                  : expiryStatus === "soon"
                                  ? "text-amber-500"
                                  : "text-slate-400"
                              }`}
                            />

                            <div>
                              <p
                                className={`text-sm font-medium ${
                                  expiryStatus === "expired"
                                    ? "text-red-600"
                                    : expiryStatus === "soon"
                                    ? "text-amber-600"
                                    : "text-slate-700"
                                }`}
                              >
                                {formatDate(
                                  getExpiryDate(medicine)
                                )}
                              </p>

                              {expiryStatus ===
                                "expired" && (
                                <p className="text-xs text-red-500">
                                  Expired
                                </p>
                              )}

                              {expiryStatus ===
                                "soon" && (
                                <p className="text-xs text-amber-500">
                                  Expiring soon
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {/* Supplier */}

                        <TableCell className="px-5 py-5">
                          <span className="text-sm text-slate-600">
                            {medicine.supplier?.name ||
                              "—"}
                          </span>
                        </TableCell>

                        {/* Actions */}

                        <TableCell className="px-5 py-5 text-right">
                          <div className="flex justify-end gap-2">
                            {/* EDIT */}

                            <Button
                              variant="outline"
                              size="icon"
                              title="Edit medicine"
                              onClick={() =>
                                navigate(
                                  `/admin/medicines/${medicine.id}/edit`
                                )
                              }
                              className="border-slate-200 hover:border-blue-300 hover:bg-blue-50"
                            >
                              <Edit className="h-4 w-4 text-blue-600" />
                            </Button>

                            {/* DELETE */}

                            <Button
                              variant="outline"
                              size="icon"
                              title="Delete medicine"
                              onClick={() =>
                                handleDelete(
                                  medicine.id
                                )
                              }
                              className="border-slate-200 hover:border-red-300 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};