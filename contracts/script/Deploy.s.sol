// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/BidRushPlatform.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerKey);

        BidRushPlatform platform = new BidRushPlatform();
        console.log("BidRushPlatform deployed to:", address(platform));

        vm.stopBroadcast();
    }
}
