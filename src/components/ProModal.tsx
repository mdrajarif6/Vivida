import React, { useState } from 'react';
import { X, Sparkles, Check, ArrowRight, Loader2 } from 'lucide-react';
import { ethers } from 'ethers';
import { switchNetwork } from '../utils/web3';

interface ProModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlockPro: () => void;
  walletAddress: string | null;
  sessionToken: string | null;
}

export default function ProModal({ isOpen, onClose, onUnlockPro, walletAddress, sessionToken }: ProModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-slate-900 border border-violet-500/30 rounded-3xl shadow-2xl shadow-violet-900/20 overflow-hidden flex flex-col animate-fade-in-up">
        {/* Header decoration */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-violet-600/20 to-transparent pointer-events-none"></div>
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-fuchsia-500/20 rounded-full blur-[50px] pointer-events-none"></div>
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors z-50"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 pt-10 text-center relative z-10">
          <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-violet-600 to-fuchsia-500 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/30 mb-6">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-3xl font-extrabold text-white mb-2">
            Upgrade to <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-500">resizzy PRO</span>
          </h2>
          <p className="text-slate-400 mb-8">
            Unlock the full creative potential of resizzy and take your designs to the next level.
          </p>

          <div className="bg-slate-800/50 rounded-2xl p-6 text-left space-y-4 mb-8 border border-white/5">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400">
                <Check className="w-4 h-4" />
              </div>
              <span className="text-slate-200 text-sm">Access to all <strong className="text-white">Premium Filters</strong></span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400">
                <Check className="w-4 h-4" />
              </div>
              <span className="text-slate-200 text-sm"><strong className="text-white">4K High-Resolution</strong> Exports</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400">
                <Check className="w-4 h-4" />
              </div>
              <span className="text-slate-200 text-sm">Completely <strong className="text-white">Ad-Free</strong> Experience</span>
            </div>
          </div>

          <button 
            onClick={async (e) => {
              e.preventDefault();
              if (!walletAddress || !sessionToken) {
                alert("Please connect your wallet using the 'Connect Wallet' button at the top right first!");
                onClose();
                return;
              }
              
              if (!window.ethereum) {
                alert("No Web3 provider found. Please install MetaMask!");
                return;
              }

              try {
                setIsProcessing(true);
                const provider = new ethers.BrowserProvider(window.ethereum);
                
                // Try to switch to Amoy testnet, but don't block if it fails
                await switchNetwork(provider).catch(console.error);

                const signer = await provider.getSigner();
                
                // Replace this with your actual Polygon MATIC or Binance Smart Chain address!
                const ADMIN_WALLET = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"; 
                
                // 0.01 MATIC or equivalent for PRO
                const amount = ethers.parseEther("0.01"); 
                
                const tx = await signer.sendTransaction({
                  to: ADMIN_WALLET,
                  value: amount
                });
                
                alert("Transaction sent! Please wait a moment while it confirms on the blockchain.\\n\\nTx Hash: " + tx.hash);
                
                // Wait for the transaction to be mined
                await tx.wait();
                
                // Call PHP backend to upgrade the user status in database
                const response = await fetch('http://localhost/resizzy/backend/api/upgrade_pro.php', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ token: sessionToken, txHash: tx.hash })
                });
                
                const data = await response.json();
                
                if (data.success) {
                  alert("🎉 Payment Confirmed! You are now a PRO user.");
                  onUnlockPro();
                  onClose();
                } else {
                  alert("Backend verification failed: " + data.error);
                }
              } catch (error: any) {
                console.error(error);
                
                // --- MOCK PAYMENT BYPASS FOR TESTING ---
                const wantsToMock = window.confirm(
                  "Payment failed (likely insufficient testnet funds or gas error).\\n\\n" +
                  "Since you are testing, would you like to SIMULATE a successful payment to unlock PRO features?"
                );
                
                if (wantsToMock) {
                  try {
                    // Send a fake hash to the backend to simulate success
                    const mockHash = "0xmocktransaction" + Date.now();
                    const response = await fetch('http://localhost/resizzy/backend/api/upgrade_pro.php', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ token: sessionToken, txHash: mockHash })
                    });
                    
                    const data = await response.json();
                    if (data.success) {
                      alert("🎉 Mock Payment Successful! You are now a PRO user.");
                      onUnlockPro();
                      onClose();
                    }
                  } catch (mockErr) {
                    alert("Mock payment failed to reach backend.");
                  }
                } else {
                  alert("Payment cancelled. " + (error.message || ""));
                }
                // ---------------------------------------
                
              } finally {
                setIsProcessing(false);
              }
            }}
            disabled={isProcessing}
            className="group relative w-full flex items-center justify-center py-4 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-500/25 overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <span className="relative z-10 flex items-center gap-2">
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing Transaction...
                </>
              ) : (
                <>
                  Pay 0.01 MATIC to Subscribe
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          </button>
          
          <button onClick={onClose} disabled={isProcessing} className="mt-4 text-xs text-slate-500 hover:text-slate-300 transition-colors">
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
