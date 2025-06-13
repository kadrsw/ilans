import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { FirebaseError } from 'firebase/app';

export function usePasswordReset() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);

  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      setError('');
      setSuccess(false);
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (err) {
      if (err instanceof FirebaseError) {
        switch (err.code) {
          case 'auth/user-not-found':
            setError('Bu e-posta adresiyle kayıtlı kullanıcı bulunamadı');
            break;
          case 'auth/invalid-email':
            setError('Geçersiz e-posta adresi');
            break;
          case 'auth/too-many-requests':
            setError('Çok fazla deneme yaptınız. Lütfen daha sonra tekrar deneyin');
            break;
          default:
            setError('Şifre sıfırlama işlemi başarısız oldu');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { resetPassword, isLoading, error, success };
}