import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

// Mock dependencies
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signUp: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
    })),
  })),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn(async () => ({
    get: vi.fn().mockReturnValue('127.0.0.1'),
  })),
}));

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(() => true),
}));

describe('Signup API (POST)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createRequest = (body: any) => {
    return new Request('http://localhost:3000/api/signup', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  };

  it('returns 400 if required fields are missing', async () => {
    const req = createRequest({ email: 'test@example.com' }); // Missing password, confirmPassword, fullName
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Missing required fields');
  });

  it('returns 400 for invalid email format', async () => {
    const req = createRequest({
      email: 'invalid-email',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      fullName: 'John Doe',
      tosAccepted: true,
    });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid email format');
  });

  it('returns 400 if passwords do not match', async () => {
    const req = createRequest({
      email: 'test@example.com',
      password: 'Password123!',
      confirmPassword: 'DifferentPassword123!',
      fullName: 'John Doe',
      tosAccepted: true,
    });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Passwords do not match');
  });

  it('returns 400 if password complexity is not met', async () => {
    const req = createRequest({
      email: 'test@example.com',
      password: 'weak',
      confirmPassword: 'weak',
      fullName: 'John Doe',
      tosAccepted: true,
    });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Password must be at least 8 characters');
  });

  it('returns 400 if fields are too long', async () => {
    const longString = 'a'.repeat(300);
    const req = createRequest({
      email: `${longString}@example.com`,
      password: 'Password123!',
      confirmPassword: 'Password123!',
      fullName: 'John Doe',
      tosAccepted: true,
    });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Email is too long');
  });
});
