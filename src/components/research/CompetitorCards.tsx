import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';
import type { IdentifiedCompetitor } from '@/types/research';

interface CompetitorCardsProps {
  data?: IdentifiedCompetitor[];
  analysisSummary?: string | null;
}

const CompetitorCards: React.FC<CompetitorCardsProps> = ({ data, analysisSummary }) => {
  if (!data || data.length === 0) {
    return <p className="text-center my-4 text-muted-foreground">No other direct competitors identified from the scraped content.</p>;
  }

  return (
    <>
      {analysisSummary && (
        <Card className="mb-6 bg-secondary/30">
          <CardHeader>
            <CardTitle className="text-lg">Analysis Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{analysisSummary}</p>
          </CardContent>
        </Card>
      )}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 my-8">
        {data.map((competitor) => (
          <Card key={competitor.name + competitor.website} className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-xl">{competitor.name}</CardTitle>
              {competitor.website && (
                 <CardDescription>
                 <a
                    href={competitor.website}
                    target="_blank"
                    rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline flex items-center"
                  >
                        {competitor.website} <ExternalLink size={12} className="ml-1" />
                  </a>
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="flex-grow space-y-2 text-sm">
              {competitor.description && (
                 <div>
                    <h4 className="font-semibold text-primary/80">Description:</h4>
                    <p className="text-muted-foreground">{competitor.description}</p>
                </div>
              )}
              <div>
                <h4 className="font-semibold text-primary/80">Analysis on Research Focus:</h4>
                <p className="text-muted-foreground whitespace-pre-wrap">{competitor.analysis_against_prompt}</p>
              </div>
              {competitor.strengths && competitor.strengths.length > 0 && (
                <div>
                  <h4 className="font-semibold text-green-600">Strengths:</h4>
                  <ul className="list-disc list-inside text-muted-foreground">
                    {competitor.strengths.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}
              {competitor.weaknesses && competitor.weaknesses.length > 0 && (
                <div>
                  <h4 className="font-semibold text-red-600">Weaknesses:</h4>
                  <ul className="list-disc list-inside text-muted-foreground">
                    {competitor.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </div>
              )}
              {competitor.key_offerings && competitor.key_offerings.length > 0 && (
                <div>
                  <h4 className="font-semibold text-primary/80">Key Offerings:</h4>
                  <div className="flex flex-wrap gap-1">
                    {competitor.key_offerings.map((offering, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">{offering}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
};

export default CompetitorCards; 