# Dashboard Site Tree & Structure (Proposed)

To help us align on the refactor, I've analyzed the current structure of the `OwnerDashboardView` and `RenterDashboardView` components and designed a proposed **Site Tree** for the new dashboard. 

Currently, everything is condensed into a single `/dashboard` route with a toggle switch, which can make the page feel heavy and cluttered. Moving to a more structured dashboard (e.g., with a left-hand sidebar or secondary navigation) will significantly improve the user experience.

Here is the proposed site tree for the dashboard. Let me know if you want to add, remove, or modify any sections before we begin refactoring.

## 🌐 Global / Shared Dashboard Areas
These are areas accessible regardless of whether the user is renting or owning at the moment.
*   **Messages (`/messages`)** - Centralized hub for all chat threads.
*   **Profile & Settings (`/profile`)** - User details, ID verification, and notification preferences.
*   **Favorites & Saved (`/favorites`)** - Tools the user has bookmarked for later.

---

## 📦 Renter Dashboard (My Rentals)
Focused entirely on acquiring and managing rented tools.

*   **Renter Overview** 
    *   *Quick summary of urgent items (items due today, upcoming pickups).*
    *   *Shortcut to find new tools (`/listings`).*
*   **Active Rentals** 
    *   Currently rented tools.
    *   **Actions:** Request Extension, Message Owner.
    *   **Status Indicators:** Overdue, Due Today, Due in X Days.
*   **Upcoming Bookings** 
    *   Approved rentals waiting for pickup.
    *   **Actions:** Receive Tool (Handover), Change Dates, Cancel Booking.
*   **Pending Requests**
    *   Requests waiting for the owner's approval.
    *   **Actions:** Cancel Request.
*   **Rental History**
    *   Previously rented items.
    *   **Actions:** Leave a Review, Rent Again.
*   **Disputes & Support** 
    *   Active disputes or issues with rented items.

---

## 🛠️ Owner Dashboard (Command Center)
Focused strictly on managing inventory, handling requests, and tracking revenue.

*   **Owner Overview** 
    *   *High-level KPIs: Earnings (30d), Active Tool Bookings, Total Tools Listed.*
    *   *Shortcut to list a new tool (`/add-tool`).*
*   **Action Center / Inbox** 
    *   High-priority tasks requiring immediate attention.
    *   **Returns Pending Inspection:** Inspect & Release funds.
    *   **Extension Requests:** Approve / Decline.
    *   **Rental Requests:** Approve / Deny (with auto-expire warnings).
*   **My Fleet / Inventory (`/owner/listings`)** 
    *   List of all tools the owner has listed.
    *   **Actions:** Edit listing, pause listing, view tool metrics.
*   **Active Rentals Out (`/owner/active-rentals`)**
    *   Tools currently out with renters.
*   **Earnings & Payouts** 
    *   Stripe Connect management.
    *   Breakdown of revenue vs platform fees.

---

## Refactor Strategy Question:
For the UI, are we leaning towards:
1.  **A Sidebar Layout:** A persistent left-hand sidebar (like modern SaaS apps) for easy navigation between these subsections.
2.  **A Sub-Navbar Layout:** Keeping the current top-navigation, but adding a secondary horizontal navigation bar specifically for dashboard sections.
