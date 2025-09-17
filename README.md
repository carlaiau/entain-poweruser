# Entain Statement Fetcher

Fetch your betting statements from the sportsbook’s private API and export them to CSV.

The exported CSV is formatted for direct import into the  
[aussportsbetting.com Betting Tracker](https://www.aussportsbetting.com/tools/betting-tracker-excel-worksheet/),  
so you can seamlessly track and analyze your betting performance.


## How it works

- Built with Next.js server actions
- Requests are made server-side to your sportsbook API (avoids browser CORS)
- Responses are transformed into a CSV that matches the Betting Tracker template
- Selectable provider: TAB (NZ) or Betcha (NZ)
- Date-range selection for fetching statement activity
- Regardless of date range, the query is capped at a maximum count of 2000


## Finding your Bearer Token

1. Log in to TAB or Betcha in your browser  
2. Open Developer Tools (F12 on Windows/Linux, ⌥⌘I on Mac)  
3. Go to the Network tab and refresh the page  
4. Find a request to “/client-details”  
5. Under Headers, copy the value of “Authorization: Bearer …” (everything after “Bearer ”)  
6. Paste the token into the app’s Bearer Token field

**Tip:** Tokens may expire periodically; if requests stop working, grab a fresh token.

## Security & Privacy

- Your bearer token grants access to your account’s API; treat it like a password
- Do not share your token or commit it to source control
- Consider creating a dedicated browser profile when retrieving tokens

## Limitations

- Availability and structure of private APIs can change without notice
- Large date ranges may be throttled by the provider
- Some transactions or fields may not map cleanly to the CSV format

## Disclaimer

This utility is provided as-is.  
The authors take no responsibility for the security of your bearer token or any data retrieved. Use at your own risk.
