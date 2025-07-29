import React from 'react';

const EyeIcon = ({ style, alt, src, onClick }) => {
  return (
    <img
      src={src}      
      alt={alt}
      onClick={onClick}
      
    />
  );
};

export default EyeIcon;
