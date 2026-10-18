import axios from "axios";
import type {
  LoginRequest,
  LoginResponse,
  UserResponse,
  RegisterRequest,
  RegisterResponse,
  UserRegisterResponse,
  ChangeRoleRequest,
  ItemResponse,
  CreateItemRequest,
  AddItemResponse,
  UpdateItemRequest,
  ItemUpdateResponse,
  ShipmentResponse,
  CreateShipmentRequest,
  AssignTransporterRequest,
  UpdateShipmentStatusRequest,
  ShipmentStatusChangeResponse,
  CreateCheckpointLogRequest,
  CreateCheckpointLogResponse,
  CheckpointLogResponse,
  AlertResponse,
  Role,
  ShipmentStatus,
  ItemStatus
} from "../types";

// Configuration for baseURL. Default is local Java server port (8080)
const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:8080/api").replace(/\/+$/, "");

// We enable mock mode if set in localStorage or if we cannot hit the backend.
// To change, call localStorage.setItem("use_mock_api", "true" | "false")
const getMockMode = (): boolean => {
  const stored = localStorage.getItem("use_mock_api");
  if (stored === null) {
    // Default to mock mode to make the app work out of the box
    localStorage.setItem("use_mock_api", "true");
    return true;
  }
  return stored === "true";
};

export const setMockMode = (enabled: boolean) => {
  localStorage.setItem("use_mock_api", enabled ? "true" : "false");
  window.location.reload();
};

export const isMockMode = getMockMode;

// Create Axios Client
export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach Authorization Token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("waypoint_auth_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle Auth Errors (401 Redirect)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("waypoint_auth_token");
      localStorage.removeItem("waypoint_auth_user");
      // Fire custom event to let auth context know to redirect
      window.dispatchEvent(new Event("auth_unauthorized"));
    }
    return Promise.reject(error);
  }
);

/* ============================================================================
   STATEFUL MOCK DATA STORE (LOCALSTORAGE)
   ============================================================================ */

