// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CollectionContract is ERC1155, Ownable {
    string public name;
    string public symbol;
    mapping(uint256 => string) private _tokenURIs;
    uint256 private _currentTokenID = 0; 
    uint256[] private _allTokenIds;
    constructor(string memory _name, string memory _symbol, string memory _uri) ERC1155(_uri) {
        name = _name;
        symbol = _symbol;
    }
    function mintToken(address to, uint256 amount, string memory uri) public onlyOwner {
        _currentTokenID += 1; 
        uint256 newTokenID = _currentTokenID;

        _mint(to, newTokenID, amount, "");
        _setTokenURI(newTokenID, uri);
        _allTokenIds.push(newTokenID); 
    }
    function _setTokenURI(uint256 tokenId, string memory uri) internal {
        _tokenURIs[tokenId] = uri;
    }

    function getTokenURI(uint256 tokenId) public view returns (string memory) {
        return _tokenURIs[tokenId];
    }
    function getTokenIds() public view returns (uint256[] memory) {
        return _allTokenIds;
    }
}
