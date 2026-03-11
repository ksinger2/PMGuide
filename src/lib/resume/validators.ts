/**
 * File validation for resume uploads.
 * MVP: PDF only, max 10MB.
 */

import { MAX_FILE_SIZE } from "@/lib/utils/constants";

export interface ValidationResult {
  valid: boolean;
  error?: {
    code: "INVALID_FILE_TYPE" | "FILE_TOO_LARGE" | "VALIDATION_ERROR";
    message: string;
  };
}

/** PDF magic bytes: %PDF */
const PDF_MAGIC_BYTES = [0x25, 0x50, 0x44, 0x46];

/**
 * Validate that the uploaded file is a PDF and within the size limit.
 * Checks both MIME type and magic bytes for security.
 */
export function validateResumeFile(file: File): ValidationResult {
  // Check file is provided
  if (!file || file.size === 0) {
    return {
      valid: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "No file provided.",
      },
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    const maxMB = Math.round(MAX_FILE_SIZE / (1024 * 1024));
    return {
      valid: false,
      error: {
        code: "FILE_TOO_LARGE",
        message: `File exceeds the ${maxMB}MB limit. Please upload a smaller file.`,
      },
    };
  }

  // Check MIME type
  if (file.type !== "application/pdf") {
    return {
      valid: false,
      error: {
        code: "INVALID_FILE_TYPE",
        message:
          "Only PDF files are supported. Please upload your resume as a PDF.",
      },
    };
  }

  return { valid: true };
}

/**
 * Validate PDF magic bytes from a buffer.
 * This is a server-side check that runs after the MIME type check.
 */
export function validatePdfMagicBytes(buffer: Buffer): ValidationResult {
  if (buffer.length < 4) {
    return {
      valid: false,
      error: {
        code: "INVALID_FILE_TYPE",
        message: "File is too small to be a valid PDF.",
      },
    };
  }

  const hasPdfHeader = PDF_MAGIC_BYTES.every(
    (byte, i) => buffer[i] === byte
  );

  if (!hasPdfHeader) {
    return {
      valid: false,
      error: {
        code: "INVALID_FILE_TYPE",
        message:
          "File does not appear to be a valid PDF. Please upload a real PDF file.",
      },
    };
  }

  return { valid: true };
}
