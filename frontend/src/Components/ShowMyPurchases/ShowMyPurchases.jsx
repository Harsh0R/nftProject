import React, { useState, useContext, useEffect } from 'react';
import { NFTMarketplaceContext } from '../../Context/nftMarketPlace';
import DisplayNFTs from '../DisplayNFTs/DisplayNFTs';
import styles from "./ShowMyPurchases.module.css";

function ShowTokensByCollection() {
    const [uniqueCollectionAddresses, setUniqueCollectionAddresses] = useState([]);
    const [selectedCollection, setSelectedCollection] = useState(null);
    const [collectionAddressesWithTokenIds, setCollectionAddressesWithTokenIds] = useState([]);
    const { getMyPurchasedTokens } = useContext(NFTMarketplaceContext);

    useEffect(() => {
        async function fetchData() {
            try {
                const purchasesData = await getMyPurchasedTokens();

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
        <div className={styles.container}>
            <h2 className={styles.title}>Show Tokens By Collection</h2>
            <div>
                <h3>Purchase Collection Addresses</h3>
                <ul className={styles.collectionList}>
                    {uniqueCollectionAddresses.map((address, index) => (
                        <li key={index} className={styles.collectionListItem} onClick={() => setSelectedCollection(address)}>
                            Collection Address: {address}
                        </li>
                    ))}
                </ul>
            </div>
            {selectedCollection && (
                <div>
                    <h3>Tokens in Selected Collection : {selectedCollection}</h3>
                    <ul className={styles.tokensList}>
                        {collectionAddressesWithTokenIds.map(({ address, tokenIds }, index) => {
                            if (address === selectedCollection) {
                                const uniqueTokenIds = [...new Set(tokenIds)];
                                return uniqueTokenIds.map((tokenId, tokenIdIndex) => (
                                    <li key={tokenIdIndex} className={styles.tokenItem}>
                                        <DisplayNFTs selectedCollection={selectedCollection} tokenIds={tokenId} />
                                    </li>
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
