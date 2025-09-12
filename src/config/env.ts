// Cấu hình môi trường cho ứng dụng
export const env = {
  // Gemini AI API Key
  GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY || '',
  
  // Firebase Configuration
  FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY || '',
  FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

// Kiểm tra các biến môi trường bắt buộc
export const validateEnv = () => {
  const requiredVars = [
    'GEMINI_API_KEY',
    'FIREBASE_API_KEY',
    'FIREBASE_AUTH_DOMAIN',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_STORAGE_BUCKET',
    'FIREBASE_MESSAGING_SENDER_ID',
    'FIREBASE_APP_ID'
  ];

  const missingVars = requiredVars.filter(varName => !env[varName as keyof typeof env]);
  
  if (missingVars.length > 0) {
    console.error('Thiếu các biến môi trường bắt buộc:', missingVars);
    console.log('Vui lòng tạo file .env với các biến sau:');
    missingVars.forEach(varName => {
      console.log(`VITE_${varName}=your_value_here`);
    });
  }
  
  return missingVars.length === 0;
};