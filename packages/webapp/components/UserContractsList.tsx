import React from 'react';
import PropTypes, { InferProps } from 'prop-types';
import { Card, Text, Icon } from 'rimble-ui';
import UserContractsTable from './UserContractsTable';

// Mock data
const CONTRACTS_LIST = [
    {
        address: '0x00',
        strategy: '0x01',
        followedTrader: '0x02',
        copiedTxns: 0,
        status: 'Deployed',
    },
    {
        address: '0x01',
        strategy: '0x02',
        followedTrader: '0x03',
        copiedTxns: 0,
        status: 'Pending',
    },
    {
        address: '0x02',
        strategy: '0x03',
        followedTrader: '0x04',
        copiedTxns: 0,
        status: 'Deployed',
    },
];

const UserContractsList = ({
    contractsList,
}: InferProps<typeof props>): JSX.Element => {
    return (
        <Card width={'auto'} mx={'auto'} px={[3, 3, 4]}>
            <Text
                caps
                fontSize={0}
                fontWeight={4}
                mb={3}
                display={'flex'}
                alignItems={'center'}
            >
                <Icon name={'Eth'} mr={2} />
                Your Mime contracts:
            </Text>
            <UserContractsTable contractsList={CONTRACTS_LIST} />
        </Card>
    );
};

const props = {
    contractsList: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default UserContractsList;
