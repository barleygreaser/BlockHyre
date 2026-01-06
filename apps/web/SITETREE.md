# Blockshare Web Application Site Tree

This document outlines the structure of the web application based on the Next.js App Router file structure in `apps/web/app`.

## Pages (Routes)

* **/** - `app/page.tsx` (Homepage)
* **/about** - `app/about/page.tsx`
* **/add-tool** - `app/add-tool/page.tsx`
* **/auth** - `app/auth/page.tsx`
* **/cart** - `app/cart/page.tsx`
* **/checkout** - `app/checkout/page.tsx`
  * **/success** - `app/checkout/success/page.tsx`
* **/community-guidelines** - `app/community-guidelines/page.tsx`
* **/dashboard** - `app/dashboard/page.tsx`
* **/disputes** - `app/disputes/page.tsx`
* **/how-it-works** - `app/how-it-works/page.tsx`
* **/liability** - `app/liability/page.tsx`
* **/listings** - `app/listings/page.tsx`
  * **/[id]/[slug]** - `app/listings/[id]/[slug]/page.tsx`
* **/messages** - `app/messages/page.tsx`
* **/my-rentals** - `app/my-rentals/page.tsx`
  * **/[id]** - `app/my-rentals/[id]/page.tsx`
* **/owner**
  * **/active-rentals** - `app/owner/active-rentals/page.tsx`
  * **/listings** - `app/owner/listings/page.tsx`
    * **/edit/[id]** - `app/owner/listings/edit/[id]/page.tsx`
* **/peace-fund** - `app/peace-fund/page.tsx`
* **/profile** - `app/profile/page.tsx`
* **/request-booking/[id]** - `app/request-booking/[id]/page.tsx`
* **/reviews/new** - `app/reviews/new/page.tsx`
* **/signup** - `app/signup/page.tsx`
* **/terms** - `app/terms/page.tsx`
* **/tools/[id]** - `app/tools/[id]/page.tsx`

## API Routes

* **/api/fetch-suggestions** - `app/api/fetch-suggestions/route.ts`
* **/api/signup** - `app/api/signup/route.ts`
* **/api/stripe/checkout** - `app/api/stripe/checkout/route.ts`
* **/api/stripe/connect** - `app/api/stripe/connect/route.ts`
* **/api/stripe/webhook** - `app/api/stripe/webhook/route.ts`

## Layouts

* **Root Layout** - `app/layout.tsx`
* **Owner Layout** - `app/owner/layout.tsx`
