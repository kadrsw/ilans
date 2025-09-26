import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, ExternalLink, Briefcase, FileText, Shield, Users, Star, Heart, Building2, TrendingUp, MessageCircle } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t-2 border-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8">
          {/* Company Info */}
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-lg">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-red-600 to-blue-600 bg-clip-text text-transparent">İşBuldum</h2>
                <p className="text-sm text-gray-600 font-medium">Hızlı İş Bulma Platformu</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              <strong>Türkiye'nin en hızlı</strong> iş bulma platformu. <strong>Dakikada 5 yeni ilan</strong> 
              ekleniyor, <strong>50.000+</strong> aktif iş fırsatı ile işverenler ve iş arayanları güvenle buluşturuyor.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              <strong>Eleman.net</strong>, <strong>Kariyer.net</strong> ve <strong>SecretCV</strong> alternatifi olarak 
              <strong>%100 ücretsiz</strong> hizmet sunuyoruz. <strong>İstanbul</strong>, <strong>Ankara</strong>, 
              <strong>İzmir</strong> başta olmak üzere 81 ilde <strong>günlük güncellenen</strong> iş fırsatları.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-red-600" />
              Hızlı Linkler
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-sm text-gray-600 hover:text-red-600 transition-colors flex items-center gap-2 touch-target">
                  <Briefcase className="h-4 w-4" />
                  İş İlanları
                </Link>
              </li>
              <li>
                <Link to="/sirketler" className="text-sm text-gray-600 hover:text-red-600 transition-colors flex items-center gap-2 touch-target">
                  <Building2 className="h-4 w-4" />
                  Şirket Rehberi
                </Link>
              </li>
              <li>
                <Link to="/cv-olustur" className="text-sm text-gray-600 hover:text-red-600 transition-colors flex items-center gap-2 touch-target">
                  <FileText className="h-4 w-4" />
                  CV Oluştur
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-sm text-gray-600 hover:text-red-600 transition-colors flex items-center gap-2 touch-target">
                  <MessageCircle className="h-4 w-4" />
                  Blog & Rehber
                </Link>
              </li>
              <li>
                <Link to="/maas-rehberi" className="text-sm text-gray-600 hover:text-red-600 transition-colors flex items-center gap-2 touch-target">
                  <TrendingUp className="h-4 w-4" />
                  Maaş Rehberi
                </Link>
              </li>
              <li>
                <Link to="/ilan-ver" className="text-sm text-gray-600 hover:text-red-600 transition-colors flex items-center gap-2 touch-target">
                  <ExternalLink className="h-4 w-4" />
                  İlan Ver
                </Link>
              </li>
              <li>
                <Link to="/gizlilik-politikasi" className="text-sm text-gray-600 hover:text-red-600 transition-colors flex items-center gap-2 touch-target">
                  <Shield className="h-4 w-4" />
                  Gizlilik Politikası
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Cities */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-red-600" />
              Popüler Şehirler
            </h3>
            <ul className="space-y-2">
              {['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana'].map((city) => (
                <li key={city}>
                  <Link 
                    to={`/${city.toLowerCase()}-is-ilanlari`}
                    className="text-sm text-gray-600 hover:text-red-600 transition-colors touch-target block"
                  >
                    {city} İş İlanları
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Stats Section */}
        <div className="border-t border-gray-200 pt-8 mb-8">
          <h3 className="text-center text-lg font-bold text-gray-900 mb-6">Platform İstatistikleri</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-red-50 rounded-xl">
              <div className="text-2xl sm:text-3xl font-bold text-red-600">50K+</div>
              <div className="text-xs sm:text-sm text-gray-600">Aktif İlan</div>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">5/dk</div>
              <div className="text-xs sm:text-sm text-gray-600">Yeni İlan</div>
            </div>
            <div className="p-4 bg-green-50 rounded-xl">
              <div className="text-2xl sm:text-3xl font-bold text-green-600">25+</div>
              <div className="text-xs sm:text-sm text-gray-600">Sektör</div>
            </div>
            <div className="p-4 bg-purple-50 rounded-xl">
              <div className="text-2xl sm:text-3xl font-bold text-purple-600">81</div>
              <div className="text-xs sm:text-sm text-gray-600">İl Kapsamı</div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            {/* Contact Info */}
            <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-gray-600">
              <a href="mailto:bilwininc@gmail.com" className="flex items-center gap-2 hover:text-red-600 transition-colors touch-target">
                <Mail className="h-4 w-4" />
                bilwininc@gmail.com
              </a>
              <span className="hidden sm:block text-gray-300">|</span>
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Türkiye
              </span>
            </div>

            {/* Copyright */}
            <div className="text-center lg:text-right">
              <p className="text-sm text-gray-600 mb-2">
                © 2025 <strong>İşBuldum</strong> - Bilwin Inc / Kadir A. Tüm hakları saklıdır.
              </p>
              <div className="flex items-center justify-center lg:justify-end gap-4 text-xs text-gray-500">
                <Link to="/gizlilik-politikasi" className="hover:text-red-600 transition-colors touch-target">
                  Gizlilik Politikası
                </Link>
                <span>•</span>
                <Link to="/gizlilik-politikasi#kvkk" className="hover:text-red-600 transition-colors touch-target">
                  KVKK Aydınlatma
                </Link>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <div className="flex justify-center items-center gap-6 text-xs text-gray-500">
              <span className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-600" />
                SSL Güvenli
              </span>
              <span className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-600" />
                KVKK Uyumlu
              </span>
              <span className="flex items-center gap-2">
                <Star className="h-4 w-4 text-blue-600" />
                Ücretsiz Platform
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Destek ve hesap silme talepleri için: 
              <a href="mailto:bilwininc@gmail.com" className="text-red-600 hover:text-red-700 ml-1 touch-target">
                bilwininc@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}