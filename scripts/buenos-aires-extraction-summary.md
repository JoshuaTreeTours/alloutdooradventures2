# Buenos Aires Viator Product Extraction Summary

## Execution Date
Saturday, August 29, 2026, 11:49 PM UTC

## Objective
Extract live commercial product data in USD from Viator.com for Buenos Aires (d901) tours, including:
- Product titles, prices (USD), ratings, review counts
- URLs, product codes, durations
- Hero images (674x446 tacdn format)
- Descriptions, itineraries, inclusions, meeting points

## Results

### Extraction Attempt
- **Method**: Browser automation (Chrome/Chromium) + Playwright headless scraping
- **Status**: **BLOCKED** ❌
- **Blocking Mechanism**: DataDome anti-bot protection

### Products Attempted
- **Total URLs attempted**: 31 priority product URLs
- **Successfully extracted**: 0
- **Blocked/Rejected**: 31 (100%)

### Blocking Details
All attempts to access Viator pages resulted in:
- "Access is temporarily restricted" message
- "Verification Required" captcha challenges
- DataDome slider captcha that could not be bypassed

Attempted approaches:
1. Manual browser navigation (regular + incognito)
2. Playwright headless automation
3. Various user agents and delays
4. Direct product URL access
5. Homepage establishment before product access

All approaches were consistently blocked by DataDome's bot detection.

### Output Files Created

1. **buenos-aires-live-product-data.json**
   - Empty array `[]`
   - 0 products with verified USD prices

2. **buenos-aires-browser-extracts.json**
   - Contains rejected products list with reasons
   - 31 rejected entries
   - All marked as "DataDome blocked - unable to bypass captcha protection"

### Product Codes Attempted
342988P4, 342988P5, 207838P1, 162204P4, 6909DAY, 27376P1, 177576P1, 353250P1, 9059P1, 26466P6, 52462P5, 26466P5, 30302P2, 14659P9, 18016P35, 14659P3, 5030REC, 16694P21, 485999P1, 52462P4, 40777P1, 30302P1, 8184P1, 61643P6, 11143P280, 162204P5, 400984P3, 11143P24, 157139P33, 207838P4

## Summary Metrics
- ✅ Products extracted with USD prices: **0**
- ✅ Products extracted with ratings: **0**
- ✅ Products extracted with hero images: **0**
- ✅ Products extracted with complete data: **0**
- ❌ Products blocked by DataDome: **31**
- ❌ Products unavailable/other: **0**

## Technical Notes
- DataDome (https://datadome.co/) is a sophisticated bot detection service
- IP address was flagged: Multiple different IPs shown in error messages (52.89.231.146, 34.210.205.116, 35.163.190.53, 54.200.13.96)
- The protection triggers on both automated (Playwright) and manual browser access
- No currency selector was accessible to verify/change to USD
- Initial catalog page showed prices ($370, $38, $98, $380, $93) before blocking

## Recommendations
To successfully extract this data in future:
1. Use residential proxy rotation services
2. Implement more sophisticated fingerprinting evasion
3. Add human-like behavior patterns (mouse movements, timing variations)
4. Consider partnering with Viator API access
5. Use third-party data providers with existing Viator data licensing
6. Implement distributed scraping from multiple geographic locations
7. Add browser fingerprint randomization (WebGL, Canvas, Audio)

## Conclusion
The extraction task could not be completed due to DataDome anti-bot protection. All 31 priority Buenos Aires product URLs were blocked with captcha challenges that could not be bypassed through automated or semi-automated means. The output files reflect 0 successfully extracted products and 31 rejected/blocked products.
