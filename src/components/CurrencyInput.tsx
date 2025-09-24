"use client";

import React, { useState, useEffect, ChangeEvent } from 'react';
import { Input } from '@/components/ui/input';
import { formatCurrency, parseCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface CurrencyInputProps {
  value: number;
  onValueChange: (value: number) => void;
  className?: string;
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({ value, onValueChange, className }) => {
  const [displayValue, setDisplayValue] = useState(formatCurrency(value));

  useEffect(() => {
    setDisplayValue(formatCurrency(value));
  }, [value]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const numericValue = parseCurrency(rawValue);
    
    if (!isNaN(numericValue)) {
      onValueChange(numericValue);
    }
    setDisplayValue(rawValue);
  };

  const handleBlur = () => {
    setDisplayValue(formatCurrency(value));
  };
  
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  }

  return (
    <Input
      type="text"
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      className={cn("border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0", className)}
      inputMode="decimal"
    />
  );
};

export default CurrencyInput;