const initLocalStorageMockData = () => {
  if (!localStorage.getItem("mock_users")) {
    const defaultUsers: UserResponse[] = [
      {
        userId: "u-1",
        name: "Riya Anand",
        email: "riya@waypoint.io",
        role: "ADMIN",
        createdAt: "2026-07-01T09:00:00Z",
        updatedAt: "2026-07-01T09:00:00Z"
      },
      {
        userId: "u-2",
        name: "Suresh Logistics Operations",
        email: "ops@sureshlog.com",
        role: "TRANSPORTER",
        createdAt: "2026-07-01T10:00:00Z",
        updatedAt: "2026-07-01T10:00:00Z"
      },
      {
        userId: "u-3",
        name: "Anand Textiles Supplier",
        email: "supply@anandtex.in",
        role: "SUPPLIER",
        createdAt: "2026-07-02T11:00:00Z",
        updatedAt: "2026-07-02T11:00:00Z"
      },
      {
        userId: "u-4",
        name: "Warehouse Manager",
        email: "warehouse@waypoint.io",
        role: "WAREHOUSE_MANAGER",
        createdAt: "2026-07-02T12:00:00Z",
        updatedAt: "2026-07-02T12:00:00Z"
      }
    ];
    localStorage.setItem("mock_users", JSON.stringify(defaultUsers));
  }

  if (!localStorage.getItem("mock_items")) {
    const defaultItems: ItemResponse[] = [
      {
        itemId: "i-1",
        name: "Cotton textile rolls",
        category: "Textiles",
        supplierEmail: "supply@anandtex.in",
        supplierName: "Anand Textiles Supplier",
        supplierRole: "SUPPLIER",
        createdAt: "2026-07-08T09:00:00Z",
        updatedAt: "2026-07-08T09:00:00Z"
      },
      {
        itemId: "i-2",
        name: "Circuit board assembly",
        category: "Electronics",
        supplierEmail: "supply@anandtex.in",
        supplierName: "Anand Textiles Supplier",
        supplierRole: "SUPPLIER",
        createdAt: "2026-07-08T10:00:00Z",
        updatedAt: "2026-07-08T10:00:00Z"
      },
      {
        itemId: "i-3",
        name: "Precision gear set",
        category: "Machine parts",
        supplierEmail: "supply@anandtex.in",
        supplierName: "Anand Textiles Supplier",
        supplierRole: "SUPPLIER",
        createdAt: "2026-07-09T11:00:00Z",
        updatedAt: "2026-07-09T11:00:00Z"
      }
    ];
    localStorage.setItem("mock_items", JSON.stringify(defaultItems));
  }

  if (!localStorage.getItem("mock_shipments")) {
    const defaultShipments: ShipmentResponse[] = [
      {
        shipmentId: "WP-4471",
        item: {
          itemId: "i-1",
          name: "Cotton textile rolls",
          category: "Textiles",
          supplierEmail: "supply@anandtex.in",
          supplierName: "Anand Textiles Supplier",
          supplierRole: "SUPPLIER",
          createdAt: "2026-07-08T09:00:00Z",
          updatedAt: "2026-07-08T09:00:00Z"
        },
        fromLocation: "Chennai Port, TN",
        toLocation: "Pune Distribution Center",
        shipmentStartDate: "2026-07-08T09:02:00Z",
        shipmentExpectedDate: "2026-07-12T18:00:00Z",
        currentStatus: "IN_TRANSIT",
        transporterEmail: "ops@sureshlog.com",
        transporterName: "Suresh Logistics Operations",
        createdAt: "2026-07-08T09:00:00Z",
        updatedAt: "2026-07-10T08:15:00Z"
      },
      {
        shipmentId: "WP-4468",
        item: {
          itemId: "i-2",
          name: "Circuit board assembly",
          category: "Electronics",
          supplierEmail: "supply@anandtex.in",
          supplierName: "Anand Textiles Supplier",
          supplierRole: "SUPPLIER",
          createdAt: "2026-07-08T10:00:00Z",
          updatedAt: "2026-07-08T10:00:00Z"
        },
        fromLocation: "Mumbai, MH",
        toLocation: "Delhi DC",
        shipmentStartDate: "2026-07-09T10:00:00Z",
        shipmentExpectedDate: "2026-07-11T14:00:00Z",
        currentStatus: "DELAYED",
        transporterEmail: "ops@sureshlog.com",
        transporterName: "Suresh Logistics Operations",
        createdAt: "2026-07-08T10:00:00Z",
        updatedAt: "2026-07-10T12:00:00Z"
      },
      {
        shipmentId: "WP-4460",
        item: {
          itemId: "i-3",
          name: "Precision gear set",
          category: "Machine parts",
          supplierEmail: "supply@anandtex.in",
          supplierName: "Anand Textiles Supplier",
          supplierRole: "SUPPLIER",
          createdAt: "2026-07-09T11:00:00Z",
          updatedAt: "2026-07-09T11:00:00Z"
        },
        fromLocation: "Pune, MH",
        toLocation: "Bengaluru DC",
        shipmentStartDate: "2026-07-09T09:00:00Z",
        shipmentExpectedDate: "2026-07-09T17:00:00Z",
        currentStatus: "DELIVERED",
        transporterEmail: "ops@sureshlog.com",
        transporterName: "Suresh Logistics Operations",
        createdAt: "2026-07-09T08:00:00Z",
        updatedAt: "2026-07-09T17:00:00Z"
      },
      {
        shipmentId: "WP-4455",
        item: {
          itemId: "i-1",
          name: "Cotton textile rolls",
          category: "Textiles",
          supplierEmail: "supply@anandtex.in",
          supplierName: "Anand Textiles Supplier",
          supplierRole: "SUPPLIER",
          createdAt: "2026-07-08T09:00:00Z",
          updatedAt: "2026-07-08T09:00:00Z"
        },
        fromLocation: "Nashik, MH",
        toLocation: "Surat DC",
        shipmentStartDate: "2026-07-10T11:00:00Z",
        shipmentExpectedDate: "2026-07-14T11:00:00Z",
        currentStatus: "CREATED",
        transporterEmail: null,
        transporterName: null,
        createdAt: "2026-07-10T11:00:00Z",
        updatedAt: "2026-07-10T11:00:00Z"
      }
    ];
    localStorage.setItem("mock_shipments", JSON.stringify(defaultShipments));
  }

  if (!localStorage.getItem("mock_checkpoints")) {
    const defaultCheckpoints: CheckpointLogResponse[] = [
      {
        checkpointId: "c-1",
        location: "Chennai Port",
        itemStatus: "IN_TRANSIT",
        shipmentId: "WP-4471",
        timestamp: "2026-07-08T09:02:00Z"
      },
      {
        checkpointId: "c-2",
        location: "Chennai Departure Gate",
        itemStatus: "IN_TRANSIT",
        shipmentId: "WP-4471",
        timestamp: "2026-07-08T11:40:00Z"
      },
      {
        checkpointId: "c-3",
        location: "Nagpur Hub",
        itemStatus: "IN_TRANSIT",
        shipmentId: "WP-4471",
        timestamp: "2026-07-10T08:15:00Z"
      },
      {
        checkpointId: "c-4",
        location: "Nagpur Cross-dock",
        itemStatus: "DAMAGED",
        shipmentId: "WP-4468",
        timestamp: "2026-07-10T12:00:00Z"
      },
      {
        checkpointId: "c-5",
        location: "Pune Warehouse",
        itemStatus: "RECEIVED",
        shipmentId: "WP-4460",
        timestamp: "2026-07-09T09:00:00Z"
      },
      {
        checkpointId: "c-6",
        location: "Bengaluru DC",
        itemStatus: "DELIVERED",
        shipmentId: "WP-4460",
        timestamp: "2026-07-09T17:00:00Z"
      }
    ];
    localStorage.setItem("mock_checkpoints", JSON.stringify(defaultCheckpoints));
  }

  if (!localStorage.getItem("mock_alerts")) {
    const defaultAlerts: AlertResponse[] = [
      {
        alertId: "a-1",
        type: "DELAYED",
        message: "Shipment WP-4468 exceeded estimated time of arrival at Nagpur Hub by 4h.",
        resolved: false,
        checkpointId: "c-4",
        shipmentId: "WP-4468",
        createdAt: "2026-07-10T12:15:00Z"
      },
      {
        alertId: "a-2",
        type: "DAMAGED",
        message: "Electronics shipment WP-4468 reported DAMAGED at Nagpur Cross-dock.",
        resolved: false,
        checkpointId: "c-4",
        shipmentId: "WP-4468",
        createdAt: "2026-07-10T12:20:00Z"
      },
      {
        alertId: "a-3",
        type: "DELAYED",
        message: "No transporter assigned to WP-4455, risk of pickup window breach in 4h.",
        resolved: false,
        checkpointId: "",
        shipmentId: "WP-4455",
        createdAt: "2026-07-10T13:00:00Z"
      }
    ];
    localStorage.setItem("mock_alerts", JSON.stringify(defaultAlerts));
  }
};

