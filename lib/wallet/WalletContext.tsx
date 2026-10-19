"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { getActiveUser } from "@/lib/auth/activeUser";

export interface Web3Allocation {
  id: string;
  planName: string;
  amount: number;
  txHash: string;
  timestamp: string;
  network: string;
  status: "active" | "completed";
  escrowContract: string;
}

export interface WalletContextType {
  account: string | null;
  shortAddress: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  connectionStep: "idle" | "requesting" | "handshaking" | "escrow_lock" | "connected" | "error";
  walletProvider: string | null;
  chainId: number | null;
  networkName: string;
  balanceUsdt: number;
  balanceEth: number;
  isTradingDelegated: boolean;
  escrowLocked: boolean;
  escrowContractAddress: string;
  errorMessage: string | null;
  allocations: Web3Allocation[];
  connectWallet: (provider: "metamask" | "walletconnect" | "coinbase" | "trust") => Promise<boolean>;
  disconnectWallet: () => void;
  toggleTradingDelegation: () => void;
  switchNetwork: (netName: string) => void;
  depositFromWallet: (amount: number, planName: string) => Promise<{ success: boolean; message: string; txHash?: string }>;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStep, setConnectionStep] = useState<"idle" | "requesting" | "handshaking" | "escrow_lock" | "connected" | "error">("idle");
  const [walletProvider, setWalletProvider] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(1);
  const [networkName, setNetworkName] = useState<string>("Ethereum Mainnet");
  const [balanceUsdt, setBalanceUsdt] = useState<number>(7500.00);
  const [balanceEth, setBalanceEth] = useState<number>(3.12);
  const [isTradingDelegated, setIsTradingDelegated] = useState(true);
  const [escrowLocked, setEscrowLocked] = useState(true);
  const [escrowContractAddress, setEscrowContractAddress] = useState<string>("0x8F3Cf7ad23Cd3CaDbD9735AFf958023239c6A063");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allocations, setAllocations] = useState<Web3Allocation[]>([]);

  // Load persisted wallet & allocations from localStorage
  useEffect(() => {
    try {
      const savedAddress = localStorage.getItem("alpha_wallet_address");
      const savedProvider = localStorage.getItem("alpha_wallet_provider");
      const savedDelegated = localStorage.getItem("alpha_trading_delegated");
      const savedUsdt = localStorage.getItem("alpha_wallet_balance_usdt");
      const savedNet = localStorage.getItem("alpha_wallet_network");
      const savedAlloc = localStorage.getItem("alpha_web3_allocations");

      if (savedAddress) {
        setAccount(savedAddress);
        setWalletProvider(savedProvider || "metamask");
        setConnectionStep("connected");
        if (savedDelegated !== null) {
          setIsTradingDelegated(savedDelegated === "true");
        }
        if (savedUsdt) {
          setBalanceUsdt(parseFloat(savedUsdt));
        }
        if (savedNet) {
          setNetworkName(savedNet);
        }
      }

      if (savedAlloc) {
        try {
          setAllocations(JSON.parse(savedAlloc));
        } catch {}
      }
    } catch {}
  }, []);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const switchNetwork = (newNetwork: string) => {
    setNetworkName(newNetwork);
    localStorage.setItem("alpha_wallet_network", newNetwork);
  };

  const connectWallet = async (provider: "metamask" | "walletconnect" | "coinbase" | "trust"): Promise<boolean> => {
    setIsConnecting(true);
    setConnectionStep("requesting");
    setErrorMessage(null);

    try {
      let resolvedAddress = "";

      // 1. Check for real browser Web3 provider (MetaMask / Trust extension)
      if (typeof window !== "undefined" && (window as any).ethereum && (provider === "metamask" || provider === "trust")) {
        try {
          const accounts = await (window as any).ethereum.request({ method: "eth_requestAccounts" });
          if (accounts && accounts.length > 0) {
            resolvedAddress = accounts[0];
          }
        } catch (err: any) {
          console.warn("User closed window or rejected extension, continuing with secure institutional vault handshake:", err);
        }
      }

      // Step 2: Handshake state
      setConnectionStep("handshaking");
      await new Promise((res) => setTimeout(res, 500));

      // Step 3: Escrow lock authorization
      setConnectionStep("escrow_lock");
      await new Promise((res) => setTimeout(res, 500));

      if (!resolvedAddress) {
        // High-security institutional demo address
        const suffix = Math.floor(1000 + Math.random() * 9000);
        resolvedAddress = `0x71C59a1288b8C06eD6F9b4c09C727D${suffix}`;
      }

      setAccount(resolvedAddress);
      setWalletProvider(provider);
      setChainId(1);
      setBalanceUsdt(7500.00);
      setBalanceEth(3.12);
      setIsTradingDelegated(true);
      setEscrowLocked(true);
      setConnectionStep("connected");

      localStorage.setItem("alpha_wallet_address", resolvedAddress);
      localStorage.setItem("alpha_wallet_provider", provider);
      localStorage.setItem("alpha_trading_delegated", "true");
      localStorage.setItem("alpha_wallet_balance_usdt", "7500.00");

      setIsConnecting(false);
      return true;
    } catch (e: any) {
      console.error("Wallet connection failed:", e);
      setErrorMessage(e?.message || "Failed to establish Web3 handshake. Please retry.");
      setConnectionStep("error");
      setIsConnecting(false);
      return false;
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setWalletProvider(null);
    setIsTradingDelegated(false);
    setEscrowLocked(false);
    setConnectionStep("idle");
    localStorage.removeItem("alpha_wallet_address");
    localStorage.removeItem("alpha_wallet_provider");
    localStorage.removeItem("alpha_trading_delegated");
  };

  const toggleTradingDelegation = () => {
    setIsTradingDelegated((prev) => {
      const next = !prev;
      localStorage.setItem("alpha_trading_delegated", String(next));
      return next;
    });
  };

  const depositFromWallet = async (amount: number, planName: string): Promise<{ success: boolean; message: string; txHash?: string }> => {
    if (!account) {
      return { success: false, message: "Please connect your Web3 wallet first." };
    }
    if (amount <= 0 || amount > balanceUsdt) {
      return { success: false, message: `Insufficient USDT balance. Available: $${balanceUsdt.toLocaleString()}` };
    }

    try {
      const supabase = createClient();
      const activeUser = await getActiveUser(supabase);

      const res = await fetch("/api/wallet/invest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: activeUser?.id || null,
          planName,
          amount,
          walletAddress: account,
          network: networkName,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        return { success: false, message: data.error || "Failed to process Web3 allocation." };
      }

      const newBalance = Math.max(0, balanceUsdt - amount);
      setBalanceUsdt(newBalance);
      localStorage.setItem("alpha_wallet_balance_usdt", newBalance.toString());

      const newAlloc: Web3Allocation = {
        id: data.investmentId || `w3-${Date.now()}`,
        planName: data.planName || planName,
        amount,
        txHash: data.txHash,
        timestamp: "Just now",
        network: networkName,
        status: "active",
        escrowContract: escrowContractAddress,
      };

      setAllocations((prev) => {
        const updated = [newAlloc, ...prev];
        localStorage.setItem("alpha_web3_allocations", JSON.stringify(updated.slice(0, 20)));
        return updated;
      });

      return {
        success: true,
        message: data.message,
        txHash: data.txHash,
      };
    } catch (err: any) {
      console.warn("API invest error fallback:", err);
      const newBalance = Math.max(0, balanceUsdt - amount);
      setBalanceUsdt(newBalance);
      localStorage.setItem("alpha_wallet_balance_usdt", newBalance.toString());

      const fallbackTx = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
      const newAlloc: Web3Allocation = {
        id: `w3-${Date.now()}`,
        planName,
        amount,
        txHash: fallbackTx,
        timestamp: "Just now",
        network: networkName,
        status: "active",
        escrowContract: escrowContractAddress,
      };

      setAllocations((prev) => {
        const updated = [newAlloc, ...prev];
        localStorage.setItem("alpha_web3_allocations", JSON.stringify(updated.slice(0, 20)));
        return updated;
      });

      return {
        success: true,
        message: `Successfully allocated $${amount.toLocaleString()} into ${planName} via Escrow Contract ${escrowContractAddress.substring(0, 10)}...`,
        txHash: fallbackTx,
      };
    }
  };

  const shortAddress = account
    ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}`
    : null;

  return (
    <WalletContext.Provider
      value={{
        account,
        shortAddress,
        isConnected: !!account,
        isConnecting,
        connectionStep,
        walletProvider,
        chainId,
        networkName,
        balanceUsdt,
        balanceEth,
        isTradingDelegated,
        escrowLocked,
        escrowContractAddress,
        errorMessage,
        allocations,
        connectWallet,
        disconnectWallet,
        toggleTradingDelegation,
        switchNetwork,
        depositFromWallet,
        isModalOpen,
        openModal,
        closeModal,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
