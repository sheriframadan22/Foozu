import { describe, it, expect, beforeEach } from 'vitest';
import { playerRegistryStore, normalizePhone, raffleStore, formatRaffleNumber } from '@/utils/storage';
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

describe('formatRaffleNumber', () => {
  it('zero-pads to at least 3 digits', () => {
    expect(formatRaffleNumber(1)).toBe('001');
    expect(formatRaffleNumber(42)).toBe('042');
    expect(formatRaffleNumber(999)).toBe('999');
  });

  it('does not truncate once past 3 digits', () => {
    expect(formatRaffleNumber(1000)).toBe('1000');
  });
});

describe('raffleStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('hands out sequential numbers starting at 1', () => {
    expect(raffleStore.next()).toBe(1);
    expect(raffleStore.next()).toBe(2);
    expect(raffleStore.next()).toBe(3);
  });

  it('peekNext previews the next number without consuming it', () => {
    raffleStore.next(); // 1
    expect(raffleStore.peekNext()).toBe(2);
    expect(raffleStore.peekNext()).toBe(2); // calling twice doesn't advance it
    expect(raffleStore.next()).toBe(2);
  });

  it('reset starts the count over at 1', () => {
    raffleStore.next();
    raffleStore.next();
    raffleStore.reset();
    expect(raffleStore.next()).toBe(1);
  });

  it('winner persists across reads until cleared', () => {
    expect(raffleStore.getWinner()).toBeNull();
    raffleStore.setWinner({ raffleNumber: 7, playerName: 'Mona', phoneNumber: '01012345678', drawnAt: new Date().toISOString() });
    expect(raffleStore.getWinner()?.raffleNumber).toBe(7);
    raffleStore.clearWinner();
    expect(raffleStore.getWinner()).toBeNull();
  });
});
