// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SalesRegistry {
    // Event emitted when a new sale is registered
    event SaleRegistered(
        string indexed numeroVenta,
        string saleHash,
        uint256 timestamp
    );

    // Mapping to store the hash of each sale by its ID (numeroVenta)
    mapping(string => string) public sales;

    /**
     * @dev Records a sale permanently on the blockchain.
     * @param _numeroVenta The unique ID of the sale from the backend
     * @param _saleHash The cryptographic hash (SHA-256) of the sale details
     */
    function recordSale(string memory _numeroVenta, string memory _saleHash) public {
        // Ensure the sale hasn't already been registered
        require(bytes(sales[_numeroVenta]).length == 0, "Sale already registered");

        sales[_numeroVenta] = _saleHash;

        emit SaleRegistered(_numeroVenta, _saleHash, block.timestamp);
    }

    /**
     * @dev Retrieves the hash of a registered sale
     * @param _numeroVenta The unique ID of the sale
     * @return The cryptographic hash of the sale
     */
    function getSaleHash(string memory _numeroVenta) public view returns (string memory) {
        return sales[_numeroVenta];
    }
}
