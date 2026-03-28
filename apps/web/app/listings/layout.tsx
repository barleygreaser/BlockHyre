import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tools | BlockHyre',
  description: 'Browse high-quality tools for rent in your neighborhood. Discover woodworking, landscaping, painting, and heavy machinery available today.',
};

export default function ListingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
