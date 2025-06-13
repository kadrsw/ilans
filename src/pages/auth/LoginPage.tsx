import React from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { FirebaseError } from 'firebase/app';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuthForm } from '../../hooks/useAuthForm';

interface LoginForm {
  email: string;
  password: string;
}

export function LoginPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>();
  const { serverError, setServerError, handleFirebaseError, signIn, navigate } = useAuthForm();

  const onSubmit = async (data: LoginForm) => {
    try {
      setServerError('');
      await signIn(data.email, data.password);
      navigate('/');
    } catch (error) {
      if (error instanceof FirebaseError) {
        setServerError(handleFirebaseError(error));
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <h1 className="text-2xl font-bold text-center mb-6">Giriş Yap</h1>
          {serverError && (
            <div className="mb-4 p-3 rounded bg-red-50 text-red-600 text-sm">
              {serverError}
            </div>
          )}
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
            <Input
              label="Şifre"
              type="password"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register('password', { 
                required: 'Şifre gerekli',
                minLength: {
                  value: 6,
                  message: 'Şifre en az 6 karakter olmalı'
                }
              })}
            />
            <div className="flex justify-between items-center text-sm">
              <Link to="/sifremi-unuttum" className="text-blue-600 hover:underline">
                Şifremi Unuttum
              </Link>
            </div>
            <Button
              type="submit"
              className="w-full"
              isLoading={isSubmitting}
            >
              Giriş Yap
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-600">
            Hesabınız yok mu?{' '}
            <Link to="/kayit" className="text-blue-600 hover:underline">
              Kayıt Ol
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}