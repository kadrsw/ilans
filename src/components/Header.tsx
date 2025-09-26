import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Menu, X, User, Settings, LogOut, Briefcase, FileText, Plus, Building2, TrendingUp, MessageCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { DeleteAccountModal } from './DeleteAccountModal';

export function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  const isAdmin = user?.role === 'admin';

  return (
    <header className="header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-lg">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-red-600 to-blue-600 bg-clip-text text-transparent">İşBuldum</span>
                <div className="text-xs text-gray-500 hidden sm:block font-medium">Hızlı İş Bulma Platformu</div>
              </div>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            <Link to="/" className="nav-link">
              <Search className="h-4 w-4" />
              İş İlanları
            </Link>
            <Link to="/sirketler" className="nav-link">
              <Building2 className="h-4 w-4" />
              Şirketler
            </Link>
            <Link to="/cv-olustur" className="nav-link">
              <FileText className="h-4 w-4" />
              CV Oluştur
            </Link>
            <Link to="/blog" className="nav-link">
              <MessageCircle className="h-4 w-4" />
              Blog
            </Link>
            <Link to="/maas-rehberi" className="nav-link">
              <TrendingUp className="h-4 w-4" />
              Maaş Rehberi
            </Link>
            {user && (
              <Link to="/ilan-ver" className="btn-primary ml-4 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl font-bold shadow-lg">
                <Plus className="h-4 w-4" />
                ÜCRETSİZ İLAN VER
              </Link>
            )}
          </nav>

          {/* User Menu / Auth Buttons */}
          <div className="flex items-center space-x-3">
            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors touch-target"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Menüyü aç/kapat"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-600" />
              ) : (
                <Menu className="h-6 w-6 text-gray-600" />
              )}
            </button>

            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors touch-target"
                  aria-label="Kullanıcı menüsü"
                >
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-red-600" />
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-700">
                    {user.email.split('@')[0]}
                  </span>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="text-sm font-medium text-gray-900 truncate">{user.email}</div>
                      {isAdmin && (
                        <div className="text-xs text-red-600 font-medium">Admin</div>
                      )}
                    </div>

                    <Link
                      to="/ilanlarim"
                      className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors touch-target"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <Briefcase className="h-4 w-4 mr-3 text-gray-400" />
                      İlanlarım
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors touch-target"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <Settings className="h-4 w-4 mr-3 text-gray-400" />
                        Admin Paneli
                      </Link>
                    )}

                    <Link
                      to="/hesap-ayarlari"
                      className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors touch-target"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <Settings className="h-4 w-4 mr-3 text-gray-400" />
                      Hesap Ayarları
                    </Link>

                    <hr className="my-2" />

                    <button
                      onClick={() => {
                        signOut();
                        setIsDropdownOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors touch-target"
                    >
                      <LogOut className="h-4 w-4 mr-3 text-gray-400" />
                      Çıkış Yap
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden lg:flex items-center space-x-3">
                <Link to="/giris" className="btn-outline">
                  Giriş Yap
                </Link>
                <Link to="/kayit" className="btn-primary">
                  Kayıt Ol
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 py-4 animate-fade-in bg-white">
            <div className="flex flex-col space-y-2">
              <Link
                to="/"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors touch-target"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Search className="h-5 w-5 text-gray-400" />
                İş İlanları
              </Link>

              <Link
                to="/cv-olustur"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors touch-target"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FileText className="h-5 w-5 text-gray-400" />
                CV Oluştur
              </Link>

              <Link
                to="/blog"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors touch-target"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <MessageCircle className="h-5 w-5 text-gray-400" />
                Blog & Rehber
              </Link>

              {user ? (
                <>
                  <Link
                    to="/ilan-ver"
                    className="flex items-center gap-3 px-4 py-3 bg-red-50 text-red-700 rounded-lg font-medium touch-target"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Plus className="h-5 w-5" />
                    İlan Ver
                  </Link>

                  <Link
                    to="/ilanlarim"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors touch-target"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Briefcase className="h-5 w-5 text-gray-400" />
                    İlanlarım
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors touch-target"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Settings className="h-5 w-5 text-gray-400" />
                      Admin Paneli
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      signOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors w-full text-left touch-target"
                  >
                    <LogOut className="h-5 w-5 text-gray-400" />
                    Çıkış Yap
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/giris"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors touch-target"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="h-5 w-5 text-gray-400" />
                    Giriş Yap
                  </Link>
                  <Link
                    to="/kayit"
                    className="flex items-center gap-3 px-4 py-3 bg-red-50 text-red-700 rounded-lg font-medium touch-target"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="h-5 w-5" />
                    Kayıt Ol
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      />
    </header>
  );
}