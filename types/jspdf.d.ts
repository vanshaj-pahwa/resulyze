declare module 'jspdf' {
  interface jsPDF {
    setFont(fontName: string, fontStyle?: string): jsPDF;
    setFontSize(size: number): jsPDF;
    text(text: string | string[], x: number, y: number, options?: any): jsPDF;
    getTextWidth(text: string): number;
    setTextColor(r: number, g: number, b: number): jsPDF;
    setLineWidth(width: number): jsPDF;
    line(x1: number, y1: number, x2: number, y2: number): jsPDF;
    splitTextToSize(text: string, maxLength: number): string[];
    addPage(): jsPDF;
    output(type: string): ArrayBuffer;
  }

  export default function jsPDF(options?: any): jsPDF;
}
