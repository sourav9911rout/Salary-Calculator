export type City = {
  name: string;
  category: 'X' | 'Y' | 'Z';
};

export const cities: City[] = [
  { name: 'Ahmedabad', category: 'X' },
  { name: 'Bengaluru', category: 'X' },
  { name: 'Chennai', category: 'X' },
  { name: 'Delhi', category: 'X' },
  { name: 'Hyderabad', category: 'X' },
  { name: 'Kolkata', category: 'X' },
  { name: 'Mumbai', category: 'X' },
  { name: 'Pune', category: 'X' },
  { name: 'Agra', category: 'Y' },
  { name: 'Jaipur', category: 'Y' },
  { name: 'Lucknow', category: 'Y' },
  { name: 'Other Cities', category: 'Z' },
];
