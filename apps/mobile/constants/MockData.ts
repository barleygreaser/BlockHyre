export interface Tool {
  id: string;
  title: string;
  pricePerDay: number;
  image: string;
  category: string;
  distance: string;
  rating?: number;
}

export const MOCK_TOOLS: Tool[] = [
  {
    id: '1',
    title: 'DeWalt Cordless Drill',
    pricePerDay: 15,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC0lz1q3r-CEQS6mYiTmEfoHGNKZOI0iiZLatER2U9o8UE_XDXklzvyJINe0ssMqx6xUmvjqj056TeebvlB2tzVJK9PoOVWus183uiPQit35hUJ-NE6fTuNFP3vW1JWPwWUnc_MNKtf3cSXKbxBxVyLZKP3yBZrl31fcU2M7zpE2N24BvFG9_t6eTx_Za69MVC9Q9QvJmycTh8RWon0IS5HC-z9PgbPsxdH3joY7r-FTB0E0GgB9ADgj78R_1JOsEq2ZBkkfASbXg',
    category: 'Power Tools',
    distance: '1.2 mi away',
    rating: 4.8,
  },
  {
    id: '2',
    title: 'Electric Lawn Mower',
    pricePerDay: 25,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpDWWzvkCKwWppMKI9HvrxUDCe5SomWHscNCQNa96O8RLvrs_CNNILqqR8WfXJJItj9TD5MeKr4COMwZePkql3UEmnS8rxj9Eea3LnvwY3KqdhsgMRQ9DLr75wW62m_sbYGK-TIYV6gnAGJ1jOmLsXmWjzjXIxdv1tGU7W3UXQzheAUDcYtnt6NhSy6GD7CecVb9NEGkfx1XwTlpG1xdf5IHwiOiPRpvnW6nThGcGLvW-zHx7UIy6ZvGVHjMfIsqdCxuEp1RF9lg',
    category: 'Gardening',
    distance: '0.5 mi away',
    rating: 4.9,
  },
  {
    id: '3',
    title: 'Circular Saw Pro',
    pricePerDay: 18,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAza_OSR6FBYVlvvXZ_BAWGNkzjQmiSPXQCLd8CQnwmrKWQ9ab7vlAQFd1xGOKMbq-8u0KsCEkoqaNTAzSV3Z3mvW1BNEb91Cx-8SeDfNWdKHeph-WsPVQmzksLD40iiSfeMvpC7Ysh-CHHjhvdG3Hm82X1xzoVT7QRhKR1zYPqfh9Y6_RguYwfet6zHLsXPjiiWDoqR373cvkBbr1VqiKSLSQJdsvlhIqOYpWvX7jMvDPvZojNq1E9LlohDp-HqVSQ78_THaIKdw',
    category: 'Power Tools',
    distance: '3.4 mi away',
    rating: 4.5,
  },
  {
    id: '4',
    title: 'High Pressure Washer',
    pricePerDay: 30,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCI8mPwVayxLz2Q574LYqZ7oTCDh652eNbqLa9lkFJHRGW2c2RioC9e_dTBBL7N73jEODiJm6sE9Hk1KIZwrgg3kv_wi7FeF_0fkZOeaJYUxtsFpoUmNLjNqMkpTiM3xDgbRD2QZbLyEwPBdmYXZCaNsK7xzoVT7QRhKR1zYPqfh9Y6_RguYwfet6zHLsXPjiiWDoqR373cvkBbr1VqiKSLSQJdsvlhIqOYpWvX7jMvDPvZojNq1E9LlohDp-HqVSQ78_THaIKdw',
    category: 'Power Tools',
    distance: '2.1 mi away',
    rating: 5.0,
  },
  {
    id: '5',
    title: '12ft Extension Ladder',
    pricePerDay: 10,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDe4lLb0QtnmUUt7ko4s8gz3ZkWulecsesVFmU6DA7dw2yw3Bn7anLaZ0Gp6vaTIwnAkSxgg_ng3vT5AruOikC2Nt1-a-cGtTacNGbD9-N9nWbiFr60xrqKopHlsLbGVkE1aXYfeThGiKiuQi-CINLjsdyII8HVzDb2LUXvh2kwc4tdlnXPnhSwfvnaPeCeSCmlkVy7QYUQxsGm7LSFn_xGQ1rlcpRwgdXnSDG-aP9YjmYeGUs7CXnxgiTfcFq7d2uVR5u4cBOCXg',
    category: 'Ladders',
    distance: '0.8 mi away',
    rating: 4.7,
  },
  {
    id: '6',
    title: 'Complete Tool Set',
    pricePerDay: 40,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAWjisSVpx9RfOMqcrdAKodgjkSgadvdd_uuctUpHcpd0rGTsEFcdqg54jS0qL9RTIVsR2JfULn73cuZZi0bCfSn25bw8SOFgaab5lqOPpqi8aCMVOWCYdEwDYzwBJxQ9G7cyYXqppunZ-eFFL1SbWDf0xtr40oaoTSK9DEGvl5eJ6rQ3kpHlWGEhjzDEpGPB3czpVllv_PZhWKyDwpZVmZ4L0lU4SlOHh1kDcYe7Qb9eBCK9WDgRIIx72L6MuJBTAalWF18-UgbA',
    category: 'Hand Tools',
    distance: '5.0 mi away',
    rating: undefined,
  },
];
