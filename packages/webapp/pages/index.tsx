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
        if (!accounts.length) window?.localStorage?.removeItem('account');
        else {
          window?.localStorage?.setItem('account', accounts[0]);
          setUserAccount(accounts[0]);
        }
      },
    );

    provider.on('network', (_, oldNetwork) => {
      if (oldNetwork) {
        // Questionable
        window?.localStorage?.removeItem('account');
        window.location.reload();
      }
    });
    const network = await provider.getNetwork();
    setCtxt({
      ...ctxt,
      provider,
      currentNetworkId: network.chainId,
    });
  };

  const setUserAccount = (account: string) => {
    window?.localStorage?.setItem('account', account);
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
