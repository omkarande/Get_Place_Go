import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Globe, Database, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { scrapegraphApi } from '@/lib/api/scrapegraph';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

type ScrapeResult = {
  success: boolean;
  total_scraped?: number;
  inserted?: number;
  errors?: string[];
  error?: string;
};

type SmartScrapeResult = {
  success: boolean;
  data?: any;
  error?: string;
};

export default function AdminScrape() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Scrape Places state
  const [placeUrl, setPlaceUrl] = useState('');
  const [area, setArea] = useState<string>('baner');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isScrapingPlaces, setIsScrapingPlaces] = useState(false);
  const [placeResult, setPlaceResult] = useState<ScrapeResult | null>(null);

  // Smart Scrape state
  const [smartUrl, setSmartUrl] = useState('');
  const [smartPrompt, setSmartPrompt] = useState('');
  const [isSmartScraping, setIsSmartScraping] = useState(false);
  const [smartResult, setSmartResult] = useState<SmartScrapeResult | null>(null);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleScrapePlaces = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!placeUrl.trim()) return;

    setIsScrapingPlaces(true);
    setPlaceResult(null);

    try {
      const result = await scrapegraphApi.scrapePlaces({
        url: placeUrl,
        area: area as 'baner' | 'koregaon_park',
        prompt: customPrompt || undefined,
      });
      setPlaceResult(result as ScrapeResult);
      if (result.success && result.data?.inserted) {
        toast({ title: `Inserted ${result.data.inserted} places!` });
      }
    } catch (err) {
      setPlaceResult({ success: false, error: 'Request failed' });
    } finally {
      setIsScrapingPlaces(false);
    }
  };

  const handleSmartScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smartUrl.trim() || !smartPrompt.trim()) return;

    setIsSmartScraping(true);
    setSmartResult(null);

    try {
      const result = await scrapegraphApi.smartScrape({
        website_url: smartUrl,
        user_prompt: smartPrompt,
      });
      setSmartResult(result);
    } catch (err) {
      setSmartResult({ success: false, error: 'Request failed' });
    } finally {
      setIsSmartScraping(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin: Scraper</h1>
            <p className="text-muted-foreground mt-1">
              Use ScrapeGraphAI to populate your places database or extract data from any website.
            </p>
          </div>

          {/* Scrape Places Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                Scrape Places into Database
              </CardTitle>
              <CardDescription>
                Provide a URL (e.g. Zomato, Google Maps listing) and we'll extract place data and insert it directly into your database.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleScrapePlaces} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="placeUrl">Website URL</Label>
                  <Input
                    id="placeUrl"
                    type="url"
                    placeholder="https://www.zomato.com/pune/baner-restaurants"
                    value={placeUrl}
                    onChange={(e) => setPlaceUrl(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Area</Label>
                  <Select value={area} onValueChange={(v) => setArea(v as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baner">Baner</SelectItem>
                      <SelectItem value="koregaon_park">Koregaon Park</SelectItem>
                      <SelectItem value="viman_nagar">Viman Nagar</SelectItem>
                      <SelectItem value="hinjewadi">Hinjewadi</SelectItem>
                      <SelectItem value="kothrud">Kothrud</SelectItem>
                      <SelectItem value="aundh">Aundh</SelectItem>
                      <SelectItem value="wakad">Wakad</SelectItem>
                      <SelectItem value="hadapsar">Hadapsar</SelectItem>
                      <SelectItem value="deccan">Deccan</SelectItem>
                      <SelectItem value="camp">Camp</SelectItem>
                      <SelectItem value="kalyani_nagar">Kalyani Nagar</SelectItem>
                      <SelectItem value="magarpatta">Magarpatta</SelectItem>
                      <SelectItem value="pimpri_chinchwad">Pimpri Chinchwad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customPrompt">Custom Extraction Prompt (optional)</Label>
                  <Textarea
                    id="customPrompt"
                    placeholder="Leave empty to use default extraction prompt..."
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button type="submit" disabled={isScrapingPlaces} className="w-full">
                  {isScrapingPlaces ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Scraping & Inserting... (this may take 1-2 min)
                    </>
                  ) : (
                    <>
                      <Globe className="w-4 h-4 mr-2" />
                      Scrape & Insert Places
                    </>
                  )}
                </Button>
              </form>

              {placeResult && (
                <div className="mt-6">
                  {placeResult.success ? (
                    <Alert className="border-primary/20">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription>
                        Scraped <Badge variant="secondary">{placeResult.total_scraped}</Badge> places,
                        inserted <Badge variant="secondary">{placeResult.inserted}</Badge> into database.
                        {placeResult.errors && placeResult.errors.length > 0 && (
                          <div className="mt-2 text-sm text-muted-foreground">
                            <p className="font-medium">Errors:</p>
                            <ul className="list-disc pl-4">
                              {placeResult.errors.map((err, i) => <li key={i}>{err}</li>)}
                            </ul>
                          </div>
                        )}
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{placeResult.error}</AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Smart Scrape Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" />
                Smart Scrape (General)
              </CardTitle>
              <CardDescription>
                Extract any structured data from any website using AI. Results shown as JSON.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSmartScrape} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="smartUrl">Website URL</Label>
                  <Input
                    id="smartUrl"
                    type="url"
                    placeholder="https://example.com"
                    value={smartUrl}
                    onChange={(e) => setSmartUrl(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smartPrompt">What to extract?</Label>
                  <Textarea
                    id="smartPrompt"
                    placeholder="Extract all product names, prices, and descriptions..."
                    value={smartPrompt}
                    onChange={(e) => setSmartPrompt(e.target.value)}
                    required
                    rows={3}
                  />
                </div>

                <Button type="submit" disabled={isSmartScraping} className="w-full" variant="secondary">
                  {isSmartScraping ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Extracting... (this may take 30-60s)
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Smart Scrape
                    </>
                  )}
                </Button>
              </form>

              {smartResult && (
                <div className="mt-6">
                  {smartResult.success ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">Extracted Data:</p>
                      <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-96 text-xs">
                        {JSON.stringify(smartResult.data, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{smartResult.error}</AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
