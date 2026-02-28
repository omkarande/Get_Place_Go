import { supabase } from '@/integrations/supabase/client';

type ScrapegraphResponse<T = any> = {
  success: boolean;
  error?: string;
  data?: T;
};

type SmartScraperOptions = {
  website_url: string;
  user_prompt: string;
  output_schema?: Record<string, any>;
  total_pages?: number;
  number_of_scrolls?: number;
};

type SearchScraperOptions = {
  user_prompt: string;
  output_schema?: Record<string, any>;
};

type ScrapeplacesOptions = {
  url: string;
  area: 'baner' | 'koregaon_park' | 'viman_nagar' | 'hinjewadi' | 'kothrud' | 'aundh' | 'wakad' | 'hadapsar' | 'deccan' | 'camp' | 'kalyani_nagar' | 'magarpatta' | 'pimpri_chinchwad';
  prompt?: string;
};

export const scrapegraphApi = {
  /** AI-powered smart scraping — extract structured data from any URL */
  async smartScrape(options: SmartScraperOptions): Promise<ScrapegraphResponse> {
    const { data, error } = await supabase.functions.invoke('scrapegraph-scrape', {
      body: { action: 'smartscraper', params: options },
    });
    if (error) return { success: false, error: error.message };
    return data;
  },

  /** AI-powered web search with structured results */
  async searchScrape(options: SearchScraperOptions): Promise<ScrapegraphResponse> {
    const { data, error } = await supabase.functions.invoke('scrapegraph-scrape', {
      body: { action: 'searchscraper', params: options },
    });
    if (error) return { success: false, error: error.message };
    return data;
  },

  /** Scrape places from a URL and auto-insert into the database */
  async scrapePlaces(options: ScrapeplacesOptions): Promise<ScrapegraphResponse> {
    const { data, error } = await supabase.functions.invoke('scrape-places', {
      body: options,
    });
    if (error) return { success: false, error: error.message };
    return data;
  },
};
