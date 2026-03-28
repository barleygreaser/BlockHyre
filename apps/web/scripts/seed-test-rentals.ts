import { createClient } from '@supabase/supabase-js';
import path from 'path';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function seed() {
  try {
    // 1. Get some users
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, full_name')
      .limit(2);

    if (userError || !users || users.length < 2) {
      console.error('Need at least 2 users in the database.');
      return;
    }

    const ownerId = users[0].id;
    const renterId = users[1].id;

    // 1.5 Get a category
    const { data: categories } = await supabase.from('categories').select('id, name').limit(1);
    const categoryId = categories?.[0]?.id;

    // 2. Get a listing owned by the 'owner'
    // If no listing exists, create one
    let { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('id, title')
      .eq('owner_id', ownerId)
      .limit(1)
      .single();

    if (listingError || !listing) {
      console.log('No listing found for owner, creating one...');
      const { data: newListing, error: createError } = await supabase
        .from('listings')
        .insert({
          owner_id: ownerId,
          title: 'Industrial Cement Mixer',
          description: 'Heavy duty mixer for professional use.',
          category_id: categoryId,
          daily_price: 45,
          status: 'active'
        })
        .select()
        .single();
      
      if (createError) throw createError;
      listing = newListing;
    }

    if (!listing) {
      console.error('Could not find or create a listing.');
      return;
    }

    console.log(`Using Listing: ${listing.title} (${listing.id})`);
    console.log(`Owner: ${users[0].full_name}`);
    console.log(`Renter: ${users[1].full_name}`);

    // 3. Create an 'active' rental (for Renter to Return)
    const { data: activeRental, error: activeError } = await supabase
      .from('rentals')
      .insert({
        listing_id: listing.id,
        renter_id: renterId,
        owner_id: ownerId,
        status: 'active',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 86400000).toISOString(),
        total_days: 1,
        daily_price_snapshot: 45,
        total_paid: 45,
        handover_photos: [
          'https://images.unsplash.com/photo-1572910358198-2fa7de3c324f?w=400',
          'https://images.unsplash.com/photo-1581094288338-2314dddb7903?w=400',
          'https://images.unsplash.com/photo-1504148455328-497c5efae15d?w=400'
        ],
        renter_receive_ts: new Date().toISOString()
      })
      .select()
      .single();

    if (activeError) throw activeError;
    console.log(`Created ACTIVE rental: ${activeRental.id}`);

    // 4. Create a 'returned' rental (for Owner to Inspect)
    const { data: returnedRental, error: returnedError } = await supabase
      .from('rentals')
      .insert({
        listing_id: listing.id,
        renter_id: renterId,
        owner_id: ownerId,
        status: 'returned',
        start_date: new Date(Date.now() - 86400000).toISOString(),
        end_date: new Date().toISOString(),
        total_days: 1,
        daily_price_snapshot: 45,
        total_paid: 45,
        handover_photos: [
          'https://images.unsplash.com/photo-1572910358198-2fa7de3c324f?w=400',
          'https://images.unsplash.com/photo-1581094288338-2314dddb7903?w=400',
          'https://images.unsplash.com/photo-1504148455328-497c5efae15d?w=400'
        ],
        return_photos: [
          'https://images.unsplash.com/photo-1572910358198-2fa7de3c324f?w=400&q=80',
          'https://images.unsplash.com/photo-1581094288338-2314dddb7903?w=400&q=80',
          'https://images.unsplash.com/photo-1504148455328-497c5efae15d?w=400&q=80'
        ],
        renter_receive_ts: new Date(Date.now() - 86400000).toISOString(),
        renter_return_ts: new Date().toISOString()
      })
      .select()
      .single();

    if (returnedError) throw returnedError;
    console.log(`Created RETURNED rental: ${returnedRental.id}`);

    console.log('\n--- SUCCESS ---');
    console.log('You can now test:');
    console.log(`1. Renter Dashboard: Rental ${activeRental.id} will have a "Return Tool" button.`);
    console.log(`2. Owner Dashboard: Rental ${returnedRental.id} will appear in "Action Required" for inspection.`);

  } catch (err) {
    console.error('Seed failed:', err);
  }
}

seed();
