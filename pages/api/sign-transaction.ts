import type { NextApiRequest, NextApiResponse } from "next";
import { AppWallet, Transaction, BlockfrostProvider } from "@martifylabs/mesh";
import { demoMnemonic } from "../../config/wallet";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const assetName = req.body.assetName;
  const signedTx = req.body.signedTx;
  const originalMetadata = req.body.originalMetadata;

  const blockchainProvider = new BlockfrostProvider(
    process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY!
  );

  const appWallet = new AppWallet({
    networkId: 0,
    fetcher: blockchainProvider,
    submitter: blockchainProvider,
    key: {
      type: "mnemonic",
      words: demoMnemonic,
    },
  });

  /**
   * todo: Here you want to retrieve the `originalMetadata` from database with the `assetName`
   */

  const signedOriginalTx = Transaction.writeMetadata(
    signedTx,
    originalMetadata
  );

  const appWalletSignedTx = await appWallet.signTx(signedOriginalTx, true);

  const txHash = await appWallet.submitTx(appWalletSignedTx);

  res.status(200).json({ txHash });
}
