import React, { useState } from 'react';
import { ethers } from 'ethers';
import { Wallet, LogOut, CheckCircle2 } from 'lucide-react';
import { switchNetwork } from '../utils/web3';

interface ConnectWalletProps {
  onConnect: (address: string, token: string, isPro: boolean) => void;
  onDisconnect: () => void;
  walletAddress: string | null;
}

export default function ConnectWallet({ onConnect, onDisconnect, walletAddress }: ConnectWalletProps) {
  const [isConnecting, setIsConnecting] = useState(false);

  const connectAndSign = async () => {
    if (!window.ethereum) {
      alert("MetaMask or a Web3 wallet is not installed. Please install it to continue.");
      return;
    }

    try {
      setIsConnecting(true);

      // 1. Connect to MetaMask and try to switch network (don't block if it fails)
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      await switchNetwork(provider).catch(console.error);
      
      const accounts = await provider.send("eth_requestAccounts", []);
      const address = accounts[0];

      // 2. Sign a message to prove ownership
      const signer = await provider.getSigner();
      const message = `Welcome to resizzy!\n\nClick to sign in and accept the Terms of Service.\n\nThis request will not trigger a blockchain transaction or cost any gas fees.\n\nWallet Address:\n${address}`;
      const signature = await signer.signMessage(message);

      // 3. Send to backend to get session token
      // Note: We use relative path so it works when deployed in XAMPP (e.g. /resizzy/backend/api/...)
      // For local Vite dev server, this will need a proxy or full URL.
      // Assuming XAMPP structure:
      const apiUrl = 'http://localhost/resizzy/backend/api/web3_login.php';
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address, signature })
      });

      const data = await response.json();
      
      if (data.success) {
        onConnect(address, data.token, data.isPro);
      } else {
        alert(data.error || "Authentication failed");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to connect wallet.");
    } finally {
      setIsConnecting(false);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  if (walletAddress) {
    return (
      <div className="flex items-center gap-3">
        <div className="px-4 py-2 bg-slate-800/80 border border-slate-700 rounded-full flex items-center gap-2 shadow-inner">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-mono font-medium text-slate-300">
            {formatAddress(walletAddress)}
          </span>
        </div>
        <button 
          onClick={onDisconnect}
          className="p-2 bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/50 rounded-full transition-colors"
          title="Disconnect Wallet"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connectAndSign}
      disabled={isConnecting}
      className="group relative flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 rounded-full text-white font-bold text-sm shadow-lg shadow-violet-500/25 transition-all active:scale-95 disabled:opacity-70 disabled:pointer-events-none overflow-hidden"
    >
      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
      <Wallet className="w-4 h-4 relative z-10" />
      <span className="relative z-10">{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
    </button>
  );
}
