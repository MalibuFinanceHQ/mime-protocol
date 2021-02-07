import { ContractTransaction, Signer } from 'ethers';
import { MimeContext } from './context';
import { NewContractForm } from './types';
import {
    TradersFactory,
    TradersFactory__factory,
    TradingStrategy,
    TradingStrategy__factory,
} from '../typechain';

const getFactory = async (signer: Signer): Promise<TradersFactory> => {
    const { NEXT_PUBLIC_TRADERS_FACTORY_ADDRESS } = process.env;
    if (!NEXT_PUBLIC_TRADERS_FACTORY_ADDRESS) {
        throw new Error(
            'NEXT_PUBLIC_TRADERS_FACTORY_ADDRESS is not set in env',
        );
    }

    return TradersFactory__factory.connect(
        NEXT_PUBLIC_TRADERS_FACTORY_ADDRESS,
        signer,
    );
};

export const createTradingStrategy = async (
    signer: Signer,
): Promise<TradingStrategy> => {
    return new TradingStrategy__factory(signer).deploy();
};

export const createCopyTradingContract = async (
    { followedAddr, strategyName }: NewContractForm,
    ctxt: MimeContext,
): Promise<ContractTransaction> => {
    const signer = ctxt.provider.getSigner(ctxt.account);
    const factory = await getFactory(signer);

    console.log(
        `#createCopyTradingContract following "${followedAddr}", strategy "${strategyName}"`,
    );
    console.log('w/ ctxt', ctxt);
    // const tradingStrategy = await createTradingStrategy(signer);
    // console.log('tradingStrategy', tradingStrategy);
    const tx = await factory.createNew(
        followedAddr,
        0,
        '0xFC170a1907dB0CEDc39000a9755D13E26525CB3a',
        // tradingStrategy.address,
    );
    return tx;
};
