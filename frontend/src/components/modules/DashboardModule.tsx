import React from 'react';
import {
  Product,
  SalesOrder,
  Supplier,
  Customer,
  Employee,
  StockMovement,
  Warehouse,
  ERPConfig,
  AIInsightsData,
  UserRole,
  LeaveRequest,
  AttendanceRecord
} from '../../types';
import { SuperAdminDashboard } from './dashboards/SuperAdminDashboard';
import { AdminDashboard } from './dashboards/AdminDashboard';
import { EmployeeDashboard } from './dashboards/EmployeeDashboard';

interface DashboardModuleProps {
  userRole: UserRole;
  currentUserName: string;
  products: Product[];
  salesOrders: SalesOrder[];
  suppliers: Supplier[];
  customers: Customer[];
  employees: Employee[];
  movements: StockMovement[];
  warehouses: Warehouse[];
  aiInsights: AIInsightsData;
  config: ERPConfig;
  onNavigateModule: (module: string) => void;
  onQuickRestock: (product: Product) => void;
  leaveRequests: LeaveRequest[];
  attendance: AttendanceRecord[];
  onSubmitLeaveRequest: (payload: { leaveType: LeaveRequest['leaveType']; startDate: string; endDate: string; reason: string; }) => void;
  onLeaveDecision: (requestId: string, decision: 'Approved' | 'Rejected', note?: string) => void;
  onClockIn: () => void;
  onClockOut: () => void;
}

// Renders a dashboard tailored to the signed-in user's role/rights:
// - employee: task-focused operational view (attendance, stock updates, leave requests, notifications)
// - admin: full operational + financial dashboard, plus employee leave approvals
// - super_admin: admin dashboard plus org-wide oversight (headcount, roles, system health)
export const DashboardModule: React.FC<DashboardModuleProps> = ({
  userRole,
  currentUserName,
  products,
  salesOrders,
  suppliers,
  customers,
  employees,
  movements,
  warehouses,
  aiInsights,
  config,
  onNavigateModule,
  onQuickRestock,
  leaveRequests,
  attendance,
  onSubmitLeaveRequest,
  onLeaveDecision,
  onClockIn,
  onClockOut
}) => {
  if (userRole === 'super_admin') {
    return (
      <SuperAdminDashboard
        products={products}
        salesOrders={salesOrders}
        suppliers={suppliers}
        customers={customers}
        employees={employees}
        movements={movements}
        warehouses={warehouses}
        aiInsights={aiInsights}
        config={config}
        onNavigateModule={onNavigateModule}
        onQuickRestock={onQuickRestock}
        leaveRequests={leaveRequests}
        onLeaveDecision={onLeaveDecision}
        reviewerName={currentUserName}
      />
    );
  }

  if (userRole === 'admin') {
    return (
      <AdminDashboard
        products={products}
        salesOrders={salesOrders}
        suppliers={suppliers}
        customers={customers}
        employees={employees}
        movements={movements}
        aiInsights={aiInsights}
        config={config}
        onNavigateModule={onNavigateModule}
        onQuickRestock={onQuickRestock}
        leaveRequests={leaveRequests}
        onLeaveDecision={onLeaveDecision}
        reviewerName={currentUserName}
      />
    );
  }

  return (
    <EmployeeDashboard
      products={products}
      movements={movements}
      config={config}
      currentUserName={currentUserName}
      onNavigateModule={onNavigateModule}
      onQuickRestock={onQuickRestock}
      leaveRequests={leaveRequests}
      attendance={attendance}
      onSubmitLeaveRequest={onSubmitLeaveRequest}
      onClockIn={onClockIn}
      onClockOut={onClockOut}
    />
  );
};
