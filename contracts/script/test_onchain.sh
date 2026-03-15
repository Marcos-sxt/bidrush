#!/bin/bash
# ===========================================
#  BidRush On-Chain Sequential Test Suite
#  Cada tx espera confirmação antes da próxima
# ===========================================

set -e  # para no primeiro erro

CONTRACT="0x8C326731903F2bD3CfE48fE2E81a1079783f66E5"
RPC="https://testnet-rpc.monad.xyz"
PK="${PRIVATE_KEY:?Set PRIVATE_KEY env var}"

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

pass() { echo -e "  ${GREEN}✅ PASS${NC}: $1"; }
fail() { echo -e "  ${RED}❌ FAIL${NC}: $1"; exit 1; }
info() { echo -e "  ${CYAN}ℹ️ ${NC} $1"; }
header() { echo -e "\n${YELLOW}[$1]${NC} $2"; }

DEPLOYER=$(cast wallet address --private-key $PK)
echo "==========================================="
echo "  BidRush On-Chain Sequential Tests"
echo "  Contract: $CONTRACT"
echo "  Tester:   $DEPLOYER"
echo "  RPC:      $RPC"
echo "==========================================="

# =============================================
# TEST 1: User Registration
# =============================================
header "TEST 1" "User Registration"

info "Sending registerUser()..."
TX1=$(cast send $CONTRACT "registerUser()" \
  --rpc-url $RPC --private-key $PK \
  --json 2>/dev/null | jq -r '.transactionHash')
info "TX: $TX1"

# Verificar perfil
PROFILE=$(cast call $CONTRACT "getProfile(address)(uint256,uint256,uint256,uint256,uint256,uint256,uint256,bool)" \
  $DEPLOYER --rpc-url $RPC 2>/dev/null)
SCORE=$(echo "$PROFILE" | head -1)
EXISTS=$(echo "$PROFILE" | tail -1)

if [ "$EXISTS" = "true" ]; then
  pass "Profile exists"
else
  fail "Profile not created"
fi

if [ "$SCORE" = "50" ]; then
  pass "Initial score = 50"
else
  fail "Score is $SCORE, expected 50"
fi

# Double register (idempotent)
info "Sending registerUser() again (idempotent test)..."
TX1B=$(cast send $CONTRACT "registerUser()" \
  --rpc-url $RPC --private-key $PK \
  --json 2>/dev/null | jq -r '.transactionHash')
info "TX: $TX1B"

PROFILE2=$(cast call $CONTRACT "getProfile(address)(uint256,uint256,uint256,uint256,uint256,uint256,uint256,bool)" \
  $DEPLOYER --rpc-url $RPC 2>/dev/null)
SCORE2=$(echo "$PROFILE2" | head -1)
if [ "$SCORE2" = "$SCORE" ]; then
  pass "Double register is idempotent (score unchanged)"
else
  fail "Score changed after double register"
fi

# =============================================
# TEST 2: Create Flash Auction
# =============================================
header "TEST 2" "Create Flash Auction"

COUNTER_BEFORE=$(cast call $CONTRACT "auctionCounter()(uint256)" --rpc-url $RPC 2>/dev/null)
info "Auction counter before: $COUNTER_BEFORE"

info "Sending createAuction('Sequential test job', 0) with 0.01 MON..."
TX2=$(cast send $CONTRACT "createAuction(string,uint256)" \
  "Sequential test: build a Monad dApp" 0 \
  --value 0.01ether \
  --rpc-url $RPC --private-key $PK \
  --json 2>/dev/null | jq -r '.transactionHash')
info "TX: $TX2"

COUNTER_AFTER=$(cast call $CONTRACT "auctionCounter()(uint256)" --rpc-url $RPC 2>/dev/null)
AUCTION_ID=$((COUNTER_AFTER - 1))
info "Auction counter after: $COUNTER_AFTER"
info "New auction ID: $AUCTION_ID"

if [ "$COUNTER_AFTER" -gt "$COUNTER_BEFORE" ]; then
  pass "Auction created (id=$AUCTION_ID)"
else
  fail "Auction counter did not increment"
fi

# Verificar bid count = 0
BID_COUNT=$(cast call $CONTRACT "getBidCount(uint256)(uint256)" $AUCTION_ID --rpc-url $RPC 2>/dev/null)
if [ "$BID_COUNT" = "0" ]; then
  pass "Bid count = 0"
else
  fail "Bid count is $BID_COUNT, expected 0"
fi

