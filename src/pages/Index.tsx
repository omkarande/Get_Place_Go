import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { HeroSection } from '@/components/home/HeroSection';
import { VibeSearch } from '@/components/search/VibeSearch';
import { VibeCategories } from '@/components/home/VibeCategories';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { VibeCategory, Area } from '@/lib/types';

export default function Index() {
  const navigate = useNavigate();
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (query: string, filters: { vibe?: VibeCategory; area?: Area }) => {
    setIsSearching(true);
    const params = new URLSearchParams({ q: query });
    if (filters.vibe) params.set('vibe', filters.vibe);
    if (filters.area) params.set('area', filters.area);
    navigate(`/explore?${params.toString()}`);
  };

  const handleCategorySelect = (category: VibeCategory) => {
    navigate(`/explore?vibe=${category}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        {/* Hero section */}
        <HeroSection />
        
        {/* Search section - clearly separated from hero */}
        <section className="py-8 relative z-30">
          <div className="container mx-auto px-4">
            <VibeSearch onSearch={handleSearch} isLoading={isSearching} />
          </div>
        </section>
        
        <VibeCategories onSelectCategory={handleCategorySelect} />
        
        {/* Footer with scroll animation */}
        <ScrollReveal>
          <footer className="py-12 bg-foreground/5 dark:bg-foreground/10 mt-8">
            <div className="container mx-auto px-4 text-center">
              <p className="font-display font-semibold text-foreground">Get Place Go</p>
              <p className="text-sm text-muted-foreground mt-1">AI-Powered Place Discovery for Pune</p>
              <p className="text-xs text-muted-foreground/70 mt-2">Baner & Koregaon Park</p>
            </div>
          </footer>
        </ScrollReveal>
      </main>
    </div>
  );
}
