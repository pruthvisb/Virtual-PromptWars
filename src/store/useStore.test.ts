import { describe, it, expect } from 'vitest';
import { getLevelNumber, getLevelName } from './useStore';

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
