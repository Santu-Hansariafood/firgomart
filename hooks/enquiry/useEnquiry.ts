 'use client'
 
 import { useState } from 'react'
 import { useAuth } from '@/context/AuthContext'
 
 export type EnquiryStatus = 'idle' | 'success' | 'error'
 
 export default function useEnquiry() {
   const { user } = useAuth()
   const [subject, setSubject] = useState('')
   const [message, setMessage] = useState('')
   const [loading, setLoading] = useState(false)
   const [status, setStatus] = useState<EnquiryStatus>('idle')
 
   const canSubmit = !!user?.email && subject.trim().length > 0 && message.trim().length > 0 && !loading
 
   const submit = async () => {
     if (!canSubmit) return
     setLoading(true)
     setStatus('idle')
     try {
       const res = await fetch('/api/support', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           name: user?.name || '',
           email: user?.email || '',
           subject: subject.trim(),
           message: message.trim(),
           source: 'enquiry',
         }),
       })
       if (res.ok) {
         setStatus('success')
         setSubject('')
         setMessage('')
       } else {
         setStatus('error')
       }
     } catch {
       setStatus('error')
     }
     setLoading(false)
   }
 
   return {
     user,
     subject,
     setSubject,
     message,
     setMessage,
     loading,
     status,
     canSubmit,
     submit,
   }
 }
