
import { AdminApplicationsTable } from "@/components/AdminApplicationsTable";

const AdminDashboard = () => {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">User Applications</h1>
      <AdminApplicationsTable />
    </div>
  );
};

export default AdminDashboard;
