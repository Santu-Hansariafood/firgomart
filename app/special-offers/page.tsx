import { Metadata } from 'next'
import SpecialOffersClient from './SpecialOffersClient'

export const metadata: Metadata = {
  title: 'Special Offers | FirgoMart',
  description: 'Exclusive deals, discounts, and special offers on your favorite products at FirgoMart.',
  openGraph: {
    title: 'Special Offers | FirgoMart',
    description: 'Exclusive deals, discounts, and special offers on your favorite products at FirgoMart.',
    url: 'https://firgomart.com/special-offers',
    type: 'website',
  },
}

export default function SpecialOffersPage() {
  return <SpecialOffersClient />
}
