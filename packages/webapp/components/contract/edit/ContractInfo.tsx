import React, { useEffect, useState } from 'react';
import PropTypes, { InferProps } from 'prop-types';
import Link from 'next/link';
import { Loader, Box, Card, Heading, Text, EthAddress, Icon } from 'rimble-ui';
import ContractEditForm from './Form';
import RelayedTxns from './RelayedTxns';
import { CopyTrader } from '../../../typechain';

// Mock data
const TXNS_LIST = [
    {
        hash:
            '0x9e88919ccb4f6db5a33c8c10cedd7f034332a348563ed0af9882c16b68f8c863',
        to: '0x00',
        created: 'Today',
    },
    {
        hash:
            '0x9e88919ccb4f6db5a33c8c10cedd7f034332a348563ed0af9882c16b68f8c864',
        to: '0x01',
        created: 'Yesterday',
    },
    {
        hash:
            '0x9e88919ccb4f6db5a33c8c10cedd7f034332a348563ed0af9882c16b68f8c865',
        to: '0x02',
        created: '2 days ago',
    },
];

const ContractInfo = ({
    contract,
    address,
    observedAddress,
    updateObservedAddress,
}: InferProps<typeof props>): JSX.Element => {
    const [strategyAddress, setStrategyAddress] = useState('');

    const fetchStrategyAddress = async () => {
        const addr = await (contract as CopyTrader).tradingStrategy();
        console.log('contract strategy', addr);
        setStrategyAddress(addr);
    };

    useEffect(() => {
        if (contract && !strategyAddress) fetchStrategyAddress();
    }, [contract, strategyAddress]);

    return (
        <Card width={'auto'} mt={25} mx={'auto'} px={[3, 3, 4]}>
            <Link href="/">
                <Icon name="ArrowBack" mr={2} style={{ cursor: 'pointer' }} />
            </Link>
            <Heading mt={25}>Edit</Heading>
            {contract && address && observedAddress ? (
                <Box mt={25}>
                    <Box>
                        <Text>Contract address</Text>
                        <EthAddress address={address} />
                    </Box>
                    <Box mt={25}>
                        <Text>Strategy address</Text>
                        <EthAddress address={strategyAddress} />
                    </Box>
                    <ContractEditForm
                        contract={contract}
                        observedAddres={observedAddress}
                        updateObservedAddress={updateObservedAddress}
                    />
                    <RelayedTxns txnsList={TXNS_LIST} />
                </Box>
            ) : (
                <Box>
                    <Loader mt={25} size={80} mx="auto" />
                    <Heading mt={25} size={80} mx="auto">
                        Loading contract...
                    </Heading>
                </Box>
            )}
        </Card>
    );
};

const props = {
    contract: PropTypes.object.isRequired,
    address: PropTypes.string.isRequired,
    observedAddress: PropTypes.string.isRequired,
    updateObservedAddress: PropTypes.func.isRequired,
};

export default ContractInfo;
