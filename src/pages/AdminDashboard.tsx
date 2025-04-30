
import { AdminApplicationsTable } from "@/components/AdminApplicationsTable";

const AdminDashboard = () => {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-4">User Applications</h1>
      <p className="text-gray-600 mb-8">
        Review and approve user applications. Approved users will be able to access the dashboard 
        and use all features of the application. Denied applications will remain in the system for reference.
      </p>
      <AdminApplicationsTable />
    </div>
  );
};

export default AdminDashboard;
