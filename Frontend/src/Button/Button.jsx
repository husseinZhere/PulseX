import React from 'react';

const styles = {
  // استخدمنا font-inter و الأطوال اللي حددتيها بالملي

  base: "h-[48px] px-6 rounded-full text-[14px] font-medium font-inter flex items-center justify-center transition-all duration-300 whitespace-nowrap active:scale-95",
  
  variants: {
primary: "cursor-pointer bg-brand-main text-white hover:bg-brand-secnd shadow-md hover:shadow-lg border border-transparent",
  
  outline: " cursor-pointer bg-white text-gray-text-dim border border-gray-200 hover:bg-brand-main hover:text-white hover:border-brand-main shadow-sm hover:shadow-md",
    
    ghost: "cursor-pointer text-brand-main hover:bg-brand-main/10"
  
  }
};

const Button = ({ children, variant = 'primary', icon: Icon, className = '', ...props }) => {
  return (
    <button 
      className={`${styles.base} ${styles.variants[variant]} ${className}`} 
      {...props}
    >
      {children}
      {/* الأيقونة لو موجودة هتظهر جنب النص */}
      {Icon && <Icon className="ml-2 w-4 h-4" />}
    </button>
  );
};

export default Button;