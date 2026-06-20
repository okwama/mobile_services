#!/usr/bin/env bash
API_BASE=${API_BASE:-http://localhost:3000}
QUERY=${1:-Nairobi}

echo "API base: $API_BASE"
echo "Query: $QUERY"

response=$(curl -sS -w "\n%{http_code}" "$API_BASE/locations/search?q=$QUERY" -H "Accept: application/json")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

echo "HTTP $http_code"
echo "$body"

if [[ "$http_code" -ge 200 && "$http_code" -lt 300 ]]; then
  echo "OK"
  exit 0
else
  echo "FAIL"
  exit 2
fi
