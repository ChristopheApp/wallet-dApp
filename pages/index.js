import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'

import chainsId from '../public/chains.json'

import { useState, useCallback, useEffect } from 'react'


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

  useEffect( async () => {

    if(window.ethereum) {
      let myAccounts =0; let myId=0;
      let myNetwork = {};
      console.log(window.ethereum)
      try {
        myAccounts = await window.ethereum.request({method: 'eth_requestAccounts'})

        setIsConnectedWeb3(true)

        myId = await web3.eth.net.getId()
        
      } catch (err) {
        console.error(err)
      }

      setAccounts(myAccounts);
      setNetworkId(myId)

      chainsId.forEach(network => {
        if(myId == network.chainId){ 
          setNetwork(network);
          myNetwork = network;}
      })
      console.log(myAccounts)
      console.log(myId)
      console.log(myNetwork)
      //displaynetwork()
    } 
  }, [])


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

  // Connecter un compte
  useEffect(() => {
    const getAccounts = async () => setAccounts(await web3.eth.getAccounts());
    const getBalance = async () => setBalance(await web3.eth.getBalance(accounts[0]));

    //console.log(networkId)
    if (accounts.length == 0) getAccounts();
    if (accounts.length > 0) getBalance();

    chainsId.forEach(network => {
      if(networkId == network.chainId) 
        setNetwork(network);
      })
    //console.log(networkId)

    
  }, [isConnectedWeb3, accounts, networkId])

  //Actualiser réseau
  // useEffect(() => {

  //   chainsId.forEach(network => {
  //     if(networkId == network.chainId) 
  //       setNetwork(network);
  //   })
  // },[networkId])

  // useEffect(() => {
  //   if(network)
  //     displaynetwork()
    
  // },[network, networkId])



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

  // const displaynetwork = () => {
  //   if(isConnectedWeb3){
  //     return (<a className={styles.network} >{network.name}</a>)
  //   }
  // }
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
            { <a href={`https://${network.network}.etherscan.io/address/${accounts[0]}`} target="_blank" className={styles.network} >
                {network.name} ↗️
              </a> }
            <button onClick={connectToWeb3} className={styles.button}>Connect web3</button>
          </div>
            {
              // isConnectedWeb3
              // ? <p>Connected</p>
              // : <button onClick={connectToWeb3} className={styles.button}>Connect web3</button>
            } 
         </div>        

          <div className={styles.card}>
            <div className={styles.subCard}>
              <p>Amount {network.chain}: {weiToEth(balance)} {network.shortName}</p>
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


      </main>

      <footer className={styles.footer}>
      </footer>
    </div>
  )
}
