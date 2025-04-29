
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export const AdminApplicationsTable = () => {
  const { toast } = useToast();

  const { data: applications, refetch, isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const handleApprove = async (applicationId: string) => {
    try {
      // Call the approve_user_application function
      const { data, error } = await supabase.rpc(
        'approve_user_application',
        { application_id: applicationId }
      );

      if (error) throw error;

      toast({
        title: "Success",
        description: "Application approved successfully",
      });

      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeny = async (applicationId: string) => {
    try {
      // Update application status to rejected
      const { error } = await supabase
        .from('user_applications')
        .update({ status: 'rejected' })
        .eq('id', applicationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Application denied",
      });

      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Business Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4">Loading applications...</TableCell>
            </TableRow>
          ) : applications?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4">No applications found</TableCell>
            </TableRow>
          ) : (
            applications?.map((app) => (
              <TableRow key={app.id}>
                <TableCell>{app.business_name}</TableCell>
                <TableCell>{app.email}</TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      app.status === 'approved' ? 'default' :
                      app.status === 'rejected' ? 'destructive' :
                      'outline'
                    }
                  >
                    {app.status}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(app.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    {app.status === 'pending' && (
                      <>
                        <Button
                          onClick={() => handleApprove(app.id)}
                          size="sm"
                          variant="default"
                        >
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleDeny(app.id)}
                          size="sm"
                          variant="destructive"
                        >
                          Deny
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
