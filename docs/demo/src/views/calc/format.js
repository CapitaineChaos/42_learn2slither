// Écriture des nombres dans le tableau et le calcul déroulé : signe
// typographique, parenthèses autour d'un négatif.

export const MINUS = '−';
export const num = (value, digits = 3) => `${value < 0 ? MINUS : ''}${Math.abs(value).toFixed(digits)}`;
export const signed = (value, digits = 3) => `${value < 0 ? MINUS : '+'}${Math.abs(value).toFixed(digits)}`;
export const paren = (value, digits = 3) => (value < 0 ? `(${num(value, digits)})` : num(value, digits));
