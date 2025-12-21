'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { fadeInUp, staggerContainer } from '@/utils/animations/animations'

interface Category {
  id: number
  name: string
  image: string
}

const categories: Category[] = [
  { id: 1, name: 'Fruits', image: '/images/categories/fruits.jpg' },
  { id: 2, name: 'Vegetables', image: '/images/categories/vegetables.jpg' },
  { id: 3, name: 'Snacks', image: '/images/categories/snacks.jpg' },
  { id: 4, name: 'Beverages', image: '/images/categories/beverages.jpg' },
  { id: 5, name: 'Dairy', image: '/images/categories/dairy.jpg' },
  { id: 6, name: 'Bakery', image: '/images/categories/bakery.jpg' },
]

const CategorySection: React.FC = () => {
  return (
    <section className="bg-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 lg:gap-6"
        >
          {categories.map((category) => (
            <motion.div
              key={category.id}
              variants={fadeInUp}
              whileHover={{ scale: 1.05 }}
              className="bg-linear-to-br from-gray-50 to-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100 flex flex-col items-center"
            >
              <div className="relative rounded-full overflow-hidden mb-3 bg-gray-100 ring-1 ring-gray-200 mx-auto w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24">
                <Image src={category.image} alt={category.name} fill sizes="(max-width: 640px) 64px, (max-width: 768px) 80px, (max-width: 1024px) 96px, 96px" className="object-cover" />
              </div>
              <h3 className="text-sm font-medium text-gray-900 text-center">
                {category.name}
              </h3>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default CategorySection
