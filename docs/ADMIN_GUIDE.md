# Admin Dashboard Guide

## Overview

The Admin Dashboard provides a secure interface for managing investor personas. It includes full CRUD (Create, Read, Update, Delete) functionality with a user-friendly interface.

## Accessing the Admin Dashboard

### Step 1: Navigate to Admin Login

Visit: `https://your-domain.com/secret-admin`

You'll see a login screen with a secret key input field.

### Step 2: Enter Admin Secret Key

Enter the value from your `.env` file:
```
ADMIN_SECRET_KEY=your_strong_secret_key_here
```

Click "Verify Access" to proceed.

### Step 3: Access Granted

Upon successful authentication, you'll be redirected to:
`https://your-domain.com/secret-admin/dashboard`

Your session will last for 1 hour before requiring re-authentication.

## Dashboard Interface

### Main Dashboard View

The dashboard displays:

1. **Header Section**
   - Page title: "Admin Dashboard"
   - Subtitle: "Manage investor personas"
   - Logout button (top right)

2. **Investor Personas Card**
   - Add Investor button (top right)
   - Data table showing all investor personas

3. **Data Table Columns**
   - Name
   - Role
   - Region
   - Check Size
   - Target Sector
   - Actions (Edit/Delete buttons)

## Managing Investor Personas

### Creating a New Investor

1. Click the **"Add Investor"** button
2. Fill in the form with required information
3. Click **"Create Investor"** to save

#### Form Fields

**Basic Information (Required)**
- **Name:** Investor's full name (e.g., "Sarah Chen")
- **Role:** Investor's title/persona (e.g., "The Titan")
- **Region:** Geographic location (e.g., "USA", "Europe", "Asia")
- **Language Code:** Two-letter code (default: "en")

**Investment Profile (Required)**
- **Risk Appetite:** Investment risk preference (e.g., "High Risk, High Reward")
- **Target Sector:** Industries of interest (e.g., "B2B SaaS, AI Infrastructure")
- **Check Size:** Investment range (e.g., "$5M - $25M")
- **Investment Thesis:** Detailed investment philosophy (multi-line text)

**Talking Style Settings**
- **Bluntness (1-10):** How direct the investor is
  - 1 = Very diplomatic
  - 10 = Extremely blunt

- **Humor (1-10):** Level of humor in responses
  - 1 = Very serious
  - 10 = Very humorous

- **Jargon Level:** Technical language usage
  - Options: "low", "medium", "high"

- **Favorite Word:** A word the investor uses frequently (e.g., "synergy")

**Optional Fields**
- **Avatar URL:** Link to investor's profile image

#### Example: Creating an Investor

```
Name: Alex Rodriguez
Role: The Skeptic
Region: Silicon Valley
Language Code: en
Avatar URL: https://example.com/avatar.jpg

Risk Appetite: Conservative Growth
Target Sector: Enterprise SaaS, DevTools
Check Size: $2M - $10M
Investment Thesis: Focuses on proven business models with strong
retention metrics. Prefers founders with prior exits and deep
domain expertise. Values capital efficiency over growth-at-all-costs.

Bluntness: 9
Humor: 3
Jargon Level: high
Favorite Word: metrics
```

### Editing an Existing Investor

1. Locate the investor in the table
2. Click the **Edit icon** (pencil) in the Actions column
3. Modify the desired fields
4. Click **"Update Investor"** to save changes

**Note:** All fields are editable except the ID and creation timestamp.

### Deleting an Investor

1. Locate the investor in the table
2. Click the **Delete icon** (trash) in the Actions column
3. Confirm the deletion in the popup dialog
4. Click **"Delete"** to permanently remove

**Warning:** Deletion is permanent and cannot be undone. Any active conversations with this investor will be affected.

### Viewing All Investors

The dashboard automatically loads and displays all investor personas in a table format. The table includes:

- Sortable columns (click headers to sort)
- Responsive design (scrolls on smaller screens)
- Empty state message if no investors exist

## Session Management

### Session Duration
- Sessions last **1 hour** from login
- After expiration, you'll need to log in again
- Sessions are stored in secure HTTP-only cookies

### Logging Out

1. Click the **"Logout"** button in the top-right corner
2. You'll be redirected to the login page
3. Your session cookie will be cleared

### Security Features

- HTTP-only cookies (protected from JavaScript access)
- Secure flag enabled in production (HTTPS only)
- SameSite strict policy (prevents CSRF attacks)
- Server-side validation for all operations

## Best Practices

### Creating Effective Investor Personas

