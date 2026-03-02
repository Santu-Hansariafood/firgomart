import { useEffect } from "react"

const gstStateMap: Record<string, string> = {
  "01": "Jammu and Kashmir", "02": "Himachal Pradesh", "03": "Punjab", "04": "Chandigarh",
  "05": "Uttarakhand", "06": "Haryana", "07": "Delhi", "08": "Rajasthan", "09": "Uttar Pradesh",
  "10": "Bihar", "11": "Sikkim", "12": "Arunachal Pradesh", "13": "Nagaland", "14": "Manipur",
  "15": "Mizoram", "16": "Tripura", "17": "Meghalaya", "18": "Assam", "19": "West Bengal",
  "20": "Jharkhand", "21": "Odisha", "22": "Chhattisgarh", "23": "Madhya Pradesh", "24": "Gujarat",
  "25": "Daman and Diu", "26": "Dadra and Nagar Haveli", "27": "Maharashtra", "28": "Andhra Pradesh",
  "29": "Karnataka", "30": "Goa", "31": "Lakshadweep", "32": "Kerala", "33": "Tamil Nadu",
  "34": "Puducherry", "35": "Andaman and Nicobar Islands", "36": "Telangana", "37": "Andhra Pradesh",
  "38": "Ladakh", "97": "Other Territory", "99": "Centre Jurisdiction"
}

export function useGstStateAutoFill(args: {
  formGST: boolean
  formGSTNumber: string
  setFormSellerState: (value: string) => void
}) {
  const { formGST, formGSTNumber, setFormSellerState } = args

  useEffect(() => {
    if (formGST) setFormSellerState("")
  }, [formGST, setFormSellerState])

  useEffect(() => {
    if (formGSTNumber.length >= 2) {
      const code = formGSTNumber.substring(0, 2)
      const state = gstStateMap[code]
      if (state) setFormSellerState(state)
    }
  }, [formGSTNumber, setFormSellerState])
}
