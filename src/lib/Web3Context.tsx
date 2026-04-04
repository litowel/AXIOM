import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BrowserProvider, formatEther } from 'ethers';

interface Web3State {
  address: string | null;
  balance: string | null;
  chainId: bigint | null;
  connect: () => Promise<void>;
  provider: BrowserProvider | null;
}

const Web3Context = createContext<Web3State>({} as Web3State);

export function Web3Provider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [chainId, setChainId] = useState<bigint | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);

  const connect = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const browserProvider = new BrowserProvider(window.ethereum);
        await browserProvider.send("eth_requestAccounts", []);
        const signer = await browserProvider.getSigner();
        const addr = await signer.getAddress();
        const bal = await browserProvider.getBalance(addr);
        const network = await browserProvider.getNetwork();
        
        setProvider(browserProvider);
        setAddress(addr);
        setBalance(formatEther(bal));
        setChainId(network.chainId);
      } catch (err) {
        console.error(err);
      }
    } else {
      alert('Please install MetaMask or another Web3 wallet to use this feature.');
    }
  };

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', () => {
        window.location.reload();
      });
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, []);

  return (
    <Web3Context.Provider value={{ address, balance, chainId, connect, provider }}>
      {children}
    </Web3Context.Provider>
  );
}

export const useWeb3 = () => useContext(Web3Context);
