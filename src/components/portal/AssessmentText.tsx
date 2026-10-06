import { sanitizeHtml } from '@/components/portal/RichTextEditor';

/** Preserve authored paragraph/list formatting without exposing unsafe markup. */
export default function AssessmentText({ text }: { text?: string | null }) {
  if (!text) return null;
  if (/<\/?[a-z][^>]*>/i.test(text)) {
    return <div className="prose prose-sm max-w-none text-foreground break-words [&_p]:my-2 [&_ul]:list-disc [&_ol]:list-decimal" dangerouslySetInnerHTML={{ __html: sanitizeHtml(text) }} />;
  }
  return <div className="whitespace-pre-wrap break-words text-foreground">{text}</div>;
}