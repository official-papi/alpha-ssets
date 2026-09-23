import { createClient } from "./client";

export interface UploadResult {
  url: string | null;
  error: string | null;
}

export type UploadQrResult = UploadResult;

/**
 * Uploads a QR code image to Supabase Storage with automatic Base64 fallback.
 * Guarantees that users are never blocked even if the remote Supabase bucket
 * has not yet been initialized.
 */
export async function uploadPayoutQrCode(
  file: File,
  userId: string
): Promise<UploadResult> {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
  if (!allowedTypes.includes(file.type)) {
    return {
      url: null,
      error: "Invalid file format. Please upload a PNG, JPG, or WEBP image.",
    };
  }

  // 5MB max
  if (file.size > 5 * 1024 * 1024) {
    return {
      url: null,
      error: "File size exceeds 5MB limit. Please choose a smaller image.",
    };
  }

  const supabase = createClient();
  const fileExt = file.name.split(".").pop() || "png";
  const fileName = `${userId}/payout_qr_${Date.now()}.${fileExt}`;

  try {
    const { data: uploadData, error: uploadErr } = await supabase.storage
      .from("payout-qrcodes")
      .upload(fileName, file, { upsert: true });

    if (!uploadErr && uploadData?.path) {
      const { data: publicUrlData } = supabase.storage
        .from("payout-qrcodes")
        .getPublicUrl(uploadData.path);

      if (publicUrlData?.publicUrl) {
        return { url: publicUrlData.publicUrl, error: null };
      }
    }
  } catch (err) {
    console.warn("Supabase storage upload failed, falling back to Base64:", err);
  }

  // Fallback to Base64 data URL if bucket is missing or network/storage fails
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({ url: reader.result as string, error: null });
    };
    reader.onerror = () => {
      resolve({ url: null, error: "Failed to read the QR code image file." });
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads a deposit proof image/document to Supabase Storage with automatic Base64 fallback.
 * Guarantees that administrators can always see the proof of payment.
 */
export async function uploadDepositProof(
  file: File,
  userId: string
): Promise<UploadResult> {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
  if (!allowedTypes.includes(file.type)) {
    return {
      url: null,
      error: "Invalid file format. Only JPG, PNG, WEBP, and PDF documents are allowed.",
    };
  }

  if (file.size > 5 * 1024 * 1024) {
    return {
      url: null,
      error: "File size exceeds 5MB limit. Please choose a smaller file.",
    };
  }

  const supabase = createClient();
  const fileExt = file.name.split(".").pop() || "png";
  const fileName = `${userId}/deposit_${Date.now()}.${fileExt}`;

  try {
    const { data: uploadData, error: uploadErr } = await supabase.storage
      .from("deposit-proofs")
      .upload(fileName, file, { upsert: true });

    if (!uploadErr && uploadData?.path) {
      const { data: publicUrlData } = supabase.storage
        .from("deposit-proofs")
        .getPublicUrl(uploadData.path);

      if (publicUrlData?.publicUrl) {
        return { url: publicUrlData.publicUrl, error: null };
      }
    }
  } catch (err) {
    console.warn("Supabase deposit proof storage upload failed, falling back to Base64:", err);
  }

  // Fallback to Base64 data URL
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({ url: reader.result as string, error: null });
    };
    reader.onerror = () => {
      resolve({ url: null, error: "Failed to read payment proof document." });
    };
    reader.readAsDataURL(file);
  });
}