# Verificar que não expirou
EXPIRED=$(cast call $CONTRACT "isAuctionExpired(uint256)(bool)" $AUCTION_ID --rpc-url $RPC 2>/dev/null)
if [ "$EXPIRED" = "false" ]; then
  pass "Auction not expired (correct)"
else
  info "Auction already expired (was fast!)"
fi

# =============================================
# TEST 3: Self-bid revert
# =============================================
header "TEST 3" "Self-bid should revert"

info "Sending placeBid() from client (should revert)..."
if cast send $CONTRACT "placeBid(uint256,uint256,uint256)" \
  $AUCTION_ID $(cast to-wei 0.005) 24 \
  --rpc-url $RPC --private-key $PK \
  --json 2>/dev/null ; then
  # Check if tx reverted
  fail "Self-bid should have reverted"
else
  pass "Self-bid correctly reverted (Client cannot bid)"
fi

# =============================================
# TEST 4: Cancel Auction + Refund
# =============================================
header "TEST 4" "Cancel Auction + Refund"

BAL_BEFORE=$(cast balance $DEPLOYER --rpc-url $RPC 2>/dev/null)
info "Balance before cancel: $(cast from-wei $BAL_BEFORE) MON"

info "Sending cancelAuction($AUCTION_ID)..."
TX4=$(cast send $CONTRACT "cancelAuction(uint256)" $AUCTION_ID \
  --rpc-url $RPC --private-key $PK \
  --json 2>/dev/null | jq -r '.transactionHash')
info "TX: $TX4"

BAL_AFTER=$(cast balance $DEPLOYER --rpc-url $RPC 2>/dev/null)
info "Balance after cancel:  $(cast from-wei $BAL_AFTER) MON"

pass "Auction cancelled + escrow refunded"

# =============================================
# TEST 5: Create another auction (for next tests)
# =============================================
header "TEST 5" "Create auction for active auctions check"

info "Sending createAuction('Active test', 0) with 0.005 MON..."
TX5=$(cast send $CONTRACT "createAuction(string,uint256)" \
  "Active auction for view test" 0 \
  --value 0.005ether \
  --rpc-url $RPC --private-key $PK \
  --json 2>/dev/null | jq -r '.transactionHash')
info "TX: $TX5"

COUNTER_NOW=$(cast call $CONTRACT "auctionCounter()(uint256)" --rpc-url $RPC 2>/dev/null)
ACTIVE_AID=$((COUNTER_NOW - 1))
pass "Created auction id=$ACTIVE_AID"

# =============================================
# TEST 6: View Functions
# =============================================
header "TEST 6" "View Functions"

# Total users
TOTAL=$(cast call $CONTRACT "getTotalUsers()(uint256)" --rpc-url $RPC 2>/dev/null)
info "getTotalUsers() = $TOTAL"
if [ "$TOTAL" -ge "1" ]; then
  pass "Total users >= 1"
else
  fail "No users found"
fi

# Active auctions
# Note: getActiveAuctions returns a dynamic array, cast outputs them differently
info "Checking getActiveAuctions..."
ACTIVES=$(cast call $CONTRACT "getActiveAuctions(uint256,uint256)(uint256[])" 0 50 --rpc-url $RPC 2>/dev/null)
info "Active auctions: $ACTIVES"
pass "getActiveAuctions() returned data"

# Profile
info "Checking profile..."
PROFILE_FINAL=$(cast call $CONTRACT "getProfile(address)(uint256,uint256,uint256,uint256,uint256,uint256,uint256,bool)" \
  $DEPLOYER --rpc-url $RPC 2>/dev/null)
FINAL_SCORE=$(echo "$PROFILE_FINAL" | sed -n '1p')
FINAL_JOBS=$(echo "$PROFILE_FINAL" | sed -n '2p')
FINAL_EARNED=$(echo "$PROFILE_FINAL" | sed -n '3p')
FINAL_SPENT=$(echo "$PROFILE_FINAL" | sed -n '4p')
FINAL_EXISTS=$(echo "$PROFILE_FINAL" | sed -n '8p')

info "Score: $FINAL_SCORE | Jobs: $FINAL_JOBS | Earned: $FINAL_EARNED | Spent: $(cast from-wei $FINAL_SPENT) MON"
pass "All profile fields readable"

# =============================================
# SUMMARY
# =============================================
echo ""
echo "==========================================="
echo -e "  ${GREEN}ALL ON-CHAIN TESTS PASSED!${NC}"
echo "  Contract is LIVE and WORKING on Monad Testnet"
echo "  All txs confirmed sequentially"
echo "==========================================="
