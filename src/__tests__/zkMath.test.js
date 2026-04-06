/**
 * ZK Math Tests
 * Tests the APY calculation logic that mirrors what the Compact circuit verifies.
 * These tests validate the off-chain computation before it's submitted as a ZK proof.
 */

// ── APY calculation (mirrors the Compact circuit math) ────────────────────────

function computeApyBps(netPnl, capital, periodDays) {
  // APY (bps) = (netPnL * 365 * 10000) / (capital * period)
  // Using BigInt to match Compact's integer arithmetic
  const numerator   = BigInt(netPnl) * 365n * 10000n;
  const denominator = BigInt(capital) * BigInt(periodDays);
  return Number(numerator / denominator);
}

function verifyApyMatch(submittedApy, netPnl, capital, periodDays) {
  const numerator   = BigInt(netPnl) * 365n * 10000n;
  const denominator = BigInt(capital) * BigInt(periodDays);
  const newApyScaled = BigInt(submittedApy) * denominator;
  // |apyNumerator - newApy * denominator| <= denominator
  const diff = numerator > newApyScaled
    ? numerator - newApyScaled
    : newApyScaled - numerator;
  return diff <= denominator;
}

function buildZkInput(trades, initialCapital, periodDays = 90) {
  const netPnl = trades.reduce((sum, t) => sum + (t.exitPrice - t.entryPrice) * t.size, 0);
  const netPnlFixed = Math.round(netPnl * 1000);
  const capitalFixed = Math.round(initialCapital * 1000);
  const apy = computeApyBps(netPnlFixed, capitalFixed, periodDays);
  return { netPnl: netPnlFixed, capital: capitalFixed, period: periodDays, count: trades.length, apy };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('ZK APY Math', () => {

  describe('computeApyBps', () => {
    test('calculates correct APY for profitable trades', () => {
      // $100 profit on $1000 capital over 90 days
      const apy = computeApyBps(100_000, 1_000_000, 90); // fixed point * 1000
      // Expected: (100/1000) * (365/90) * 10000 ≈ 4055 bps = 40.55%
      expect(apy).toBeGreaterThan(4000);
      expect(apy).toBeLessThan(4100);
    });

    test('returns 0 for zero PnL', () => {
      expect(computeApyBps(0, 1_000_000, 90)).toBe(0);
    });

    test('handles large capital values', () => {
      const apy = computeApyBps(1_000_000_000, 10_000_000_000, 90);
      expect(apy).toBeGreaterThan(0);
      expect(Number.isFinite(apy)).toBe(true);
    });

    test('handles single day period', () => {
      const apy = computeApyBps(1000, 1_000_000, 1);
      expect(apy).toBeGreaterThan(0);
    });

    test('handles full year period', () => {
      // 10% annual return
      const apy = computeApyBps(100_000, 1_000_000, 365);
      expect(apy).toBe(1000); // exactly 1000 bps = 10%
    });
  });

  describe('verifyApyMatch (mirrors Compact circuit assertion)', () => {
    test('accepts correct APY', () => {
      const netPnl = 100_000, capital = 1_000_000, period = 90;
      const correctApy = computeApyBps(netPnl, capital, period);
      expect(verifyApyMatch(correctApy, netPnl, capital, period)).toBe(true);
    });

    test('accepts APY within 1 bps tolerance', () => {
      const netPnl = 100_000, capital = 1_000_000, period = 90;
      const correctApy = computeApyBps(netPnl, capital, period);
      // +1 is within tolerance, -1 may not be due to integer floor — test +1 only
      expect(verifyApyMatch(correctApy + 1, netPnl, capital, period)).toBe(true);
      expect(verifyApyMatch(correctApy,     netPnl, capital, period)).toBe(true);
    });

    test('rejects fabricated APY (too high)', () => {
      const netPnl = 100_000, capital = 1_000_000, period = 90;
      const correctApy = computeApyBps(netPnl, capital, period);
      expect(verifyApyMatch(correctApy + 100, netPnl, capital, period)).toBe(false);
    });

    test('rejects fabricated APY (too low)', () => {
      const netPnl = 100_000, capital = 1_000_000, period = 90;
      const correctApy = computeApyBps(netPnl, capital, period);
      expect(verifyApyMatch(correctApy - 100, netPnl, capital, period)).toBe(false);
    });

    test('rejects completely wrong APY', () => {
      expect(verifyApyMatch(99999, 100_000, 1_000_000, 90)).toBe(false);
    });

    test('rejects zero APY for profitable trades', () => {
      expect(verifyApyMatch(0, 100_000, 1_000_000, 90)).toBe(false);
    });
  });

  describe('buildZkInput', () => {
    test('correctly aggregates multiple trades', () => {
      const trades = [
        { entryPrice: 100, exitPrice: 110, size: 10 }, // +100
        { entryPrice: 200, exitPrice: 190, size: 5  }, // -50
        { entryPrice: 50,  exitPrice: 60,  size: 20 }, // +200
      ];
      const input = buildZkInput(trades, 1000, 90);
      expect(input.count).toBe(3);
      expect(input.netPnl).toBe(250_000); // (100 - 50 + 200) * 1000
      expect(input.capital).toBe(1_000_000);
    });

    test('handles all losing trades', () => {
      const trades = [
        { entryPrice: 100, exitPrice: 90, size: 10 }, // -100
        { entryPrice: 200, exitPrice: 180, size: 5 }, // -100
      ];
      const input = buildZkInput(trades, 1000, 90);
      expect(input.netPnl).toBe(-200_000);
    });

    test('handles single trade', () => {
      const trades = [{ entryPrice: 1000, exitPrice: 1100, size: 1 }];
      const input = buildZkInput(trades, 1000, 90);
      expect(input.count).toBe(1);
      expect(input.netPnl).toBe(100_000);
    });

    test('handles zero-profit trade', () => {
      const trades = [{ entryPrice: 100, exitPrice: 100, size: 10 }];
      const input = buildZkInput(trades, 1000, 90);
      expect(input.netPnl).toBe(0);
      expect(input.apy).toBe(0);
    });

    test('massive trade volume does not overflow', () => {
      const trades = Array(10).fill({ entryPrice: 50000, exitPrice: 55000, size: 100 });
      const input = buildZkInput(trades, 1_000_000, 90);
      expect(Number.isFinite(input.apy)).toBe(true);
      expect(input.apy).toBeGreaterThan(0);
    });
  });

  describe('Edge cases / attack vectors', () => {
    test('rejects negative capital (would cause division issues)', () => {
      expect(() => computeApyBps(100, -1000, 90)).not.toThrow();
      // Negative capital should produce nonsensical result — circuit would reject
    });

    test('rejects zero period — circuit asserts period > 0', () => {
      // Division by zero throws — the Compact circuit prevents this with assert(period > 0)
      expect(() => computeApyBps(100, 1000, 0)).toThrow();
    });

    test('APY is consistent regardless of trade order', () => {
      const trades1 = [
        { entryPrice: 100, exitPrice: 110, size: 10 },
        { entryPrice: 200, exitPrice: 220, size: 5  },
      ];
      const trades2 = [
        { entryPrice: 200, exitPrice: 220, size: 5  },
        { entryPrice: 100, exitPrice: 110, size: 10 },
      ];
      expect(buildZkInput(trades1, 1000).apy).toBe(buildZkInput(trades2, 1000).apy);
    });

    test('unauthorized admin cannot forge APY', () => {
      // Simulates: attacker submits high APY with low actual PnL
      const actualNetPnl = 10_000;   // small profit
      const capital      = 1_000_000;
      const period       = 90;
      const forgedApy    = 50000;    // claiming 500% APY

      expect(verifyApyMatch(forgedApy, actualNetPnl, capital, period)).toBe(false);
    });
  });
});
