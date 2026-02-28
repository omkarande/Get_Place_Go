import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, MapPin, Loader2, Sparkles } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Itinerary {
  id: string;
  title: string;
  description: string | null;
  places: string[];
  schedule: Record<string, any>;
  is_public: boolean;
  created_at: string;
}

export default function Itineraries() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth?redirect=/itineraries');
      return;
    }
    if (user) {
      fetchItineraries();
    }
  }, [user, authLoading, navigate]);

  const fetchItineraries = async () => {
    try {
      const { data, error } = await supabase
        .from('itineraries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItineraries((data || []).map(d => ({
        ...d,
        schedule: (d.schedule as Record<string, any>) || {}
      })));
    } catch (err) {
      console.error('Error fetching itineraries:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createItinerary = async () => {
    if (!newTitle.trim()) return;
    setIsCreating(true);

    try {
      const { data, error } = await supabase
        .from('itineraries')
        .insert({
          title: newTitle.trim(),
          description: newDescription.trim() || null,
          user_id: user!.id,
          places: [],
          schedule: {},
        })
        .select()
        .single();

      if (error) throw error;

      toast({ title: 'Itinerary created!', description: 'Start adding places to your trip.' });
      setDialogOpen(false);
      setNewTitle('');
      setNewDescription('');
      navigate(`/itineraries/${data.id}`);
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to create itinerary' });
    } finally {
      setIsCreating(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center pt-32">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
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
              <h1 className="font-display text-3xl font-bold">My Itineraries</h1>
              <p className="text-muted-foreground mt-1">Plan your perfect day in Pune</p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gradient-primary gap-2">
                  <Plus className="w-4 h-4" />
                  New Itinerary
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Itinerary</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Weekend Brunch Crawl"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="A foodie adventure through Koregaon Park..."
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                    />
                  </div>
                  <Button onClick={createItinerary} disabled={!newTitle.trim() || isCreating} className="w-full">
                    {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Create Itinerary
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Itineraries Grid */}
          {itineraries.length === 0 ? (
            <div className="text-center py-20">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
              <h2 className="text-xl font-semibold mb-2">No itineraries yet</h2>
              <p className="text-muted-foreground mb-6">Create your first trip plan to explore Pune!</p>
              <Button onClick={() => setDialogOpen(true)} className="gradient-primary gap-2">
                <Plus className="w-4 h-4" />
                Create Your First Itinerary
              </Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {itineraries.map((itinerary) => (
                <Card
                  key={itinerary.id}
                  className="cursor-pointer hover:shadow-medium transition-all group"
                  onClick={() => navigate(`/itineraries/${itinerary.id}`)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors">
                      <Calendar className="w-5 h-5" />
                      {itinerary.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {itinerary.description && (
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {itinerary.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {itinerary.places?.length || 0} places
                      </span>
                      <span>
                        {new Date(itinerary.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
