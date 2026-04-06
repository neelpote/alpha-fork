import React, { createContext, useContext, useState } from 'react';

const WalletContext = createContext(null);

// Demo credentials — in a real app these come from your backend
export const DEMO_CREDENTIALS = [
  { address: '0x3fA885dE1234AbCd5678EF90c91B2345dEaD6789', password: 'Alpha@2026' },
  { address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', password: 'Vault#Secure1' },
  { address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', password: 'ZkProof!99' },
];

export const WalletProvider = ({ children }) => {
  const [connected, setConnected]   = useState(false);
  const [address, setAddress]       = useState(null);
  // pending = address waiting for OTP confirmation
  const [pending, setPending]       = useState(null);
  // generated OTP (stored in context so verify step can check it)
  const [otp, setOtp]               = useState(null);

  /** Step 1 — validate credentials, generate OTP */
  const initConnect = (addr, password) => {
    const match = DEMO_CREDENTIALS.find(
      (c) => c.address.toLowerCase() === addr.toLowerCase() && c.password === password
    );
    if (!match) return { ok: false, error: 'Invalid wallet address or password.' };

    const code = String(Math.floor(100000 + Math.random() * 900000)); // 6-digit
    setPending(match.address);
    setOtp(code);
    return { ok: true, code }; // in prod you'd email/SMS this — here we return it for demo display
  };

  /** Step 2 — verify OTP */
  const verifyOtp = (inputCode) => {
    if (inputCode.trim() !== otp) return { ok: false, error: 'Incorrect verification code.' };
    setAddress(pending);
    setConnected(true);
    setPending(null);
    setOtp(null);
    return { ok: true };
  };

  const disconnect = () => {
    setAddress(null);
    setConnected(false);
    setPending(null);
    setOtp(null);
  };

  return (
    <WalletContext.Provider value={{ connected, address, pending, initConnect, verifyOtp, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
