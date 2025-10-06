/**
 * FormField Component
 * Wrapper combining label + input/select + error message
 */

import React from 'react'

export interface FormFieldProps {
  children: React.ReactNode
  error?: string
  className?: string
}

export const FormField: React.FC<FormFieldProps> = ({ children, error, className = '' }) => {
  return (
    <div className={`w-full ${className}`}>
      {children}
    </div>
  )
}
