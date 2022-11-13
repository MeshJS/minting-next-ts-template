import { useEffect, useState } from "react";

import { BrowserWallet } from "@martifylabs/mesh";
import type { Wallet } from "@martifylabs/mesh";
import useWallet from "../contexts/wallet";

export default function ConnectWallet({
  classNameButton,
  classNameLabel,
}: {
  classNameButton?: string;
  classNameLabel?: string;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [availableWallets, setAvailableWallets] = useState<
    Wallet[] | undefined
  >(undefined);
  const { walletNameConnected, connecting, connectWallet, walletConnected } =
    useWallet();

  useEffect(() => {
    async function init() {
      setAvailableWallets(BrowserWallet.getInstalledWallets());
    }
    init();
  }, []);

  function toggleMenu() {
    setShowMenu(!showMenu);
  }

  let buttonClasses = `inline-flex justify-center rounded-md border border-gray-100 bg-white bg-opacity-0 px-4 py-2 text-sm font-medium shadow-sm hover:bg-opacity-20 bg-white/[.06] backdrop-blur w-60`;
  if (classNameButton) {
    buttonClasses = classNameButton;
  }

  let labelClasses = `text-white font-normal	hover:font-bold`;
  if (classNameLabel) {
    labelClasses = classNameLabel;
  }

  return (
    <>
      <div
        onMouseEnter={() => setShowMenu(true)}
        onMouseLeave={() => setShowMenu(false)}
      >
        <button
          className={buttonClasses}
          type="button"
          onClick={() => toggleMenu()}
        >
          {walletConnected
            ? `Connected: ${walletNameConnected}`
            : "Connect Wallet"}

          <svg
            className="ml-2 w-4 h-4"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            ></path>
          </svg>
        </button>
        <div
          className={`${
            !showMenu && "hidden"
          } z-10 absolute grid grid-cols-1 ${buttonClasses}`}
        >
          {availableWallets?.map((wallet, i) => {
            return (
              <button
                key={i}
                onClick={() => {
                  connectWallet(wallet.name);
                  setShowMenu(false);
                }}
                className={`flex justify-evenly items-start p-2 w-full`}
              >
                <div className="flex-none">
                  <img src={wallet.icon} className="h-7 mr-4" />
                </div>
                <div
                  className={`flex-1 flex justify-start items-center h-full ${labelClasses}`}
                >
                  <span>{wallet.name}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
