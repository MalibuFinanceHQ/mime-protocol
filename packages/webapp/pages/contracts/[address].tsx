import React, { useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Context from '../../utils/context';
import { Box } from 'rimble-ui';
import { getTraderContract } from '../../utils/follow';
import ContractInfo from '../../components/contract/edit/ContractInfo';
import ContractPools from '../../components/contract/edit/ContractPools';

export default function Contract(): JSX.Element {
    const router = useRouter();
    const { address } = router.query;
    const ctxt = useContext(Context);
    const [contract, setContract] = useState(null);
    const [observedAddress, setObservedAddress] = useState('');

    const initContract = async () => {
        if (!ctxt.provider || !address) return null;
        const trader = await getTraderContract(ctxt, address as string);
        // console.log('Contract', trader);
        setContract(trader);
        const followedTrader = await trader.followedTrader();
        setObservedAddress(followedTrader);
    };

    useEffect(() => {
        if (!contract && address) initContract();
    }, [address, ctxt]);

    return (
        <Box>
            <ContractInfo
                contract={contract}
                address={address as string}
                observedAddress={observedAddress}
                updateObservedAddress={(newAddr) => setObservedAddress(newAddr)}
            />
            <ContractPools contract={contract} />
        </Box>
    );
}
