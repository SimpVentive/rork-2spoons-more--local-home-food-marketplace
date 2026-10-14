# Wire Up Supabase Backend for 2Spoons Marketplace


## What This Does

Replaces all mock data and local-only storage with a real Supabase Postgres database. Listings, orders, users, reviews, follows, and notifications will be shared across all users — turning the app into a real marketplace.

## Features

- **Real user accounts** — sign in with Google or Apple via Rork Auth (replaces the fake email login)
- **Shared listings** — dishes posted by one seller are visible to all buyers immediately
- **Real orders** — orders persist in the database, with proper status tracking across users
- **Reviews & ratings** — reviews are linked to real orders and update seller ratings
- **Follow system** — follow/unfollow chefs with real data
- **Notifications** — notifications persist in the database
- **Everything stays fast** — the Supabase client queries directly from the app with Row Level Security protecting user data

## Database Tables

- **profiles** — user profiles (name, email, location, chef status, subscription)
- **food_listings** — all food listings with pricing, availability, location
- **orders** — order lifecycle from pending to completed
- **reviews** — ratings and comments linked to orders
- **follows** — follower/following relationships
- **notifications** — user notifications (order updates, reviews, system messages)
- **complaints** — user complaints and admin resolution
- **dish_notifications** — saved dish alerts for route-based notifications
- **campaigns** — admin marketing campaigns (email, push, in-app)
- **admin_messages** — admin-to-user messaging system

## Design

The app's existing UI stays exactly the same — all screens, colors, animations, and layouts are unchanged. The only difference is data now comes from the cloud instead of local mocks.
