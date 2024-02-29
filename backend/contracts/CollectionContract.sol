// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

contract CollectionContract is ERC1155, Ownable, IERC2981 {
    string public name;
    string public symbol;
    mapping(uint256 => string) private _tokenURIs;
    uint256 private _currentTokenID = 0;
    uint256[] private _allTokenIds;
    struct RoyaltyInfo {
        address recipient;
        uint256 percentage;
    }
    mapping(uint256 => RoyaltyInfo) private _royalties;
    constructor(
        string memory _name,
        string memory _symbol,
        string memory _uri
    ) ERC1155(_uri) {
        name = _name;
        symbol = _symbol;
    }
    function mintToken(
        address to,
        uint256 amount,
        string memory uri,
        address royaltyRecipient,
        uint256 royaltyPercentage
    ) public onlyOwner {
        _currentTokenID += 1;
        uint256 newTokenID = _currentTokenID;
        _mint(to, newTokenID, amount, "");
        _setTokenURI(newTokenID, uri);
        _allTokenIds.push(newTokenID);
        require(royaltyPercentage <= 40, "Royalty too high");
        _royalties[newTokenID] = RoyaltyInfo(
            royaltyRecipient,
            royaltyPercentage
        );
    }

    function royaltyInfo(
        uint256 tokenId,
        uint256 salePrice
    ) external view override returns (address receiver, uint256 royaltyAmount) {
        RoyaltyInfo memory royalty = _royalties[tokenId];
        royaltyAmount = (salePrice * royalty.percentage) / 100;
        receiver = royalty.recipient;
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
    function getOwnedTokens(
        address owner
    ) public view returns (uint256[] memory, uint256[] memory) {
        uint256[] memory tokenIds = getTokenIds();
        uint256[] memory ownedAmounts = new uint256[](tokenIds.length);

        for (uint256 i = 0; i < tokenIds.length; i++) {
            ownedAmounts[i] = balanceOf(owner, tokenIds[i]);
        }

        return (tokenIds, ownedAmounts);
    }
}
