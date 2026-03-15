// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/BidRushPlatform.sol";

contract BidRushPlatformTest is Test {
    BidRushPlatform public platform;

    address client = makeAddr("client");
    address freelancer1 = makeAddr("freelancer1");
    address freelancer2 = makeAddr("freelancer2");
    address freelancer3 = makeAddr("freelancer3");
    address auditor1 = makeAddr("auditor1");
    address auditor2 = makeAddr("auditor2");
    address auditor3 = makeAddr("auditor3");

    function setUp() public {
        platform = new BidRushPlatform();

        // Fund test accounts
        vm.deal(client, 1000 ether);
        vm.deal(freelancer1, 10 ether);
        vm.deal(freelancer2, 10 ether);
        vm.deal(freelancer3, 10 ether);

        // Register all users
        vm.prank(client);
        platform.registerUser();
        vm.prank(freelancer1);
        platform.registerUser();
        vm.prank(freelancer2);
        platform.registerUser();
        vm.prank(freelancer3);
        platform.registerUser();

        // Register and boost auditors to score >= 80
        vm.prank(auditor1);
        platform.registerUser();
        vm.prank(auditor2);
        platform.registerUser();
        vm.prank(auditor3);
        platform.registerUser();

        _boostUserScore(auditor1, 6); // 50 + 30 = 80
        _boostUserScore(auditor2, 6);
        _boostUserScore(auditor3, 6);
    }

    /// @dev Helper: boost a user's score by completing N auction→job→pay cycles
    function _boostUserScore(address user, uint256 times) internal {
        for (uint256 i = 0; i < times; i++) {
            vm.prank(client);
            platform.createAuction{value: 1 ether}("boost job", 0);
            uint256 aid = platform.auctionCounter() - 1;

            vm.prank(user);
            platform.placeBid(aid, 0.5 ether, 1);

            vm.warp(block.timestamp + 121);
            platform.closeAuction(aid);

            vm.prank(client);
            platform.selectFreelancer(aid, 0);
            uint256 jid = platform.jobCounter() - 1;

            vm.prank(user);
            platform.submitDelivery(jid, "done");

            vm.prank(client);
            platform.approveAndPay(jid);

            vm.warp(block.timestamp + 1);
        }
    }

    /// @dev Helper: run a fresh auction cycle and return (auctionId)
    function _freshAuction(
        string memory desc,
        uint256 minScore,
        uint256 value
    ) internal returns (uint256 auctionId) {
        vm.prank(client);
        platform.createAuction{value: value}(desc, minScore);
        auctionId = platform.auctionCounter() - 1;
    }

    // ============================
    // USER REGISTRATION TESTS
    // ============================

    function test_RegisterUser() public {
        address newUser = makeAddr("newUser");
        vm.prank(newUser);
        platform.registerUser();

        BidRushPlatform.UserProfile memory p = platform.getProfile(newUser);
        assertTrue(p.exists);
        assertEq(p.qualityScore, 50);
        assertEq(p.completedJobs, 0);
    }

    function test_DoubleRegisterIsIdempotent() public {
        address newUser = makeAddr("newUser2");
        vm.startPrank(newUser);
        platform.registerUser();
        uint256 ts = block.timestamp;

        vm.warp(block.timestamp + 100);
        platform.registerUser();

        BidRushPlatform.UserProfile memory p = platform.getProfile(newUser);
        assertEq(p.registeredAt, ts);
        vm.stopPrank();
    }

    // ============================
    // AUCTION CREATION TESTS
    // ============================

    function test_CreateAuction() public {
        uint256 aid = _freshAuction("Build a DEX", 60, 5 ether);

        (
            address ac, , uint256 mb, uint256 ms, uint256 st,
            uint256 et, uint256 ea, BidRushPlatform.AuctionStatus status,
            uint256 bc, address sf
        ) = platform.auctions(aid);

        assertEq(ac, client);
        assertEq(mb, 5 ether);
        assertEq(ms, 60);
        assertEq(ea, 5 ether);
        assertTrue(status == BidRushPlatform.AuctionStatus.Active);
        assertEq(bc, 0);
        assertEq(et, st + 120);
    }

    function test_CreateAuctionRequiresRegistration() public {
        address unreg = makeAddr("unregistered");
        vm.deal(unreg, 10 ether);
        vm.prank(unreg);
        vm.expectRevert("Register first");
        platform.createAuction{value: 1 ether}("x", 50);
    }

    function test_CreateAuctionRequiresFunds() public {
        vm.prank(client);
        vm.expectRevert("Must lock funds");
        platform.createAuction{value: 0}("x", 50);
    }

    // ============================
    // BIDDING TESTS
    // ============================

    function test_PlaceBid() public {
        uint256 aid = _freshAuction("Build a DEX", 0, 5 ether);

        vm.prank(freelancer1);
        platform.placeBid(aid, 3 ether, 48);

        BidRushPlatform.Bid[] memory bids = platform.getAuctionBids(aid);
        assertEq(bids.length, 1);
        assertEq(bids[0].freelancer, freelancer1);
        assertEq(bids[0].amount, 3 ether);
        assertEq(bids[0].deliveryTime, 48);
        assertEq(bids[0].freelancerScore, 50);
    }

    function test_BidRevertOnLowScore() public {
        uint256 aid = _freshAuction("Expert", 90, 5 ether);

        vm.prank(freelancer1);
        vm.expectRevert("Score below minimum");
        platform.placeBid(aid, 3 ether, 48);
    }

    function test_BidRevertAfterDeadline() public {
        uint256 aid = _freshAuction("x", 0, 5 ether);

        vm.warp(block.timestamp + 121);

        vm.prank(freelancer1);
        vm.expectRevert("Auction ended");
        platform.placeBid(aid, 3 ether, 48);
    }

    function test_BidRevertIfExceedsMaxBudget() public {
        uint256 aid = _freshAuction("x", 0, 5 ether);

        vm.prank(freelancer1);
        vm.expectRevert("Bid exceeds max budget");
        platform.placeBid(aid, 6 ether, 48);
    }

    function test_ClientCannotBid() public {
        uint256 aid = _freshAuction("x", 0, 5 ether);

        vm.prank(client);
        vm.expectRevert("Client cannot bid");
        platform.placeBid(aid, 3 ether, 48);
    }

    function test_MultipleBids() public {
        uint256 aid = _freshAuction("x", 0, 5 ether);

        vm.prank(freelancer1);
        platform.placeBid(aid, 4 ether, 48);
        vm.prank(freelancer2);
        platform.placeBid(aid, 3 ether, 72);
        vm.prank(freelancer3);
        platform.placeBid(aid, 2 ether, 24);

        assertEq(platform.getBidCount(aid), 3);
    }

    // ============================
    // AUCTION CLOSE + SELECTION
    // ============================

    function test_CloseAndSelectFreelancer() public {
        uint256 aid = _freshAuction("x", 0, 5 ether);

        vm.prank(freelancer1);
        platform.placeBid(aid, 4 ether, 48);
        vm.prank(freelancer2);
        platform.placeBid(aid, 3 ether, 24);

        vm.warp(block.timestamp + 121);
        platform.closeAuction(aid);

        vm.prank(client);
        platform.selectFreelancer(aid, 1); // pick freelancer2

        uint256 jid = platform.jobCounter() - 1;
        (
            uint256 auctionId, address jc, address jf,
            uint256 amt, , BidRushPlatform.JobStatus status, ,
        ) = platform.jobs(jid);

        assertEq(auctionId, aid);
        assertEq(jc, client);
        assertEq(jf, freelancer2);
        assertEq(amt, 3 ether);
        assertTrue(status == BidRushPlatform.JobStatus.InProgress);
    }

    function test_CloseAuctionRevertIfStillActive() public {
        uint256 aid = _freshAuction("x", 0, 5 ether);

        vm.expectRevert("Auction still active");
        platform.closeAuction(aid);
    }

    // ============================
    // DELIVERY + PAYMENT
    // ============================

    function test_FullDeliveryAndPaymentFlow() public {
        uint256 aid = _freshAuction("NFT Market", 0, 5 ether);

        vm.prank(freelancer1);
        platform.placeBid(aid, 3 ether, 48);

        vm.warp(block.timestamp + 121);
        platform.closeAuction(aid);

        vm.prank(client);
        platform.selectFreelancer(aid, 0);
        uint256 jid = platform.jobCounter() - 1;

        uint256 f1Before = freelancer1.balance;
        uint256 cBefore = client.balance;

        vm.prank(freelancer1);
        platform.submitDelivery(jid, "https://github.com/nft");

        vm.prank(client);
        platform.approveAndPay(jid);

        // freelancer gets 3 ETH, client refunded 2 ETH
        assertEq(freelancer1.balance, f1Before + 3 ether);
        assertEq(client.balance, cBefore + 2 ether);

        BidRushPlatform.UserProfile memory p = platform.getProfile(freelancer1);
        assertEq(p.qualityScore, 55); // 50 + 5
        assertEq(p.completedJobs, 1);
        assertEq(p.totalEarned, 3 ether);
    }

    // ============================
    // DISPUTE TESTS
    // ============================

    function test_DisputeClientWins() public {
        uint256 aid = _freshAuction("Smart Contract", 0, 5 ether);

        vm.prank(freelancer1);
        platform.placeBid(aid, 3 ether, 48);

        vm.warp(block.timestamp + 121);
        platform.closeAuction(aid);

        vm.prank(client);
        platform.selectFreelancer(aid, 0);
        uint256 jid = platform.jobCounter() - 1;

        vm.prank(freelancer1);
        platform.submitDelivery(jid, "bad-code");

        uint256 cBefore = client.balance;

        vm.prank(client);
        platform.openDispute(jid);

        uint256 did = platform.jobToDispute(jid);
        address[] memory auds = platform.getDisputeAuditors(did);
        assertEq(auds.length, 3);

        // 2 votes for client = majority
        vm.prank(auds[0]);
        platform.castVote(did, true);
        vm.prank(auds[1]);
        platform.castVote(did, true);

        // Client refunded
        assertEq(client.balance, cBefore + 5 ether);

        // Freelancer penalized
        BidRushPlatform.UserProfile memory fp = platform.getProfile(freelancer1);
        assertEq(fp.qualityScore, 35); // 50 - 15
        assertEq(fp.disputesLost, 1);
    }

    function test_DisputeFreelancerWins() public {
        uint256 aid = _freshAuction("App", 0, 5 ether);

        vm.prank(freelancer1);
        platform.placeBid(aid, 5 ether, 48);

        vm.warp(block.timestamp + 121);
        platform.closeAuction(aid);

        vm.prank(client);
        platform.selectFreelancer(aid, 0);
        uint256 jid = platform.jobCounter() - 1;

        vm.prank(freelancer1);
        platform.submitDelivery(jid, "good-code");

        uint256 f1Before = freelancer1.balance;

        vm.prank(client);
        platform.openDispute(jid);

        uint256 did = platform.jobToDispute(jid);
        address[] memory auds = platform.getDisputeAuditors(did);

        // 2 votes for freelancer
        vm.prank(auds[0]);
        platform.castVote(did, false);
        vm.prank(auds[1]);
        platform.castVote(did, false);

        assertEq(freelancer1.balance, f1Before + 5 ether);

        BidRushPlatform.UserProfile memory cp = platform.getProfile(client);
        assertEq(cp.disputesLost, 1);
    }

    // ============================
    // VIEW FUNCTION TESTS
    // ============================

    function test_GetTopBids() public {
        uint256 aid = _freshAuction("Big", 0, 10 ether);

        vm.prank(freelancer1);
        platform.placeBid(aid, 8 ether, 48); // ratio: 50/8 = 6.25
        vm.prank(freelancer2);
        platform.placeBid(aid, 3 ether, 24); // ratio: 50/3 = 16.67 (best)
        vm.prank(freelancer3);
        platform.placeBid(aid, 5 ether, 36); // ratio: 50/5 = 10

        BidRushPlatform.Bid[3] memory top = platform.getTopBids(aid);

        assertEq(top[0].freelancer, freelancer2); // best ratio
        assertEq(top[1].freelancer, freelancer3);
        assertEq(top[2].freelancer, freelancer1);
    }

    function test_CancelAuction() public {
        uint256 cBefore = client.balance;
        uint256 aid = _freshAuction("cancel me", 0, 5 ether);
        assertEq(client.balance, cBefore - 5 ether);

        vm.prank(client);
        platform.cancelAuction(aid);

        assertEq(client.balance, cBefore); // refunded
    }
}
