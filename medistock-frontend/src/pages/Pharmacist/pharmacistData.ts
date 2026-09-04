export interface PharmacistMedicine {
  id: number;
  name: string;
  category: string;
  quantity: number;
  price: number;
  status: "Available" | "Low Stock" | "Out of Stock";
}

export interface PharmacistOrder {
  id: string;
  customerName: string;
  customerId: string;
  medicines: {
    name: string;
    quantity: number;
    price: number;
  }[];
  prescription: boolean;
  prescriptionName?: string;
  status:
    | "PENDING"
    | "APPROVED"
    | "REJECTED"
    | "DISPENSED";
  createdAt: string;
}

export interface PharmacistActivity {
  id: number;
  type: string;
  message: string;
  time: string;
}

/* =========================================================
   MEDICINES
   ========================================================= */

export const pharmacistMedicines: PharmacistMedicine[] = [
  {
    id: 1,
    name: "Paracetamol 500mg",
    category: "Tablet",
    quantity: 450,
    price: 25,
    status: "Available",
  },
  {
    id: 2,
    name: "Amoxicillin 250mg",
    category: "Capsule",
    quantity: 32,
    price: 80,
    status: "Low Stock",
  },
  {
    id: 3,
    name: "Azithromycin 500mg",
    category: "Tablet",
    quantity: 120,
    price: 95,
    status: "Available",
  },
  {
    id: 4,
    name: "Cough Syrup",
    category: "Syrup",
    quantity: 85,
    price: 65,
    status: "Available",
  },
  {
    id: 5,
    name: "Cetirizine 10mg",
    category: "Tablet",
    quantity: 8,
    price: 35,
    status: "Low Stock",
  },
];

/* =========================================================
   SAMPLE PENDING ORDER
   ========================================================= */

const sampleOrders: PharmacistOrder[] = [];

/* =========================================================
   LOCAL STORAGE
   ========================================================= */

const ORDER_STORAGE_KEY = "medistock_pharmacist_orders";
const ACTIVITY_STORAGE_KEY = "medistock_pharmacist_activity";

export const getPharmacistOrders = (): PharmacistOrder[] => {
  const stored = localStorage.getItem(ORDER_STORAGE_KEY);

  if (!stored) {
    localStorage.setItem(
      ORDER_STORAGE_KEY,
      JSON.stringify(sampleOrders)
    );

    return sampleOrders;
  }

  try {
    const orders: PharmacistOrder[] = JSON.parse(stored);
    return orders.filter(
      (order) =>
        order.customerName?.toLowerCase() !== "arun" &&
        order.customerName?.toLowerCase() !== "arun-user"
    );
  } catch {
    return sampleOrders;
  }
};

export const savePharmacistOrders = (
  orders: PharmacistOrder[]
): void => {
  const cleanOrders = orders.filter(
    (order) =>
      order.customerName?.toLowerCase() !== "arun" &&
      order.customerName?.toLowerCase() !== "arun-user"
  );
  localStorage.setItem(
    ORDER_STORAGE_KEY,
    JSON.stringify(cleanOrders)
  );
};

export const addPharmacistOrder = (order: PharmacistOrder): void => {
  const orders = getPharmacistOrders();
  const updated = [order, ...orders.filter((o) => o.id !== order.id)];
  savePharmacistOrders(updated);
};

/* =========================================================
   UPDATE ORDER STATUS
   ========================================================= */

export const updatePharmacistOrderStatus = (
  orderId: string,
  status:
    | "PENDING"
    | "APPROVED"
    | "REJECTED"
    | "DISPENSED"
): void => {
  const orders = getPharmacistOrders();

  const updatedOrders = orders.map((order) =>
    order.id === orderId
      ? {
          ...order,
          status,
        }
      : order
  );

  savePharmacistOrders(updatedOrders);
};

/* =========================================================
   ACTIVITY
   ========================================================= */

export const getPharmacistActivities =
  (): PharmacistActivity[] => {
    const stored = localStorage.getItem(
      ACTIVITY_STORAGE_KEY
    );

    if (!stored) {
      return [];
    }

    try {
      const activities: PharmacistActivity[] = JSON.parse(stored);
      return activities.filter(
        (activity) => !activity.message?.toLowerCase().includes("arun")
      );
    } catch {
      return [];
    }
  };

export const addPharmacistActivity = (
  activity: Omit<PharmacistActivity, "id">
): void => {
  const activities = getPharmacistActivities();
  const newActivity = { ...activity, id: Date.now() };
  const updated = [newActivity, ...activities];
  localStorage.setItem(
    ACTIVITY_STORAGE_KEY,
    JSON.stringify(updated)
  );
};
