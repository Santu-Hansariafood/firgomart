import { useState } from 'react';

export const useSellerVerification = () => {
  const [gstVerified, setGstVerified] = useState(false);
  const [gstVerifying, setGstVerifying] = useState(false);
  const [gstError, setGstError] = useState<string | null>(null);
  const [gstData, setGstData] = useState<any>(null);

  const [bankVerified, setBankVerified] = useState(false);
  const [bankVerifying, setBankVerifying] = useState(false);
  const [bankError, setBankError] = useState<string | null>(null);
  const [bankData, setBankData] = useState<any>(null);

  const [ifscVerified, setIfscVerified] = useState(false);
  const [ifscVerifying, setIfscVerifying] = useState(false);
  const [ifscError, setIfscError] = useState<string | null>(null);
  const [ifscData, setIfscData] = useState<any>(null);

  const verifyIfsc = async (code: string) => {
    if (!code || code.length !== 11) return false;
    setIfscVerifying(true);
    setIfscError(null);
    setIfscVerified(false);
    try {
      const res = await fetch(`/api/verification/ifsc?code=${code}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid IFSC Code');
      }
      setIfscVerified(true);
      setIfscData(data);
      return data;
    } catch (err: any) {
      setIfscError(err.message);
      return null;
    } finally {
      setIfscVerifying(false);
    }
  };

  const verifyGst = async (gstNumber: string) => {
    if (!gstNumber) return false;
    setGstVerifying(true);
    setGstError(null);
    setGstVerified(false);
    try {
      const res = await fetch('/api/verification/gst', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gstNumber }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Verification failed');
      }
      // Cashfree GST response check
      if (data.valid === true) {
          setGstVerified(true);
          setGstData(data);
          return true;
      } else {
          setGstError("Invalid GST Number");
          return false;
      }
    } catch (err: any) {
      setGstError(err.message);
      return false;
    } finally {
      setGstVerifying(false);
    }
  };

  const verifyBank = async (bankAccount: string, ifsc: string, name: string, phone: string) => {
    if (!bankAccount || !ifsc || !name || !phone) {
        setBankError("All bank details and phone number are required");
        return false;
    }
    setBankVerifying(true);
    setBankError(null);
    setBankVerified(false);
    try {
      const res = await fetch('/api/verification/bank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bankAccount, ifsc, name, phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Verification failed');
      }
      // Cashfree Bank Sync check - usually checks for status SUCCESS and valid account status
      if (data.status === "SUCCESS" && (data.data?.accountStatus === "VALID" || data.subCode === "200")) {
          setBankVerified(true);
          setBankData(data);
          return true;
      } else {
          setBankError(data.message || "Invalid Bank Account Details");
          return false;
      }
    } catch (err: any) {
      setBankError(err.message);
      return false;
    } finally {
      setBankVerifying(false);
    }
  };
  
  return {
    gstVerified, gstVerifying, gstError, gstData, verifyGst,
    bankVerified, bankVerifying, bankError, bankData, verifyBank,
    ifscVerified, ifscVerifying, ifscError, ifscData, verifyIfsc,
    setGstVerified, setBankVerified
  };
};
