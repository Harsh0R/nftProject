import { useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar/Navbar";
import { NFTMarketplaceProvider } from './Context/nftMarketPlace'
import Home from './Pages/Home/Home';
import MyAccount from './Pages/MyAccount/MyAccount';
import ListingToken from './Pages/ListingToken/ListingToken';

function App() {
  return (
    <>
      <NFTMarketplaceProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route path="/myAccount" element={<MyAccount />} />
            <Route path="/listNfts/:selectedCollection/:tokenId" element={<ListingToken />} />
          </Routes>
        </Router>
      </NFTMarketplaceProvider>
    </>
  )
}

export default App
