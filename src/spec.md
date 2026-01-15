# RDMmaths Online Education Platform

## Overview
RDMmaths is an online mathematics education platform that offers both free and paid educational content with integrated payment processing, live class access, secure administrative controls, and a comprehensive RDMcoin rewards system.

## Core Features

### Course Management
- Display courses organized into batches (free and paid)
- Course filtering by category, difficulty level, price, and instructor
- Detailed batch information including curriculum, duration, and prerequisites
- Course reviews and ratings system
- Instructor profiles with qualifications and experience

### Video Content System
- Free batches: Embedded YouTube videos accessible to all users
- Paid batches: Hosted video content accessible only after purchase
- Video progress tracking for enrolled students
- Sequential video unlocking based on completion
- RDMcoin rewards: 2 coins per minute of video watch time

### Payment Integration
- Stripe payment processing for paid batch purchases
- Secure checkout flow with course confirmation
- Payment history and receipt generation
- Support for one-time batch purchases

### Student Dashboard
- Overview of purchased courses and enrollment status
- Progress tracking with completion percentages
- Upcoming live class schedules and notifications
- Access to purchased video content
- Payment history and receipts

### Live Classes
- Exclusive live class access for paid batch students
- Live session scheduling and calendar integration
- Class reminders and notifications
- Recording access for missed sessions

### RDMcoin Rewards System
- Daily login rewards: 50 RDMcoins for first login or each daily login (configurable)
- Video watch rewards: 2 RDMcoins per minute of video viewing
- Review rewards: 100 RDMcoins for submitting 5-star reviews
- User level progression based on total coins earned
- Automatic coin tracking and balance updates

### Coin Wallet Dashboard
- "My RDMcoins" page displaying current coin balance
- Recent coin-earning history with timestamps and sources (login, video watch, reviews)
- Level progress visualization with progress bar
- Next level target display and requirements

### Global Leaderboard
- Top 20 users ranked by total coin count
- Weekly automatic updates and rank level upgrades for top 20 users
- User display includes avatar, name, total coins, level, and rank number
- Real-time leaderboard updates

### Admin Authentication System
- Dedicated Admin Login Page accessible at `/admin-login` route
- Secure admin key input field with lock icon for visual security indication
- Admin key verification using existing `verifyAdminKey` backend call
- Successful verification redirects to main Admin Dashboard
- Invalid key displays error message and denies access
- Admin Login Page styled with RDM color theme and logo branding

### Admin Panel with Secure Access
- Special admin key authentication system in addition to regular login
- Admin key prompt when accessing Admin Panel routes
- Only users with valid admin key can access administrative functions
- Course creation and management for authorized admins
- Instructor profile creation and management
- Live session scheduling and management
- Coin Management section for viewing and adjusting user coins
- Accessibility note displayed in Admin Panel about required special key for security

### User Interface
- Modern, professional design optimized for mobile and desktop
- Responsive layout for all screen sizes
- Intuitive navigation and course discovery
- Clean video player interface with progress controls
- RDM logo integration throughout the site (header, hero banner, favicon, footer)
- Dedicated Admin Login Page with consistent branding and security styling

## Backend Data Storage
- User accounts and authentication
- Secure admin key storage in canister state
- Course and batch information (title, description, price, curriculum)
- Instructor profiles and qualifications
- Student enrollments and purchase records
- Video progress tracking data
- Live class schedules and attendance
- Course reviews and ratings
- Payment transaction records
- RDMcoin balances and transaction history for each user
- User level progression data
- Daily login tracking for coin rewards
- Video watch time tracking for coin rewards
- Leaderboard rankings and weekly update timestamps

## Backend Operations
- User registration and authentication
- Admin key verification and validation
- Course enrollment processing
- Stripe payment verification and processing
- Progress tracking updates
- Live class scheduling and management
- Review and rating submission
- Course filtering and search functionality
- Administrative content creation (courses, instructors, live sessions)
- RDMcoin balance management and transaction recording
- Daily login reward processing
- Video watch time tracking and coin awarding
- Review-based coin reward processing
- Leaderboard calculation and weekly ranking updates
- Admin coin adjustment operations
