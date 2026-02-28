import { useState } from 'react';
import { Search, Sparkles, MapPin, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { VIBE_INFO, AREA_INFO, type VibeCategory, type Area } from '@/lib/types';

interface VibeSearchProps {
  onSearch: (query: string, filters: { vibe?: VibeCategory; area?: Area }) => void;
  isLoading?: boolean;
}

const QUICK_PROMPTS = [
  { text: 'Quiet cafe to study', vibe: 'work_study' as VibeCategory },
  { text: 'Romantic dinner spot', vibe: 'social_dating' as VibeCategory },
  { text: 'Best breakfast in Baner', vibe: 'food_experience' as VibeCategory },
  { text: 'Group hangout place', vibe: 'social_dating' as VibeCategory },
];

export function VibeSearch({ onSearch, isLoading }: VibeSearchProps) {
  const [query, setQuery] = useState('');
  const [selectedVibe, setSelectedVibe] = useState<VibeCategory | undefined>();
  const [selectedArea, setSelectedArea] = useState<Area | undefined>();

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query, { vibe: selectedVibe, area: selectedArea });
    }
  };

  const handleQuickPrompt = (prompt: typeof QUICK_PROMPTS[0]) => {
    setQuery(prompt.text);
    setSelectedVibe(prompt.vibe);
    onSearch(prompt.text, { vibe: prompt.vibe, area: selectedArea });
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 relative z-20">
      {/* Main Search Bar */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 blur-xl rounded-2xl" />
        <div className="relative bg-card rounded-2xl p-2 shadow-medium border border-border/50">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Describe your vibe... e.g., 'Quiet place with great coffee for working'"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-12 pr-4 py-6 text-lg border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            <Button
              size="lg"
              className="gradient-primary px-6 gap-2"
              onClick={handleSearch}
              disabled={!query.trim() || isLoading}
            >
              <Sparkles className="w-5 h-5" />
              {isLoading ? 'Finding...' : 'Find Places'}
            </Button>
          </div>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-3 justify-center">
        {/* Vibe Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <Volume2 className="w-4 h-4 text-muted-foreground" />
          {(Object.entries(VIBE_INFO) as [VibeCategory, typeof VIBE_INFO[VibeCategory]][]).map(([key, info]) => (
            <Badge
              key={key}
              variant={selectedVibe === key ? 'default' : 'outline'}
              className={`cursor-pointer transition-all hover:scale-105 ${
                selectedVibe === key ? 'bg-primary text-primary-foreground' : ''
              }`}
              onClick={() => setSelectedVibe(selectedVibe === key ? undefined : key)}
            >
              {info.emoji} {info.label}
            </Badge>
          ))}
        </div>

        {/* Area Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          {(Object.entries(AREA_INFO) as [Area, typeof AREA_INFO[Area]][]).map(([key, info]) => (
            <Badge
              key={key}
              variant={selectedArea === key ? 'default' : 'outline'}
              className={`cursor-pointer transition-all hover:scale-105 whitespace-nowrap ${
                selectedArea === key ? 'bg-secondary text-secondary-foreground' : ''
              }`}
              onClick={() => setSelectedArea(selectedArea === key ? undefined : key)}
            >
              {info.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="flex flex-wrap gap-2 justify-center">
        <span className="text-sm text-muted-foreground">Try:</span>
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleQuickPrompt(prompt)}
            className="text-sm text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
          >
            {prompt.text}
          </button>
        ))}
      </div>
    </div>
  );
}
