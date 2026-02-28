import { useNavigate } from 'react-router-dom';
import { 
  Laptop, Heart, ChefHat, Wifi, Zap, Volume2, Users, 
  Star, Coffee, Utensils, ArrowRight, Sparkles, MessageSquare 
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { VibeCategory, VIBE_INFO, NOISE_LABELS } from '@/lib/types';

interface VibeDetailCardProps {
  category: VibeCategory;
  title: string;
  description: string;
  longDescription: string;
  icon: React.ReactNode;
  iconColor: string;
  cardBg: string;
  features: { icon: React.ReactNode; label: string }[];
  perfectFor: string[];
  onClick: () => void;
}

function VibeDetailCard({ 
  title, description, longDescription, icon, iconColor, cardBg, features, perfectFor, onClick 
}: VibeDetailCardProps) {
  return (
    <Card className={`overflow-hidden border-0 ${cardBg} hover:shadow-lg transition-all duration-300`}>
      <CardContent className="p-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Icon and Title */}
          <div className="lg:w-1/3">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${iconColor} text-white shadow-lg mb-4`}>
              {icon}
            </div>
            <h2 className="font-display text-2xl font-bold mb-2">{title}</h2>
            <p className="text-muted-foreground">{description}</p>
          </div>
          
          {/* Right: Details */}
          <div className="lg:w-2/3 space-y-6">
            <p className="text-foreground/80">{longDescription}</p>
            
            {/* Features */}
            <div>
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-3">
                What we look for
              </h3>
              <div className="flex flex-wrap gap-2">
                {features.map((feature, idx) => (
                  <Badge key={idx} variant="secondary" className="gap-1.5 py-1.5 px-3">
                    {feature.icon}
                    {feature.label}
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Perfect For */}
            <div>
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-3">
                Perfect for
              </h3>
              <div className="flex flex-wrap gap-2">
                {perfectFor.map((item, idx) => (
                  <span 
                    key={idx} 
                    className="text-sm bg-background/50 px-3 py-1.5 rounded-full"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
            
            <Button onClick={onClick} className="gap-2 mt-4">
              Explore {title} Places
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Vibes() {
  const navigate = useNavigate();

  const vibeDetails = [
    {
      category: 'work_study' as VibeCategory,
      title: 'Work & Study',
      description: 'Focus-friendly environments for productivity.',
      longDescription: 'Our AI identifies places with the perfect ambiance for deep work and studying. We analyze noise levels, seating comfort, WiFi reliability, and power outlet availability to find your ideal productive space.',
      icon: <Laptop className="w-10 h-10" />,
      iconColor: 'bg-blue-600',
      cardBg: 'bg-blue-100 dark:bg-blue-900/50 border-2 border-blue-200 dark:border-blue-800',
      features: [
        { icon: <Volume2 className="w-3.5 h-3.5" />, label: 'Quiet atmosphere' },
        { icon: <Wifi className="w-3.5 h-3.5" />, label: 'Reliable WiFi' },
        { icon: <Zap className="w-3.5 h-3.5" />, label: 'Power outlets' },
        { icon: <Coffee className="w-3.5 h-3.5" />, label: 'Good coffee' },
      ],
      perfectFor: ['Remote workers', 'Students', 'Freelancers', 'Writers', 'Programmers'],
    },
    {
      category: 'social_dating' as VibeCategory,
      title: 'Social & Dating',
      description: 'Memorable settings for connections.',
      longDescription: 'Whether it\'s a first date, anniversary dinner, or group celebration, we find venues with the right atmosphere. Our AI evaluates romantic ambiance, privacy levels, aesthetic appeal, and group-friendliness.',
      icon: <Heart className="w-10 h-10" />,
      iconColor: 'bg-rose-600',
      cardBg: 'bg-rose-100 dark:bg-rose-900/50 border-2 border-rose-200 dark:border-rose-800',
      features: [
        { icon: <Star className="w-3.5 h-3.5" />, label: 'Romantic ambiance' },
        { icon: <Users className="w-3.5 h-3.5" />, label: 'Group-friendly' },
        { icon: <Sparkles className="w-3.5 h-3.5" />, label: 'Aesthetic decor' },
        { icon: <Volume2 className="w-3.5 h-3.5" />, label: 'Conversation-friendly' },
      ],
      perfectFor: ['Date nights', 'Anniversaries', 'Friend groups', 'Celebrations', 'Meetups'],
    },
    {
      category: 'food_experience' as VibeCategory,
      title: 'Food & Experience',
      description: 'Culinary adventures and hidden gems.',
      longDescription: 'Discover Pune\'s best-kept culinary secrets and iconic eateries. We surface places known for exceptional food quality, unique dining experiences, authentic flavors, and Instagram-worthy presentations.',
      icon: <ChefHat className="w-10 h-10" />,
      iconColor: 'bg-amber-600',
      cardBg: 'bg-amber-100 dark:bg-amber-900/50 border-2 border-amber-200 dark:border-amber-800',
      features: [
        { icon: <Utensils className="w-3.5 h-3.5" />, label: 'Quality cuisine' },
        { icon: <Star className="w-3.5 h-3.5" />, label: 'Highly rated' },
        { icon: <Sparkles className="w-3.5 h-3.5" />, label: 'Unique experience' },
        { icon: <Coffee className="w-3.5 h-3.5" />, label: 'Specialty items' },
      ],
      perfectFor: ['Foodies', 'Explorers', 'Brunch lovers', 'Food bloggers', 'Adventurous eaters'],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero */}
          <ScrollReveal>
            <div className="text-center mb-16">
              <Badge className="mb-4 gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                AI-Powered Vibe Detection
              </Badge>
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
                Understanding <span className="text-primary">Vibes</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                We go beyond star ratings. Our AI analyzes thousands of reviews to understand 
                the true <em>vibe</em> of each place — so you find exactly what you're looking for.
              </p>
            </div>
          </ScrollReveal>

          {/* How it works */}
          <ScrollReveal delay={100}>
            <div className="bg-muted/30 rounded-2xl p-8 mb-16">
              <h2 className="font-display text-2xl font-bold text-center mb-8">
                How Vibe Detection Works
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    1
                  </div>
                  <h3 className="font-semibold mb-2">Analyze Reviews</h3>
                  <p className="text-sm text-muted-foreground">
                    Our AI reads and understands reviews to extract sentiment and vibe indicators
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    2
                  </div>
                  <h3 className="font-semibold mb-2">Score Attributes</h3>
                  <p className="text-sm text-muted-foreground">
                    We score places on noise level, work-friendliness, romance factor, and more
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    3
                  </div>
                  <h3 className="font-semibold mb-2">Match Your Mood</h3>
                  <p className="text-sm text-muted-foreground">
                    Tell us what you're looking for, and we'll find places that match your vibe
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Vibe Categories */}
          <div className="space-y-8">
            {vibeDetails.map((vibe, idx) => (
              <ScrollReveal key={vibe.category} delay={idx * 100}>
                <VibeDetailCard
                  {...vibe}
                  onClick={() => navigate(`/explore?vibe=${vibe.category}`)}
                />
              </ScrollReveal>
            ))}
          </div>

          {/* Share Your Experience Section */}
          <ScrollReveal delay={200}>
            <div className="mt-16 bg-secondary/10 dark:bg-secondary/20 rounded-2xl p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="md:w-1/2">
                  <div className="w-16 h-16 rounded-2xl bg-secondary text-secondary-foreground flex items-center justify-center mb-4">
                    <MessageSquare className="w-8 h-8" />
                  </div>
                  <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">
                    Share Your Experience
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Been to a great spot in Pune? Your review helps our AI understand vibes better 
                    and helps others discover amazing places. Every review makes our recommendations smarter!
                  </p>
                  <ReviewForm />
                </div>
                <div className="md:w-1/2">
                  <div className="bg-card rounded-xl p-6 shadow-soft">
                    <h3 className="font-semibold mb-4">What makes a great review?</h3>
                    <ul className="space-y-3 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-xs mt-0.5">✓</span>
                        <span>Describe the <strong>vibe</strong> — Was it quiet? Lively? Romantic?</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-xs mt-0.5">✓</span>
                        <span>Mention specific details — WiFi quality, seating, noise level</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-xs mt-0.5">✓</span>
                        <span>Share who it's perfect for — Solo work? Date night? Groups?</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-xs mt-0.5">✓</span>
                        <span>Be honest — Both positives and areas to improve help others</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* CTA */}
          <ScrollReveal delay={300}>
            <div className="text-center mt-16 py-12 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-2xl">
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
                Ready to Find Your Vibe?
              </h2>
              <p className="text-muted-foreground mb-6">
                Start exploring Pune's best places matched to your mood
              </p>
              <Button size="lg" onClick={() => navigate('/explore')} className="gap-2">
                <Sparkles className="w-5 h-5" />
                Start Exploring
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </main>
    </div>
  );
}
