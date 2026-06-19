# 🧪 Testing Aviation Data System

## Step 1: Run Database Migration

Copy and paste the entire contents of `migrations/001_add_aviation_metadata.sql` into your MySQL client (phpMyAdmin, TablePlus, etc.) and execute.

**Expected Result**:
```
✅ Column iata_code added
✅ Column icao_code added
✅ Column municipality added
✅ Column elevation_ft added
✅ Column source added
✅ Column last_verified added
✅ Indexes created
✅ Code column modified to allow NULL
```

---

## Step 2: Start the Services

```bash
cd air_services

# Start location service
npm run start:location-service

# Or start all services
npm run start:all
```

**Expected Logs**:
```
[LocationService] Listening on Redis...
[OurAirportsSyncService] Cron job registered for daily sync at 3 AM
```

---

## Step 3: Test Manual OurAirports Sync

### Option A: Via API Gateway

Create a temporary endpoint in API Gateway:

```typescript
// apps/api-gateway/src/controllers/locations.controller.ts

@Post('sync-ourairports')
async syncOurAirports(@Body() body: { countryCode?: string }) {
  return firstValueFrom(
    this.locationService.send(
      { cmd: 'sync_ourairports' },
      { countryCode: body.countryCode || 'KE' }
    )
  );
}

@Post('sync-ourairports-multiple')
async syncOurAirportsMultiple(@Body() body: { countryCodes: string[] }) {
  return firstValueFrom(
    this.locationService.send(
      { cmd: 'sync_ourairports_multiple' },
      { countryCodes: body.countryCodes }
    )
  );
}
```

Then call:
```bash
curl -X POST http://localhost:3000/api/locations/sync-ourairports \
  -H "Content-Type: application/json" \
  -d '{"countryCode": "KE"}'
```

### Option B: Direct Service Call (for testing)

Add a test method to your service:

```typescript
// apps/location-service/src/modules/locations/locations.service.ts

async testOurAirportsSync() {
  const syncService = new OurAirportsSyncService(this.locationRepository, this.httpService);
  return await syncService.syncAirports('KE');
}
```

---

## Step 4: Verify Data in Database

```sql
-- Check total airports synced
SELECT COUNT(*) FROM locations WHERE source = 'ourairports';
-- Expected: 150-200 for Kenya

-- Check ICAO codes
SELECT name, iataCode, icaoCode, municipality, elevationFt 
FROM locations 
WHERE source = 'ourairports' 
ORDER BY name 
LIMIT 10;

-- Expected results (Kenya examples):
-- Jomo Kenyatta International Airport | NBO | HKJK | Nairobi | 5327
-- Moi International Airport | MBA | HKMO | Mombasa | 200
-- Wilson Airport | WIL | HKWJ | Nairobi | 5536
-- Kisumu International Airport | KIS | HKKI | Kisumu | 3734
```

---

## Step 5: Test Google Auto-Save

Search for an airport from your Flutter app:

```dart
// In your Flutter app
final results = await locationService.searchLocations('Nairobi airport');
```

**Backend logs should show**:
```
❌ Cache MISS for search: "nairobi airport" - Fetching fresh data
✅ Saved new location: Jomo Kenyatta International Airport
```

**Verify in database**:
```sql
SELECT * FROM locations WHERE source = 'google' ORDER BY createdAt DESC LIMIT 5;
```

---

## Step 6: Test Search Performance

### Test 1: Cache MISS (First Search)
```bash
curl "http://localhost:3000/api/locations/search?query=Wilson&type=airport"
```

**Expected**:
- Response time: ~600ms
- Logs: `❌ Cache MISS for search: "wilson"`

### Test 2: Cache HIT (Second Search - within 15 min)
```bash
curl "http://localhost:3000/api/locations/search?query=Wilson&type=airport"
```

**Expected**:
- Response time: ~10-50ms ⚡
- Logs: `✅ Cache HIT for search: "wilson"`

---

## Step 7: Test IATA/ICAO Search

```bash
# Search by IATA code (3 letters)
curl "http://localhost:3000/api/locations/search?query=NBO&type=airport"

# Search by ICAO code (4 letters)
curl "http://localhost:3000/api/locations/search?query=HKJK&type=airport"
```

**Expected Result**:
```json
{
  "name": "Jomo Kenyatta International Airport",
  "code": "NBO",
  "iataCode": "NBO",
  "icaoCode": "HKJK",
  "country": "Kenya",
  "municipality": "Nairobi",
  "latitude": -1.319167,
  "longitude": 36.927778,
  "elevationFt": 5327,
  "source": "ourairports"
}
```

---

## Step 8: Test Daily Cron Job

### Option A: Wait until 3 AM 😴
The cron job will run automatically.

### Option B: Trigger Manually (Recommended)

Modify the cron decorator temporarily for testing:

```typescript
// ourairports-sync.service.ts

// Change from:
@Cron(CronExpression.EVERY_DAY_AT_3AM)

// To (for testing):
@Cron(CronExpression.EVERY_30_SECONDS)

// Or trigger manually:
@Cron(CronExpression.EVERY_MINUTE)
```

**Watch logs**:
```
🕐 Starting scheduled daily sync (3 AM)
🚀 Starting OurAirports sync for country: KE
✅ Downloaded 198 airports for KE
✅ Sync complete: { imported: 45, updated: 153, failed: 0 }
```

**Don't forget to change back to EVERY_DAY_AT_3AM after testing!**

---

## Step 9: Load Test (Optional)

```bash
# Run 100 concurrent searches
for i in {1..100}; do
  curl "http://localhost:3000/api/locations/search?query=Nairobi&type=airport" &
done

wait
```

**Expected**:
- First request: ~600ms (cache miss)
- Remaining 99 requests: ~10-50ms each (cache hit)
- All return same data

---

## 📊 Success Criteria

| Test | Expected Result | Status |
|------|-----------------|--------|
| Database migration | ✅ All columns added | ⬜ |
| Service starts | ✅ No errors, cron registered | ⬜ |
| OurAirports sync (KE) | ✅ 150-200 airports imported | ⬜ |
| Google auto-save | ✅ New locations saved to DB | ⬜ |
| Cache HIT | ✅ < 50ms response time | ⬜ |
| Cache MISS | ✅ < 1s response time | ⬜ |
| IATA search | ✅ Returns correct airport | ⬜ |
| ICAO search | ✅ Returns correct airport | ⬜ |
| Daily cron | ✅ Runs at 3 AM (or test time) | ⬜ |

---

## 🐛 Troubleshooting

### Issue: "Column already exists"
**Solution**: Migration script handles this automatically. Just ignore the message.

### Issue: "csv-parser not found"
**Solution**: 
```bash
cd air_services
npm install csv-parser --save
```

### Issue: "Cannot download OurAirports CSV"
**Solution**: Check network connection. The service will retry daily automatically.

### Issue: "No locations found in search"
**Solution**: 
1. Run OurAirports sync first
2. Or search for a location to trigger Google auto-save

### Issue: "Cache not working"
**Solution**: Check Redis connection in logs. Ensure Redis is running.

---

## 🎉 You're Done!

Once all tests pass, you have:
- ✅ Aviation-grade location data
- ✅ Sub-100ms search performance
- ✅ Automatic daily syncs
- ✅ Self-improving database
- ✅ Offline capability

**System is production-ready!** 🚀


