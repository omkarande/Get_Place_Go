import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MapPin, Sparkles, AlertCircle } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { VibeSearch } from '@/components/search/VibeSearch';
import { PlaceCard } from '@/components/places/PlaceCard';
import { PlaceCardSkeleton } from '@/components/places/PlaceCardSkeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { VibeCategory, Area, Place } from '@/lib/types';

interface SearchResult {
  place: Place;
  similarity: number;
  explanation: string;
}

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const query = searchParams.get('q') || '';
  const vibe = searchParams.get('vibe') as VibeCategory | undefined;
  const area = searchParams.get('area') as Area | undefined;

  // Load user's favorites if logged in
  useEffect(() => {
    if (user) {
      supabase
        .from('favorites')
        .select('place_id')
        .eq('user_id', user.id)
        .then(({ data }) => {
          if (data) {
            setFavorites(new Set(data.map(f => f.place_id)));
          }
        });
    }
  }, [user]);

  const performSearch = useCallback(async (searchQuery: string, filters: { vibe?: VibeCategory; area?: Area }) => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fnError } = await supabase.functions.invoke('vibe-search', {
        body: {
          query: searchQuery,
          ...(filters.vibe && { vibe: filters.vibe }),
          ...(filters.area && { area: filters.area }),
          limit: 12,
        },
      });

      if (fnError) {
        throw new Error(fnError.message || 'Search failed');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setResults(data.results || []);
      setSummary(data.summary || '');
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setResults([]);
      setSummary('');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Search on initial load if query params exist
  useEffect(() => {
    if (query) {
      performSearch(query, { vibe, area });
    }
  }, []); // Only on mount

  const handleSearch = (newQuery: string, filters: { vibe?: VibeCategory; area?: Area }) => {
    const params = new URLSearchParams({ q: newQuery });
    if (filters.vibe) params.set('vibe', filters.vibe);
    if (filters.area) params.set('area', filters.area);
    setSearchParams(params);
    performSearch(newQuery, filters);
  };

  const handleFavorite = async (placeId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save favorites",
        variant: "default",
      });
      navigate('/auth');
      return;
    }

    const isFavorite = favorites.has(placeId);

    if (isFavorite) {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('place_id', placeId);

      if (!error) {
        setFavorites(prev => {
          const next = new Set(prev);
          next.delete(placeId);
          return next;
        });
        toast({ title: "Removed from favorites" });
      }
    } else {
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: user.id, place_id: placeId });

      if (!error) {
        setFavorites(prev => new Set(prev).add(placeId));
        toast({ title: "Added to favorites" });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Search */}
          <div className="mb-12">
            <VibeSearch onSearch={handleSearch} isLoading={isLoading} />
          </div>

          {/* Error State */}
          {error && (
            <Alert variant="destructive" className="mb-8 max-w-2xl mx-auto">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Loading State - Skeleton Cards */}
          {isLoading && (
            <div className="space-y-8">
              <div className="max-w-3xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent mb-4">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  <span className="text-sm font-medium">Finding your perfect vibe...</span>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <PlaceCardSkeleton key={idx} />
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          {!isLoading && results.length > 0 && (
            <div className="space-y-8">
              {/* AI Summary */}
              {summary && (
                <div className="max-w-3xl mx-auto text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent mb-4">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-medium">AI Recommendation</span>
                  </div>
                  <p className="text-lg text-foreground">{summary}</p>
                </div>
              )}

              {/* Results Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((result, idx) => (
                  <div key={result.place.id} style={{ animationDelay: `${idx * 0.1}s` }}>
                    <PlaceCard
                      place={result.place}
                      similarity={result.similarity}
                      explanation={result.explanation}
                      onFavorite={handleFavorite}
                      isFavorite={favorites.has(result.place.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && results.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
              <MapPin className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">Search for places to see AI-powered recommendations</p>
              <p className="text-sm mt-2">Try "Quiet cafe for working" or "Romantic dinner in Koregaon Park"</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
