import './App.css';
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import WalletConnectProvider from "@walletconnect/web3-provider"; // downgrade react-scripts to 4.0.3 
import Web3Modal from "web3modal";
import { ethers } from 'ethers';
import { useState, useEffect } from 'react';
import Authereum from "authereum";


function App() {
  const [web3Modal, setWeb3Modal] = useState(null);
  const [address, setAddress] = useState("")

  useEffect(() => {
    const providerOptions = { 
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          infuraId: "eaec93be8408460eaadf081fbab158ef"
        }
      },
      coinbasewallet: {
        package: CoinbaseWalletSDK,
        options: {
          appName: "My Web 3 modal app",
          infuraId: "eaec93be8408460eaadf081fbab158ef"
        }
      },
      authereum: {
        package: Authereum // required
      }
    }

    const newWeb3Modal = new Web3Modal({
      network: "rinkeby",
      cacheProvider: false,
      disableInjectedProvider: false,
      providerOptions
    });

    setWeb3Modal(newWeb3Modal);
  }, [])


  //if cachedProvider is set to true, this function will be usefull
  /* useEffect(() => {
    // connect automatically and without a popup if user is already connected
    if(web3Modal && web3Modal.cachedProvider){
      connectWallet()
    }
  }, [web3Modal]) */


  const connectWallet = async () => {
    try{
      await getProviderOrSigner();
    }catch(err) {
      console.log(err)
    }
  }

  const getProviderOrSigner = async (IsSigner = false) => {
    const web3Instance = await web3Modal.connect();
    addListeners(web3Instance);
    const provider = new ethers.providers.Web3Provider(web3Instance);

    const { chainId } = await provider.getNetwork();
    if(chainId !== 4){
      window.alert("Change to Rinkeby network");
      throw new Error("Change to Rinkeby network")
    }

    setAddress(await provider.getSigner().getAddress())

    if(IsSigner){
      const signer = await provider.getSigner();
      return signer;
    }
    return provider;
  }

  const addListeners = async (web3ModalProvider) => {
    web3ModalProvider.on("accountsChanged", (accounts) => {
      window.location.reload()
    });

    // Subscribe to chainId change
    web3ModalProvider.on("chainChanged", (chainId) => {
      console.log("chainId: ", chainId)
      if(chainId !== "0x4"){
        alert("Connect to rinkeby")
        return
      }
    });
  }

  return (
    <div className="App">
      <header className="App-header">
        <p>Connect to web3 modal</p>
        <button onClick={connectWallet}>Connect wallet</button>
        <p>{address}</p>
      </header>
    </div>
  );
}

export default App;
