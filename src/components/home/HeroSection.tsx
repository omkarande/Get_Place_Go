import { Sparkles, Coffee, Users, UtensilsCrossed } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden pt-8 pb-12">
      {/* Seamless gradient background that flows into page */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,hsl(var(--primary)/0.1)_0%,transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_80%,hsl(var(--secondary)/0.08)_0%,transparent_60%)]" />
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-[10%] animate-float opacity-20">
        <Coffee className="w-16 h-16 text-primary" />
      </div>
      <div className="absolute bottom-32 right-[15%] animate-float opacity-20" style={{ animationDelay: '1s' }}>
        <Users className="w-12 h-12 text-secondary" />
      </div>
      <div className="absolute top-40 right-[20%] animate-float opacity-20" style={{ animationDelay: '2s' }}>
        <UtensilsCrossed className="w-10 h-10 text-accent" />
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium animate-fade-in">
            <Sparkles className="w-4 h-4" />
            AI-Powered Place Discovery for Pune
          </div>
          
          {/* Headline */}
          <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Find Your Perfect
            <span className="block bg-gradient-to-r from-primary via-orange-500 to-secondary bg-clip-text text-transparent">Vibe in Pune</span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Whether you need a quiet corner to work, a romantic dinner spot, or the best breakfast in town — 
            our AI understands <em>vibes</em>, not just keywords.
          </p>
          
          {/* Stats */}
          <div className="flex justify-center gap-8 pt-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="text-center">
              <div className="text-3xl font-display font-bold text-primary">50+</div>
              <div className="text-sm text-muted-foreground">Curated Places</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-display font-bold text-secondary">2</div>
              <div className="text-sm text-muted-foreground">Pune Areas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-display font-bold text-accent">3</div>
              <div className="text-sm text-muted-foreground">Vibe Categories</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
