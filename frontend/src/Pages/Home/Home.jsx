import React from 'react'
import Web3Setup from '../../Components/web3setUp/web3setUp'
import GetAllListedToken from '../../Components/GetAllListedToken/GetAllListedToken'

const Home = () => {
  return (
    <div>Home
        <Web3Setup></Web3Setup>
        <GetAllListedToken></GetAllListedToken>

    </div>
  )
}

export default Home