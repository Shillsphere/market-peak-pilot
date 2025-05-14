import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';
import { Competitor } from '@/lib/types.js';

interface CompetitorCardsProps {
  data?: Competitor[];
  analysisSummary?: string | null;
}

const CompetitorCards: React.FC<CompetitorCardsProps> = ({ data, analysisSummary }) => {
  if (!data || data.length === 0) {
    return <p className="text-center my-8 text-muted-foreground">No competitor data found or still loading.</p>;
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
          <Card key={competitor.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-xl">{competitor.name}</CardTitle>
              {competitor.website && (
                 <a
                    href={competitor.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline inline-flex items-center"
                  >
                    {new URL(competitor.website).hostname} <ExternalLink size={14} className="ml-1" />
                  </a>
              )}
            </CardHeader>
            <CardContent className="flex-grow space-y-3">
              {competitor.description && (
                <div>
                  <h4 className="font-semibold text-sm mb-1">Description:</h4>
                  <CardDescription className="text-sm leading-relaxed">
                    {competitor.description}
                  </CardDescription>
                </div>
              )}
              
              {competitor.key_offerings && competitor.key_offerings.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-1">Key Offerings:</h4>
                  <div className="flex flex-wrap gap-1">
                    {competitor.key_offerings.map((offering, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">{offering}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {competitor.strengths && competitor.strengths.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-1">Strengths:</h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {competitor.strengths.map((strength, idx) => (
                      <li key={idx}>{strength}</li>
                    ))}
                  </ul>
                </div>
              )}

              {competitor.weaknesses && competitor.weaknesses.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-1">Weaknesses:</h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {competitor.weaknesses.map((weakness, idx) => (
                      <li key={idx}>{weakness}</li>
                    ))}
                  </ul>
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