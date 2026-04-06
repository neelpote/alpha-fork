import React from 'react';
import { ShieldCheck, Terminal, CheckCircle, ExternalLink } from 'lucide-react';

const Step = ({ n, title, code, note }) => (
  <div className="flex gap-4">
    <div className="w-7 h-7 rounded-full bg-accent-blue/20 text-accent-blue text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
      {n}
    </div>
    <div className="space-y-2 flex-1">
      <p className="text-white font-medium text-sm">{title}</p>
      {code && (
        <pre className="bg-black/40 border border-white/10 rounded-lg p-3 text-xs text-gray-300 font-mono overflow-x-auto whitespace-pre-wrap">{code}</pre>
      )}
      {note && <p className="text-gray-500 text-xs">{note}</p>}
    </div>
  </div>
);

const DeployPage = () => (
  <div className="flex-1 py-12 px-6">
    <div className="max-w-2xl mx-auto space-y-8">

      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Deploy Contract</h1>
        <p className="text-gray-400">
          Deploy the AlphaVault Compact contract to Midnight Preprod.
          Requires Docker for ZK proof generation.
        </p>
      </div>

      {/* Status */}
      <div className="bg-card border border-white/5 rounded-2xl p-6 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck size={16} className="text-semantic-profit" />
          <span className="text-white font-semibold text-sm">Contract Status</span>
        </div>
        {[
          ['Compact contract written', true],
          ['ZK circuits compiled (5 circuits)', true],
          ['Proving keys generated', true],
          ['Deployed to Preprod', false],
        ].map(([label, done]) => (
          <div key={label} className="flex items-center gap-3 text-sm">
            <CheckCircle size={14} className={done ? 'text-semantic-profit' : 'text-gray-600'} />
            <span className={done ? 'text-gray-300' : 'text-gray-600'}>{label}</span>
          </div>
        ))}
      </div>

      {/* Steps */}
      <div className="bg-card border border-white/5 rounded-2xl p-6 space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <Terminal size={16} className="text-accent-blue" />
          <span className="text-white font-semibold text-sm uppercase tracking-widest">Deploy Steps</span>
        </div>

        <Step
          n="1"
          title="Install Docker Desktop"
          note="Required to run the ZK proof server locally."
          code="https://www.docker.com/products/docker-desktop/"
        />

        <Step
          n="2"
          title="Start the proof server"
          code="docker run -p 6300:6300 midnightntwrk/proof-server:8.0.3 midnight-proof-server -v"
          note="Leave this running in a separate terminal."
        />

        <Step
          n="3"
          title="Run the deploy script"
          code={`MIDNIGHT_SEED="your lace seed phrase here" node scripts/deploy.mjs`}
          note="This creates deployment.json with your contract address."
        />

        <Step
          n="4"
          title="Copy deployment.json to public/"
          code="cp deployment.json public/deployment.json"
          note="The frontend auto-detects the contract address on next page load."
        />
      </div>

      {/* Links */}
      <div className="flex flex-col gap-3">
        <a
          href="https://faucet.preprod.midnight.network"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 text-accent-blue text-sm hover:underline"
        >
          <ExternalLink size={14} /> Get testnet DUST from the Preprod faucet
        </a>
        <a
          href="https://explorer.preprod.midnight.network"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 text-accent-blue text-sm hover:underline"
        >
          <ExternalLink size={14} /> View contracts on the Preprod explorer
        </a>
      </div>

    </div>
  </div>
);

export default DeployPage;
