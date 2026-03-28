import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { createClient } from '@supabase/supabase-js';
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';

// Mock everything
const { mockSupabase } = vi.hoisted(() => ({
  mockSupabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockImplementation(() => Promise.resolve({ data: { daily_price: 100, categories: { risk_tier: 1 } }, error: null })),
    insert: vi.fn().mockImplementation(() => Promise.resolve({ error: null })),
  }
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabase),
}));

vi.mock('@/lib/stripe', () => ({
  stripe: {
    webhooks: {
      constructEvent: vi.fn(),
    },
  },
}));

vi.mock('@/lib/email', () => ({
  sendEmail: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn(async () => ({
    get: vi.fn().mockReturnValue('mock-signature'),
  })),
}));

describe('Stripe Webhook API (POST)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_WEBHOOK_SECRET = 'test_secret';
  });

  const createRequest = (body: string) => {
    return new Request('http://localhost:3000/api/stripe/webhook', {
      method: 'POST',
      body: body,
    });
  };

  it('skips processing if session already exists (Idempotency)', async () => {
    const mockSession = {
      id: 'cs_test_123',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123',
          metadata: {
             renter_id: 'user_123',
             cart_items: JSON.stringify([{ listing_id: 'tool_1', days: 1 }])
          }
        }
      }
    };

    (stripe.webhooks.constructEvent as any).mockReturnValue(mockSession);
    
    // Mock existing rental found
    mockSupabase.limit.mockResolvedValueOnce({ data: [{ id: 'existing_rental' }], error: null });

    const req = createRequest(JSON.stringify(mockSession));
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.already_processed).toBe(true);
    // Verify insert was NOT called
    expect(mockSupabase.insert).not.toHaveBeenCalled();
  });

  it('successfully processes new rentals', async () => {
     const mockSession = {
      id: 'cs_test_new',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_new',
          amount_total: 10000, // $100
          metadata: {
             renter_id: 'user_123',
             cart_items: JSON.stringify([{ listing_id: 'tool_1', days: 1 }])
          }
        }
      }
    };

    (stripe.webhooks.constructEvent as any).mockReturnValue(mockSession);
    
    // Mock no existing rental found
    mockSupabase.limit.mockResolvedValueOnce({ data: [], error: null });
    // Mock listing found (1st call)
    mockSupabase.single.mockResolvedValueOnce({ 
        data: { 
            daily_price: 100, 
            deposit_amount: 100, 
            categories: { risk_tier: 1 },
            owner_id: 'user_456',
            tools: { name: 'Drill' },
            owner: { email: 'owner@example.com', full_name: 'Bob Owner' }
        }, 
        error: null 
    });

    // Mock renter found (2nd call)
    mockSupabase.single.mockResolvedValueOnce({
        data: { email: 'renter@example.com', full_name: 'Alice Renter' },
        error: null
    });

    // Mock platform_settings found (3rd call)
    mockSupabase.single.mockResolvedValueOnce({
        data: { seller_fee_percent: 15 },
        error: null
    });

    const req = createRequest(JSON.stringify(mockSession));
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.received).toBe(true);
    // Verify insert WAS called
    expect(mockSupabase.insert).toHaveBeenCalledWith(expect.objectContaining({
        stripe_session_id: 'cs_test_new',
        renter_id: 'user_123'
    }));
  });

  it('returns 400 for invalid signature', async () => {
    (stripe.webhooks.constructEvent as any).mockImplementation(() => {
        throw new Error('Invalid signature');
    });

    const req = createRequest('invalid-body');
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Webhook Error');
  });
});
