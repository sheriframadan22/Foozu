import { describe, it, expect, beforeEach } from 'vitest';
import { playerRegistryStore, normalizePhone } from '@/utils/storage';
import { QUESTION_SECONDS } from '@/game/timer';

describe('timer', () => {
  it('question timer is 20 seconds', () => {
    expect(QUESTION_SECONDS).toBe(20);
  });
});

describe('normalizePhone', () => {
  it('strips spaces, dashes and parens so equivalent formats match', () => {
    expect(normalizePhone('010 123 4567')).toBe(normalizePhone('010-123-4567'));
    expect(normalizePhone('(010) 123 4567')).toBe(normalizePhone('0101234567'));
  });
});

describe('playerRegistryStore — "played before" flag', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('a phone number that has never played is not found', () => {
    expect(playerRegistryStore.find('01012345678')).toBeUndefined();
  });

  it('registering a phone number makes it findable afterward', () => {
    playerRegistryStore.register('010 123 45678', 'Ahmed', 25);
    const record = playerRegistryStore.find('0101234 5678');
    expect(record).toBeDefined();
    expect(record?.playerName).toBe('Ahmed');
    expect(record?.timesPlayed).toBe(1);
  });

  it('registering the same phone number again bumps timesPlayed instead of duplicating', () => {
    playerRegistryStore.register('01012345678', 'Ahmed', 25);
    playerRegistryStore.register('01012345678', 'Ahmed', 25, 'game-2');
    const record = playerRegistryStore.find('01012345678');
    expect(record?.timesPlayed).toBe(2);
  });

  it('different phone numbers do not collide', () => {
    playerRegistryStore.register('01012345678', 'Ahmed', 25);
    expect(playerRegistryStore.find('01098765432')).toBeUndefined();
  });

  it('recordPrize attaches the most recent result to the registry entry', () => {
    playerRegistryStore.register('01012345678', 'Ahmed', 25);
    playerRegistryStore.recordPrize('01012345678', 180);
    expect(playerRegistryStore.find('01012345678')?.lastPrize).toBe(180);
  });

  it('clearAll wipes the registry so everyone can play again', () => {
    playerRegistryStore.register('01012345678', 'Ahmed', 25);
    playerRegistryStore.clearAll();
    expect(playerRegistryStore.find('01012345678')).toBeUndefined();
  });
});
