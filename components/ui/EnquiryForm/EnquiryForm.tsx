 'use client'
 
 import { Loader2 } from 'lucide-react'
 
 type EnquiryFormProps = {
   userName?: string
   userEmail?: string
   subject: string
   setSubject: (v: string) => void
   message: string
   setMessage: (v: string) => void
   canSubmit: boolean
   submit: () => void
   loading: boolean
   status: 'idle' | 'success' | 'error'
 }
 
 export default function EnquiryForm({
   userName,
   userEmail,
   subject,
   setSubject,
   message,
   setMessage,
   canSubmit,
   submit,
   loading,
   status,
 }: EnquiryFormProps) {
   return (
     <>
       {!userEmail && (
         <div className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-[13px] text-amber-800">
           Please login to Firgomart so we can attach this enquiry to your account.
         </div>
       )}
 
       <div className="space-y-3 bg-white border border-foreground/5 rounded-2xl p-4">
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
           <div className="space-y-1">
             <span className="text-[11px] font-semibold uppercase tracking-wide text-foreground/50">Name</span>
             <div className="px-3 py-2 rounded-lg border border-foreground/10 bg-background/60 text-foreground/80 text-sm">
               {userName || "-"}
             </div>
           </div>
           <div className="space-y-1">
             <span className="text-[11px] font-semibold uppercase tracking-wide text-foreground/50">Email</span>
             <div className="px-3 py-2 rounded-lg border border-foreground/10 bg-background/60 text-foreground/80 text-sm">
               {userEmail || "-"}
             </div>
           </div>
         </div>
 
         <div className="space-y-1">
           <label className="text-[11px] font-semibold uppercase tracking-wide text-foreground/50">
             Subject
           </label>
           <input
             type="text"
             value={subject}
             onChange={(e) => setSubject(e.currentTarget.value)}
             placeholder="Briefly describe your enquiry"
             className="w-full px-3 py-2 text-sm rounded-lg border border-foreground/15 bg-white/95"
           />
         </div>
 
         <div className="space-y-1">
           <label className="text-[11px] font-semibold uppercase tracking-wide text-foreground/50">
             Message
           </label>
           <textarea
             rows={4}
             value={message}
             onChange={(e) => setMessage(e.currentTarget.value)}
             placeholder="Write your enquiry with details..."
             className="w-full px-3 py-2 text-sm rounded-lg border border-foreground/15 bg-white/95 resize-none"
           />
         </div>
 
         <button
           type="button"
           onClick={submit}
           disabled={!canSubmit}
           className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-brand-purple text-white text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
         >
           {loading && <Loader2 className="w-4 h-4 animate-spin" />}
           Submit Enquiry
         </button>
 
         {status === "success" && (
           <p className="text-[12px] text-emerald-600">
             Enquiry submitted successfully. We will reach out on your registered email.
           </p>
         )}
         {status === "error" && (
           <p className="text-[12px] text-red-600">
             Could not submit enquiry. Please try again after some time.
           </p>
         )}
       </div>
     </>
   )
 }
