import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/DashboardLayout";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DeploymentLayout from "./pages/deployment/DeploymentLayout";
import DeploymentOverview from "./pages/deployment/DeploymentOverview";
import DeploymentsTab from "./pages/deployment/DeploymentsTab";
import EnvironmentsTab from "./pages/deployment/EnvironmentsTab";
import ReleasesTab from "./pages/deployment/ReleasesTab";
import RollbacksTab from "./pages/deployment/RollbacksTab";
import PipelinesLayout from "./pages/pipelines/PipelinesLayout";
import PipelinesOverview from "./pages/pipelines/PipelinesOverview";
import PipelineRuns from "./pages/pipelines/PipelineRuns";
import PipelineWorkflowPage from "./pages/pipelines/PipelineWorkflowPage";
import BuildHistory from "./pages/pipelines/BuildHistory";
import InfrastructureLayout from "./pages/infrastructure/InfrastructureLayout";
import InfraOverview from "./pages/infrastructure/InfraOverview";
import ResourcesTab from "./pages/infrastructure/ResourcesTab";
import TerraformTab from "./pages/infrastructure/TerraformTab";
import KubernetesTab from "./pages/infrastructure/KubernetesTab";
import InfraEnvironmentsTab from "./pages/infrastructure/InfraEnvironmentsTab";
import MonitoringLayout from "./pages/monitoring/MonitoringLayout";
import MonitoringOverview from "./pages/monitoring/MonitoringOverview";
import MetricsTab from "./pages/monitoring/MetricsTab";
import LogsTab from "./pages/monitoring/LogsTab";
import AlertsTab from "./pages/monitoring/AlertsTab";
import HealthTab from "./pages/monitoring/HealthTab";
import CostLayout from "./pages/cost/CostLayout";
import CostSummary from "./pages/cost/CostSummary";
import CostOverview from "./pages/cost/CostOverview";
import CostEstimator from "./pages/cost/CostEstimator";
import AddRepository from "./pages/AddRepository";
import BudgetTab from "./pages/cost/BudgetTab";
import OptimizationTab from "./pages/cost/OptimizationTab";
import "./styles/shared.css";

function AppLayout() {
  return (
    <ProtectedRoute>
      <DashboardLayout />
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/deployment" element={<DeploymentLayout />}>
          <Route index element={<DeploymentOverview />} />
          <Route path="deployments" element={<DeploymentsTab />} />
          <Route path="environments" element={<EnvironmentsTab />} />
          <Route path="releases" element={<ReleasesTab />} />
          <Route path="rollbacks" element={<RollbacksTab />} />
        </Route>

        <Route path="/pipelines" element={<PipelinesLayout />}>
          <Route index element={<PipelinesOverview />} />
          <Route path="runs" element={<PipelineRuns />} />
          <Route path="workflow" element={<PipelineWorkflowPage />} />
          <Route path="builds" element={<BuildHistory />} />
        </Route>

        <Route path="/infrastructure" element={<InfrastructureLayout />}>
          <Route index element={<InfraOverview />} />
          <Route path="resources" element={<ResourcesTab />} />
          <Route path="terraform" element={<TerraformTab />} />
          <Route path="kubernetes" element={<KubernetesTab />} />
          <Route path="environments" element={<InfraEnvironmentsTab />} />
        </Route>

        <Route path="/monitoring" element={<MonitoringLayout />}>
          <Route index element={<MonitoringOverview />} />
          <Route path="metrics" element={<MetricsTab />} />
          <Route path="logs" element={<LogsTab />} />
          <Route path="alerts" element={<AlertsTab />} />
          <Route path="health" element={<HealthTab />} />
        </Route>

        <Route path="/cost" element={<CostLayout />}>
          <Route index element={<CostSummary />} />
          <Route path="overview" element={<CostOverview />} />
          <Route path="estimator" element={<CostEstimator />} />
          <Route path="budget" element={<BudgetTab />} />
          <Route path="optimization" element={<OptimizationTab />} />
        </Route>
        <Route path="/repositories/add" element={<AddRepository />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
