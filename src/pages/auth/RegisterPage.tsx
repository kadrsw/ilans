import React from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { FirebaseError } from 'firebase/app';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuthForm } from '../../hooks/useAuthForm';

interface RegisterForm {
  email: string;
  password: string;
  passwordConfirm: string;
  phone?: string;
}

export function RegisterPage() {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<RegisterForm>();
  const { serverError, setServerError, handleFirebaseError, signUp, navigate } = useAuthForm();

  const password = watch('password');

  const onSubmit = async (data: RegisterForm) => {
    try {
      setServerError('');
      await signUp(data.email, data.password, data.phone);
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
          <h1 className="text-2xl font-bold text-center mb-6">Kayıt Ol</h1>
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
              autoComplete="new-password"
              error={errors.password?.message}
              {...register('password', { 
                required: 'Şifre gerekli',
                minLength: {
                  value: 6,
                  message: 'Şifre en az 6 karakter olmalı'
                }
              })}
            />
            <Input
              label="Şifre Tekrar"
              type="password"
              autoComplete="new-password"
              error={errors.passwordConfirm?.message}
              {...register('passwordConfirm', {
                required: 'Şifre tekrarı gerekli',
                validate: value => 
                  value === password || 'Şifreler eşleşmiyor'
              })}
            />
            <Input
              label="Telefon (İsteğe bağlı)"
              type="tel"
              autoComplete="tel"
              placeholder="5XX XXX XX XX"
              error={errors.phone?.message}
              {...register('phone', {
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: 'Geçerli bir telefon numarası girin (5XX XXX XX XX)'
                }
              })}
            />
            <Button
              type="submit"
              className="w-full"
              isLoading={isSubmitting}
            >
              Kayıt Ol
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-600">
            Zaten hesabınız var mı?{' '}
            <Link to="/giris" className="text-blue-600 hover:underline">
              Giriş Yap
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}