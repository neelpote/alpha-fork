import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, ShieldCheck, Lock, Eye, EyeOff, ArrowRight, RefreshCw, CheckCircle } from 'lucide-react';
import { useWallet, DEMO_CREDENTIALS } from '../context/WalletContext';
import SceneBackground from '../components/SceneBackground';

// ── Step 1: Credentials ───────────────────────────────────────────────────────
const CredentialsStep = ({ onSuccess }) => {
  const { initConnect } = useWallet();
  const [addr, setAddr]         = useState('');
  const [pass, setPass]         = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!addr.trim()) return setError('Wallet address is required.');
    if (!pass)        return setError('Password is required.');

    setLoading(true);
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 800));
    const result = initConnect(addr.trim(), pass);
    setLoading(false);

    if (!result.ok) return setError(result.error);
    onSuccess(result.code); // pass OTP to next step (demo only)
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Wallet address */}
      <div className="space-y-1.5">
        <label htmlFor="wallet-addr" className="text-xs font-mono text-gray-500 uppercase tracking-widest">
          Wallet Address
        </label>
        <input
          id="wallet-addr"
          type="text"
          value={addr}
          onChange={(e) => setAddr(e.target.value)}
          placeholder="0x..."
          autoComplete="off"
          spellCheck={false}
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 font-mono text-sm focus:outline-none focus:border-accent-blue/60 focus:bg-white/8 transition-all"
        />
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label htmlFor="wallet-pass" className="text-xs font-mono text-gray-500 uppercase tracking-widest">
          Password
        </label>
        <div className="relative">
          <input
            id="wallet-pass"
            type={showPass ? 'text' : 'password'}
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="Enter your password"
            className="w-full px-4 py-3 pr-11 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-accent-blue/60 focus:bg-white/8 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPass((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
            aria-label={showPass ? 'Hide password' : 'Show password'}
          >
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <p role="alert" className="text-semantic-loss text-xs font-mono bg-semantic-loss/10 border border-semantic-loss/20 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      {/* Demo hint */}
      <div className="glass rounded-xl p-4 space-y-2">
        <p className="text-gray-600 text-[11px] font-mono uppercase tracking-widest mb-2">Demo credentials</p>
        {DEMO_CREDENTIALS.map((c, i) => (
          <button
            key={i}
            type="button"
            onClick={() => { setAddr(c.address); setPass(c.password); setError(''); }}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 transition-colors group"
          >
            <p className="text-gray-400 text-[11px] font-mono truncate group-hover:text-accent-blue transition-colors">
              {c.address}
            </p>
            <p className="text-gray-600 text-[10px] font-mono">{c.password}</p>
          </button>
        ))}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full py-3.5 rounded-xl text-sm disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <RefreshCw size={16} className="animate-spin" />
        ) : (
          <ArrowRight size={16} />
        )}
        {loading ? 'Verifying...' : 'Continue'}
      </button>
    </form>
  );
};

