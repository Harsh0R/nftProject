import React, { useState, useContext, useEffect } from 'react';
import { NFTMarketplaceContext } from '../../Context/nftMarketPlace';
import DisplayNFTs from '../DisplayNFTs/DisplayNFTs';

function ShowTokensByCollection() {
    const [uniqueCollectionAddresses, setUniqueCollectionAddresses] = useState([]);
    const [selectedCollection, setSelectedCollection] = useState(null);
    const [collectionAddressesWithTokenIds, setCollectionAddressesWithTokenIds] = useState([]);
    const { getMyPurchasedTokens } = useContext(NFTMarketplaceContext);

    useEffect(() => {
        async function fetchData() {
            try {
                const purchasesData = await getMyPurchasedTokens();
                console.log("Purchases data:", purchasesData);

                // Extract unique collection addresses
                const uniqueAddresses = [...new Set(purchasesData.map(purchase => purchase.collectionAddress))];
                setUniqueCollectionAddresses(uniqueAddresses);

                // Populate collectionAddressesWithTokenIds with collection addresses and associated token IDs
                const addressesWithTokenIds = uniqueAddresses.map(address => {
                    const tokenIds = purchasesData
                        .filter(purchase => purchase.collectionAddress === address)
                        .map(purchase => purchase.tokenId.toString());
                    return { address, tokenIds };
                });
                setCollectionAddressesWithTokenIds(addressesWithTokenIds);
            } catch (error) {
                console.error("Error fetching purchased tokens:", error);
            }
        }

        fetchData(); // Fetch data when the component mounts
    }, [getMyPurchasedTokens]);

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
                        {collectionAddressesWithTokenIds.map(({ address, tokenIds }, index) => {
                            if (address === selectedCollection) {
                                const uniqueTokenIds = [...new Set(tokenIds)];
                                return uniqueTokenIds.map((tokenId, tokenIdIndex) => (
                                    <>
                                        <li key={tokenIdIndex}>Token ID: {tokenId}</li>
                                        <li > <DisplayNFTs selectedCollection={selectedCollection} tokenIds={tokenId} ></DisplayNFTs> </li>
                                    </>
                                ));
                            }
                            return null;
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default ShowTokensByCollection;