1. **Diverse Personalities:** Create investors with varied styles
   - Mix blunt and diplomatic personas
   - Include different humor levels
   - Vary jargon usage

2. **Realistic Investment Profiles:**
   - Use actual investment thesis patterns
   - Reference real sector trends
   - Set realistic check sizes

3. **Consistent Characterization:**
   - Align bluntness with role (e.g., "The Skeptic" = high bluntness)
   - Match jargon level to sector expertise
   - Use favorite words that fit the persona

4. **Clear Naming:**
   - Use memorable names
   - Descriptive roles (e.g., "The Growth Hacker", "The Value Seeker")
   - Include region for context

### Maintaining the Database

1. **Regular Audits:**
   - Review personas quarterly
   - Update investment theses to reflect market trends
   - Remove outdated or unused personas

2. **Data Quality:**
   - Verify all required fields are filled
   - Check for typos and formatting errors
   - Ensure avatar URLs are valid

3. **Testing:**
   - Test new personas in the arena before publishing
   - Verify AI responses match the intended personality
   - Adjust talking style settings based on feedback

### Content Guidelines

**Investment Thesis Examples:**
```
✅ Good: "Focuses on B2B companies with $1M+ ARR, strong
unit economics (LTV/CAC > 3), and experienced founding teams."

❌ Bad: "Invests in tech companies."
```

**Talking Style Combinations:**
```
The Diplomat:
- Bluntness: 3
- Humor: 5
- Jargon: medium
- Favorite Word: "partnership"

The Shark:
- Bluntness: 9
- Humor: 2
- Jargon: high
- Favorite Word: "revenue"

The Mentor:
- Bluntness: 6
- Humor: 7
- Jargon: low
- Favorite Word: "journey"
```

## Troubleshooting

### Can't Access Dashboard

**Problem:** Redirected to 404 page after login

**Solutions:**
- Verify admin secret key is correct
- Clear browser cookies and try again
- Check that session hasn't expired
- Ensure environment variable is set correctly

### Changes Not Saving

**Problem:** Edit form doesn't save changes

**Solutions:**
- Check browser console for errors
- Verify all required fields are filled
- Ensure you have an active session
- Try logging out and back in

### Personas Not Loading

**Problem:** Dashboard shows "Failed to load investor personas"

**Solutions:**
- Check Supabase connection
- Verify service role key is correct
- Check database migrations are applied
- Review browser console for error details

### Delete Confirmation Not Appearing

**Problem:** Delete button doesn't show confirmation

**Solutions:**
- Check for JavaScript errors in console
- Try refreshing the page
- Clear browser cache
- Use a different browser

## API Operations Reference

### Authentication Endpoint
```
POST /api/admin/auth
Body: { action: 'login', secretKey: 'your_key' }
Response: { success: true }
```

### Logout Endpoint
```
POST /api/admin/auth
Body: { action: 'logout' }
Response: { success: true }
```

### Data Operations
All data operations use Next.js Server Actions:

- `getAllInvestorPersonas()` - Fetch all investors
- `createInvestorPersona(data)` - Create new investor
- `updateInvestorPersona(id, data)` - Update investor
- `deleteInvestorPersona(id)` - Delete investor

## Security Recommendations

1. **Strong Secret Key:**
   - Use at least 32 characters
   - Include uppercase, lowercase, numbers, and symbols
   - Change periodically (every 90 days)
   - Never commit to version control

2. **Access Control:**
   - Limit admin access to trusted personnel
   - Use HTTPS in production
   - Monitor access logs
   - Implement IP whitelisting (optional)

3. **Data Backup:**
   - Export data regularly via Supabase dashboard
   - Keep backups in secure location
   - Test restore procedures
   - Document backup schedule

4. **Audit Trail:**
   - Monitor who accesses the admin panel
   - Track changes to investor personas
   - Review logs periodically
   - Set up alerts for suspicious activity

## FAQ

**Q: Can multiple admins use the dashboard simultaneously?**
A: Yes, each admin has their own session cookie.

**Q: What happens if I delete an investor while someone is chatting with them?**
A: The chat session will continue, but new sessions cannot be started with that investor.

**Q: Can I export investor data?**
A: Yes, use the Supabase dashboard to export the `investor_personas` table as CSV or JSON.

**Q: How do I change the admin secret key?**
A: Update the `ADMIN_SECRET_KEY` in your `.env` file and restart the server.

**Q: Is there a limit to how many investors I can create?**
A: No built-in limit, but consider performance with 100+ personas.

**Q: Can I restore deleted investors?**
A: No, deletion is permanent. Always keep backups.
