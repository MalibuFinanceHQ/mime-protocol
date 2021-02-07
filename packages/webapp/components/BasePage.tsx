import React, { useState, useEffect } from 'react';
import detectEthereumProvider from '@metamask/detect-provider';
import { ethers } from 'ethers';
import { BaseStyles } from 'rimble-ui';
import Header from '../components/Header';
import MetaMaskAuth from '../components/MetaMaskAuth';
import Context, { defaultCtxt } from '../utils/context';
import PropTypes, { InferProps } from 'prop-types';
import { CopyTradingContract } from '../utils/types';

export default function BasePage({
    children,
}: InferProps<typeof props>): JSX.Element {
    const [ctxt, setCtxt] = useState(defaultCtxt);

    const initProvider = async () => {
        const metamaskEthereumProvider = await detectEthereumProvider();
        const provider = new ethers.providers.Web3Provider(
            metamaskEthereumProvider,
            'any', // Allows spontaneous network changes
        );

        (metamaskEthereumProvider as ethers.providers.Provider).on(
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

    const fetchCopyTradingContracts = async () => {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/contracts?address=${ctxt.account}`,
        );
        // TODO: handle errors
        if (!response.ok) return;
        const contracts: CopyTradingContract[] = await response.json();
        console.log(
            `Fetched contracts from account ${ctxt.account}`,
            contracts,
        );
        setCtxt({
            ...ctxt,
            contracts,
        });
    };

    useEffect(() => {
        let _timeout: NodeJS.Timeout;
        if (ctxt.account) {
            fetchCopyTradingContracts();
            _timeout = setInterval(fetchCopyTradingContracts, 3 * 1000);
        } else initProvider();
        return () => clearInterval(_timeout);
    }, [ctxt.account]);

    return (
        <Context.Provider value={ctxt}>
            <BaseStyles>
                <Header />
                <MetaMaskAuth setUserAccount={setUserAccount} />
                {children}
            </BaseStyles>
        </Context.Provider>
    );
}

const props = {
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node,
    ]).isRequired,
};
