import { VALID_SHIFTS } from '@/domain/Doctor';

describe('Doctor domain constants', () => {
  it('VALID_SHIFTS contains exactly two shifts', () => {
    expect(VALID_SHIFTS).toEqual(['06:00-14:00', '14:00-22:00']);
  });

  it('VALID_SHIFTS is readonly', () => {
    expect(Object.isFrozen(VALID_SHIFTS)).toBe(false);
    expect(VALID_SHIFTS).toHaveLength(2);
  });
});
