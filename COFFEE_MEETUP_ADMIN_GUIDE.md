# Coffee Meetup Admin Guide

## Overview
Coffee meetups are managed through a configuration file at `/content/coffee-meetups.json`. This allows you to:
- Override automatic 2nd Friday scheduling
- Set specific dates for special occasions
- Skip months when no meetup is planned
- Update location, time, or other details

## Quick Reference

### File Location
```
content/coffee-meetups.json
```

### To Change a Date

#### Option 1: Use Manual Override (Recommended for one-off changes)
1. Open `content/coffee-meetups.json`
2. Set `"manualOverride": true`
3. Add the specific date to `specificDates` array:
```json
{
  "date": "2025-05-09",
  "title": "Espresso Yourself Coffee Meet-Up",
  "location": "Coffee Fellows, 3329 W Grand Pkwy N #700, Katy, TX 77449",
  "timeOverride": null,
  "notes": "2nd Friday of May"
}
```
4. Commit and push changes
5. Vercel will auto-deploy

#### Option 2: Skip a Month
1. Add month number to `skipMonths`:
```json
"skipMonths": [12]  // Skips December
```

#### Option 3: Return to Auto-Schedule
1. Set `"manualOverride": false`
2. The system will automatically calculate 2nd Fridays

## Configuration Options

| Field | Type | Description |
|-------|------|-------------|
| `enabled` | boolean | Set to `false` to disable coffee meetups completely |
| `manualOverride` | boolean | When `true`, uses dates from `specificDates` instead of auto-calculating |
| `specificDates` | array | List of specific meetup dates with optional overrides |
| `skipMonths` | array | Month numbers (1-12) to skip auto-generation |
| `defaultTime` | string | Default start time in HH:MM format (24-hour) |
| `defaultDuration` | number | Duration in hours |
| `defaultLocation` | string | Default venue address |
| `title` | string | Event title |
| `description` | string | Event description shown on website |
| `image` | string | Path to event image |

## Specific Date Fields

When adding to `specificDates`:

| Field | Required | Description |
|-------|----------|-------------|
| `date` | Yes | Date in YYYY-MM-DD format |
| `title` | No | Override the default title for this date |
| `location` | No | Override the default location |
| `timeOverride` | No | Override time (null uses default) |
| `notes` | No | Internal notes (not shown on website) |

## Examples

### Example 1: Regular 2nd Friday (Auto)
```json
{
  "manualOverride": false,
  "specificDates": []
}
```

### Example 2: Specific Date Override
```json
{
  "manualOverride": true,
  "specificDates": [
    {
      "date": "2025-05-09",
      "title": "Special Pride Month Kickoff Coffee",
      "location": "Coffee Fellows, 3329 W Grand Pkwy N #700, Katy, TX 77449",
      "notes": "Pride month special meetup"
    }
  ]
}
```

### Example 3: Skip Summer Months
```json
{
  "skipMonths": [6, 7, 8],
  "manualOverride": false
}
```

### Example 4: Multiple Specific Dates
```json
{
  "manualOverride": true,
  "specificDates": [
    {
      "date": "2025-05-09",
      "title": "Espresso Yourself Coffee Meet-Up",
      "notes": "May meetup"
    },
    {
      "date": "2025-06-13",
      "title": "Summer Coffee Social",
      "location": "Different Venue Address",
      "notes": "June special location"
    }
  ]
}
```

## Deployment

After editing `coffee-meetups.json`:

```bash
git add content/coffee-meetups.json
git commit -m "Update coffee meetup dates for May"
git push origin main
```

Vercel will automatically deploy the changes.

## Troubleshooting

**Changes not showing?**
- Check that you committed and pushed to the correct branch
- Vercel deployments take 1-2 minutes
- Try hard refresh (Ctrl+Shift+R) to clear cache

**Date format errors?**
- Dates must be in `YYYY-MM-DD` format (e.g., `2025-05-09`)
- No slashes, use hyphens

**Meetup not appearing?**
- Check that `enabled` is `true`
- If using `manualOverride`, ensure the date hasn't already passed
- The website only shows future events

## Current Schedule Logic

By default, the website automatically:
1. Calculates the 2nd Friday of each month
2. Shows the next upcoming 2nd Friday that hasn't passed
3. Respects `skipMonths` (won't generate meetups for skipped months)
4. Uses `defaultTime` (1:00 PM) and `defaultDuration` (2 hours)
5. Uses `defaultLocation` for the venue

## Need Help?

Contact the web team or check the main admin guide at `ADMIN_GUIDE.md`.
