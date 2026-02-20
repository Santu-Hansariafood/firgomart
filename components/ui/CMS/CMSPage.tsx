"use client"

import React from 'react'
import { Loader2 } from 'lucide-react'
import BeautifulLoader from '@/components/common/Loader/BeautifulLoader'
import AdminLogin from '@/components/ui/AdminLogin/AdminLogin'
import { useCMSAuth } from '@/hooks/cms/useCMSAuth'
import { useCMSState } from '@/hooks/cms/useCMSState'
import { CMSTabs } from './CMSTabs'
import { CMSFormPanel } from './CMSFormPanel'
import { CMSListPanel } from './CMSListPanel'

export default function CMSPage() {
  const { authLoading, allowed } = useCMSAuth()
  const state = useCMSState()
 
  if (authLoading) return <BeautifulLoader />
  if (!allowed) return <AdminLogin />
   if (state.loading) {
     return (
       <div className="flex justify-center p-12">
         <Loader2 className="animate-spin w-8 h-8 text-brand-purple" />
       </div>
     )
   }
 
   return (
     <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <CMSTabs activeTab={state.activeTab} onChange={state.setActiveTab} onReset={state.resetForms} />
       <div className="grid lg:grid-cols-3 gap-8">
         <div className="lg:col-span-1">
           <CMSFormPanel state={state} />
         </div>
         <CMSListPanel state={state} />
       </div>
     </div>
   )
 }
