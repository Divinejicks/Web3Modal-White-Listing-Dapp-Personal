import './App.css';
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import WalletConnectProvider from "@walletconnect/web3-provider"; // downgrade react-scripts to 4.0.3 
import Web3Modal from "web3modal";
import { ethers } from 'ethers';
import { useState, useEffect } from 'react';
import Authereum from "authereum";
import {abi, whiteList_Contract_Address} from "./constants/constants";


function App() {
  const [web3Modal, setWeb3Modal] = useState(null);
  const [address, setAddress] = useState("")
  const [walletConnected, setWalletConnected] = useState(false);
  const [whiteListedAddress, setWhiteListedAddresses] = useState("");
  const [numberOfWhiteListedAddress, setNumberOfWhiteListedAddress] = useState(0);
 /*  const [ownerAddress, setOwnerAddress] = useState("");
  const [msgSender, setMsgSender] = useState(""); */

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
      cacheProvider: true,
      disableInjectedProvider: false,
      providerOptions
    });

    setWeb3Modal(newWeb3Modal);
  }, [])


  //if cachedProvider is set to true, this function will be usefull
  useEffect(() => {
    // connect automatically and without a popup if user is already connected
    if(web3Modal && web3Modal.cachedProvider){
      connectWallet()
      getNumberWhiteListedAddress()
    }
  }, [web3Modal])

  const clearCachedProvider = () => {
    if(web3Modal && web3Modal.cachedProvider){
      web3Modal.clearCachedProvider()
    }
  }

  const connectWallet = async () => {
    try{
      await getProviderOrSigner();
      setWalletConnected(true);
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

  const addToWhiteList = async () => {
    const signer = await getProviderOrSigner(true);
    const whiteListContract = new ethers.Contract(
      whiteList_Contract_Address,
      abi,
      signer
    );
    const tx = await whiteListContract.addAddressToWhiteList()
    await tx.wait();
  }

  const getWhiteListedAddress = async () => {
    const signer = await getProviderOrSigner(true); //we are using the signer here because we want to check against the owner else it will send the zeroth address
    const whiteListContract = new ethers.Contract(
      whiteList_Contract_Address,
      abi,
      signer
    );
    const whitelistedAddresses = await whiteListContract.getAllWhiteListedAddress();
      setWhiteListedAddresses(whitelistedAddresses);
  }

  const getNumberWhiteListedAddress = async () => {
    const provider = await getProviderOrSigner();
    const whiteListContract = new ethers.Contract(
      whiteList_Contract_Address,
      abi,
      provider
    );
    
    const num = await whiteListContract.getNumberOfWhiteListedAddresses();
    setNumberOfWhiteListedAddress(num.toNumber())
  }

  /* const getOwner = async () => {
    const provider = await getProviderOrSigner();
    const whiteListContract = new ethers.Contract(
      whiteList_Contract_Address,
      abi,
      provider
    );
    
    const owner = await whiteListContract.getOwner();
    setOwnerAddress(owner);
  }


  const getMsgSender = async () => {
    const provider = await getProviderOrSigner(true);
    const whiteListContract = new ethers.Contract(
      whiteList_Contract_Address,
      abi,
      provider
    );
    
    const owner = await whiteListContract.getMsgSender();
    setMsgSender(owner);
  } */

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

  const renderButton = () => {
    if(!walletConnected) {
      return (
        <>
          <button onClick={connectWallet}>Connect wallet</button>
          <button onClick={clearCachedProvider}>Clear Cached Provider</button>
        </>
      )
    } 
    else {
      return (
        <>
          <p>Wallet connected on the address {address}</p>
          <button onClick={addToWhiteList}>
            Add Address To WhiteList
          </button>
          <br />
          <button onClick={getWhiteListedAddress}>
            Get whitelisted addresses
          </button>
          <p>WhiteListed addresses are: {renderWhiteListedAddresses()}</p>

          {/* <button onClick={getNumberWhiteListedAddress}>
            Get number whitelisted addresses
          </button> */}
          <p>Number of WhiteListed address is: {numberOfWhiteListedAddress}/2</p>

          {/* <button onClick={getOwner}>
            Get Owner
          </button>
          <p>Owner's address is: {ownerAddress}</p>

          <button onClick={getMsgSender}>
            Get Msg Sender
          </button>
          <p>MsgSender's address is: {msgSender}</p> */}
        </>
      )
    }
  }

  const renderWhiteListedAddresses = () => {
    if(whiteListedAddress !== ""){
      let items = [];
      for(var i = 0; i < whiteListedAddress.length; i++) {
        items.push(<li key={whiteListedAddress[i]}>{whiteListedAddress[i]}</li>)
      }
      return(
        <>
          {items}
        </>
      )
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <p>Connect to web3 modal</p>
        {renderButton()}
      </header>
    </div>
  );
}

export default App;
