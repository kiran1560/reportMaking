import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Patient, Order, OrderStatus } from '@/types/lims';
import { v4 as uuidv4 } from 'uuid';

interface LimsState {
  patients: Patient[];
  orders: Order[];
  addPatient: (patient: Omit<Patient, 'id' | 'createdAt'>) => Patient;
  getPatient: (id: string) => Patient | undefined;
  addOrder: (order: Omit<Order, 'id' | 'orderId' | 'barcode' | 'createdAt'>) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus, extra?: Partial<Order>) => void;
  updateOrder: (orderId: string, updates: Partial<Order>) => void;
  getOrdersByStatus: (status: OrderStatus) => Order[];
  getOrder: (orderId: string) => Order | undefined;
}

const generateOrderId = () => {
  const date = new Date();
  const prefix = 'ORD';
  const datePart = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${datePart}-${random}`;
};

const generateBarcode = () => {
  return `BC${Date.now()}${Math.floor(Math.random() * 1000)}`;
};

export const useLimsStore = create<LimsState>()(
  persist(
    (set, get) => ({
      patients: [],
      orders: [],

      addPatient: (patientData) => {
        const patient: Patient = {
          ...patientData,
          id: uuidv4(),
          createdAt: new Date(),
        };
        set((state) => ({ patients: [...state.patients, patient] }));
        return patient;
      },

      getPatient: (id) => {
        return get().patients.find((p) => p.id === id);
      },

      addOrder: (orderData) => {
        const order: Order = {
          ...orderData,
          id: uuidv4(),
          orderId: generateOrderId(),
          barcode: generateBarcode(),
          createdAt: new Date(),
          status: 'booked',
        };
        set((state) => ({ orders: [...state.orders, order] }));
        return order;
      },

      updateOrderStatus: (orderId, status, extra = {}) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId ? { ...order, status, ...extra } : order
          ),
        }));
      },

      updateOrder: (orderId, updates) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId ? { ...order, ...updates } : order
          ),
        }));
      },

      getOrdersByStatus: (status) => {
        return get().orders.filter((order) => order.status === status);
      },

      getOrder: (orderId) => {
        return get().orders.find((order) => order.id === orderId);
      },
    }),
    {
      name: 'lims-storage',
    }
  )
);
