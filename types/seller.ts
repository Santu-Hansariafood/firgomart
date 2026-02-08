export interface SellerFormData {
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  country: string;
  state: string;
  district: string;
  city: string;
  pincode: string;
  gstNumber: string;
  panNumber: string;
  aadhaar?: string;
  hasGST: boolean;
  businessLogo: File | null;
  businessLogoUrl?: string;
  bankAccount?: string;
  bankIfsc?: string;
  bankName?: string;
  bankBranch?: string;
  bankDocumentImage?: string;
  bankDocumentUrl?: string;
}
