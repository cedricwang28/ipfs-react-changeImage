import { useState, useEffect, useMemo } from 'react'
import './App.css'
import { Buffer } from 'buffer'
import { create } from 'ipfs-http-client'
import Web3 from 'web3'
import Meme from '../../build/contracts/Meme.json'

const auth =
  'Basic ' +
  Buffer.from(
    '2KRaoV0wzxddt54rsX6KdMZGZWY' + ':' + '6d1dd3179fa5888be462aaee5058801c'
  ).toString('base64')
const ipfs = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: auth
  }
})

function App() {
  const [buffer, setBuffer] = useState(null)
  const [imageUrl, setImageUrl] = useState('')
  const [account, setAccount] = useState('')
  const [contract, setContract] = useState({})

  useEffect(() => {
    loadWeb3()
    // web3 = new Web3(new Web3.providers.HttpProvider(ethereum))
    // loadData()
  }, [imageUrl, account])

  const m = useMemo(() => {
    return {}
  })

  const loadWeb3 = async () => {
    if (window.ethereum) {
      window.web3 = await new Web3(ethereum)
      await ethereum.enable()
    }
    const _account = await window.web3.eth.getAccounts()
    console.log(_account)
    setAccount(_account[0])
    const networkId = await web3.eth.net.getId()
    const networkData = Meme.networks[networkId]
    if (networkData) {
      console.log('have contract')
      const abi = Meme.abi
      const address = networkData.address
      const _contract = new web3.eth.Contract(abi, address)
      setContract(_contract)
      console.log(_contract)
      const _memeHash = await _contract.methods.get().call()
      console.log(_memeHash)
      setImageUrl(_memeHash)
    } else {
      alert('no smart contract')
    }
  }

  const captureFile = (e) => {
    const file = e.target.files[0]
    const reader = new FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => {
      console.log(Buffer(reader.result))
      setBuffer((prev) => Buffer(reader.result))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    ipfs.add(buffer).then((res) => {
      console.log(res)

      // setImageUrl(() => `https://ipfs.io/ipfs/${res.path}`)
      contract.methods
        .set(res.path)
        .send({ from: account })
        .then((r) => {
          setImageUrl(r.path)
          console.log(r)
        })
    })
  }

  return (
    <div className="App">
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img
            src={`https://ipfs.io/ipfs/${imageUrl}`}
            className="logo"
            alt="Vite logo"
          />
        </a>
      </div>
      <h1>Change Image</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={captureFile} />
        <input type="submit" />
      </form>
    </div>
  )
}

export default App
