import crypto from 'crypto';

const PHONEPE_MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID || "PGTESTPAYUAT";
const PHONEPE_SALT_KEY = process.env.PHONEPE_SALT_KEY || "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399";
const PHONEPE_SALT_INDEX = process.env.PHONEPE_SALT_INDEX || "1";
const PHONEPE_HOST_URL = process.env.PHONEPE_HOST_URL || "https://api-preprod.phonepe.com/apis/pg-sandbox";

export const phonePeConfig = {
  merchantId: PHONEPE_MERCHANT_ID,
  saltKey: PHONEPE_SALT_KEY,
  saltIndex: PHONEPE_SALT_INDEX,
  hostUrl: PHONEPE_HOST_URL,
};

export const generateChecksum = (payload: string, endpoint: string) => {
  const stringToSign = payload + endpoint + PHONEPE_SALT_KEY;
  const sha256 = crypto.createHash('sha256').update(stringToSign).digest('hex');
  return `${sha256}###${PHONEPE_SALT_INDEX}`;
};
