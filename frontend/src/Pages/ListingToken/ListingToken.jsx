import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { NFTMarketplaceContext } from '../../Context/nftMarketPlace';
import Style from "./ListingToken.module.css";

const ListingToken = () => {
    const { tokenId, selectedCollection } = useParams();
    const { listToken, getTokenURI, getOwnedTokens } = useContext(NFTMarketplaceContext);
    const [price, setPrice] = useState('');
    const [tokenData, setTokenData] = useState(null);
    const [tokenBalance, setTokenBalance] = useState('');
    const [quantity, setQuantity] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTokenURIs = async () => {
            if (!selectedCollection || !tokenId) {
                return;
            }
            try {
                const uri = await getTokenURI(selectedCollection, tokenId);
                const response = await fetch(uri);
                if (!response.ok) {
                    throw new Error("Failed to fetch token data");
                }
                const data = await response.json();
                setTokenData(data);
                const tokenAndBalance = await getOwnedTokens(selectedCollection, tokenId);
                setTokenBalance(tokenAndBalance);
            } catch (error) {
                console.error(`Error fetching URI for token ${tokenId}:`, error);
                setError("Failed to fetch token data");
            }
        };

        fetchTokenURIs();
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (parseInt(quantity) > parseInt(tokenBalance)) {
            setError("Quantity cannot be greater than your balance.");
            return;
        }
        await listToken(selectedCollection, tokenId, quantity, price);
    };

    return (
        <div className={Style.container}>
            <h2 className={Style.title}>Listing Token</h2>
            {error && <p className={Style.error}>{error}</p>}
            {tokenData && (
                <div>
                    <h3>Token ID: {tokenId}</h3>
                    <p>Collection: {selectedCollection}</p>
                    <p>Name: {tokenData.name}</p>
                    <p>Description: {tokenData.description}</p>
                    <img src={tokenData.image} alt="NFT" style={{ maxWidth: "300px" }} />
                    <p>Rarity: {tokenData.attributes.rarity}</p>
                    <p>Edition: {tokenData.attributes.edition}</p>
                    <p>Total Supply: {tokenData.totalSupply}</p>
                    <p>Your Balance: {tokenBalance}</p>
                </div>
            )}
            <form onSubmit={handleSubmit}>
                <label htmlFor="price">Price:</label>
                <input
                    type="number"
                    id="price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    className={Style.input}
                />
                <label htmlFor="quantity">Quantity:</label>
                <input
                    type="number"
                    id="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                    max={tokenBalance}
                    className={Style.input}
                />
                <button type="submit" className={Style.button}>List Token</button>
            </form>
        </div>
    );
};

export default ListingToken;
