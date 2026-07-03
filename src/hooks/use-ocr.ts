import { useState, useCallback } from 'react';
import { scanReceipt, type OcrResult, type OcrStatus } from '@/services';

interface UseOcrReturn {
  status: OcrStatus;
  result: OcrResult | null;
  error: string | null;
  scan: (imageUri: string) => Promise<void>;
  reset: () => void;
}

export function useOcr(): UseOcrReturn {
  const [status, setStatus] = useState<OcrStatus>('idle');
  const [result, setResult] = useState<OcrResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const scan = useCallback(async (imageUri: string) => {
    setStatus('scanning');
    setError(null);

    try {
      const ocrResult = await scanReceipt(imageUri);
      setResult(ocrResult);
      setStatus('success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'OCR scan failed';
      setError(message);
      setStatus('error');
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setResult(null);
    setError(null);
  }, []);

  return { status, result, error, scan, reset };
}
