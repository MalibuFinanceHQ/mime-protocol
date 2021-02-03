import React from 'react';
import PropTypes, { InferProps } from 'prop-types';
import { Table } from 'rimble-ui';

const UserContractsTable = ({
    contractsList = [],
}: InferProps<typeof props>): JSX.Element => {
    return (
        <Table>
            <thead>
                <tr>
                    <th>Contract address</th>
                    <th>Followed address</th>
                    <th>Strategy</th>
                    <th>Copied transactions</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                {contractsList.map(
                    ({
                        address,
                        followedTrader,
                        strategy,
                        copiedTxns,
                        status,
                    }) => (
                        <tr key={address}>
                            <td>{address}</td>
                            <td>{followedTrader}</td>
                            <td>{strategy}</td>
                            <td>{copiedTxns}</td>
                            <td>{status}</td>
                        </tr>
                    ),
                )}
            </tbody>
        </Table>
    );
};

const props = {
    contractsList: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default UserContractsTable;
