# Investment Page Restructuring Plan

## Problem Analysis
- [x] The investments page is loading but showing wrong content in the "Financial Products" section
- [x] The page is too long with 14 different sections
- [x] Content needs to be split into two pages for better user experience

## Implementation Tasks

### 1. Fix Content Loading Issues
- [ ] Fix the financial products section to show the correct bullet list
- [ ] Fix main content showing only the title
- [ ] Improve content parsing in contentLoader.js for investments

### 2. Create New Markdown Files
- [ ] Create investment-solutions.md with sections from Private Equity onwards
- [ ] Update investments.md to only include first 8 sections

### 3. Create New HTML Page
- [ ] Create investment-solutions.html based on investments.html template
- [ ] Update page title and meta description
- [ ] Adjust content sections as needed

### 4. Update Navigation
- [ ] Add "Investment Solutions" to navigation in index.html
- [ ] Add "Investment Solutions" to navigation in about.html
- [ ] Add "Investment Solutions" to navigation in services.html
- [ ] Add "Investment Solutions" to navigation in investments.html
- [ ] Add "Investment Solutions" to navigation in contact.html
- [ ] Add "Investment Solutions" to navigation in new investment-solutions.html
- [ ] Update active states for both investment pages

### 5. Update Content Loader
- [ ] Add new loader function for investment-solutions in main.js
- [ ] Fix the generateFinancialProductsSection to pull correct content
- [ ] Update investments loader to handle split content properly

### 6. Content Display Improvements
- [ ] Create proper grid layouts for investment service cards
- [ ] Add icons for each investment service type
- [ ] Improve visual hierarchy and readability
- [ ] Fix the main content display issue

### 7. Testing Checklist
- [ ] Verify investments.html loads correct content
- [ ] Verify investment-solutions.html loads correct content
- [ ] Check navigation works properly on all pages
- [ ] Ensure responsive design on mobile
- [ ] Verify all console errors are resolved

## Page Content Distribution

### investments.html will contain:
1. Forzak Treats Each Client With Personalized Attention
2. Forzak Has The Experience Needed To Finance Diverse Businesses and Products
3. Industries We Have Invested In (grid display)
4. You Can Count on Forzak To Be Responsive To Your Unique Needs
5. We Are Proud Of Our Strong Acceptance Rate
6. Forzak Enjoys Solid Backing (with financial products list)
7. A Personal Invitation
8. Forzak Can Help Your Company Meet Its Financing Needs

### investment-solutions.html will contain:
1. Private Equity
2. Private Placements
3. Management Buyouts
4. Financial Restructuring
5. Debtor-in-Possession Financing
6. Real Estate Development Financing
7. Asset Based Financing