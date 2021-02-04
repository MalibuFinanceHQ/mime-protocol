
import { MimeContext } from './context';
import { CopyTrader, CopyTrader__factory } from '../typechain';

export const getTraderContract = async (
  ctxt: MimeContext,
  copyTradingContractAddress: string,
): Promise<CopyTrader> => {
  const signer = ctxt.provider.getSigner(ctxt.account);
  const trader: CopyTrader = CopyTrader__factory.connect(
    copyTradingContractAddress,
    signer,
  );
  return trader;
};
