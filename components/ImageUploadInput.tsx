"use client";
 
// eslint-disable-next-line  @typescript-eslint/no-explicit-any  
const ImageUploadInput = ({ fileInputRef, onChange }: { fileInputRef: any, onChange: any }) => {
  return (
    <input
      type="file"
      ref={fileInputRef}
      onChange={onChange}
      style={{ display: 'none' }}
      accept="image/png, image/jpeg, image/gif"
    />
  );
};

export default ImageUploadInput;
