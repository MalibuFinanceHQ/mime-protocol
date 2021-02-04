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
        '0xEE8EF3127A34bdb689a58B07354852daBb7C9c5d',
        // tradingStrategy.address,
    );
    return tx;
};
