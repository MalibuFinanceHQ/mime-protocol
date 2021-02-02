import { ethers } from 'ethers';
import { MimeContext } from './context';
import { NewContractForm } from './types';
import {
    TradersFactory,
    TradersFactory__factory,
} from '../../contracts/typechain';

let FACTORY;

const getFactory = async (
    provider: ethers.providers.Web3Provider,
): Promise<ethers.Contract> => {
    const { TRADERS_FACTORY_ADDRESS } = process.env;
    if (!TRADERS_FACTORY_ADDRESS) {
        throw new Error('TRADERS_FACTORY_ADDRESS is not set in env');
    }
    // if (!FACTORY) {
    //     FACTORY = // TODO: get the factory
    // }
    return FACTORY;
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
