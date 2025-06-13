import React from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { usePasswordReset } from '../../hooks/usePasswordReset';

interface ForgotPasswordForm {
  email: string;
}

export function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordForm>();
  const { resetPassword, isLoading, error, success } = usePasswordReset();

  const onSubmit = async (data: ForgotPasswordForm) => {
    await resetPassword(data.email);
  };

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <h1 className="text-2xl font-bold text-center mb-6">Şifre Sıfırlama</h1>
          
          {error && (
            <div className="mb-4 p-3 rounded bg-red-50 text-red-600 text-sm">
              {error}
            </div>
          )}
          
          {success ? (
            <div className="text-center">
              <div className="mb-4 p-3 rounded bg-green-50 text-green-600 text-sm">
                Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.
                Lütfen e-postanızı kontrol edin.
              </div>
              <Link
                to="/giris"
                className="text-blue-600 hover:underline"
              >
                Giriş sayfasına dön
              </Link>
            </div>
          ) : (
            <>
              <p className="text-gray-600 mb-6 text-sm">
                E-posta adresinizi girin. Size şifre sıfırlama bağlantısı göndereceğiz.
              </p>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="E-posta"
                  type="email"
                  autoComplete="email"
                  error={errors.email?.message}
                  {...register('email', { 
                    required: 'E-posta gerekli',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Geçerli bir e-posta adresi girin'
                    }
                  })}
                />
                <Button
                  type="submit"
                  className="w-full"
                  isLoading={isLoading}
                >
                  Şifre Sıfırlama Bağlantısı Gönder
                </Button>
              </form>
              <p className="mt-4 text-center text-sm text-gray-600">
                <Link to="/giris" className="text-blue-600 hover:underline">
                  Giriş sayfasına dön
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}