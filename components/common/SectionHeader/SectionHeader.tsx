 'use client'
 
 import Link from 'next/link'
 import type { ReactNode } from 'react'
 
 type SectionHeaderProps = {
   titlePrimary: string
   titleSecondary: string
   primaryClassName?: string
   secondaryClassName?: string
   containerClassName?: string
   showAction?: boolean
   actionLabel?: string
   actionHref?: string
   onActionClick?: () => void
   actionIcon?: ReactNode
   actionClassName?: string
   hideActionOnMobile?: boolean
 }
 
 export default function SectionHeader({
   titlePrimary,
   titleSecondary,
   primaryClassName,
   secondaryClassName,
   containerClassName,
   showAction,
   actionLabel,
   actionHref,
   onActionClick,
   actionIcon,
   actionClassName,
   hideActionOnMobile,
 }: SectionHeaderProps) {
   const renderAction = () => {
     if (!showAction || !actionLabel) return null
     const base = actionClassName || 'flex items-center gap-2 text-brand-purple hover:underline font-medium'
     const cls = hideActionOnMobile ? `hidden sm:inline-flex ${base}` : base
     if (actionHref) {
       return (
         <Link href={actionHref} className={cls}>
           {actionLabel} {actionIcon}
         </Link>
       )
     }
     return (
       <button type="button" onClick={onActionClick} className={cls}>
         {actionLabel} {actionIcon}
       </button>
     )
   }
 
   return (
     <div className={`flex items-center justify-between mb-6 ${containerClassName || ''}`}>
       <h2 className="text-2xl sm:text-4xl lg:text-5xl font-heading font-extrabold tracking-tight">
         <span className={primaryClassName || 'text-brand-purple'}>{titlePrimary}</span>
         <span className={`${secondaryClassName || 'text-red-500'} ml-2`}>{titleSecondary}</span>
       </h2>
       {renderAction()}
     </div>
   )
 }
