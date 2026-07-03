import type { OcrItem, ExpenseCategory } from '@/types';

export interface OcrResult {
  items: OcrItem[];
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
  confidence: number;
  rawText: string;
}

export type OcrStatus = 'idle' | 'scanning' | 'success' | 'error';

type TextRecognitionResult = {
  blocks: {
    lines: {
      text: string;
      confidence?: number;
    }[];
  }[];
  text: string;
};

const FALLBACK_CATEGORIES: Record<string, ExpenseCategory> = {
  pizza: 'food',
  burger: 'food',
  salad: 'food',
  pasta: 'food',
  steak: 'food',
  sushi: 'food',
  wine: 'drinks',
  beer: 'drinks',
  cocktail: 'drinks',
  coffee: 'drinks',
  soda: 'drinks',
  water: 'drinks',
  taxi: 'transport',
  uber: 'transport',
  gas: 'transport',
  'electric bill': 'utilities',
  internet: 'utilities',
  rent: 'rent',
  movie: 'entertainment',
  ticket: 'entertainment',
};

function inferCategory(itemName: string): ExpenseCategory | null {
  const lower = itemName.toLowerCase();
  for (const [keyword, category] of Object.entries(FALLBACK_CATEGORIES)) {
    if (lower.includes(keyword)) return category;
  }
  return null;
}

function parseReceiptText(result: TextRecognitionResult): OcrItem[] {
  return result.blocks
    .flatMap((block: { lines: { text: string; confidence?: number }[] }) => block.lines)
    .filter((line: { text: string; confidence?: number }) => {
      const text = line.text.trim();
      return text.length > 0 && /\d/.test(text);
    })
    .map((line: { text: string; confidence?: number }) => {
      const text = line.text.trim();
      const priceMatch = text.match(/(\d+[.,]\d{2})$/);
      const price = priceMatch ? parseFloat(priceMatch[1].replace(',', '.')) : 0;
      const name = priceMatch ? text.slice(0, Math.max(0, text.lastIndexOf(priceMatch[1]))).trim() : text;

      return {
        name: name || text,
        price,
        quantity: 1,
        confidence: line.confidence ?? 0.5,
        assignedTo: [],
        category: inferCategory(name || text),
      };
    })
    .filter((item: OcrItem) => item.price > 0 || item.name.length > 0);
}

export async function scanReceipt(imageUri: string): Promise<OcrResult> {
  try {
    const textRecognition = await import('@react-native-ml-kit/text-recognition');
    const result = await (
      textRecognition as unknown as { recognize: (uri: string) => Promise<TextRecognitionResult> }
    ).recognize(imageUri);

    const items = parseReceiptText(result);

    const totalMatch = result.text.match(/total\s*[\$€£]?\s*(\d+[.,]\d{2})/i);
    const total = totalMatch
      ? parseFloat(totalMatch[1].replace(',', '.'))
      : items.reduce((sum, i) => sum + i.price, 0);
    const avgConfidence =
      items.length > 0 ? items.reduce((s, i) => s + i.confidence, 0) / items.length : 0;

    return {
      items,
      subtotal: items.reduce((sum, i) => sum + i.price, 0),
      tax: 0,
      tip: 0,
      total,
      confidence: avgConfidence,
      rawText: result.text,
    };
  } catch {
    return {
      items: [],
      subtotal: 0,
      tax: 0,
      tip: 0,
      total: 0,
      confidence: 0,
      rawText: '',
    };
  }
}

export function getConfidenceLabel(confidence: number): { label: string; variant: 'high' | 'medium' | 'low' } {
  if (confidence >= 0.8) return { label: 'High', variant: 'high' };
  if (confidence >= 0.5) return { label: 'Medium', variant: 'medium' };
  return { label: 'Low', variant: 'low' };
}
