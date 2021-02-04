import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Box, Card, Heading, Text, EthAddress, Icon } from 'rimble-ui';
import BasePage from '../../components/BasePage';
import ContractEditForm from '../../components/contract/edit/Form';

export default function Contract(): JSX.Element {
    const router = useRouter();
    const { address } = router.query;

    return (
        <BasePage>
            <Card width={'auto'} mt={25} mx={'auto'} px={[3, 3, 4]}>
                <Link href="/">
                    <Icon
                        name={'ArrowBack'}
                        mr={2}
                        style={{ cursor: 'pointer' }}
                    />
                </Link>
                <Heading mt={25}>Edit</Heading>
                <Box>
                    <Text>Contract address</Text>
                    {address ? <EthAddress address={address} /> : ''}
                </Box>

                {address ? (
                    <ContractEditForm address={address as string} />
                ) : (
                    ''
                )}
            </Card>
        </BasePage>
    );
}
