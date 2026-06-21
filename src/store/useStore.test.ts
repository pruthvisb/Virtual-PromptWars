import { describe, it, expect, beforeEach, vi } from 'vitest';

// Define the fetch mock locally in a hoisted block so it runs before imports
const mocks = vi.hoisted(() => {
  const localStorageStore: Record<string, string> = {};
  const lsMock = {
    getItem: (key: string) => localStorageStore[key] || null,
    setItem: (key: string, value: string) => {
      localStorageStore[key] = value.toString();
    },
    clear: () => {
      for (const key in localStorageStore) {
        delete localStorageStore[key];
      }
    },
    removeItem: (key: string) => {
      delete localStorageStore[key];
    }
  };

  Object.defineProperty(globalThis, 'localStorage', {
    value: lsMock,
    writable: true
  });

  const fMock = vi.fn().mockImplementation((url, _init) => {
    const urlStr = String(url);
    
    if (urlStr.includes('/feed/post') || urlStr.includes('post.php')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          id: 'post_123',
          author: 'Warden_Jane',
          avatar: 'W',
          avatar_bg: '#10b981',
          time: 'Just now',
          content: 'Planted an oak tree today!',
          applauds: 0,
          comments: []
        })
      });
    }

    if (urlStr.includes('/profile/equip')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          username: 'Warden_Jane',
          bio: 'Protecting the planet, one habit at a time.',
          level: 'Beginner',
          xp: 120,
          coins: 250,
          streak: 3,
          carbon_saved: 15.4,
          equipped_frame: 'none',
          equipped_theme: 'sunset-gold',
          equipped_badge: 'Seedling',
          owned_frames: ['none'],
          owned_themes: ['dark-green'],
          owned_badges: ['Seedling']
        })
      });
    }

    if (urlStr.includes('/profile')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          username: 'Warden_Jane',
          bio: 'Protecting the planet, one habit at a time.',
          level: 'Beginner',
          xp: 120,
          coins: 250,
          streak: 3,
          carbon_saved: 15.4,
          equipped_frame: 'none',
          equipped_theme: 'sunset-gold',
          equipped_badge: 'Seedling',
          owned_frames: ['none'],
          owned_themes: ['dark-green'],
          owned_badges: ['Seedling']
        })
      });
    }

    if (urlStr.includes('/challenges')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([])
      });
    }

    if (urlStr.includes('/analytics')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([])
      });
    }

    if (urlStr.includes('/feed')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([])
      });
    }

    if (urlStr.includes('/leaderboard')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([])
      });
    }

    // Default fallback
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({})
    });
  });

  Object.defineProperty(globalThis, 'fetch', {
    value: fMock,
    writable: true
  });

  Object.defineProperty(globalThis, 'window', {
    value: {
      location: {
        hostname: 'localhost'
      },
      fetch: fMock,
      localStorage: lsMock
    },
    writable: true
  });

  return { fMock, lsMock };
});

import { getLevelNumber, getLevelName, useStore, calculateFootprint } from './useStore';

describe('Leveling System Helpers', () => {
  describe('getLevelNumber', () => {
    it('should return level 1 for XP less than 100', () => {
      expect(getLevelNumber(0)).toBe(1);
      expect(getLevelNumber(50)).toBe(1);
      expect(getLevelNumber(99)).toBe(1);
    });

    it('should return level 2 for XP between 100 and 249', () => {
      expect(getLevelNumber(100)).toBe(2);
      expect(getLevelNumber(150)).toBe(2);
      expect(getLevelNumber(249)).toBe(2);
    });

    it('should return level 3 for XP between 250 and 499', () => {
      expect(getLevelNumber(250)).toBe(3);
      expect(getLevelNumber(350)).toBe(3);
      expect(getLevelNumber(499)).toBe(3);
    });

    it('should return level 4 for XP between 500 and 999', () => {
      expect(getLevelNumber(500)).toBe(4);
      expect(getLevelNumber(750)).toBe(4);
      expect(getLevelNumber(999)).toBe(4);
    });

    it('should return level 5 for XP greater than or equal to 1000', () => {
      expect(getLevelNumber(1000)).toBe(5);
      expect(getLevelNumber(5000)).toBe(5);
    });
  });

  describe('getLevelName', () => {
    it('should return correct level name based on level number', () => {
      expect(getLevelName(1)).toBe('Beginner');
      expect(getLevelName(2)).toBe('Explorer');
      expect(getLevelName(3)).toBe('Guardian');
      expect(getLevelName(4)).toBe('Champion');
      expect(getLevelName(5)).toBe('Protector');
      expect(getLevelName(6)).toBe('Legend');
    });

    it('should handle boundary and fallback level numbers', () => {
      expect(getLevelName(0)).toBe('Beginner');
      expect(getLevelName(-5)).toBe('Beginner');
      expect(getLevelName(7)).toBe('Legend');
      expect(getLevelName(100)).toBe('Legend');
    });
  });
});

