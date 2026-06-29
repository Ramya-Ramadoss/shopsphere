export type Role = 'CUSTOMER' | 'ADMIN';

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: Role;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  enabled?: boolean;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface ProductImage {
  id: number;
  imageUrl: string;
  isPrimary: boolean;
  sortOrder?: number;
  primaryImage?: boolean;
}

export interface Inventory {
  id: number;
  quantity: number;
  reservedQuantity: number;
  inStock: boolean;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  brand: string;
  available: boolean;
  category: Category;
  images: ProductImage[];
  inventory: Inventory;
  averageRating?: number;
  reviewCount?: number;
  premium?: boolean;
  approved?: boolean;
  deletedAt?: string;
  sku?: string;
  reviews?: Review[];
}

export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Cart {
  id: number;
  customerId: number;
  items: CartItem[];
  totalPrice: number;
  totalQuantity: number;
}

export interface WishlistItem {
  id: number;
  productId: number;
  productName: string;
  productImage: string;
  price: number;
}

export interface Wishlist {
  id: number;
  customerId: number;
  items: WishlistItem[];
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface Order {
  id: number;
  customerId: number;
  orderDate: string;
  totalAmount: number;
  orderStatus: OrderStatus;
  orderItems: OrderItem[];
  paymentStatus?: string;
  paymentMethod?: string;
  courierPartner?: string;
  trackingId?: string;
  expectedDeliveryDate?: string;
  estimatedArrivalTime?: string;
}

export interface Payment {
  id: number;
  amount: number;
  paymentMethod: string;
  paymentStatus: 'PENDING' | 'SUCCESS' | 'FAILED';
  transactionId: string;
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  orderId: number;
  orderDate: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  taxes: number;
  shipping: number;
  grandTotal: number;
  paymentStatus: string;
  paymentMethod: string;
  paid: boolean;
  generatedDate: string;
}

export interface Notification {
  id: number;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface Review {
  id: number;
  productId: number;
  customerName: string;
  rating: number;
  comment: string;
  reviewDate: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
