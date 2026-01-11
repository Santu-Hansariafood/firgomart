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
    title: "Summer Collection 2026",
    description: "Up to 60% off on trending styles",
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
