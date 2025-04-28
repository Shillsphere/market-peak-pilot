import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle2, FileText, Link as LinkIcon } from 'lucide-react';
import { useResearchJob, ResearchJob } from '@/hooks/useResearchJob'; // Import hook and type
import { marked } from 'marked'; // Import marked
import DOMPurify from 'dompurify'; // Import DOMPurify

interface SummaryViewerProps {
  jobId?: string | null;
}

export const SummaryViewer: React.FC<SummaryViewerProps> = ({ jobId }) => {
  const { data: job, isLoading, error } = useResearchJob(jobId);

  if (isLoading || (!job && !error)) {
    return (
      <Card className="mt-4 min-h-[200px] flex items-center justify-center">
        <CardContent className="text-center text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
          <p>Loading research results...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Loading Research Results</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  if (!job) {
    return (
       <Card className="mt-4 min-h-[200px] flex items-center justify-center">
        <CardContent className="text-center text-muted-foreground">
          <p>No research job selected.</p>
        </CardContent>
      </Card>
    );
  }

  // Display based on job status
  if (job.status === 'queued' || job.status === 'running') {
    return (
      <Card className="mt-4 min-h-[200px] flex items-center justify-center">
        <CardContent className="text-center text-muted-foreground">
            {job.status === 'queued' && <p>Research job is queued...</p>}
            {job.status === 'running' && (
                <>
                 <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                 <p>Research in progress...</p>
                </>
            )}
        </CardContent>
      </Card>
    );
  }

   if (job.status === 'error') {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Research Job Failed</AlertTitle>
        <AlertDescription>{job.error || 'An unknown error occurred.'}</AlertDescription>
      </Alert>
    );
  }

  // --- Job Done --- 
  const documents = job.docs || [];
  // Use marked synchronously and sanitize
  let sanitizedHtmlSummary: string | null = null;
  if (job.summary_md) {
      try {
          // marked.parse() is sync by default, cast result to string
          const rawHtml = marked.parse(job.summary_md) as string;
          sanitizedHtmlSummary = DOMPurify.sanitize(rawHtml);
      } catch (e) {
          console.error("Error parsing or sanitizing summary markdown:", e);
          sanitizedHtmlSummary = "<p>Error displaying summary.</p>"; // Show error in UI
      }
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center">
            <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
            Research Completed
        </CardTitle>
        <CardDescription>Prompt: "{job.prompt}"</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Render Synthesized Summary */} 
        {sanitizedHtmlSummary ? (
          <>
            <h4 className="font-semibold mb-2 text-base">Synthesized Summary:</h4>
            <div 
              className="prose prose-sm dark:prose-invert max-w-none bg-muted/30 p-3 rounded-md border mb-4"
              dangerouslySetInnerHTML={{ __html: sanitizedHtmlSummary }}
            />
          </>
        ) : (
           <p className="text-sm text-muted-foreground mb-4">No summary was generated for this job.</p>
        )}
        
        {/* Keep Collected Documents section */} 
        <h4 className="font-semibold mb-2 text-base">Collected Documents ({documents.length} chunks):</h4>
        {documents.length > 0 ? (
            <ul className="space-y-3 max-h-[300px] overflow-y-auto pr-2 border rounded-md p-2">
                {documents.map((doc) => (
                <li key={doc.id} className="p-2 border-b last:border-b-0">
                    {doc.title && <p className="font-medium text-xs mb-1 truncate">{doc.title}</p>}
                    {doc.url && (
                     <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center mb-1 truncate">
                       <LinkIcon className="h-3 w-3 mr-1 flex-shrink-0" /> <span className="truncate">{doc.url}</span>
                    </a>
                    )}
                    {/* Optionally hide content or show snippet */} 
                    {/* {doc.content && <p className="text-xs text-muted-foreground truncate">{doc.content}</p>} */}
                </li>
                ))}
            </ul>
        ) : (
             <p className="text-sm text-muted-foreground">No documents were processed for this job.</p>
        )}
      </CardContent>
    </Card>
  );
}; 