import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { FirebaseError } from 'firebase/app';

export function useAuthForm() {
  const [serverError, setServerError] = useState<string>('');
  const { signIn, signUp } = useAuthContext();
  const navigate = useNavigate();

  const handleFirebaseError = (error: FirebaseError) => {
    switch (error.code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'E-posta veya şifre hatalı';
      case 'auth/email-already-in-use':
        return 'Bu e-posta adresi zaten kullanımda';
      case 'auth/weak-password':
        return 'Şifre çok zayıf';
      case 'auth/invalid-email':
        return 'Geçersiz e-posta adresi';
      case 'auth/network-request-failed':
        return 'Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin';
      default:
        return 'Bir hata oluştu. Lütfen tekrar deneyin';
    }
  };

  return {
    serverError,
    setServerError,
    handleFirebaseError,
    signIn,
    signUp,
    navigate
  };
}