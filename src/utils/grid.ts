import type { ColConfig } from '../types';
import { BREAKPOINTS } from '../constants';

export function getCols(width: number, cfg: ColConfig): number {
  if (width >= BREAKPOINTS.lg) return cfg.lg;
  if (width >= BREAKPOINTS.md) return cfg.md;
  if (width >= BREAKPOINTS.sm) return cfg.sm;
  return cfg.xs;
}
