import React, { useState, useEffect } from 'react';
import detectEthereumProvider from '@metamask/detect-provider';
import { ethers } from 'ethers';
import Header from '../components/Header';
import MetaMaskAuth from '../components/MetaMaskAuth';
import Context, { defaultCtxt } from '../utils/context';

export default function Home() {
  const [ctxt, setCtxt] = useState(defaultCtxt);

  const initProvider = async () => {
    const metamaskEthereumProvider: any = await detectEthereumProvider();
    const provider = new ethers.providers.Web3Provider(
      metamaskEthereumProvider,
      'any', // Allows spontaneous network changes
    );

    metamaskEthereumProvider.on(
      'accountsChanged',
      (accounts: Array<string>) => {
        console.log('accountsChanged', accounts);
        setUserAccount(accounts[0]);
      },
    );

    provider.on('network', (_, oldNetwork) => {
      if (oldNetwork) {
        window.location.reload();
      }
    });
    const network = await provider.getNetwork();

    const accounts = await provider.listAccounts();
    setCtxt({
      ...ctxt,
      provider,
      currentNetworkId: network.chainId,
      account: accounts.length > 0 ? accounts[0] : null,
    });
  };

  const setUserAccount = (account: string) => {
    setCtxt({
      ...ctxt,
      account,
    });
  };

  useEffect(() => {
    initProvider();
  }, []);

  return (
    <Context.Provider value={ctxt}>
      <Header />
      <MetaMaskAuth setUserAccount={setUserAccount} />
    </Context.Provider>
  );
}
