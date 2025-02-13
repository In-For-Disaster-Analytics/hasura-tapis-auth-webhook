#!/bin/bash

# Check if TACC_ACCESS_TOKEN is set
if [ -z "${TACC_ACCESS_TOKEN}" ]; then
    echo "Error: TACC_ACCESS_TOKEN environment variable is not set"
    exit 1
fi

# Configuration
WEBHOOK_URL="http://localhost:3000/auth-webhook"  # Update this with your webhook URL

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "Testing Hasura Tapis Auth Webhook..."
echo "=============================="
echo "1. Testing health endpoint..."

# Test health endpoint
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "${WEBHOOK_URL%/auth-webhook}/health")
HEALTH_BODY=$(echo "$HEALTH_RESPONSE" | head -n 1)
HEALTH_STATUS=$(echo "$HEALTH_RESPONSE" | tail -n 1)

if [ "$HEALTH_STATUS" -eq 200 ]; then
    printf "${GREEN}✓ Health check passed${NC}\n"
else
    printf "${RED}✗ Health check failed with status $HEALTH_STATUS${NC}\n"
fi

echo -e "\n2. Testing auth webhook with Tapis token..."

# Create JSON payload with the token
JSON_PAYLOAD=$(cat <<EOF
{
  "headers": {
    "authorization": "Bearer ${TACC_ACCESS_TOKEN}"
  }
}
EOF
)

# Make the request and capture both response body and status code
RESPONSE=$(curl -s -w "\n%{http_code}" \
    -X POST \
    -H "Content-Type: application/json" \
    -d "$JSON_PAYLOAD" \
    "$WEBHOOK_URL")

BODY=$(echo "$RESPONSE" | head -n 1)
STATUS=$(echo "$RESPONSE" | tail -n 1)

echo -e "\nResponse Status: $STATUS"
echo -e "Response Body:"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"

# Check if the response contains the expected Hasura session variables
if [ "$STATUS" -eq 200 ] && echo "$BODY" | grep -q "X-Hasura-Role"; then
    printf "\n${GREEN}✓ Auth webhook test passed${NC}\n"
    echo -e "\nSession variables received:"
    echo "$BODY" | jq '.' 2>/dev/null | grep "X-Hasura"
else
    printf "\n${RED}✗ Auth webhook test failed${NC}\n"
    if [ "$STATUS" -ne 200 ]; then
        echo "Error: Received status code $STATUS"
    else
        echo "Error: Response did not contain expected session variables"
    fi
fi