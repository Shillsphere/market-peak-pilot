
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SummaryViewerProps {
  markdown: string | null;
  jobId?: string;
}

export const SummaryViewer: React.FC<SummaryViewerProps> = ({ markdown, jobId }) => {
  if (!markdown) {
    return null; // Don't render if no markdown content
  }

  return (
    <Card className="bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">
          Research Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {markdown}
          </ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
};
