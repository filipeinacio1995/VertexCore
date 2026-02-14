export interface Script {
  id: number | string; // Flexible type to prevent mapping errors
  name: string;
  description: string;      // Clean text for cards
  longDescription: string;  // HTML for details page
  image: string;
  price: number;
  category: string;
  version?: string;
  features?: string[];
  compatibility?: string[];
}