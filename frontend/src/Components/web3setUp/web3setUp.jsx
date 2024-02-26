import { useContext } from 'react';
import { NFTMarketplaceContext } from '../../Context/nftMarketPlace';; // Import your context

function Web3Setup() {
    // const [account, setAccount] = useState(null);
    const { account } = useContext(NFTMarketplaceContext); // Use context to manage provider and signer globally

    return (
        <div>
            {account ? `Connected as ${account}` : "Not connected"}
        </div>
    );
}

export default Web3Setup;
