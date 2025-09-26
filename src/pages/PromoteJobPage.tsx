import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, get } from 'firebase/database';
import { db } from '../lib/firebase';
import { useAuthContext } from '../contexts/AuthContext';
import { paymentPackages, paymentService } from '../services/paymentService';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Crown, Zap, Star, CheckCircle, ArrowLeft } from 'lucide-react';
import type { JobListing } from '../types';
import toast from 'react-hot-toast';

export function PromoteJobPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [job, setJob] = useState<JobListing | null>(null);
  const [selectedPackage, setSelectedPackage] = useState('weekly');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId || !user) return;

      try {
        const jobRef = ref(db, `jobs/${jobId}`);
        const snapshot = await get(jobRef);
        
        if (snapshot.exists()) {
          const jobData = snapshot.val();
          if (jobData.userId === user.id) {
            setJob({ id: jobId, ...jobData });
          } else {
            toast.error('Bu ilan size ait değil');
            navigate('/ilanlarim');
          }
        } else {
          toast.error('İlan bulunamadı');
          navigate('/ilanlarim');
        }
      } catch (error) {
        console.error('Error fetching job:', error);
        toast.error('İlan yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId, user, navigate]);

  const handlePayment = async () => {
    if (!job || !user) return;

    console.log('💳 Ödeme butonu tıklandı');

    // Detaylı validasyon
    if (!userInfo.name || userInfo.name.trim().length < 2) {
      toast.error('Lütfen geçerli bir ad soyad girin');
      console.error('❌ Ad soyad eksik:', userInfo.name);
      return;
    }
    
    if (!userInfo.phone || userInfo.phone.replace(/[^0-9]/g, '').length < 10) {
      toast.error('Lütfen geçerli bir telefon numarası girin');
      console.error('❌ Telefon eksik/hatalı:', userInfo.phone);
      return;
    }
    
    if (!userInfo.address || userInfo.address.trim().length < 5) {
      toast.error('Lütfen geçerli bir adres girin');
      console.error('❌ Adres eksik:', userInfo.address);
      return;
    }
    
    if (!user.email || !user.email.includes('@')) {
      toast.error('Geçerli bir e-posta adresi gerekli');
      console.error('❌ User email eksik:', user.email);
      return;
    }

    console.log('✅ Tüm validasyonlar geçti, PayTR servisine gönderiliyor...');

    try {
      setProcessing(true);
      toast.loading('Ödeme sayfası hazırlanıyor...', { id: 'payment-loading' });
      
      const result = await paymentService.createPayment(
        job.id,
        selectedPackage,
        user.email,
        userInfo.name,
        userInfo.phone,
        userInfo.address
      );

      toast.dismiss('payment-loading');

      if (result.success) {
        console.log('✅ Payment result:', result);
        
        if (result.token || result.iframeToken || result.paymentUrl) {
          // PayTR ödeme sayfasına yönlendir
          const paymentUrl = result.paymentUrl || 
            (result.iframeToken ? `https://www.paytr.com/odeme/guvenli/${result.iframeToken}` : 
             result.token ? `https://www.paytr.com/odeme/guvenli/${result.token}` : null);
          
          if (paymentUrl) {
            console.log('🔗 Ödeme sayfasına yönlendiriliyor:', paymentUrl);
            
            // Kullanıcıyı bilgilendir
            toast.success('Ödeme sayfasına yönlendiriliyorsunuz...', { duration: 2000 });
            
            // 1 saniye bekle sonra yönlendir
            setTimeout(() => {
              console.log('🚀 Yönlendirme yapılıyor...');
              window.location.href = paymentUrl;
            }, 1000);
            
          } else {
            console.error('❌ Payment URL not found in result:', result);
            toast.error('Ödeme URL\'si oluşturulamadı');
          }
        } else {
          console.error('❌ No payment token received:', result);
          toast.error('Ödeme token\'i alınamadı');
        }
      } else {
        console.error('❌ Payment creation failed:', result);
        toast.error(result.error || 'Ödeme başlatılamadı');
      }
    } catch (error) {
      console.error('❌ Payment error:', error);
      toast.dismiss('payment-loading');
      toast.error('Ödeme işlemi başarısız');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-8 text-red-600">
        İlan bulunamadı
      </div>
    );
  }

  const selectedPkg = paymentPackages.find(p => p.id === selectedPackage);

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/ilanlarim')}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">İlanı Öne Çıkar</h1>
          <p className="text-gray-600">Daha fazla görüntülenme için ilanınızı öne çıkarın</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Paket Seçimi */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">İlan Bilgileri</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900">{job.title}</h3>
              <p className="text-gray-600">{job.company}</p>
              <p className="text-sm text-gray-500">{job.location}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Paket Seçimi</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {paymentPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    selectedPackage === pkg.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedPackage(pkg.id)}
                >
                  {pkg.popular && (
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                      <span className="bg-orange-500 text-white text-xs px-3 py-1 rounded-full">
                        Popüler
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center">
                    <div className="flex justify-center mb-2">
                      {pkg.id === 'daily' && <Zap className="h-6 w-6 text-yellow-500" />}
                      {pkg.id === 'weekly' && <Star className="h-6 w-6 text-blue-500" />}
                      {pkg.id === 'monthly' && <Crown className="h-6 w-6 text-purple-500" />}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{pkg.name}</h3>
                    <div className="text-2xl font-bold text-gray-900 mb-3">
                      ₺{pkg.price}
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {pkg.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Fatura Bilgileri</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Ad Soyad"
                value={userInfo.name}
                onChange={(e) => setUserInfo({...userInfo, name: e.target.value})}
                placeholder="Adınız ve soyadınız"
                required
              />
              <Input
                label="Telefon"
                value={userInfo.phone}
                onChange={(e) => setUserInfo({...userInfo, phone: e.target.value})}
                placeholder="05XX XXX XX XX"
                required
              />
              <div className="md:col-span-2">
                <Input
                  label="Adres"
                  value={userInfo.address}
                  onChange={(e) => setUserInfo({...userInfo, address: e.target.value})}
                  placeholder="Fatura adresi"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Özet */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm sticky top-8">
            <h2 className="text-lg font-semibold mb-4">Ödeme Özeti</h2>
            
            {selectedPkg && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg mb-6">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Crown className="h-6 w-6 text-purple-600" />
                    <h2 className="text-lg font-semibold text-purple-900">
                      {selectedPkg.name}
                    </h2>
                  </div>
                  <p className="text-purple-700">
                    İlanınız {selectedPkg.duration} gün boyunca öne çıkacak
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Paket</span>
                    <span className="font-medium">{selectedPkg.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Süre</span>
                    <span className="font-medium">{selectedPkg.duration} gün</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-4">
                    <span>Toplam</span>
                    <span>₺{selectedPkg.price}</span>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium text-blue-900 mb-2">Öne Çıkarma Avantajları</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• İlanınız listenin en üstünde görünür</li>
                      <li>• Renkli arka plan ile dikkat çeker</li>
                      <li>• Premium rozet ile güvenilirlik</li>
                      <li>• Daha fazla başvuru alırsınız</li>
                    </ul>
                  </div>

                  {/* Debug Bilgileri - Sadece geliştirme için */}
                  {import.meta.env.DEV && (
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <h4 className="font-medium text-yellow-800 mb-2">Debug Bilgileri</h4>
                      <div className="text-xs text-yellow-700 space-y-1">
                        <div>Job ID: {job.id}</div>
                        <div>Package: {selectedPackage}</div>
                        <div>User Email: {user.email}</div>
                        <div>User Name: {userInfo.name}</div>
                        <div>User Phone: {userInfo.phone}</div>
                        <div>User Address: {userInfo.address}</div>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handlePayment}
                    isLoading={processing}
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={!userInfo.name || !userInfo.phone || !userInfo.address}
                  >
                    {processing ? 'Ödeme Hazırlanıyor...' : 'Güvenli Ödeme Yap'}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    256-bit SSL ile güvenli ödeme
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}