// ── Step 2: OTP ───────────────────────────────────────────────────────────────
const OtpStep = ({ demoCode, onSuccess, onBack }) => {
  const { verifyOtp } = useWallet();
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const inputs = useRef([]);

  useEffect(() => { inputs.current[0]?.focus(); }, []);

  const handleChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[idx] = val;
    setDigits(next);
    setError('');
    if (val && idx < 5) inputs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(''));
      inputs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = digits.join('');
    if (code.length < 6) return setError('Enter all 6 digits.');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const result = verifyOtp(code);
    setLoading(false);
    if (!result.ok) { setError(result.error); setDigits(['','','','','','']); inputs.current[0]?.focus(); return; }
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-gray-400 text-sm">
          A 6-digit verification code has been sent to your registered device.
        </p>
        {/* Demo: show the code since there's no real SMS/email */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-blue/10 border border-accent-blue/20">
          <span className="text-gray-500 text-xs font-mono">Demo code:</span>
          <span className="text-accent-blue font-bold text-lg font-mono tracking-[0.3em]">{demoCode}</span>
        </div>
      </div>

      {/* OTP boxes */}
      <div className="flex justify-center gap-3" onPaste={handlePaste} role="group" aria-label="6-digit verification code">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => (inputs.current[i] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            aria-label={`Digit ${i + 1} of 6`}
            onChange={(e) => handleChange(e.target.value, i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            className={`w-12 h-14 text-center text-xl font-bold font-mono rounded-xl border transition-all focus:outline-none
              ${d ? 'bg-accent-blue/10 border-accent-blue/50 text-white' : 'bg-white/5 border-white/10 text-white'}
              focus:border-accent-blue focus:bg-accent-blue/10`}
          />
        ))}
      </div>

      {error && (
        <p role="alert" className="text-semantic-loss text-xs font-mono text-center bg-semantic-loss/10 border border-semantic-loss/20 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || digits.join('').length < 6}
        className="btn-primary w-full py-3.5 rounded-xl text-sm disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? <RefreshCw size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
        {loading ? 'Verifying...' : 'Verify & Access Dashboard'}
      </button>

      <button
        type="button"
        onClick={onBack}
        className="w-full text-center text-gray-600 hover:text-gray-400 text-xs font-mono transition-colors"
      >
        ← Back to credentials
      </button>
    </form>
  );
};

// ── Step 3: Success flash ─────────────────────────────────────────────────────
const SuccessStep = () => (
  <div className="text-center space-y-4 py-4">
    <div className="flex justify-center">
      <div className="p-4 rounded-full bg-accent-green/15 border border-accent-green/30">
        <CheckCircle size={40} className="text-accent-green" />
      </div>
    </div>
    <h3 className="text-xl font-bold text-white">Identity Verified</h3>
    <p className="text-gray-400 text-sm font-mono">Redirecting to dashboard...</p>
    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
      <div className="h-full bg-gradient-to-r from-accent-blue to-accent-green rounded-full animate-[grow_1.2s_ease-in-out_forwards]" />
    </div>
  </div>
);

// ── Main page ─────────────────────────────────────────────────────────────────
const STEPS = ['credentials', 'otp', 'success'];

const ConnectWallPage = () => {
  const navigate = useNavigate();
  const [step, setStep]         = useState('credentials');
  const [demoCode, setDemoCode] = useState('');

  const handleCredSuccess = (code) => {
    setDemoCode(code);
    setStep('otp');
  };

  const handleOtpSuccess = () => {
    setStep('success');
    setTimeout(() => navigate('/dashboard'), 1400);
  };

  const stepIndex = STEPS.indexOf(step);

  return (
    <div className="relative flex-1 w-full flex items-center justify-center min-h-[85vh] px-6 py-12 overflow-hidden">
      <SceneBackground variant="hero" />
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-background/55 via-background/40 to-background/70 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md space-y-8">

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-2xl bg-accent-blue/10 border border-accent-blue/20 shadow-glow-blue">
              <Wallet size={32} className="text-accent-blue" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            {step === 'credentials' && 'Investor Verification'}
            {step === 'otp'         && 'Enter Verification Code'}
            {step === 'success'     && 'Access Granted'}
          </h1>
          <p className="text-gray-500 text-sm">
            {step === 'credentials' && 'Enter your wallet credentials to continue.'}
            {step === 'otp'         && 'Check your device for the 6-digit code.'}
            {step === 'success'     && ''}
          </p>
        </div>

        {/* Step indicator */}
        {step !== 'success' && (
          <div className="flex items-center gap-2 justify-center">
            {['Credentials', 'Verify OTP'].map((label, i) => (
              <React.Fragment key={label}>
                <div className="flex items-center gap-1.5">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold font-mono transition-all ${
                    i < stepIndex     ? 'bg-accent-green text-background' :
                    i === stepIndex   ? 'bg-accent-blue text-white' :
                                        'bg-white/10 text-gray-600'
                  }`}>
                    {i < stepIndex ? '✓' : i + 1}
                  </div>
                  <span className={`text-xs font-mono transition-colors ${i === stepIndex ? 'text-white' : 'text-gray-600'}`}>
                    {label}
                  </span>
                </div>
                {i < 1 && <div className={`flex-1 h-px max-w-[40px] transition-colors ${i < stepIndex ? 'bg-accent-green/50' : 'bg-white/10'}`} />}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Card */}
        <div className="glass rounded-2xl p-7">
          {step === 'credentials' && <CredentialsStep onSuccess={handleCredSuccess} />}
          {step === 'otp'         && <OtpStep demoCode={demoCode} onSuccess={handleOtpSuccess} onBack={() => setStep('credentials')} />}
          {step === 'success'     && <SuccessStep />}
        </div>

        {step === 'credentials' && (
          <div className="flex items-center justify-center gap-4 text-xs text-gray-700 font-mono">
            <span className="flex items-center gap-1"><Lock size={10} /> End-to-end encrypted</span>
            <span className="flex items-center gap-1"><ShieldCheck size={10} /> ZK-secured session</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectWallPage;