initLocalStorageMockData();

// Access Helper functions
const getMockUsers = (): UserResponse[] => JSON.parse(localStorage.getItem("mock_users") || "[]");
const saveMockUsers = (users: UserResponse[]) => localStorage.setItem("mock_users", JSON.stringify(users));

const getMockItems = (): ItemResponse[] => JSON.parse(localStorage.getItem("mock_items") || "[]");
const saveMockItems = (items: ItemResponse[]) => localStorage.setItem("mock_items", JSON.stringify(items));

const getMockShipments = (): ShipmentResponse[] => JSON.parse(localStorage.getItem("mock_shipments") || "[]");
const saveMockShipments = (shipments: ShipmentResponse[]) => localStorage.setItem("mock_shipments", JSON.stringify(shipments));

const getMockCheckpoints = (): CheckpointLogResponse[] => JSON.parse(localStorage.getItem("mock_checkpoints") || "[]");
const saveMockCheckpoints = (checkpoints: CheckpointLogResponse[]) => localStorage.setItem("mock_checkpoints", JSON.stringify(checkpoints));

const getMockAlerts = (): AlertResponse[] => JSON.parse(localStorage.getItem("mock_alerts") || "[]");
const saveMockAlerts = (alerts: AlertResponse[]) => localStorage.setItem("mock_alerts", JSON.stringify(alerts));


