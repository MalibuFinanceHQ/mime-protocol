import React from 'react';
import PropTypes, { InferProps } from 'prop-types';
import { Card, Text, Icon } from 'rimble-ui';
import UserContractsTable from './UserContractsTable';

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
            <UserContractsTable contractsList={contractsList} />
        </Card>
    );
};

const props = {
    contractsList: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default UserContractsList;
