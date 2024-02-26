// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CollectionContract is ERC1155, Ownable {
    string public name;
    string public symbol;
    mapping(uint256 => string) private _tokenURIs;
    uint256 private _currentTokenID = 0; // Variable to track the last used token ID

    // Array to keep track of all minted token IDs
    uint256[] private _allTokenIds;

    constructor(string memory _name, string memory _symbol, string memory _uri) ERC1155(_uri) {
        name = _name;
        symbol = _symbol;
    }

    // Modified mintToken function to auto-increment id
    function mintToken(address to, uint256 amount, string memory uri) public onlyOwner {
        _currentTokenID += 1; // Increment the token ID
        uint256 newTokenID = _currentTokenID;

        _mint(to, newTokenID, amount, "");
        _setTokenURI(newTokenID, uri);
        _allTokenIds.push(newTokenID); // Track the minted token ID
    }

    function _setTokenURI(uint256 tokenId, string memory uri) internal {
        _tokenURIs[tokenId] = uri;
    }

    function getTokenURI(uint256 tokenId) public view returns (string memory) {
        return _tokenURIs[tokenId];
    }

    // Function to get all minted token IDs
    function getTokenIds() public view returns (uint256[] memory) {
        return _allTokenIds;
    }
}
