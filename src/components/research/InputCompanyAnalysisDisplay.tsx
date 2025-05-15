import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ExternalLink, ListChecks, FileText, SearchCode } from 'lucide-react'; // Example icons
import type { InputCompanyAnalysis } from '@/types/research'; // Adjust path

interface InputCompanyAnalysisDisplayProps {
  analyses: InputCompanyAnalysis[];
}

const InputCompanyAnalysisDisplay: React.FC<InputCompanyAnalysisDisplayProps> = ({ analyses }) => {
  if (!analyses || analyses.length === 0) {
    return null; // Or a placeholder if preferred
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-3">Analysis of Provided Companies/URLs:</h2>
      {analyses.map((analysis, index) => (
        <Card key={analysis.source_url || index}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <SearchCode className="mr-2 h-5 w-5 text-primary" />
              Analysis for: {analysis.company_name || new URL(analysis.source_url).hostname}
            </CardTitle>
            <CardDescription>
              <a
                href={analysis.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline flex items-center"
              >
                {analysis.source_url} <ExternalLink size={12} className="ml-1" />
              </a>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {analysis.website_summary && (
                <div>
                    <h4 className="font-semibold text-primary/90 flex items-center mb-1">
                        <FileText size={16} className="mr-2" /> Website Summary:
                    </h4>
                    <p className="text-muted-foreground pl-6">{analysis.website_summary}</p>
                </div>
            )}
            <div>
              <h4 className="font-semibold text-primary/90 flex items-center mb-1">
                <FileText size={16} className="mr-2" /> Insights on Your Research Focus:
              </h4>
              <p className="text-muted-foreground pl-6 whitespace-pre-wrap">{analysis.analysis_against_prompt}</p>
            </div>
            {analysis.key_findings && analysis.key_findings.length > 0 && (
              <div>
                <h4 className="font-semibold text-primary/90 flex items-center mb-1">
                  <ListChecks size={16} className="mr-2" /> Key Findings:
                </h4>
                <ul className="list-disc list-inside pl-6 space-y-1 text-muted-foreground">
                  {analysis.key_findings.map((finding, findIndex) => (
                    <li key={findIndex}>{finding}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default InputCompanyAnalysisDisplay; 