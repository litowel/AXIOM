import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BrowserProvider, formatEther, formatUnits, Contract, toBeHex } from 'ethers';
import { ADDRESSES, ERC20_ABI, SUPPORTED_CHAINS } from './contracts';

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface Web3State {
  address: string | null;
  balance: string | null;
  usdcBalance: string | null;
  aaveDeposit: string | null;
  aaveDebt: string | null;
  chainId: bigint | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: (chainId: bigint) => Promise<void>;
  provider: BrowserProvider | null;
}

const Web3Context = createContext<Web3State>({} as Web3State);

export function Web3Provider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [usdcBalance, setUsdcBalance] = useState<string | null>(null);
  const [aaveDeposit, setAaveDeposit] = useState<string | null>(null);
  const [aaveDebt, setAaveDebt] = useState<string | null>(null);
  const [chainId, setChainId] = useState<bigint | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);

  const fetchBalances = async (prov: BrowserProvider, acc: string, chain: bigint) => {
    try {
      const bal = await prov.getBalance(acc);
      setBalance(formatEther(bal));

      if (chain === SUPPORTED_CHAINS.BASE_SEPOLIA) {
        const usdcContract = new Contract(ADDRESSES.BASE_SEPOLIA.USDC, ERC20_ABI, prov);
        const aUsdcContract = new Contract(ADDRESSES.BASE_SEPOLIA.A_USDC, ERC20_ABI, prov);
        const vDebtUsdcContract = new Contract(ADDRESSES.BASE_SEPOLIA.V_DEBT_USDC, ERC20_ABI, prov);

        const [usdcBal, aUsdcBal, vDebtBal] = await Promise.all([
          usdcContract.balanceOf(acc),
          aUsdcContract.balanceOf(acc),
          vDebtUsdcContract.balanceOf(acc)
        ]);

        setUsdcBalance(formatUnits(usdcBal, 6));
        setAaveDeposit(formatUnits(aUsdcBal, 6));
        setAaveDebt(formatUnits(vDebtBal, 6));
      } else {
        setUsdcBalance(null);
        setAaveDeposit(null);
        setAaveDebt(null);
      }
    } catch (error) {
      console.error("Error fetching balances:", error);
    }
  };

  const connect = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const browserProvider = new BrowserProvider(window.ethereum);
        await browserProvider.send("eth_requestAccounts", []);
        const signer = await browserProvider.getSigner();
        const addr = await signer.getAddress();
        const network = await browserProvider.getNetwork();
        
        setProvider(browserProvider);
        setAddress(addr);
        setChainId(network.chainId);
        
        await fetchBalances(browserProvider, addr, network.chainId);
      } catch (err) {
        console.error(err);
      }
    } else {
      alert('Please install MetaMask or another Web3 wallet to use this feature.');
    }
  };

  const disconnect = () => {
    setAddress(null);
    setBalance(null);
    setUsdcBalance(null);
    setAaveDeposit(null);
    setAaveDebt(null);
    setChainId(null);
    setProvider(null);
  };

  const switchNetwork = async (targetChainId: bigint) => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: toBeHex(targetChainId) }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902 && targetChainId === SUPPORTED_CHAINS.BASE_SEPOLIA) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: toBeHex(targetChainId),
                chainName: 'Base Sepolia Testnet',
                rpcUrls: ['https://sepolia.base.org'],
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
                blockExplorerUrls: ['https://sepolia.basescan.org'],
              },
            ],
          });
        } catch (addError) {
          console.error('Failed to add network:', addError);
        }
      } else {
        console.error('Failed to switch network:', switchError);
      }
    }
  };

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect();
        } else {
          setAddress(accounts[0]);
          if (provider && chainId) fetchBalances(provider, accounts[0], chainId);
        }
      });
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, [provider, chainId]);

  return (
    <Web3Context.Provider value={{ address, balance, usdcBalance, aaveDeposit, aaveDebt, chainId, connect, disconnect, switchNetwork, provider }}>
      {children}
    </Web3Context.Provider>
  );
}

export const useWeb3 = () => useContext(Web3Context);
