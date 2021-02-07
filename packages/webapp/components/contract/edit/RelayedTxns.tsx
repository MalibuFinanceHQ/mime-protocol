import React from 'react';
import PropTypes, { InferProps } from 'prop-types';
import { Box, Table, Heading, Link } from 'rimble-ui';
import { TransactionRow } from '../../../utils/types';

const RelayedTxns = ({
    txnsList = [],
}: InferProps<typeof props>): JSX.Element => {
    return (
        <Box>
            <Heading mt={25}>Relayed Transactions</Heading>
            <Table mt={25}>
                <thead>
                    <tr>
                        <th>Transaction hash</th>
                        <th>Base transaction hash</th>
                    </tr>
                </thead>
                <tbody>
                    {txnsList.map(({ txHash, baseTxHash }: TransactionRow) => (
                        <tr key={txHash}>
                            <td>
                                <Link
                                    href={`https://kovan.etherscan.io/tx/${txHash}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    title="View on Etherscan"
                                    style={{ textDecoration: 'underline' }}
                                >
                                    {txHash}
                                </Link>
                            </td>
                            <td>
                                <Link
                                    href={`https://kovan.etherscan.io/tx/${baseTxHash}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    title="View on Etherscan"
                                    style={{ textDecoration: 'underline' }}
                                >
                                    {baseTxHash}
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Box>
    );
};

const props = {
    txnsList: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default RelayedTxns;
