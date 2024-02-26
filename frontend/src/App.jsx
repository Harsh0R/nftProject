import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar/Navbar";
import { NFTMarketplaceProvider } from './Context/nftMarketPlace'
import Home from './Pages/Home/Home';
import MyAccount from './Pages/MyAccount/MyAccount';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <NFTMarketplaceProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route path="/myAccount" element={<MyAccount />} />
          </Routes>
        </Router>
      </NFTMarketplaceProvider>
    </>
  )
}

export default App
