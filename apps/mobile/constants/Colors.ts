import { primitiveColors, semanticColors, radiiNumeric } from '@repo/tokens';

const tintColorLight = primitiveColors.electricIndigo[500]; // #5B6EAE Electric Indigo
const tintColorDark = primitiveColors.electricIndigo[400]; // #7289DA Periwinkle Blue

export const brandColors = {
  electricIndigo: primitiveColors.electricIndigo[500],
  midnightNavy: primitiveColors.electricIndigo[900],
  periwinkleBlue: primitiveColors.electricIndigo[400],
  safetyOrange: primitiveColors.safetyOrange[500],
  safetyOrangeHover: primitiveColors.safetyOrange[600],
  charcoal: primitiveColors.charcoal[900],
  deepCharcoal: primitiveColors.charcoal[950],
  concrete: primitiveColors.concrete[300],
  signalWhite: primitiveColors.concrete[100],
  emerald: primitiveColors.peaceFund[500],
};

export const radii = radiiNumeric;
export { radiiNumeric };

export default {
  light: {
    text: primitiveColors.charcoal[900],
    background: '#FFFFFF',
    tint: tintColorLight,
    tabIconDefault: '#94A3B8',
    tabIconSelected: tintColorLight,
    card: '#FFFFFF',
    border: '#E2E8F0',
    primary: tintColorLight,
    urgent: primitiveColors.safetyOrange[500],
    muted: '#64748B',
  },
  dark: {
    text: primitiveColors.concrete[100],
    background: primitiveColors.charcoal[950],
    tint: tintColorDark,
    tabIconDefault: '#64748B',
    tabIconSelected: tintColorDark,
    card: primitiveColors.charcoal[900],
    border: primitiveColors.charcoal[700],
    primary: tintColorDark,
    urgent: primitiveColors.safetyOrange[500],
    muted: '#94A3B8',
  },
};
