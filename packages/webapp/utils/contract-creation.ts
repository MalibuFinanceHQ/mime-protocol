import { ethers, Signer } from 'ethers';
import { MimeContext } from './context';
import { NewContractForm } from './types';
import {
    TradersFactory,
    TradersFactory__factory,
} from '../../contracts/typechain';


const getFactory = async (
    signer: Signer,
): Promise<TradersFactory> => {
    const { TRADERS_FACTORY_ADDRESS } = process.env;
    if (!TRADERS_FACTORY_ADDRESS) {
        throw new Error('TRADERS_FACTORY_ADDRESS is not set in env');
    }

    return TradersFactory__factory.connect(TRADERS_FACTORY_ADDRESS, signer)

};

export const createCopyTradingContract = async (
    { followedAddr, strategyName }: NewContractForm,
    ctxt: MimeContext,
): Promise<void> => {
    // const factory = await getFactory(ctxt.provider);
    console.log(
        `#createCopyTradingContract following "${followedAddr}", strategy "${strategyName}"`,
    );
    console.log('w/ ctxt', ctxt);
};
