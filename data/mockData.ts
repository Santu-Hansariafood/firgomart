export interface Category {
  id: number;
  name: string;
  image: string;
}

export interface Advertisement {
  id: number;
  title: string;
  description: string;
  buttonText: string;
  image: string;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  image: string;
}

export const categories: Category[] = [
  { id: 1, name: "Women's Fashion", image: "/image/my.jpeg" },
  { id: 2, name: "Men's Casual Wear", image: "/image/my.jpeg" },
  { id: 3, name: "Footwear", image: "/image/my.jpeg" },
  { id: 4, name: "Jewellery & Accessories", image: "/image/my.jpeg" },
  { id: 5, name: "Beauty & Skincare", image: "/image/my.jpeg" },
  { id: 6, name: "Home & Kitchen", image: "/image/my.jpeg" }
];

export const advertisements: Advertisement[] = [
  {
    id: 1,
    title: "Summer Collection 2024",
    description: "Up to 50% off on trending styles",
    buttonText: "Shop Now",
    image: "/image/carssole.jpeg"
  },
  {
    id: 2,
    title: "New Arrivals",
    description: "Discover the latest fashion trends",
    buttonText: "Explore",
    image: "/image/carssole.jpeg"
  },
  {
    id: 3,
    title: "Exclusive Deals",
    description: "Limited time offers on premium brands",
    buttonText: "View Deals",
    image: "/image/carssole.jpeg"
  }
];

export const products = [
  { id: 1, name: "Floral Summer Dress", category: "Women's Fashion", price: 1299, originalPrice: 2499, discount: 48, rating: 4.5, image: "/image/my.jpeg" },
  { id: 2, name: "Classic Denim Jacket", category: "Women's Fashion", price: 1899, originalPrice: 3499, discount: 46, rating: 4.7, image: "/image/my.jpeg" },
  { id: 3, name: "Casual Cotton T-Shirt", category: "Men's Casual Wear", price: 499, originalPrice: 999, discount: 50, rating: 4.3, image: "/image/my.jpeg" },
  { id: 4, name: "Slim Fit Chinos", category: "Men's Casual Wear", price: 1599, originalPrice: 2999, discount: 47, rating: 4.6, image: "/image/my.jpeg" },
  { id: 5, name: "Running Sneakers", category: "Footwear", price: 2499, originalPrice: 4999, discount: 50, rating: 4.8, image: "/image/my.jpeg" },
  { id: 6, name: "Leather Formal Shoes", category: "Footwear", price: 3299, originalPrice: 5999, discount: 45, rating: 4.4, image: "/image/my.jpeg" },
  { id: 7, name: "Gold Plated Necklace", category: "Jewellery & Accessories", price: 899, originalPrice: 1799, discount: 50, rating: 4.5, image: "/image/my.jpeg" },
  { id: 8, name: "Designer Handbag", category: "Jewellery & Accessories", price: 2199, originalPrice: 4499, discount: 51, rating: 4.6, image: "/image/my.jpeg" },
  { id: 9, name: "Anti-Aging Serum", category: "Beauty & Skincare", price: 1499, originalPrice: 2999, discount: 50, rating: 4.7, image: "/image/my.jpeg" },
  { id: 10, name: "Makeup Palette Set", category: "Beauty & Skincare", price: 1799, originalPrice: 3499, discount: 49, rating: 4.8, image: "/image/my.jpeg" },
  { id: 11, name: "Ceramic Dinner Set", category: "Home & Kitchen", price: 2999, originalPrice: 5999, discount: 50, rating: 4.5, image: "/image/my.jpeg" },
  { id: 12, name: "Non-Stick Cookware", category: "Home & Kitchen", price: 3499, originalPrice: 6999, discount: 50, rating: 4.6, image: "/image/my.jpeg" },
  { id: 13, name: "Bohemian Maxi Dress", category: "Women's Fashion", price: 1699, originalPrice: 3299, discount: 48, rating: 4.4, image: "/image/my.jpeg" },
  { id: 14, name: "Striped Polo Shirt", category: "Men's Casual Wear", price: 799, originalPrice: 1599, discount: 50, rating: 4.3, image: "/image/my.jpeg" },
  { id: 15, name: "Canvas Sneakers", category: "Footwear", price: 1299, originalPrice: 2499, discount: 48, rating: 4.5, image: "/image/my.jpeg" },
  { id: 16, name: "Silver Bracelet", category: "Jewellery & Accessories", price: 699, originalPrice: 1399, discount: 50, rating: 4.6, image: "/image/my.jpeg" },
  { id: 17, name: "Face Moisturizer", category: "Beauty & Skincare", price: 899, originalPrice: 1799, discount: 50, rating: 4.7, image: "/image/my.jpeg" },
  { id: 18, name: "Kitchen Knife Set", category: "Home & Kitchen", price: 1999, originalPrice: 3999, discount: 50, rating: 4.8, image: "/image/my.jpeg" },
  { id: 19, name: "Printed Midi Skirt", category: "Women's Fashion", price: 999, originalPrice: 1999, discount: 50, rating: 4.4, image: "/image/my.jpeg" },
  { id: 20, name: "Cargo Shorts", category: "Men's Casual Wear", price: 899, originalPrice: 1799, discount: 50, rating: 4.3, image: "/image/my.jpeg" },
  { id: 21, name: "Ankle Boots", category: "Footwear", price: 2799, originalPrice: 5499, discount: 49, rating: 4.6, image: "/image/my.jpeg" },
  { id: 22, name: "Pearl Earrings", category: "Jewellery & Accessories", price: 1299, originalPrice: 2599, discount: 50, rating: 4.7, image: "/image/my.jpeg" },
  { id: 23, name: "Vitamin C Serum", category: "Beauty & Skincare", price: 1199, originalPrice: 2399, discount: 50, rating: 4.8, image: "/image/my.jpeg" },
  { id: 24, name: "Bed Sheet Set", category: "Home & Kitchen", price: 1499, originalPrice: 2999, discount: 50, rating: 4.5, image: "/image/my.jpeg" },
  { id: 25, name: "Silk Blouse", category: "Women's Fashion", price: 1399, originalPrice: 2799, discount: 50, rating: 4.6, image: "/image/my.jpeg" },
  { id: 26, name: "Linen Shirt", category: "Men's Casual Wear", price: 1199, originalPrice: 2399, discount: 50, rating: 4.4, image: "/image/my.jpeg" },
  { id: 27, name: "Sports Sandals", category: "Footwear", price: 1599, originalPrice: 3199, discount: 50, rating: 4.5, image: "/image/my.jpeg" },
  { id: 28, name: "Watch Set", category: "Jewellery & Accessories", price: 2999, originalPrice: 5999, discount: 50, rating: 4.7, image: "/image/my.jpeg" },
  { id: 29, name: "Hair Care Kit", category: "Beauty & Skincare", price: 1699, originalPrice: 3399, discount: 50, rating: 4.6, image: "/image/my.jpeg" },
  { id: 30, name: "Wall Art Frames", category: "Home & Kitchen", price: 999, originalPrice: 1999, discount: 50, rating: 4.4, image: "/image/my.jpeg" }
]