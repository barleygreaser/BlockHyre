import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email';
import RentalAlertEmail from '../../../../emails/rental-alert';

// Mock Supabase client
const { mockSupabase } = vi.hoisted(() => ({
  mockSupabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
  }
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabase),
}));

// Mock Email sending utility
vi.mock('@/lib/email', () => ({
  sendEmail: vi.fn().mockResolvedValue({ success: true }),
}));

// Mock React email component
vi.mock('../../../../emails/rental-alert', () => ({
  default: vi.fn().mockReturnValue('mock-rental-alert-email-component'),
}));

describe('System Message Notification API (POST)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createRequest = (body: object) => {
    return new Request('http://localhost:3000/api/notifications/system-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  };

  it('returns 400 if required fields are missing', async () => {
    const req = createRequest({ eventName: 'RENTAL_REQUEST_EXPIRING' });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Missing required fields');
  });

  it('skips processing for redundant events', async () => {
    const req = createRequest({
      eventName: 'RENTAL_REQUEST_SUBMITTED',
      ownerId: 'owner_123',
      renterId: 'renter_123',
    });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.skipped).toBe(true);
    expect(data.reason).toContain('handled by a dedicated email flow');
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('skips processing for unconfigured events', async () => {
    const req = createRequest({
      eventName: 'NON_EXISTENT_EVENT',
      ownerId: 'owner_123',
      renterId: 'renter_123',
    });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.skipped).toBe(true);
    expect(data.reason).toContain('No email config defined');
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('returns 500 if database query fails to resolve users', async () => {
    const req = createRequest({
      eventName: 'RENTAL_REQUEST_EXPIRING',
      ownerId: 'owner_123',
      renterId: 'renter_123',
    });

    // Mock DB error
    mockSupabase.in.mockResolvedValueOnce({
      data: null,
      error: { message: 'Database failure' },
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toContain('Could not resolve recipient emails');
  });

  it('sends email to owner for owner-only events (e.g. RENTAL_REQUEST_EXPIRING)', async () => {
    const req = createRequest({
      eventName: 'RENTAL_REQUEST_EXPIRING',
      ownerId: 'owner_123',
      renterId: 'renter_123',
      context: {
        tool_name: 'Drill',
        renter_name: 'Alice',
        start_date: 'May 28',
        end_date: 'May 30',
      },
    });

    // Mock resolving owner
    mockSupabase.in.mockResolvedValueOnce({
      data: [
        { id: 'owner_123', email: 'owner@example.com', full_name: 'Bob Owner' },
      ],
      error: null,
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.sent).toBe(true);
    expect(data.results).toHaveLength(1);
    expect(data.results[0]).toEqual({
      userId: 'owner_123',
      success: true,
      error: undefined,
    });

    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({
      to: 'owner@example.com',
      subject: '⏰ Action needed: Request for Drill expires soon',
    }));
  });

  it('sends email to renter for renter-only events (e.g. RENTAL_REQUEST_REJECTED)', async () => {
    const req = createRequest({
      eventName: 'RENTAL_REQUEST_REJECTED',
      ownerId: 'owner_123',
      renterId: 'renter_123',
      context: {
        tool_name: 'Drill',
        owner_name: 'Bob',
        start_date: 'May 28',
        end_date: 'May 30',
      },
    });

    // Mock resolving renter
    mockSupabase.in.mockResolvedValueOnce({
      data: [
        { id: 'renter_123', email: 'renter@example.com', full_name: 'Alice Renter' },
      ],
      error: null,
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.sent).toBe(true);
    expect(data.results).toHaveLength(1);
    expect(data.results[0]).toEqual({
      userId: 'renter_123',
      success: true,
      error: undefined,
    });

    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({
      to: 'renter@example.com',
      subject: 'Your request for Drill was declined',
    }));
  });

  it('sends email to both for joint events (e.g. RENTAL_REQUEST_AUTO_DENIED)', async () => {
    const req = createRequest({
      eventName: 'RENTAL_REQUEST_AUTO_DENIED',
      ownerId: 'owner_123',
      renterId: 'renter_123',
      context: {
        tool_name: 'Drill',
        start_date: 'May 28',
        end_date: 'May 30',
      },
    });

    // Mock resolving both renter and owner
    mockSupabase.in.mockResolvedValueOnce({
      data: [
        { id: 'owner_123', email: 'owner@example.com', full_name: 'Bob Owner' },
        { id: 'renter_123', email: 'renter@example.com', full_name: 'Alice Renter' },
      ],
      error: null,
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.sent).toBe(true);
    expect(data.results).toHaveLength(2);

    expect(sendEmail).toHaveBeenCalledTimes(2);
    expect(sendEmail).toHaveBeenNthCalledWith(1, expect.objectContaining({
      to: 'owner@example.com',
      subject: 'Rental request for Drill expired',
    }));
    expect(sendEmail).toHaveBeenNthCalledWith(2, expect.objectContaining({
      to: 'renter@example.com',
      subject: 'Rental request for Drill expired',
    }));
  });
});