/* ============================================================================
   TYPED API ENDPOINTS (MOCK & LIVE SUPPORT)
   ============================================================================ */

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

export const apiService = {
  // --- AUTHENTICATION ---
  login: async (req: LoginRequest): Promise<LoginResponse> => {
    if (getMockMode()) {
      await delay(400);
      const users = getMockUsers();
      const user = users.find(u => u.email.toLowerCase() === req.email.toLowerCase());
      if (user) {
        return {
          token: `mock-jwt-token-for-${user.email}`,
          role: user.role,
          email: user.email,
          name: user.name
        };
      }
      // If user not found, fallback to role mapping on email prefix
      let resolvedRole: Role = "ADMIN";
      if (req.email.includes("supplier") || req.email.includes("supply")) resolvedRole = "SUPPLIER";
      else if (req.email.includes("transporter") || req.email.includes("ops")) resolvedRole = "TRANSPORTER";
      else if (req.email.includes("warehouse")) resolvedRole = "WAREHOUSE_MANAGER";

      return {
        token: `mock-jwt-token-for-${req.email}`,
        role: resolvedRole,
        email: req.email
      };
    } else {
      const response = await apiClient.post<LoginResponse>("/auth/login", req);
      return response.data;
    }
  },

  // --- USERS ---
  getUsers: async (): Promise<UserResponse[]> => {
    if (getMockMode()) {
      await delay(200);
      return getMockUsers();
    } else {
      const response = await apiClient.get<UserResponse[]>("/users");
      return response.data;
    }
  },

  registerUser: async (req: RegisterRequest): Promise<UserRegisterResponse> => {
    if (getMockMode()) {
      await delay(300);
      const users = getMockUsers();
      
      // Check duplicate
      if (users.some(u => u.email.toLowerCase() === req.email.toLowerCase())) {
        throw new Error("User with this email already exists");
      }

      const newUser: UserResponse = {
        userId: `u-${Date.now()}`,
        name: req.name,
        email: req.email,
        role: req.role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      saveMockUsers([...users, newUser]);
      return {
        email: newUser.email,
        role: newUser.role,
        name: newUser.name
      };
    } else {
      const response = await apiClient.post<UserRegisterResponse>("/users/admin/register", req);
      return response.data;
    }
  },

  changeUserRole: async (req: ChangeRoleRequest): Promise<RegisterResponse> => {
    if (getMockMode()) {
      await delay(300);
      const users = getMockUsers();
      const index = users.findIndex(u => u.email.toLowerCase() === req.email.toLowerCase());
      if (index === -1) {
        throw new Error("User not found");
      }
      users[index].role = req.role;
      users[index].updatedAt = new Date().toISOString();
      saveMockUsers(users);
      return {
        message: "User role updated successfully",
        role: req.role
      };
    } else {
      const response = await apiClient.put<RegisterResponse>("/users/admin/role", req);
      return response.data;
    }
  },

  // --- ITEMS ---
  getItems: async (): Promise<ItemResponse[]> => {
    if (getMockMode()) {
      await delay(200);
      return getMockItems();
    } else {
      const response = await apiClient.get<ItemResponse[]>("/items");
      return response.data;
    }
  },

  getItem: async (itemId: string): Promise<ItemResponse> => {
    if (getMockMode()) {
      await delay(100);
      const items = getMockItems();
      const item = items.find(i => i.itemId === itemId);
      if (!item) throw new Error("Item not found");
      return item;
    } else {
      const response = await apiClient.get<ItemResponse>(`/items/${itemId}`);
      return response.data;
    }
  },

  createItem: async (req: CreateItemRequest): Promise<AddItemResponse> => {
    if (getMockMode()) {
      await delay(300);
      const items = getMockItems();
      const activeUserMail = localStorage.getItem("waypoint_auth_user") || "supply@anandtex.in";
      const users = getMockUsers();
      const currentUser = users.find(u => u.email.toLowerCase() === activeUserMail.toLowerCase());

      const newItem: ItemResponse = {
        itemId: `i-${Date.now()}`,
        name: req.name,
        category: req.category,
        supplierEmail: activeUserMail,
        supplierName: currentUser?.name || "Anand Textiles Supplier",
        supplierRole: (currentUser?.role || "SUPPLIER") as Role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      saveMockItems([...items, newItem]);
      return {
        name: newItem.name,
        message: "Item created successfully"
      };
    } else {
      const response = await apiClient.post<AddItemResponse>("/items", req);
      return response.data;
    }
  },

  updateItem: async (itemId: string, req: UpdateItemRequest): Promise<ItemUpdateResponse> => {
    if (getMockMode()) {
      await delay(300);
      const items = getMockItems();
      const index = items.findIndex(i => i.itemId === itemId);
      if (index === -1) throw new Error("Item not found");
      
      const users = getMockUsers();
      const supplierUser = users.find(u => u.email.toLowerCase() === req.supplierEmail.toLowerCase());

      items[index] = {
        ...items[index],
        name: req.name,
        category: req.category,
        supplierEmail: req.supplierEmail,
        supplierName: supplierUser?.name || items[index].supplierName,
        updatedAt: new Date().toISOString()
      };

      saveMockItems(items);
      return {
        message: "Item updated successfully",
        item: items[index]
      };
    } else {
      const response = await apiClient.put<ItemUpdateResponse>(`/items/${itemId}`, req);
      return response.data;
    }
  },

  deleteItem: async (itemId: string): Promise<{ message: string }> => {
    if (getMockMode()) {
      await delay(200);
      const items = getMockItems();
      const filtered = items.filter(i => i.itemId !== itemId);
      saveMockItems(filtered);
      return { message: "Item deleted successfully" };
    } else {
      const response = await apiClient.delete<{ message: string }>(`/items`, {
        params: { itemId }
      });
      return response.data;
    }
  },

  getItemsByCategory: async (category: string): Promise<ItemResponse[]> => {
    if (getMockMode()) {
      await delay(200);
      const items = getMockItems();
      return items.filter(i => i.category.toLowerCase() === category.toLowerCase());
    } else {
      const response = await apiClient.get<ItemResponse[]>("/items/item", {
        params: { category }
      });
      return response.data;
    }
  },

  // --- SHIPMENTS ---
  getShipments: async (): Promise<ShipmentResponse[]> => {
    if (getMockMode()) {
      await delay(250);
      return getMockShipments();
    } else {
      const response = await apiClient.get<ShipmentResponse[]>("/shipments");
      return response.data;
    }
  },

  createShipment: async (req: CreateShipmentRequest): Promise<ShipmentResponse> => {
    if (getMockMode()) {
      await delay(300);
      const shipments = getMockShipments();
      const items = getMockItems();
      const item = items.find(i => i.itemId === req.itemId);
      if (!item) throw new Error("Item not found");

      const newShipment: ShipmentResponse = {
        shipmentId: `WP-${Math.floor(1000 + Math.random() * 9000)}`,
        item,
        fromLocation: req.fromLocation,
        toLocation: req.toLocation,
        shipmentStartDate: new Date().toISOString(),
        shipmentExpectedDate: new Date(req.endDate).toISOString(),
        currentStatus: "CREATED",
        transporterEmail: null,
        transporterName: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      saveMockShipments([...shipments, newShipment]);

      // Log initial checkpoint
      const checkpoints = getMockCheckpoints();
      const newCheckpoint: CheckpointLogResponse = {
        checkpointId: `c-${Date.now()}`,
        location: req.fromLocation,
        itemStatus: "IN_TRANSIT",
        shipmentId: newShipment.shipmentId,
        timestamp: new Date().toISOString()
      };
      saveMockCheckpoints([...checkpoints, newCheckpoint]);

      return newShipment;
    } else {
      const response = await apiClient.post<ShipmentResponse>("/shipments", req);
      return response.data;
    }
  },

  assignTransporter: async (shipmentId: string, req: AssignTransporterRequest): Promise<{ message: string }> => {
    if (getMockMode()) {
      await delay(300);
      const shipments = getMockShipments();
      const index = shipments.findIndex(s => s.shipmentId === shipmentId);
      if (index === -1) throw new Error("Shipment not found");

      const users = getMockUsers();
      const transporter = users.find(u => u.userId === req.transporterId || u.email === req.transporterId);
      
      if (!transporter) throw new Error("Transporter not found");

      shipments[index].transporterEmail = transporter.email;
      shipments[index].transporterName = transporter.name;
      shipments[index].updatedAt = new Date().toISOString();
      saveMockShipments(shipments);

      // Try to resolve any transporter alert on this shipment
      let alerts = getMockAlerts();
      alerts = alerts.map(alt => {
        if (alt.shipmentId === shipmentId && alt.message.includes("No transporter assigned")) {
          return { ...alt, resolved: true };
        }
        return alt;
      });
      saveMockAlerts(alerts);

      return { message: "Transporter assigned successfully" };
    } else {
      const response = await apiClient.post<{ message: string }>(`/shipments/${shipmentId}/assign`, req);
      return response.data;
    }
  },

  updateShipmentStatus: async (shipmentId: string, req: UpdateShipmentStatusRequest): Promise<ShipmentStatusChangeResponse> => {
    if (getMockMode()) {
      await delay(300);
      const shipments = getMockShipments();
      const index = shipments.findIndex(s => s.shipmentId === shipmentId);
      if (index === -1) throw new Error("Shipment not found");

      shipments[index].currentStatus = req.status;
      shipments[index].updatedAt = new Date().toISOString();
      saveMockShipments(shipments);

      // Create checkpoint for this status change if it doesn't already exist
      const checkpoints = getMockCheckpoints();
      const statusMap: Record<ShipmentStatus, ItemStatus> = {
        CREATED: "IN_TRANSIT",
        IN_TRANSIT: "IN_TRANSIT",
        DELAYED: "MISSING",
        DELIVERED: "DELIVERED"
      };

      const newCheckpoint: CheckpointLogResponse = {
        checkpointId: `c-${Date.now()}`,
        location: req.status === "DELIVERED" ? shipments[index].toLocation : "Route Checkpoint",
        itemStatus: statusMap[req.status],
        shipmentId,
        timestamp: new Date().toISOString()
      };
      saveMockCheckpoints([...checkpoints, newCheckpoint]);

      // If status is DELAYED, raise an alert
      if (req.status === "DELAYED") {
        const alerts = getMockAlerts();
        const newAlert: AlertResponse = {
          alertId: `a-${Date.now()}`,
          type: "DELAYED",
          message: `Shipment ${shipmentId} updated to DELAYED state by transporter.`,
          resolved: false,
          checkpointId: newCheckpoint.checkpointId,
          shipmentId,
          createdAt: new Date().toISOString()
        };
        saveMockAlerts([...alerts, newAlert]);
      }

      return {
        message: "Shipment status updated successfully",
        shipmentId,
        currentStatus: req.status
      };
    } else {
      const response = await apiClient.put<ShipmentStatusChangeResponse>(`/shipments/${shipmentId}/status`, req);
      return response.data;
    }
  },

  // --- CHECKPOINTS ---
  createCheckpoint: async (req: CreateCheckpointLogRequest): Promise<CreateCheckpointLogResponse> => {
    if (getMockMode()) {
      await delay(300);
      const checkpoints = getMockCheckpoints();
      const shipments = getMockShipments();

      const newCheckpoint: CheckpointLogResponse = {
        checkpointId: `c-${Date.now()}`,
        location: req.location,
        itemStatus: req.itemStatus,
        shipmentId: req.shipmentId,
        timestamp: new Date().toISOString()
      };
      saveMockCheckpoints([...checkpoints, newCheckpoint]);

      // Update shipment updatedAt time
      const sIndex = shipments.findIndex(s => s.shipmentId === req.shipmentId);
      if (sIndex !== -1) {
        shipments[sIndex].updatedAt = new Date().toISOString();
        if (req.itemStatus === "DELIVERED" || req.itemStatus === "RECEIVED") {
          shipments[sIndex].currentStatus = "DELIVERED";
        } else if (req.itemStatus === "DAMAGED" || req.itemStatus === "MISSING") {
          shipments[sIndex].currentStatus = "DELAYED";
        }
        saveMockShipments(shipments);
      }

      // If checkpoint status is DAMAGED or MISSING, raise an alert
      if (req.itemStatus === "DAMAGED" || req.itemStatus === "MISSING") {
        const alerts = getMockAlerts();
        const newAlert: AlertResponse = {
          alertId: `a-${Date.now()}`,
          type: req.itemStatus === "DAMAGED" ? "DAMAGED" : "DELAYED",
          message: `Critical alert: Shipment ${req.shipmentId} reported ${req.itemStatus} at ${req.location}.`,
          resolved: false,
          checkpointId: newCheckpoint.checkpointId,
          shipmentId: req.shipmentId,
          createdAt: new Date().toISOString()
        };
        saveMockAlerts([...alerts, newAlert]);
      }

      return {
        message: "Checkpoint log recorded successfully",
        shipmentId: req.shipmentId,
        location: req.location,
        itemStatus: req.itemStatus,
        date: newCheckpoint.timestamp
      };
    } else {
      const response = await apiClient.post<CreateCheckpointLogResponse>("/checkpoints", req);
      return response.data;
    }
  },

  getShipmentCheckpoints: async (shipmentId: string): Promise<CheckpointLogResponse[]> => {
    if (getMockMode()) {
      await delay(150);
      const checkpoints = getMockCheckpoints();
      return checkpoints
        .filter(c => c.shipmentId === shipmentId)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    } else {
      const response = await apiClient.get<CheckpointLogResponse[]>(`/checkpoints/shipment/${shipmentId}`);
      return response.data;
    }
  },

  // --- ALERTS ---
  getAlerts: async (alertType?: string): Promise<AlertResponse[]> => {
    if (getMockMode()) {
      await delay(200);
      const alerts = getMockAlerts();
      if (alertType) {
        return alerts.filter(a => a.type === alertType);
      }
      return alerts;
    } else {
      const response = await apiClient.get<AlertResponse[]>("/alerts", {
        params: alertType ? { alertType } : undefined
      });
      return response.data;
    }
  },

  getShipmentAlerts: async (shipmentId: string): Promise<AlertResponse[]> => {
    if (getMockMode()) {
      await delay(150);
      const alerts = getMockAlerts();
      return alerts.filter(a => a.shipmentId === shipmentId);
    } else {
      const response = await apiClient.get<AlertResponse[]>(`/alerts/${shipmentId}`);
      return response.data;
    }
  },

  resolveAlert: async (alertId: string): Promise<{ message: string }> => {
    if (getMockMode()) {
      await delay(200);
      const alerts = getMockAlerts();
      const index = alerts.findIndex(a => a.alertId === alertId);
      if (index !== -1) {
        alerts[index].resolved = true;
        saveMockAlerts(alerts);
      }
      return { message: "Alert marked as resolved" };
    } else {
      // In case backend doesn't have resolve, assume success or fallback
      const response = await apiClient.put<{ message: string }>(`/alerts/${alertId}/resolve`);
      return response.data;
    }
  }
};
