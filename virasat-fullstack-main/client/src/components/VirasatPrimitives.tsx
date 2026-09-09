// Shared Virāsat design primitives: these are the visual source of truth for headings, cards, imagery, labels, threadwork, and actions across retained routes.
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "wouter";

export function HeritageLabel({ children, className = "" }: { children: ReactNode; className?: string }) { return <span className={`heritage-label ${className}`}><i />{children}</span>; }
export function GoldDivider({ className = "" }: { className?: string }) { return <span className={`gold-divider ${className}`} aria-hidden="true"><i /><i /><i /><i /></span>; }
export function GoldenThread({ className = "" }: { className?: string }) { return <svg className={`golden-thread ${className}`} viewBox="0 0 1000 160" preserveAspectRatio="none" aria-hidden="true"><path d="M 0 117 C 119 74 168 133 289 101 C 406 70 431 42 537 78 C 640 113 688 149 799 91 C 878 50 915 94 1000 51" /></svg>; }
export function VirasatHeading({ eyebrow, title, accent, copy, className = "" }: { eyebrow: ReactNode; title: ReactNode; accent?: ReactNode; copy?: ReactNode; className?: string }) { return <header className={`virasat-heading ${className}`}><HeritageLabel>{eyebrow}</HeritageLabel><h2>{title}{accent && <><br /><em>{accent}</em></>}</h2>{copy && <p>{copy}</p>}</header>; }
export function HeritageImage({ src, alt, label, className = "" }: { src: string; alt: string; label?: ReactNode; className?: string }) { return <figure className={`heritage-image ${className}`}><img src={src} alt={alt} />{label && <figcaption><HeritageLabel>{label}</HeritageLabel></figcaption>}</figure>; }
export function VirasatCard({ children, className = "", onClick }: { children: ReactNode; className?: string; onClick?: () => void }) { return <motion.article className={`virasat-card ${className}`} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .2 }} transition={{ duration: .42 }} onClick={onClick}>{children}</motion.article>; }
export function VirasatButton({ children, className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode; className?: string }) { return <button className={`virasat-button ${className}`} {...props}>{children}</button>; }
export function VirasatBackLink({ href, children = "Back", className = "" }: { href: string; children?: ReactNode; className?: string }) { return <Link href={href} className={`virasat-back-link ${className}`}><ArrowLeft size={15} /><span>{children}</span></Link>; }