describe('useStore Zustand Store', () => {
  beforeEach(() => {
    mocks.lsMock.clear();
    mocks.fMock.mockClear();
    // Reset store to default state before each test
    useStore.setState({
      isAuthenticated: false,
      userEmail: null,
      profile: {
        username: 'Warden_Jane',
        bio: 'Protecting the planet, one habit at a time.',
        level: 'Beginner',
        xp: 120,
        coins: 250,
        streak: 3,
        carbon_saved: 15.4,
        equipped_frame: 'none',
        equipped_theme: 'dark-green',
        equipped_badge: 'Seedling',
        owned_frames: ['none'],
        owned_themes: ['dark-green'],
        owned_badges: ['Seedling']
      },
      socialPosts: [],
      isLoading: false,
      toast: null
    });
  });

  it('should initialize with default values', () => {
    const state = useStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
    expect(state.toast).toBeNull();
    expect(state.profile.username).toBe('Warden_Jane');
  });

  it('should toggle authentication state', () => {
    useStore.getState().setAuthenticated(true, 'jane@ecoverse.com');
    expect(useStore.getState().isAuthenticated).toBe(true);
    expect(useStore.getState().userEmail).toBe('jane@ecoverse.com');

    useStore.getState().setAuthenticated(false, null);
    expect(useStore.getState().isAuthenticated).toBe(false);
    expect(useStore.getState().userEmail).toBeNull();
  });

  it('should show and clear toast messages', () => {
    useStore.getState().showToast('Quest Completed!', 'success');
    expect(useStore.getState().toast).toEqual({ message: 'Quest Completed!', type: 'success' });

    useStore.getState().clearToast();
    expect(useStore.getState().toast).toBeNull();
  });

  it('should equip customizations locally and call API', async () => {
    await useStore.getState().equipItem('theme', 'sunset-gold');
    expect(useStore.getState().profile.equipped_theme).toBe('sunset-gold');
    expect(mocks.fMock).toHaveBeenCalled();
  });

  it('should add social post locally and call API', async () => {
    await useStore.getState().addSocialPost('Planted an oak tree today!');
    const posts = useStore.getState().socialPosts;
    expect(posts.length).toBe(1);
    expect(posts[0].content).toBe('Planted an oak tree today!');
    expect(posts[0].author).toBe('Warden_Jane');
  });

  describe('calculateFootprint and updateCarbonTwin', () => {
    it('should calculate correct footprint based on lifestyle profile', () => {
      const testProfile = {
        username: 'Alex',
        bio: '',
        level: 'Beginner',
        xp: 100,
        coins: 100,
        streak: 1,
        carbon_saved: 0,
        equipped_frame: 'none',
        equipped_theme: 'dark-green',
        equipped_badge: 'Seedling',
        owned_frames: [],
        owned_themes: [],
        owned_badges: [],
        commute_mode: 'gas_car' as const,
        commute_km: 15,
        diet_style: 'balanced' as const,
        home_size: 'townhouse' as const,
        energy_source: 'grid' as const,
        shopping_level: 'average' as const,
        recycling_level: 'partial' as const,
        digital_hours: 'average' as const,
        banking_type: 'conventional' as const
      };
      expect(calculateFootprint(testProfile)).toBe(21.4);
    });

    it('should calculate correct footprint for a low-carbon vegan profile', () => {
      const testProfile = {
        username: 'EcoVegan',
        bio: '',
        level: 'Explorer',
        xp: 350,
        coins: 120,
        streak: 5,
        carbon_saved: 12,
        equipped_frame: 'none',
        equipped_theme: 'dark-green',
        equipped_badge: 'Seedling',
        owned_frames: [],
        owned_themes: [],
        owned_badges: [],
        commute_mode: 'walk_bike' as const,
        commute_km: 0,
        diet_style: 'strict_vegan' as const,
        home_size: 'apartment' as const,
        energy_source: 'renewable' as const,
        shopping_level: 'minimal' as const,
        recycling_level: 'full' as const,
        digital_hours: 'low' as const,
        banking_type: 'green' as const
      };
      expect(calculateFootprint(testProfile)).toBe(3.42);
    });

    it('should calculate correct footprint for a high-carbon consumer profile', () => {
      const testProfile = {
        username: 'BigConsumer',
        bio: '',
        level: 'Beginner',
        xp: 50,
        coins: 10,
        streak: 0,
        carbon_saved: 0,
        equipped_frame: 'none',
        equipped_theme: 'dark-green',
        equipped_badge: 'Seedling',
        owned_frames: [],
        owned_themes: [],
        owned_badges: [],
        commute_mode: 'gas_car' as const,
        commute_km: 50,
        diet_style: 'heavy_meat' as const,
        home_size: 'house' as const,
        energy_source: 'fossil' as const,
        shopping_level: 'high' as const,
        recycling_level: 'none' as const,
        digital_hours: 'high' as const,
        banking_type: 'conventional' as const
      };
      expect(calculateFootprint(testProfile)).toBe(40.7);
    });

    it('should update carbon twin and recalculate saved carbon', async () => {
      useStore.setState({
        profile: {
          username: 'Alex',
          bio: '',
          level: 'Beginner',
          xp: 100,
          coins: 100,
          streak: 1,
          carbon_saved: 0,
          equipped_frame: 'none',
          equipped_theme: 'dark-green',
          equipped_badge: 'Seedling',
          owned_frames: [],
          owned_themes: [],
          owned_badges: [],
          commute_mode: 'gas_car',
          commute_km: 15,
          diet_style: 'balanced',
          home_size: 'townhouse',
          energy_source: 'grid',
          shopping_level: 'average',
          recycling_level: 'partial',
          digital_hours: 'average',
          banking_type: 'conventional'
        }
      });

      await useStore.getState().updateCarbonTwin({ commute_mode: 'walk_bike', commute_km: 0 });
      expect(useStore.getState().profile.carbon_saved).toBe(2.7);
    });
  });
});
