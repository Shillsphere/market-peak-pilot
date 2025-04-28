import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CompetitorInfo {
  name: string;
  price?: string | null;
  usp?: string | null;
}

interface CompetitorTableProps {
  competitors: CompetitorInfo[] | null | undefined;
}

export const CompetitorTable: React.FC<CompetitorTableProps> = ({ competitors }) => {
  if (!competitors || competitors.length === 0) {
    return (
      <div className="p-4 border rounded-md bg-card text-card-foreground">
        <h3 className="font-semibold mb-2">Competitor Analysis</h3>
        <p className="text-sm text-muted-foreground">No competitor data extracted yet or none found.</p>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-md bg-card text-card-foreground">
      <h3 className="font-semibold mb-4">Competitor Analysis</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Pricing</TableHead>
            <TableHead>Key Feature / USP</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {competitors.map((comp, index) => (
            <TableRow key={comp.name + index}>
              <TableCell className="font-medium">{comp.name || 'N/A'}</TableCell>
              <TableCell>{comp.price || '-'}</TableCell>
              <TableCell>{comp.usp || '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}; 