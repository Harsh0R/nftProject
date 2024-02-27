import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { NFTMarketplaceContext } from '../../Context/nftMarketPlace';

const ListingToken = () => {
    const { tokenId, selectedCollection } = useParams();
    const { listToken, getTokenURI, getOwnedTokens } = useContext(NFTMarketplaceContext);
    const [price, setPrice] = useState('');
    const [tokenData, setTokenData] = useState(null);
    const [tokenBalance, setTokenBalance] = useState();
    const [quantity, setQuantity] = useState('');

    useEffect(() => {
        const fetchTokenURIs = async () => {
            if (!selectedCollection || !tokenId) {
                return;
            }
            try {
                try {
                    const uri = await getTokenURI(selectedCollection, tokenId);
                    const response = await fetch(uri);
                    if (!response.ok) {
                        throw new Error("Failed to fetch token data");
                    }
                    const data = await response.json();
                    setTokenData(data);
                    const tokanAndBalance = await getOwnedTokens(selectedCollection, tokenId);
                    setTokenBalance(tokanAndBalance);
                    return { tokenId, uri };
                } catch (error) {
                    console.error(`Error fetching URI for token ${tokenId}:`, error);
                    return { tokenId: tokenId.toString(), uri: "Error fetching URI" };
                }
            } catch (err) {
                setError("Failed to fetch token URIs.");
            }
        };

        fetchTokenURIs();

    }, [])


    console.log("Token data ===",tokenData);

    const handleSubmit = async (event) => {
        event.preventDefault();
        // Call listToken function with the form inputs
        await listToken(selectedCollection, tokenId, quantity ,price);
    };

    return (
        <div>
            <h2>Listing Token</h2>
            {tokenData && (
                <>
                    <p>Token ID: {tokenId}</p>
                    <p>Collection: {selectedCollection}</p>
                    <h3>Token ID: {tokenId}</h3>
                    <p>Name: {tokenData.name}</p>
                    <p>Description: {tokenData.description}</p>
                    <img src={tokenData.image} alt="NFT" style={{ maxWidth: "300px" }} />
                    <p>Rarity: {tokenData.attributes.rarity}</p>
                    <p>Edition: {tokenData.attributes.edition}</p>
                    <p>Total Supply: {tokenData.totalSupply}</p>
                    <p>Your Balance: {tokenBalance}</p>
                </>
            )}
            <form onSubmit={handleSubmit}>
                <label htmlFor="price">Price:</label>
                <input
                    type="number"
                    id="price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                />
                <label htmlFor="quantity">Quantity:</label>
                <input
                    type="number"
                    id="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                />
                <button type="submit">List Token</button>
            </form>
        </div>
    );
};

export default ListingToken;
