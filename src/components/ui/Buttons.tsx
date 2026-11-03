import React, { useState } from 'react';
import { MessageSquare, Copy, Check, ExternalLink } from 'lucide-react';
import { buildWhatsAppLink } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5 min-h-[36px]',
    md: 'px-4 py-2.5 text-sm gap-2 min-h-[44px]',
    lg: 'px-6 py-3 text-base gap-2.5 min-h-[48px]',
  };

  const variantStyles = {
    primary: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow active:bg-emerald-800',
    secondary: 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm active:bg-black',
    outline: 'border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 hover:border-slate-400',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm active:bg-rose-800',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-700 active:bg-slate-200',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
      ) : (
        icon
      )}
      {children}
    </button>
  );
};

export const WhatsAppButton: React.FC<{
  phone: string;
  message: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ phone, message, label = 'Chat on WhatsApp', size = 'md', className = '' }) => {
  const url = buildWhatsAppLink(phone, message);

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs gap-1.5 min-h-[36px]',
    md: 'px-4 py-2.5 text-sm gap-2 min-h-[44px]',
    lg: 'px-5 py-3 text-base gap-2.5 min-h-[48px]',
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center font-medium bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-lg shadow-sm transition-all duration-150 select-none whitespace-nowrap active:scale-[0.98] ${sizeClasses[size]} ${className}`}
    >
      <MessageSquare className="w-4 h-4 shrink-0 fill-current" />
      <span>{label}</span>
      <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-80" />
    </a>
  );
};

export const CopyButton: React.FC<{
  text: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
  size?: 'sm' | 'md';
}> = ({ text, label = 'Copy', copiedLabel = 'Copied!', className = '', size = 'sm' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 rounded-md border text-xs font-medium transition-colors ${
        copied
          ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
      } ${size === 'sm' ? 'px-2.5 py-1' : 'px-3 py-1.5'} ${className}`}
      title="Click to copy"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
      <span>{copied ? copiedLabel : label}</span>
    </button>
  );
};
