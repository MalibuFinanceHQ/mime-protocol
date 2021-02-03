import React, { useContext } from 'react';
import ConnectionBanner from '@rimble/connection-banner';
import { Flex, Box, MetaMaskButton } from 'rimble-ui';
import PropTypes, { InferProps } from 'prop-types';
import Context from '../utils/context';
import Avatar from './Avatar';

export default function MetaMaskAuth({
    setUserAccount,
}: InferProps<typeof props>): JSX.Element {
    const ctxt = useContext(Context);
    const { provider, account } = ctxt;

    const handleConnect = async () => {
        try {
            if (!provider) return;
            const [_account] = await provider.send('eth_requestAccounts', []);

            setUserAccount(_account);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <>
            <Box maxWidth="640px" mx="auto" p={3}>
                {provider ? (
                    <ConnectionBanner
                        currentNetwork={ctxt.currentNetworkId}
                        requiredNetwork={ctxt.requiredNetworkId}
                        onWeb3Fallback={false}
                    />
                ) : null}
            </Box>
            <Flex justifyContent="center">
                {account ? (
                    <Avatar address={account} />
                ) : (
                    <MetaMaskButton onClick={handleConnect}>
                        Connect with MetaMask
                    </MetaMaskButton>
                )}
            </Flex>
        </>
    );
}

const props = {
    setUserAccount: PropTypes.func,
};
