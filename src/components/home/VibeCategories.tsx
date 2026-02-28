import { Laptop, Heart, ChefHat, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { VibeCategory } from '@/lib/types';

interface VibeCategoryCardProps {
  category: VibeCategory;
  title: string;
  description: string;
  icon: React.ReactNode;
  iconColor: string;
  cardBg: string;
  accentColor: string;
  examples: string[];
  onClick: (category: VibeCategory) => void;
}

function VibeCategoryCard({ category, title, description, icon, iconColor, cardBg, accentColor, examples, onClick }: VibeCategoryCardProps) {
  return (
    <Card 
      className={`group cursor-pointer hover:shadow-medium transition-all duration-300 overflow-hidden border-0 ${cardBg}`}
      onClick={() => onClick(category)}
    >
      <CardContent className="p-6 space-y-4">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${iconColor} text-white group-hover:scale-110 transition-transform shadow-lg`}>
          {icon}
        </div>
        
        <div>
          <h3 className="font-display text-xl font-semibold">{title}</h3>
          <p className="text-muted-foreground mt-1">{description}</p>
        </div>
        
        <div className="space-y-2">
          {examples.map((example, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className={`w-1.5 h-1.5 rounded-full ${accentColor}`} />
              {example}
            </div>
          ))}
        </div>
        
        <Button variant="ghost" className={`gap-2 p-0 h-auto group-hover:gap-3 transition-all ${accentColor.replace('bg-', 'text-')}`}>
          Explore <ArrowRight className="w-4 h-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

interface VibeCategoriesProps {
  onSelectCategory: (category: VibeCategory) => void;
}

export function VibeCategories({ onSelectCategory }: VibeCategoriesProps) {
  const categories = [
    {
      category: 'work_study' as VibeCategory,
      title: 'Work & Study',
      description: 'Quiet spots with WiFi, power outlets, and the perfect ambiance to focus.',
      icon: <Laptop className="w-7 h-7" />,
      iconColor: 'bg-blue-600',
      cardBg: 'bg-blue-100 dark:bg-blue-900/50 border-2 border-blue-200 dark:border-blue-800',
      accentColor: 'bg-blue-600',
      examples: ['Silent cafes', 'Co-working friendly', 'Study corners'],
    },
    {
      category: 'social_dating' as VibeCategory,
      title: 'Social & Dating',
      description: 'From romantic dinners to group hangouts — set the mood right.',
      icon: <Heart className="w-7 h-7" />,
      iconColor: 'bg-rose-600',
      cardBg: 'bg-rose-100 dark:bg-rose-900/50 border-2 border-rose-200 dark:border-rose-800',
      accentColor: 'bg-rose-600',
      examples: ['Date night spots', 'Group-friendly venues', 'Rooftop lounges'],
    },
    {
      category: 'food_experience' as VibeCategory,
      title: 'Food & Experience',
      description: 'Discover hidden gems and iconic eateries that define Pune\'s taste.',
      icon: <ChefHat className="w-7 h-7" />,
      iconColor: 'bg-amber-600',
      cardBg: 'bg-amber-100 dark:bg-amber-900/50 border-2 border-amber-200 dark:border-amber-800',
      accentColor: 'bg-amber-600',
      examples: ['Best breakfasts', 'Authentic cuisine', 'Instagrammable spots'],
    },
  ];

  return (
    <section className="py-20 relative">
      {/* Subtle gradient background that blends with hero */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/20 to-transparent pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              What's Your Vibe Today?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We go beyond star ratings. Our AI analyzes reviews to understand the true <em>vibe</em> of each place.
            </p>
          </div>
        </ScrollReveal>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {categories.map((cat, idx) => (
            <ScrollReveal key={cat.category} delay={idx * 100}>
              <VibeCategoryCard {...cat} onClick={onSelectCategory} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
