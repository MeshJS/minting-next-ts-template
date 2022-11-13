import type { NextApiRequest, NextApiResponse } from "next";
import {
  AppWallet,
  ForgeScript,
  Transaction,
  BlockfrostProvider,
  largestFirst,
} from "@martifylabs/mesh";
import type { Mint } from "@martifylabs/mesh";
import { demoMnemonic } from "../../config/wallet";
import {
  assetsMetadata,
  bankWalletAddress,
  costLovelace,
} from "../../config/mint";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const recipientAddress = req.body.recipientAddress;
  const utxos = req.body.utxos;

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

  const appWalletAddress = appWallet.getPaymentAddress();
  const forgingScript = ForgeScript.withOneSignature(appWalletAddress);

  /**
   * todo: Here you want to select one of your NFT that has not been minted
   */

  // In this starter template, we simply randomly pick one from.
  const assetIdPrefix = "MeshToken";
  let selectedAssetId = Math.floor(Math.random() * 10).toString();
  const assetMetadata = assetsMetadata[selectedAssetId];
  const assetName = `${assetIdPrefix}${selectedAssetId}`;

  const asset: Mint = {
    assetName: assetName,
    assetQuantity: "1",
    metadata: assetMetadata,
    label: "721",
    recipient: {
      address: recipientAddress,
    },
  };

  const selectedUtxos = largestFirst(costLovelace, utxos, true);

  const tx = new Transaction({ initiator: appWallet });
  tx.setTxInputs(selectedUtxos);
  tx.mintAsset(forgingScript, asset);
  tx.sendLovelace(bankWalletAddress, costLovelace);
  tx.setChangeAddress(recipientAddress);

  const unsignedTx = await tx.build();

  const originalMetadata = Transaction.readMetadata(unsignedTx);

  /**
   * todo: Here you want to save the `originalMetadata` in a database with the `assetName`
   */

  const maskedTx = Transaction.maskMetadata(unsignedTx);

  // In this starter template, we send `originalMetadata` to the frontend.
  // Not recommended, its better to save the `originalMetadata` in a database.
  res.status(200).json({ assetName, maskedTx, originalMetadata });
}
