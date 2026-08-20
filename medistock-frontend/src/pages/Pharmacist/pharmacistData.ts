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

const sampleOrders: PharmacistOrder[] = [
  {
    id: "ORD-1025",
    customerName: "arun",
    customerId: "USR-001",
    medicines: [
      {
        name: "Paracetamol 500mg",
        quantity: 2,
        price: 25,
      },
      {
        name: "Amoxicillin 250mg",
        quantity: 1,
        price: 80,
      },
    ],
    prescription: true,
    prescriptionName: "prescription_arun.jpg",
    status: "PENDING",
    createdAt: "Today, 10:35 AM",
  },
];

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
    return JSON.parse(stored);
  } catch {
    return sampleOrders;
  }
};

export const savePharmacistOrders = (
  orders: PharmacistOrder[]
): void => {
  localStorage.setItem(
    ORDER_STORAGE_KEY,
    JSON.stringify(orders)
  );
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
      const activities: PharmacistActivity[] = [
        {
          id: 1,
          type: "ORDER",
          message: "New order received from arun",
          time: "Today, 10:35 AM",
        },
        {
          id: 2,
          type: "PRESCRIPTION",
          message: "Prescription uploaded by arun",
          time: "Today, 10:34 AM",
        },
        {
          id: 3,
          type: "APPROVAL",
          message: "Order ORD-1021 approved",
          time: "Today, 09:50 AM",
        },
        {
          id: 4,
          type: "DISPENSED",
          message: "Order ORD-1018 marked as dispensed",
          time: "Yesterday, 04:15 PM",
        },
      ];

      localStorage.setItem(
        ACTIVITY_STORAGE_KEY,
        JSON.stringify(activities)
      );

      return activities;
    }

    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  };
