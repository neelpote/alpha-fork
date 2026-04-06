import { renderHook, act } from '@testing-library/react';
import { useMidnightWallet } from '../hooks/useMidnightWallet';

// ── Helpers ───────────────────────────────────────────────────────────────────

const makeMockApi = (overrides = {}) => ({
  getConfiguration:    jest.fn().mockResolvedValue({ indexerUri: 'https://indexer.test', networkId: 'preprod' }),
  getDustBalance:      jest.fn().mockResolvedValue(1000000n),
  getShieldedAddresses: jest.fn().mockResolvedValue({ shieldedAddress: 'mn_shield_test', coinPublicKey: 'aabbcc', encryptionPublicKey: 'ddeeff' }),
  getUnshieldedAddress: jest.fn().mockResolvedValue('mn_addr_preprod_test'),
  ...overrides,
});

const mockLace = (api) => {
  window.midnight = { 'test-uuid': { name: 'lace', connect: jest.fn().mockResolvedValue(api) } };
};

afterEach(() => { delete window.midnight; jest.clearAllMocks(); });

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useMidnightWallet', () => {

  test('starts disconnected', () => {
    window.midnight = {};
    const { result } = renderHook(() => useMidnightWallet());
    expect(result.current.connected).toBe(false);
    expect(result.current.address).toBeNull();
  });

  test('sets error when Lace not installed', async () => {
    delete window.midnight;
    const { result } = renderHook(() => useMidnightWallet());
    await act(async () => {});
    expect(result.current.error).toMatch(/not found/i);
  });

  test('connects successfully and populates state', async () => {
    const api = makeMockApi();
    mockLace(api);
    const { result } = renderHook(() => useMidnightWallet());

    await act(async () => { await result.current.connect(); });

    expect(result.current.connected).toBe(true);
    expect(result.current.address).toBe('mn_addr_preprod_test');
    expect(result.current.dustBalance).toBe(1000000n);
    expect(result.current.error).toBeNull();
  });

  test('handles connection rejection gracefully', async () => {
    window.midnight = {
      'test-uuid': { name: 'lace', connect: jest.fn().mockRejectedValue(new Error('User rejected')) },
    };
    const { result } = renderHook(() => useMidnightWallet());

    await act(async () => {
      try { await result.current.connect(); } catch {}
    });

    expect(result.current.connected).toBe(false);
    expect(result.current.error).toBe('User rejected');
    expect(result.current.connecting).toBe(false);
  });

  test('handles network timeout', async () => {
    window.midnight = {
      'test-uuid': {
        name: 'lace',
        connect: jest.fn().mockRejectedValue(new Error('Network timeout')),
      },
    };
    const { result } = renderHook(() => useMidnightWallet());
    await act(async () => { try { await result.current.connect(); } catch {} });
    expect(result.current.error).toBe('Network timeout');
  });

  test('disconnect resets all state', async () => {
    const api = makeMockApi();
    mockLace(api);
    const { result } = renderHook(() => useMidnightWallet());

    await act(async () => { await result.current.connect(); });
    expect(result.current.connected).toBe(true);

    act(() => { result.current.disconnect(); });
    expect(result.current.connected).toBe(false);
    expect(result.current.address).toBeNull();
    expect(result.current.api).toBeNull();
  });

  test('refreshBalance updates dustBalance', async () => {
    const api = makeMockApi();
    mockLace(api);
    const { result } = renderHook(() => useMidnightWallet());

    await act(async () => { await result.current.connect(); });
    api.getDustBalance.mockResolvedValue(9999999n);

    await act(async () => { await result.current.refreshBalance(); });
    expect(result.current.dustBalance).toBe(9999999n);
  });

  test('handles getDustBalance returning object', async () => {
    const api = makeMockApi({ getDustBalance: jest.fn().mockResolvedValue({ total: 500n }) });
    mockLace(api);
    const { result } = renderHook(() => useMidnightWallet());
    await act(async () => { await result.current.connect(); });
    expect(result.current.dustBalance).toBe(500n);
  });

});
