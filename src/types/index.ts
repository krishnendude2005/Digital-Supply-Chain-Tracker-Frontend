export type Role = "ADMIN" | "WAREHOUSE_MANAGER" | "SUPPLIER" | "TRANSPORTER";

export type ShipmentStatus = "CREATED" | "IN_TRANSIT" | "DELIVERED" | "DELAYED";

export type ItemStatus = "DAMAGED" | "MISSING" | "IN_TRANSIT" | "DELIVERED" | "RECEIVED";

export type AlertType = "DAMAGED" | "DELAYED";

export interface UserResponse {
  userId: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface ItemResponse {
  itemId: string;
  name: string;
  category: string;
  supplierEmail: string;
  supplierName: string;
  supplierRole: Role;
  createdAt: string;
  updatedAt: string;
}

export interface ShipmentResponse {
  shipmentId: string;
  item: ItemResponse;
  fromLocation: string;
  toLocation: string;
  shipmentStartDate: string;
  shipmentExpectedDate: string;
  currentStatus: ShipmentStatus;
  transporterEmail: string | null;
  transporterName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CheckpointLogResponse {
  checkpointId: string;
  location: string;
  itemStatus: ItemStatus;
  shipmentId: string;
  timestamp: string;
}

export interface AlertResponse {
  alertId: string;
  type: AlertType;
  message: string;
  resolved: boolean;
  checkpointId: string;
  shipmentId: string;
  createdAt: string;
}

// Request Request Payloads
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  role: Role;
  email: string;
  name?: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password?: string;
  role: Role;
}

export interface RegisterResponse {
  message: string;
  role: Role;
}

export interface UserRegisterResponse {
  email: string;
  role: Role;
  name: string;
}

export interface ChangeRoleRequest {
  email: string;
  role: Role;
}

export interface CreateItemRequest {
  name: string;
  category: string;
}

export interface AddItemResponse {
  name: string;
  message: string;
}

export interface UpdateItemRequest {
  name: string;
  category: string;
  supplierEmail: string;
}

export interface ItemUpdateResponse {
  message: string;
  item: ItemResponse;
}

export interface CreateShipmentRequest {
  itemId: string;
  fromLocation: string;
  toLocation: string;
  endDate: string;
}

export interface AssignTransporterRequest {
  transporterId: string;
}

export interface UpdateShipmentStatusRequest {
  status: ShipmentStatus;
}

export interface ShipmentStatusChangeResponse {
  message: string;
  shipmentId: string;
  currentStatus: ShipmentStatus;
}

export interface CreateCheckpointLogRequest {
  shipmentId: string;
  location: string;
  itemStatus: ItemStatus;
}

export interface CreateCheckpointLogResponse {
  message: string;
  shipmentId: string;
  location: string;
  itemStatus: ItemStatus;
  date: string;
}
