import React, { useState, useContext, useEffect } from 'react';
import { NFTMarketplaceContext } from '../../Context/nftMarketPlace';
import DisplayNFTs from '../DisplayNFTs/DisplayNFTs';

function ShowTokensByCollection() {
    const [uniqueCollectionAddresses, setUniqueCollectionAddresses] = useState([]);
    const [selectedCollection, setSelectedCollection] = useState(null);
    const [collectionTokenIds, setCollectionTokenIds] = useState([]);
    const [collectionAddressesWithTokenIds, setCollectionAddressesWithTokenIds] = useState([]);
    const { getMyPurchasedTokens} = useContext(NFTMarketplaceContext);

    async function fetchData() {
        try {
            const purchasesData = await getMyPurchasedTokens();
            console.log("Purchases data:", purchasesData);
            
            // Extract unique collection addresses
            const uniqueAddresses = [...new Set(purchasesData.map(purchase => purchase.collectionAddress))];
            setUniqueCollectionAddresses(uniqueAddresses);
            
            // Populate the 2D array with collection addresses and associated token IDs
            const tokenIdsByCollection = uniqueAddresses.map(address => {
                return purchasesData
                .filter(purchase => purchase.collectionAddress === address)
                .map(purchase => purchase.tokenId.toString());
            });
            setCollectionTokenIds(tokenIdsByCollection);
            
            // Create another 2D array with collection addresses and associated token IDs
            const addressesWithTokenIds = uniqueAddresses.map((address, index) => {
                return [address, collectionTokenIds[index]];
            });
            setCollectionAddressesWithTokenIds(addressesWithTokenIds);
        } catch (error) {
            console.error("Error fetching purchased tokens:", error);
        }
    }

    useEffect(() => {
        fetchData(); // Fetch data when the component mounts
    }, [getMyPurchasedTokens, selectedCollection]);

    return (
        <div>
            <h2>Show Tokens By Collection</h2>
            <div>
                <h3>Unique Collection Addresses</h3>
                <ul>
                    {uniqueCollectionAddresses.map((address, index) => (
                        <li key={index} onClick={() => setSelectedCollection(address)}>
                            Collection Address: {address}
                        </li>
                    ))}
                </ul>
            </div>
            {selectedCollection && (
                <div>
                    <h3>Tokens in Selected Collection : {selectedCollection}</h3>
                    <ul>
                        {collectionAddressesWithTokenIds.map((addressWithTokenIds, index) => {
                            const [address, tokenIds] = addressWithTokenIds;
                            if (address === selectedCollection) {
                                return tokenIds.map((tokenId, index) => (
                                    <li key={index}>Token ID: {tokenId}</li>
                                ));
                            }
                        })}
                    </ul>
                    {/* You can display more details about the tokens if needed */}
                </div>
            )}
        </div>
    );
}

export default ShowTokensByCollection;
