import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateSession } from './middleware';
import { createServerClient } from '@supabase/ssr';
import { NextResponse, NextRequest } from 'next/server';

// Mock Supabase SSR
vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(),
}));

// Mock Next.js Server components
vi.mock('next/server', () => {
  const next = vi.fn((options) => ({
    next: true,
    cookies: {
        getAll: vi.fn().mockReturnValue([]),
        set: vi.fn(),
        delete: vi.fn(),
    },
    ...options
  }));
  
  return {
    NextResponse: {
      next: next,
      redirect: vi.fn((url) => ({
        redirect: true,
        url: url.toString(),
        cookies: {
            getAll: vi.fn().mockReturnValue([]),
        }
      })),
    },
  };
});

describe('Middleware / updateSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockRequest = (pathname: string) => {
    const nextUrl = {
      pathname,
      toString: function() { return `http://localhost:3000${this.pathname}` },
      clone: function() { 
        const cloned = { ...this };
        cloned.clone = vi.fn().mockImplementation(() => ({ ...cloned }));
        return cloned;
      },
    };
    return {
      nextUrl,
      cookies: {
        getAll: vi.fn().mockReturnValue([]),
        set: vi.fn(),
      },
    } as unknown as NextRequest;
  };

  it('redirects to /auth for protected paths when user is NOT logged in', async () => {
    const req = createMockRequest('/dashboard');
    
    // Mock no user
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
    };
    (createServerClient as any).mockReturnValue(mockSupabase);

    const response = await updateSession(req);

    expect(response).toBeDefined();
    expect((response as any).redirect).toBe(true);
    expect((response as any).url).toContain('/auth');
  });

  it('allows access to protected paths when user IS logged in', async () => {
    const req = createMockRequest('/dashboard');
    
    // Mock user exists
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user_123' } } }),
      },
    };
    (createServerClient as any).mockReturnValue(mockSupabase);

    const response = await updateSession(req);

    expect(response).toBeDefined();
    expect((response as any).next).toBe(true);
    expect((response as any).redirect).toBeUndefined();
  });

  it('allows access to public paths even if not logged in', async () => {
    const req = createMockRequest('/listings'); // Public path
    
    // Mock no user
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
    };
    (createServerClient as any).mockReturnValue(mockSupabase);

    const response = await updateSession(req);

    expect(response).toBeDefined();
    expect((response as any).next).toBe(true);
    expect((response as any).redirect).toBeUndefined();
  });

  it('sets auth hint cookie when user is logged in', async () => {
    const req = createMockRequest('/listings');
    
    // Mock user exists
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user_123' } } }),
      },
    };
    (createServerClient as any).mockReturnValue(mockSupabase);

    const response = await updateSession(req);
    
    expect((response as any).cookies.set).toHaveBeenCalledWith(
        'bh-auth-hint',
        '1',
        expect.any(Object)
    );
  });
});
