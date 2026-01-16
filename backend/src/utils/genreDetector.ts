// @ts-ignore - natural module types
import natural from 'natural';

const tokenizer = new natural.WordTokenizer();

const GENRE_KEYWORDS = {
  fantasy: ['dragon', 'magic', 'wizard', 'spell', 'sword', 'kingdom', 'quest', 'elf', 'dwarf', 'enchanted', 'mystical', 'sorcerer'],
  scifi: ['space', 'alien', 'robot', 'technology', 'future', 'planet', 'spacecraft', 'android', 'cybernetic', 'galaxy', 'quantum', 'laser'],
  mystery: ['detective', 'murder', 'clue', 'investigate', 'suspect', 'crime', 'solve', 'mystery', 'evidence', 'police', 'criminal'],
  romance: ['love', 'heart', 'romance', 'kiss', 'passion', 'relationship', 'desire', 'wedding', 'date', 'forever', 'beloved'],
  thriller: ['danger', 'chase', 'escape', 'threat', 'pursuit', 'survival', 'conspiracy', 'assassin', 'trap', 'deadly'],
  horror: ['fear', 'terror', 'scream', 'darkness', 'ghost', 'haunted', 'nightmare', 'blood', 'monster', 'evil', 'creature'],
  historical: ['century', 'war', 'king', 'queen', 'empire', 'battle', 'ancient', 'historical', 'victorian', 'medieval'],
  biography: ['born', 'life', 'childhood', 'career', 'achievement', 'biography', 'autobiography', 'memoir', 'journey'],
  selfhelp: ['improve', 'success', 'habit', 'mindset', 'goal', 'motivation', 'confidence', 'productivity', 'happiness', 'growth'],
  business: ['business', 'market', 'company', 'profit', 'strategy', 'entrepreneur', 'investment', 'economy', 'management'],
};

export class GenreDetector {
  static detectGenre(text: string, title?: string): string {
    const sampleText = text.slice(0, 5000);
    const allText = (title || '') + ' ' + sampleText;
    
    const tokens = tokenizer.tokenize(allText.toLowerCase()) || [];
    const scores: { [key: string]: number } = {};
    
    for (const [genre, keywords] of Object.entries(GENRE_KEYWORDS)) {
      scores[genre] = 0;
      
      for (const keyword of keywords) {
        const count = tokens.filter((token: string) => token.includes(keyword) || keyword.includes(token)).length;
        scores[genre] += count;
      }
    }
    
    const maxScore = Math.max(...Object.values(scores));
    
    if (maxScore === 0) {
      return 'general';
    }
    
    const detectedGenre = Object.entries(scores).find(([_, score]) => score === maxScore)?.[0];
    
    return detectedGenre || 'general';
  }

  static generateBackgroundTheme(genre: string): {
    type: 'gradient' | 'image' | 'pattern';
    colors?: string[];
    imageUrl?: string;
    patternType?: string;
    overlayIntensity?: number;
  } {
    const themes: { [key: string]: any } = {
      fantasy: {
        type: 'gradient',
        colors: ['#4A148C', '#7B1FA2', '#9C27B0', '#311B92'],
        overlayIntensity: 50
      },
      scifi: {
        type: 'gradient',
        colors: ['#0D47A1', '#1565C0', '#1976D2', '#01579B'],
        overlayIntensity: 55
      },
      mystery: {
        type: 'gradient',
        colors: ['#212121', '#424242', '#37474F', '#263238'],
        overlayIntensity: 60
      },
      romance: {
        type: 'gradient',
        colors: ['#880E4F', '#C2185B', '#D81B60', '#AD1457'],
        overlayIntensity: 45
      },
      thriller: {
        type: 'gradient',
        colors: ['#BF360C', '#D84315', '#E64A19', '#B71C1C'],
        overlayIntensity: 58
      },
      horror: {
        type: 'gradient',
        colors: ['#1A1A1A', '#263238', '#212121', '#000000'],
        overlayIntensity: 65
      },
      historical: {
        type: 'gradient',
        colors: ['#4E342E', '#5D4037', '#6D4C41', '#3E2723'],
        overlayIntensity: 50
      },
      biography: {
        type: 'gradient',
        colors: ['#455A64', '#546E7A', '#607D8B', '#37474F'],
        overlayIntensity: 52
      },
      selfhelp: {
        type: 'gradient',
        colors: ['#F57C00', '#FB8C00', '#FF9800', '#EF6C00'],
        overlayIntensity: 48
      },
      business: {
        type: 'gradient',
        colors: ['#1B5E20', '#2E7D32', '#388E3C', '#1565C0'],
        overlayIntensity: 50
      },
      general: {
        type: 'gradient',
        colors: ['#1A237E', '#283593', '#303F9F', '#1976D2'],
        overlayIntensity: 50
      }
    };

    return themes[genre] || themes.general;
  }

  static async getUnsplashImage(genre: string, unsplashKey?: string): Promise<string | null> {
    if (!unsplashKey) {
      return null;
    }

    const searchTerms: { [key: string]: string } = {
      fantasy: 'fantasy landscape mystical',
      scifi: 'space futuristic technology',
      mystery: 'dark mysterious noir',
      romance: 'romantic sunset nature',
      thriller: 'suspense dark atmosphere',
      horror: 'dark haunting eerie',
      historical: 'vintage historical architecture',
      biography: 'portrait vintage photography',
      selfhelp: 'inspiration motivation sunrise',
      business: 'business modern office',
      general: 'abstract art modern'
    };

    try {
      const axios = require('axios');
      const response = await axios.get('https://api.unsplash.com/photos/random', {
        params: {
          query: searchTerms[genre] || searchTerms.general,
          orientation: 'landscape'
        },
        headers: {
          Authorization: `Client-ID ${unsplashKey}`
        }
      });

      return response.data.urls.regular;
    } catch (error) {
      console.error('Unsplash API error:', error);
      return null;
    }
  }
}
