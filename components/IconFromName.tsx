'use client'

import {
  ShieldCheck,
  Wrench,
  Package,
  Boxes,
  Car,
  Sparkles,
  Target,
  Heart,
  Award,
  Users,
  CheckCircle2,
  Star,
  type LucideIcon,
} from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  ShieldCheck,
  Wrench,
  Package,
  Boxes,
  Car,
  Sparkles,
  Target,
  Heart,
  Award,
  Users,
  CheckCircle2,
  Star,
}

interface IconFromNameProps {
  name: string
  className?: string
  size?: number
}

/** Renders a lucide icon by string name (e.g. "ShieldCheck"). Fallback: Package. */
export default function IconFromName({ name, className = '', size = 24 }: IconFromNameProps) {
  const normalized = (name || '').trim().replace(/\s+/g, '')
  const Icon = normalized ? iconMap[normalized] ?? iconMap[normalized.charAt(0).toUpperCase() + normalized.slice(1)] ?? iconMap.Package : iconMap.Package
  return <Icon className={className} size={size} />
}
