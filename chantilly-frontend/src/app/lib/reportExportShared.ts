export type ExportMeta = {
  exportedAt: string;
  exportedBy: string;
};

export function formatCurrency(value: number) {
  return `S/ ${Number(value || 0).toFixed(2)}`;
}

export function safeSheetName(name: string) {
  return name.slice(0, 31);
}
