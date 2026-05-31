import {
  UtensilsCrossed,
  Car,
  Home,
  Zap,
  HeartPulse,
  ShoppingBag,
  GraduationCap,
  Gamepad2,
  Briefcase,
  CreditCard,
  Users,
  PawPrint,
  Landmark,
  PiggyBank,
  AlertTriangle,
  MoreHorizontal,
  Tag,
  Wallet,
  TrendingUp,
  BarChart2,
  Gift,
  Coins,
  type LucideProps,
} from 'lucide-react'
import React from 'react'

// Map: icon name (stored in DB) → Lucide component
const ICON_MAP: Record<string, React.FC<LucideProps>> = {
  UtensilsCrossed,
  Car,
  Home,
  Zap,
  HeartPulse,
  ShoppingBag,
  GraduationCap,
  Gamepad2,
  Briefcase,
  CreditCard,
  Users,
  PawPrint,
  Landmark,
  PiggyBank,
  AlertTriangle,
  MoreHorizontal,
  Wallet,
  TrendingUp,
  BarChart2,
  Gift,
  Coins,
}

interface CategoryIconProps extends LucideProps {
  name: string
}

/**
 * Renders a Lucide icon by name (as stored in the database).
 * Falls back to a generic Tag icon if the name is not found.
 */
export function CategoryIcon({ name, ...props }: CategoryIconProps) {
  const Icon = ICON_MAP[name] ?? Tag
  return <Icon {...props} />
}

export default ICON_MAP
