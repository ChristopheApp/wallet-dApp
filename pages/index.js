import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'

import chainsId from '../public/chains.json'

import { useState, useCallback, useEffect } from 'react'

import Erc20Abi from "../contracts/wcs-contract.json"

import Web3 from 'web3';


export default function Home() {

  const [web3] = useState(new Web3(Web3.givenProvider || "ws://localhost:8545"));
  const [isConnectedWeb3, setIsConnectedWeb3] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [balance, setBalance] = useState(0);

  const [networkId, setNetworkId] = useState(0);
  const [network, setNetwork] = useState({});

  const [ethToSend, setEthToSend] = useState(0)
  const [addressToSend, setAddressToSend] = useState("")

  const [amount2, setAmount2] = useState(0)
  const [address2, setAddress2] = useState("")

  const [contracts, setContracts] = useState({})

  const [tokenAddress, setTokenAddress] = useState("")
  const [token, setToken] = useState({})

  // const [addressContract, setAddressContract] = useState("")
  // const [tokens, setTokens] = useState([]);

  const connectToWeb3 = useCallback(
    async () => {
      if(window.ethereum) {
        try {
          await window.ethereum.request({method: 'eth_requestAccounts'})

          setIsConnectedWeb3(true)
         web3.eth.net.getId()
         .then(setNetworkId)
         
        } catch (err) {
          console.error(err)
        }
      } else {
        alert("Install Metamask")
      }
    }
  )

  useEffect( async () => {

    if(window.ethereum) {
      console.log(window.ethereum)

      let myAccounts =0; let myId=0;
      let myNetwork = {}; let myBalance=0;
      try {
        setIsConnectedWeb3(true)

        myAccounts = await window.ethereum.request({method: 'eth_requestAccounts'})
        myBalance = await web3.eth.getBalance(myAccounts[0])
        myId = await web3.eth.net.getId()

      } catch (err) {
        console.error(err)
      }

      setAccounts(myAccounts);
      setNetworkId(myId)
      setBalance(myBalance)


      chainsId.forEach(network => {
        if(myId == network.chainId){ 
          setNetwork(network);
          myNetwork = network;
          }          
      })

      console.log(myNetwork)
      console.log(accounts)
        //setUptoken(myAccounts[0]);
      
    } 
  }, [])

  useEffect(() => {
    if(tokenAddress !== "") {
      const erc20Contract = new web3.eth.Contract(
        Erc20Abi,
        tokenAddress
      )

      const getErc20Info = async () => {
        try {

          const name = await erc20Contract.methods.name().call()
          const balance = await erc20Contract.methods.balanceOf(accounts[0]).call()
          const symbol = await erc20Contract.methods.symbol().call()

          setToken({
            name: name,
            balance: balance,
            symbol: symbol
          })
          
        } catch(err) {
          alert("The contract address is not valid.")
        }
      }
      getErc20Info();
    }
  }, [tokenAddress, accounts])

  // Get balance du new contract
  // useEffect(async () => {
  //   if(contracts) {

  //     console.log(contracts)
  //     let balance = await contracts.contract.methods.balanceOf(accounts[0]).call();
  //     console.log(balance)
  //     let myContract = contracts
  //     myContract.token.balance = balance
  //     setContracts(myContract)
  //   }
  // },[contracts] )

  // const setUptoken = async(address) => {
  //   const myContract = new web3.eth.Contract(Erc20Abi, "0x67BeF77Fef6D7bbF0fE14723E017c2fda1634Ef8")
  //   console.log(myContract)
    
  //   let myToken = {};
  //   myToken.name = await myContract.methods.name().call();
  //   myToken.symbol = await myContract.methods.symbol().call();
  //   myToken.balance = await myContract.methods.balanceOf(address).call();
  //   console.log(myToken)

  //   setContracts({
  //     contract: myContract,
  //     token: myToken
  //   })

  // }



  // Changement de compte - reseau
  useEffect(async () => {
    const getAccounts = async () => setAccounts(await web3.eth.getAccounts());
    const getBalance = async () => setBalance(await web3.eth.getBalance(web3.eth.defaultAccount));

    const getNetwork= async () => {

      let myId = await web3.eth.net.getId();
      
      chainsId.forEach(network => {
        if(myId == network.chainId){ 
          setNetwork(network);
          }          
      })
    }
    /**
     * @description Detect if account changed on Metamask, and the data (network accounts and balance)
    */
  window.ethereum.on('accountsChanged', (accounts) => {
    // Handle the new accounts, or lack thereof.
    // "accounts" will always be an array, but it can be empty.
    if (web3.eth.defaultAccount !== accounts[0]) {
      web3.eth.defaultAccount = accounts[0];
      getAccounts()
      getNetwork()
      // too many repeat
      if(web3.eth.defaultAccount)
        getBalance();
    }
    console.log("You have changed your account !",  accounts[0])
  })

  /**
     * @description Detect if network change and update the data
     */
   window.ethereum.on('chainChanged', (chainId) => {
    getNetwork()
    // to many repeat

    if(web3.eth.defaultAccount)
      getBalance();

    console.log("You have changed network", chainId, accounts[0])
  })

  }, [web3, accounts, network])
 




  function weiToEth(wei) {
    if(network.nativeCurrency)
      return wei / Math.pow(10, network.nativeCurrency.decimals);
    else
    return wei
  }

  function ethToWei(eth) {
    if(network.nativeCurrency)
      return eth * Math.pow(10, network.nativeCurrency.decimals);
    else
      return wei
  }

  const sendToken = useCallback(
    async () => {
      web3.eth.sendTransaction({
        from: accounts[0],
        to: addressToSend,
        value: ethToWei(ethToSend)
      })
      .once('transactionHash', function(hash){
        console.log(hash)
      })
      .once('confirmation', function() {
        console.log("Transaction confirmed");
      })
    }, [accounts, addressToSend, ethToSend]
  );

  const transferToken = () => {
    const erc20Contract = new web3.eth.Contract(
      Erc20Abi,
      tokenAddress
    )

    const sendErc20 = async () => {
      try {
        
        // METHODE TRANSFER
        const receipt = await erc20Contract.methods.transfer(address2, web3.utils.toWei(amount2)).send({from: accounts[0]});
      } catch (error) {
        alert("error send.")
      }
    }

    sendErc20()
    
  }

  const addToken = () => {
    console.log("addToken")
    //setTokens([...tokens, 1])
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Ethereum Wallet</title>
        <meta name="description" content="Ethereum Wallet" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div className={styles.top}>
          <h1>Wallet dApp</h1>
          <div>
            { <a href={`https://${network.network}.etherscan.io/address/${accounts[0]}`} target="_blank" rel="noreferrer" className={styles.network} >
                {network.name} ↗️
              </a> }
            <button onClick={connectToWeb3} className={styles.button}>Connect web3</button>
          </div>
         </div>        

          <div className={styles.card}>
            <div className={styles.subCard}>
              <p>Amount {network.shortName}: {weiToEth(balance)} {network.nativeCurrency ? network.nativeCurrency.symbol : network.shortName}</p>
              <p></p>
            </div>
            
            <div className={styles.subCard}>
              <p>Address :</p>
              <input type="text" onChange={e => setAddressToSend(e.target.value)} />
            </div>
            
            <div className={styles.subCard}>
              <p>Amount :</p>
              <input type="number" onChange={e => setEthToSend(e.target.value)} />
            </div>
            
            <button onClick={sendToken} className={styles.cardButton}>Envoyer</button>
          </div>

          {/* Nouveau token  */}
          
          <div className={styles.card}>
            <div className={styles.subCard}>
              <p>Amount {token.name}: {weiToEth(token.balance)} {token.symbol}</p>
            </div>

            <div className={styles.subCard}>
              <label>Address ERC20:</label>
              <input type="text" onChange={e => setTokenAddress(e.target.value)} />
            </div>
            
            <div className={styles.subCard}>
              <p>Address :</p>
              <input type="text" onChange={e => setAddress2(e.target.value)} />
            </div>
            
            <div className={styles.subCard}>
              <p>Amount :</p>
              <input type="number" onChange={e => setAmount2(e.target.value)} />
            </div>
            
            <button onClick={transferToken} className={styles.cardButton}>Envoyer {token.symbol} </button>
          </div>
          
          

          {/* {
            tokens.length > 0 &&
            <div>
              hello
            </div>
            
          }
          <input type="text" onChange={e => setAddressContract(e.target.value)} placeholder="Adresse du token" ></input>
          <button onClick={addToken} className={styles.cardButton}>Ajouter un jeton</button> */}



      </main>

      <footer className={styles.footer}>
      </footer>
    </div>
  )
}
