import { Currency } from '../types';

export function formatCurrency(amountFCFA: number, currency: Currency): string {
  if (currency === 'EUR') {
    const amountEUR = Math.round(amountFCFA / 655.957);
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(amountEUR);
  }

  // FCFA format
  const formattedNumber = new Intl.NumberFormat('fr-FR').format(amountFCFA);
  return `${formattedNumber} FCFA`;
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('fr-FR').format(num);
}
