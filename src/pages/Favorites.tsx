import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Trash2, MapPin, Loader2 } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { PlaceCard } from '@/components/places/PlaceCard';
import { PlaceCardSkeleton } from '@/components/places/PlaceCardSkeleton';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Place } from '@/lib/types';

interface FavoriteWithPlace {
  id: string;
  place_id: string;
  created_at: string;
  notes: string | null;
  place: Place;
}

export default function Favorites() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<FavoriteWithPlace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to view your favorites",
      });
      navigate('/auth');
    }
  }, [user, authLoading, navigate, toast]);

  // Fetch favorites with place details
  useEffect(() => {
    if (!user) return;

    const fetchFavorites = async () => {
      setIsLoading(true);
      
      const { data: favoritesData, error: favError } = await supabase
        .from('favorites')
        .select('id, place_id, created_at, notes')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (favError) {
        console.error('Error fetching favorites:', favError);
        setIsLoading(false);
        return;
      }

      if (!favoritesData || favoritesData.length === 0) {
        setFavorites([]);
        setIsLoading(false);
        return;
      }

      // Fetch place details for each favorite
      const placeIds = favoritesData.map(f => f.place_id);
      const { data: placesData, error: placesError } = await supabase
        .from('places')
        .select('*')
        .in('id', placeIds);

      if (placesError) {
        console.error('Error fetching places:', placesError);
        setIsLoading(false);
        return;
      }

      // Merge favorites with place data
      const merged = favoritesData.map(fav => {
        const place = placesData?.find(p => p.id === fav.place_id);
        return place ? { ...fav, place: place as Place } : null;
      }).filter(Boolean) as FavoriteWithPlace[];

      setFavorites(merged);
      setIsLoading(false);
    };

    fetchFavorites();
  }, [user]);

  const handleRemoveFavorite = async (favoriteId: string, placeId: string) => {
    setRemovingId(favoriteId);
    
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('id', favoriteId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to remove from favorites",
        variant: "destructive",
      });
    } else {
      setFavorites(prev => prev.filter(f => f.id !== favoriteId));
      toast({ title: "Removed from favorites" });
    }
    
    setRemovingId(null);
  };

  const handleClearAll = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to clear favorites",
        variant: "destructive",
      });
    } else {
      setFavorites([]);
      toast({ title: "All favorites cleared" });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold flex items-center gap-3">
                <Heart className="w-8 h-8 text-destructive fill-destructive" />
                My Favorites
              </h1>
              <p className="text-muted-foreground mt-1">
                {favorites.length} saved place{favorites.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            {favorites.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Trash2 className="w-4 h-4" />
                    Clear All
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear all favorites?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove all {favorites.length} places from your favorites. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Clear All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, idx) => (
                <PlaceCardSkeleton key={idx} />
              ))}
            </div>
          )}

          {/* Favorites Grid */}
          {!isLoading && favorites.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((fav, idx) => (
                <div key={fav.id} className="relative" style={{ animationDelay: `${idx * 0.05}s` }}>
                  <PlaceCard
                    place={fav.place}
                    onFavorite={() => handleRemoveFavorite(fav.id, fav.place_id)}
                    isFavorite={true}
                  />
                  {removingId === fav.id && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && favorites.length === 0 && (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                <Heart className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No favorites yet</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Start exploring and save places you love by clicking the heart icon
              </p>
              <Button onClick={() => navigate('/explore')} className="gap-2">
                <MapPin className="w-4 h-4" />
                Explore Places
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
