// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/BidRushPlatform.sol";

/// @title On-chain integration test for deployed BidRushPlatform
/// @dev Run with:
///   forge script script/TestOnChain.s.sol --rpc-url https://testnet-rpc.monad.xyz \
///     --private-key 0x<KEY> --broadcast -vvvv
contract TestOnChain is Script {
    BidRushPlatform platform =
        BidRushPlatform(payable(0x8C326731903F2bD3CfE48fE2E81a1079783f66E5));

    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(pk);

        console.log("===========================================");
        console.log("  BidRush On-Chain Integration Tests");
        console.log("  Contract:", address(platform));
        console.log("  Tester:", deployer);
        console.log("===========================================");

        vm.startBroadcast(pk);

        _testRegistration(deployer);
        _testCreateAndCancel(deployer);
        _testFullFlow(deployer);
        _testViews(deployer);

        console.log("\n===========================================");
        console.log("  ALL ON-CHAIN TESTS PASSED!");
        console.log("===========================================");

        vm.stopBroadcast();
    }

    function _testRegistration(address deployer) internal {
        console.log("\n[TEST 1] User Registration...");
        platform.registerUser();

        BidRushPlatform.UserProfile memory p = platform.getProfile(deployer);
        require(p.exists, "FAIL: profile should exist");
        require(p.qualityScore == 50, "FAIL: initial score should be 50");
        console.log("  PASS: Registered with score =", p.qualityScore);

        // Double register
        platform.registerUser();
        BidRushPlatform.UserProfile memory p2 = platform.getProfile(deployer);
        require(p2.registeredAt == p.registeredAt, "FAIL: overwrote");
        console.log("  PASS: Double register is idempotent");
    }

    function _testCreateAndCancel(address deployer) internal {
        console.log("\n[TEST 2] Create + Cancel Auction...");
        uint256 balBefore = deployer.balance;

        platform.createAuction{value: 0.01 ether}("Test: cancel flow", 0);
        uint256 aid = platform.auctionCounter() - 1;
        console.log("  Created auction id =", aid);

        require(deployer.balance == balBefore - 0.01 ether, "FAIL: lock");

        platform.cancelAuction(aid);
        require(deployer.balance == balBefore, "FAIL: refund");
        console.log("  PASS: 0.01 MON locked then refunded on cancel");
    }

    function _testFullFlow(address deployer) internal {
        console.log("\n[TEST 3] Auction + Self-bid revert...");

        platform.createAuction{value: 0.005 ether}("Test: full flow", 0);
        uint256 aid = platform.auctionCounter() - 1;
        console.log("  Created auction id =", aid);

        // Self-bid should revert — stop broadcast so forge doesn't try to send it
        vm.stopBroadcast();
        bool reverted = false;
        try platform.placeBid(aid, 0.003 ether, 24) {
            // no-op
        } catch {
            reverted = true;
        }
        require(reverted, "FAIL: self-bid should revert");
        console.log("  PASS: Client cannot bid on own auction");
        vm.startBroadcast(vm.envUint("PRIVATE_KEY"));

        // Check bid count = 0
        uint256 bc = platform.getBidCount(aid);
        require(bc == 0, "FAIL: bid count should be 0");
        console.log("  PASS: Bid count = 0");

        // isAuctionExpired should be false (just created)
        bool exp = platform.isAuctionExpired(aid);
        require(!exp, "FAIL: should not be expired");
        console.log("  PASS: isAuctionExpired = false");
    }

    function _testViews(address deployer) internal {
        console.log("\n[TEST 4] View Functions...");

        uint256 totalUsers = platform.getTotalUsers();
        require(totalUsers >= 1, "FAIL: no users");
        console.log("  getTotalUsers() =", totalUsers);

        uint256[] memory actives = platform.getActiveAuctions(0, 50);
        console.log("  getActiveAuctions() count =", actives.length);

        BidRushPlatform.UserProfile memory p = platform.getProfile(deployer);
        console.log("  Profile score:", p.qualityScore);
        console.log("  Profile jobs:", p.completedJobs);
        console.log("  Profile spent:", p.totalSpent);
        console.log("  PASS: All views working");
    }
}
