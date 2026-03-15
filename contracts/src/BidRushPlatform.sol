// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title BidRushPlatform
/// @notice Decentralized anonymous freelance marketplace on Monad
/// @dev All data stored on-chain for hackathon demo purposes
contract BidRushPlatform {

    // ============================
    // ENUMS
    // ============================

    enum AuctionStatus {
        Active,     // accepting bids
        Closed,     // timer expired, awaiting selection
        Selected,   // freelancer selected, job in progress
        Cancelled   // cancelled by client
    }

    enum JobStatus {
        InProgress, // freelancer working
        Delivered,  // freelancer submitted delivery
        Approved,   // client approved, payment released
        Disputed,   // in dispute
        Resolved    // dispute resolved
    }

    // ============================
    // STRUCTS
    // ============================

    struct UserProfile {
        uint256 qualityScore;
        uint256 completedJobs;
        uint256 totalEarned;
        uint256 totalSpent;
        uint256 disputesWon;
        uint256 disputesLost;
        uint256 registeredAt;
        bool exists;
    }

    struct Auction {
        address client;
        string description;
        uint256 maxBudget;
        uint256 minScore;
        uint256 startTime;
        uint256 endTime;
        uint256 escrowAmount;
        AuctionStatus status;
        uint256 bidCount;
        address selectedFreelancer;
    }

    struct Bid {
        address freelancer;
        uint256 amount;
        uint256 deliveryTime;
        uint256 freelancerScore;
        uint256 timestamp;
    }

    struct Job {
        uint256 auctionId;
        address client;
        address freelancer;
        uint256 agreedAmount;
        string deliveryProof;
        JobStatus status;
        uint256 startedAt;
        uint256 deliveredAt;
    }

    struct Dispute {
        uint256 jobId;
        address[] auditors;
        uint256 votesForClient;
        uint256 votesForFreelancer;
        uint256 totalVotesNeeded;
        bool resolved;
    }

    // ============================
    // CONSTANTS
    // ============================

    uint256 public constant AUCTION_DURATION = 120; // 2 minutes
    uint256 public constant INITIAL_SCORE = 50;
    uint256 public constant MAX_SCORE = 100;
    uint256 public constant SCORE_BOOST_PER_JOB = 5;
    uint256 public constant SCORE_PENALTY_DISPUTE = 15;
    uint256 public constant AUDITOR_COUNT = 3;
    uint256 public constant MIN_AUDITOR_SCORE = 70;

    // ============================
    // STATE VARIABLES
    // ============================

    mapping(address => UserProfile) public profiles;
    address[] public registeredUsers;

    uint256 public auctionCounter;
    mapping(uint256 => Auction) public auctions;
    mapping(uint256 => Bid[]) public auctionBids;

    uint256 public jobCounter;
    mapping(uint256 => Job) public jobs;

    uint256 public disputeCounter;
    mapping(uint256 => Dispute) public disputes;
    mapping(uint256 => uint256) public jobToDispute;
    // disputeId => auditor => hasVoted
    mapping(uint256 => mapping(address => bool)) public disputeVotes;

    // ============================
    // EVENTS
    // ============================

    event UserRegistered(address indexed user, uint256 timestamp);
    event ScoreUpdated(address indexed user, uint256 oldScore, uint256 newScore);

    event AuctionCreated(
        uint256 indexed auctionId,
        address indexed client,
        string description,
        uint256 maxBudget,
        uint256 minScore,
        uint256 endTime
    );
    event AuctionClosed(uint256 indexed auctionId, uint256 totalBids);

    event BidPlaced(
        uint256 indexed auctionId,
        address indexed freelancer,
        uint256 amount,
        uint256 deliveryTime,
        uint256 freelancerScore
    );
    event BidRejected(
        uint256 indexed auctionId,
        address indexed freelancer,
        string reason
    );

    event FreelancerSelected(
        uint256 indexed auctionId,
        uint256 indexed jobId,
        address indexed freelancer,
        uint256 agreedAmount
    );
    event DeliverySubmitted(uint256 indexed jobId, string proof);
    event JobApproved(uint256 indexed jobId, address indexed freelancer, uint256 amount);

    event DisputeOpened(uint256 indexed jobId, uint256 indexed disputeId);
    event AuditorAssigned(uint256 indexed disputeId, address indexed auditor);
    event VoteCast(uint256 indexed disputeId, address indexed auditor, bool inFavorOfClient);
    event DisputeResolved(uint256 indexed disputeId, bool clientWon, uint256 amount);

    // ============================
    // USER REGISTRATION
    // ============================

    /// @notice Register the caller as a platform user with initial score of 50
    function registerUser() external {
        if (!profiles[msg.sender].exists) {
            profiles[msg.sender] = UserProfile({
                qualityScore: INITIAL_SCORE,
                completedJobs: 0,
                totalEarned: 0,
                totalSpent: 0,
                disputesWon: 0,
                disputesLost: 0,
                registeredAt: block.timestamp,
                exists: true
            });
            registeredUsers.push(msg.sender);
            emit UserRegistered(msg.sender, block.timestamp);
        }
    }

    // ============================
    // FLASH AUCTION
    // ============================

    /// @notice Client creates a flash auction, locking MON as escrow
    /// @param _description Job description (stored on-chain for hackathon)
    /// @param _minScore Minimum quality score required to bid (0-100)
    function createAuction(
        string calldata _description,
        uint256 _minScore
    ) external payable {
        require(profiles[msg.sender].exists, "Register first");
        require(msg.value > 0, "Must lock funds");
        require(_minScore <= MAX_SCORE, "Invalid min score");

        uint256 auctionId = auctionCounter++;
        uint256 endTime = block.timestamp + AUCTION_DURATION;

        auctions[auctionId] = Auction({
            client: msg.sender,
            description: _description,
            maxBudget: msg.value,
            minScore: _minScore,
            startTime: block.timestamp,
            endTime: endTime,
            escrowAmount: msg.value,
            status: AuctionStatus.Active,
            bidCount: 0,
            selectedFreelancer: address(0)
        });

        profiles[msg.sender].totalSpent += msg.value;

        emit AuctionCreated(auctionId, msg.sender, _description, msg.value, _minScore, endTime);
    }

    // ============================
    // BIDDING
    // ============================

    /// @notice Freelancer places a bid on an active auction
    /// @param _auctionId Auction to bid on
    /// @param _amount Requested payment in MON (wei), must be <= maxBudget
    /// @param _deliveryTime Estimated delivery time in hours
    function placeBid(
        uint256 _auctionId,
        uint256 _amount,
        uint256 _deliveryTime
    ) external {
        Auction storage auction = auctions[_auctionId];

        require(auction.status == AuctionStatus.Active, "Auction not active");
        require(block.timestamp <= auction.endTime, "Auction ended");
        require(msg.sender != auction.client, "Client cannot bid");
        require(profiles[msg.sender].exists, "Register first");
        require(_amount > 0, "Bid must be > 0");
        require(_amount <= auction.maxBudget, "Bid exceeds max budget");

        // KEY CHECK: minimum quality score — reverts if too low
        uint256 freelancerScore = profiles[msg.sender].qualityScore;
        if (freelancerScore < auction.minScore) {
            emit BidRejected(_auctionId, msg.sender, "Score too low");
            revert("Score below minimum");
        }

        auctionBids[_auctionId].push(Bid({
            freelancer: msg.sender,
            amount: _amount,
            deliveryTime: _deliveryTime,
            freelancerScore: freelancerScore,
            timestamp: block.timestamp
        }));

        auction.bidCount++;

        emit BidPlaced(_auctionId, msg.sender, _amount, _deliveryTime, freelancerScore);
    }

    // ============================
    // AUCTION CLOSE + SELECTION
    // ============================

    /// @notice Close an auction after the timer expires (callable by anyone)
    function closeAuction(uint256 _auctionId) external {
        Auction storage auction = auctions[_auctionId];
        require(auction.status == AuctionStatus.Active, "Not active");
        require(block.timestamp > auction.endTime, "Auction still active");

        auction.status = AuctionStatus.Closed;
        emit AuctionClosed(_auctionId, auction.bidCount);
    }

    /// @notice Client selects the winning freelancer from bids
    /// @param _auctionId Auction ID
    /// @param _bidIndex Index of the chosen bid in auctionBids array
    function selectFreelancer(uint256 _auctionId, uint256 _bidIndex) external {
        Auction storage auction = auctions[_auctionId];
        require(msg.sender == auction.client, "Only client");
        require(auction.status == AuctionStatus.Closed, "Auction not closed");
        require(_bidIndex < auctionBids[_auctionId].length, "Invalid bid index");

        Bid storage winningBid = auctionBids[_auctionId][_bidIndex];
        auction.selectedFreelancer = winningBid.freelancer;
        auction.status = AuctionStatus.Selected;

        uint256 jobId = jobCounter++;
        jobs[jobId] = Job({
            auctionId: _auctionId,
            client: auction.client,
            freelancer: winningBid.freelancer,
            agreedAmount: winningBid.amount,
            deliveryProof: "",
            status: JobStatus.InProgress,
            startedAt: block.timestamp,
            deliveredAt: 0
        });

        emit FreelancerSelected(_auctionId, jobId, winningBid.freelancer, winningBid.amount);
    }

    /// @notice Client cancels an auction (only if no bids yet or still active)
    function cancelAuction(uint256 _auctionId) external {
        Auction storage auction = auctions[_auctionId];
        require(msg.sender == auction.client, "Only client");
        require(
            auction.status == AuctionStatus.Active || auction.status == AuctionStatus.Closed,
            "Cannot cancel"
        );

        auction.status = AuctionStatus.Cancelled;

        // Refund escrow to client
        (bool sent,) = payable(auction.client).call{value: auction.escrowAmount}("");
        require(sent, "Refund failed");
    }

    // ============================
    // DELIVERY + PAYMENT
    // ============================

    /// @notice Freelancer submits proof of delivery
    /// @param _jobId Job ID
    /// @param _proof Link or hash of the deliverable (stored on-chain for hackathon)
    function submitDelivery(uint256 _jobId, string calldata _proof) external {
        Job storage job = jobs[_jobId];
        require(msg.sender == job.freelancer, "Only freelancer");
        require(job.status == JobStatus.InProgress, "Job not in progress");

        job.deliveryProof = _proof;
        job.status = JobStatus.Delivered;
        job.deliveredAt = block.timestamp;

        emit DeliverySubmitted(_jobId, _proof);
    }

    /// @notice Client approves delivery and releases payment from escrow
    function approveAndPay(uint256 _jobId) external {
        Job storage job = jobs[_jobId];
        require(msg.sender == job.client, "Only client");
        require(job.status == JobStatus.Delivered, "Not delivered");

        job.status = JobStatus.Approved;

        uint256 payment = job.agreedAmount;
        Auction storage auction = auctions[job.auctionId];

        // Pay freelancer
        (bool sent,) = payable(job.freelancer).call{value: payment}("");
        require(sent, "Payment failed");

        // Refund excess to client (if bid < maxBudget)
        uint256 refund = auction.escrowAmount - payment;
        if (refund > 0) {
            (bool refundSent,) = payable(job.client).call{value: refund}("");
            require(refundSent, "Refund failed");
        }

        // Update freelancer stats
        _boostScore(job.freelancer);
        profiles[job.freelancer].completedJobs++;
        profiles[job.freelancer].totalEarned += payment;

        emit JobApproved(_jobId, job.freelancer, payment);
    }

    // ============================
    // DISPUTE TRIBUNAL
    // ============================

    /// @notice Open a dispute on a delivered or in-progress job
    function openDispute(uint256 _jobId) external {
        Job storage job = jobs[_jobId];
        require(
            msg.sender == job.client || msg.sender == job.freelancer,
            "Not involved"
        );
        require(
            job.status == JobStatus.Delivered || job.status == JobStatus.InProgress,
            "Cannot dispute"
        );

        job.status = JobStatus.Disputed;

        uint256 disputeId = disputeCounter++;
        disputes[disputeId].jobId = _jobId;
        disputes[disputeId].totalVotesNeeded = AUDITOR_COUNT;
        disputes[disputeId].resolved = false;
        jobToDispute[_jobId] = disputeId;

        _selectAuditors(disputeId);

        emit DisputeOpened(_jobId, disputeId);
    }

    /// @notice Auditor casts a vote on a dispute
    /// @param _disputeId Dispute ID
    /// @param _inFavorOfClient true = vote for client, false = vote for freelancer
    function castVote(uint256 _disputeId, bool _inFavorOfClient) external {
        Dispute storage dispute = disputes[_disputeId];
        require(!dispute.resolved, "Already resolved");
        require(!disputeVotes[_disputeId][msg.sender], "Already voted");

        // Verify caller is an assigned auditor
        bool isAuditor = false;
        for (uint256 i = 0; i < dispute.auditors.length; i++) {
            if (dispute.auditors[i] == msg.sender) {
                isAuditor = true;
                break;
            }
        }
        require(isAuditor, "Not an auditor");

        disputeVotes[_disputeId][msg.sender] = true;

        if (_inFavorOfClient) {
            dispute.votesForClient++;
        } else {
            dispute.votesForFreelancer++;
        }

        emit VoteCast(_disputeId, msg.sender, _inFavorOfClient);

        // Check if majority reached
        uint256 majority = (dispute.totalVotesNeeded / 2) + 1;
        if (dispute.votesForClient >= majority) {
            _resolveDispute(_disputeId, true);
        } else if (dispute.votesForFreelancer >= majority) {
            _resolveDispute(_disputeId, false);
        }
    }

    // ============================
    // INTERNAL FUNCTIONS
    // ============================

    function _boostScore(address _user) internal {
        uint256 oldScore = profiles[_user].qualityScore;
        uint256 newScore = oldScore + SCORE_BOOST_PER_JOB;
        if (newScore > MAX_SCORE) newScore = MAX_SCORE;
        profiles[_user].qualityScore = newScore;
        emit ScoreUpdated(_user, oldScore, newScore);
    }

    function _penalizeScore(address _user) internal {
        uint256 oldScore = profiles[_user].qualityScore;
        uint256 newScore;
        if (oldScore <= SCORE_PENALTY_DISPUTE) {
            newScore = 0;
        } else {
            newScore = oldScore - SCORE_PENALTY_DISPUTE;
        }
        profiles[_user].qualityScore = newScore;
        emit ScoreUpdated(_user, oldScore, newScore);
    }

    /// @dev Select auditors with high scores (simplified for hackathon)
    function _selectAuditors(uint256 _disputeId) internal {
        Dispute storage dispute = disputes[_disputeId];
        Job storage job = jobs[dispute.jobId];
        uint256 selected = 0;

        for (uint256 i = 0; i < registeredUsers.length && selected < AUDITOR_COUNT; i++) {
            address candidate = registeredUsers[i];
            if (candidate == job.client || candidate == job.freelancer) continue;
            if (profiles[candidate].qualityScore < MIN_AUDITOR_SCORE) continue;

            dispute.auditors.push(candidate);
            selected++;
            emit AuditorAssigned(_disputeId, candidate);
        }
    }

    function _resolveDispute(uint256 _disputeId, bool _clientWon) internal {
        Dispute storage dispute = disputes[_disputeId];
        dispute.resolved = true;

        Job storage job = jobs[dispute.jobId];
        job.status = JobStatus.Resolved;

        Auction storage auction = auctions[job.auctionId];
        uint256 amount = auction.escrowAmount;

        if (_clientWon) {
            (bool sent,) = payable(job.client).call{value: amount}("");
            require(sent, "Transfer failed");
            _penalizeScore(job.freelancer);
            profiles[job.freelancer].disputesLost++;
            profiles[job.client].disputesWon++;
        } else {
            (bool sent,) = payable(job.freelancer).call{value: amount}("");
            require(sent, "Transfer failed");
            _penalizeScore(job.client);
            profiles[job.client].disputesLost++;
            profiles[job.freelancer].disputesWon++;
            profiles[job.freelancer].completedJobs++;
            profiles[job.freelancer].totalEarned += amount;
        }

        emit DisputeResolved(_disputeId, _clientWon, amount);
    }

    // ============================
    // VIEW FUNCTIONS
    // ============================

    /// @notice Get a user's profile
    function getProfile(address _user) external view returns (UserProfile memory) {
        return profiles[_user];
    }

    /// @notice Get all bids for an auction
    function getAuctionBids(uint256 _auctionId) external view returns (Bid[] memory) {
        return auctionBids[_auctionId];
    }

    /// @notice Get the top 3 bids by composite score (score/price ratio)
    function getTopBids(uint256 _auctionId) external view returns (Bid[3] memory topBids) {
        Bid[] storage bids = auctionBids[_auctionId];
        if (bids.length == 0) return topBids;

        uint256[3] memory topScores;
        uint256[3] memory topIndices;

        for (uint256 i = 0; i < bids.length; i++) {
            uint256 compositeScore = (bids[i].freelancerScore * 1e18) / bids[i].amount;

            for (uint256 j = 0; j < 3; j++) {
                if (compositeScore > topScores[j]) {
                    // Shift down
                    for (uint256 k = 2; k > j; k--) {
                        topScores[k] = topScores[k - 1];
                        topIndices[k] = topIndices[k - 1];
                    }
                    topScores[j] = compositeScore;
                    topIndices[j] = i;
                    break;
                }
            }
        }

        uint256 count = bids.length < 3 ? bids.length : 3;
        for (uint256 i = 0; i < count; i++) {
            topBids[i] = bids[topIndices[i]];
        }
    }

    /// @notice Get total number of registered users
    function getTotalUsers() external view returns (uint256) {
        return registeredUsers.length;
    }

    /// @notice Get dispute auditors
    function getDisputeAuditors(uint256 _disputeId) external view returns (address[] memory) {
        return disputes[_disputeId].auditors;
    }

    /// @notice Check if an auction has expired
    function isAuctionExpired(uint256 _auctionId) external view returns (bool) {
        return block.timestamp > auctions[_auctionId].endTime;
    }

    /// @notice Get active auctions (paginated)
    function getActiveAuctions(uint256 _offset, uint256 _limit) external view returns (uint256[] memory) {
        uint256[] memory temp = new uint256[](_limit);
        uint256 count = 0;
        for (uint256 i = _offset; i < auctionCounter && count < _limit; i++) {
            if (auctions[i].status == AuctionStatus.Active) {
                temp[count] = i;
                count++;
            }
        }
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = temp[i];
        }
        return result;
    }

    /// @notice Get bid count for an auction
    function getBidCount(uint256 _auctionId) external view returns (uint256) {
        return auctionBids[_auctionId].length;
    }

    /// @notice Receive MON (needed for escrow)
    receive() external payable {}
}
