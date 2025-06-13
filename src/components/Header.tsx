import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BriefcaseIcon, UserCircle, Settings, LogOut, Trash2, FileText, Menu, X, Search } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { DeleteAccountModal } from './DeleteAccountModal';

export function Header() {
  const { user, signOut } = useAuth();
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
    <header className="header sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
              <BriefcaseIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold text-gray-900">İş İlanları</span>
              <div className="text-xs text-gray-500">2025 Güncel Fırsatlar</div>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              to="/"
              className="px-3 py-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 font-medium"
            >
              Ana Sayfa
            </Link>
            <Link
              to="/cv-olustur"
              className="px-3 py-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 font-medium flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              CV Oluştur
            </Link>
            {user && (
              <Link
                to="/ilan-ver"
                className="btn-primary ml-2"
              >
                İlan Ver
              </Link>
            )}
          </nav>

          {/* User Menu / Auth Buttons */}
          <div className="flex items-center space-x-3">
            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
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
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Kullanıcı menüsü"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <UserCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700">
                    {user.email.split('@')[0]}
                  </span>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-strong border border-gray-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <div className="text-sm font-medium text-gray-900">{user.email}</div>
                      {isAdmin && (
                        <div className="text-xs text-blue-600 font-medium">Admin</div>
                      )}
                    </div>

                    <Link
                      to="/ilanlarim"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <BriefcaseIcon className="h-4 w-4 mr-3 text-gray-400" />
                      İlanlarım
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <Settings className="h-4 w-4 mr-3 text-gray-400" />
                        Admin Paneli
                      </Link>
                    )}

                    <Link
                      to="/hesap-ayarlari"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
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
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-3 text-gray-400" />
                      Çıkış Yap
                    </button>

                    <button
                      onClick={() => {
                        setShowDeleteModal(true);
                        setIsDropdownOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4 mr-3" />
                      Hesabı Sil
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Link
                  to="/giris"
                  className="btn-secondary"
                >
                  Giriş Yap
                </Link>
                <Link
                  to="/kayit"
                  className="btn-primary"
                >
                  Kayıt Ol
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 animate-fade-in">
            <div className="flex flex-col space-y-2">
              <Link
                to="/"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Search className="h-5 w-5 text-gray-400" />
                Ana Sayfa
              </Link>

              <Link
                to="/cv-olustur"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FileText className="h-5 w-5 text-gray-400" />
                CV Oluştur
              </Link>

              {user ? (
                <>
                  <Link
                    to="/ilan-ver"
                    className="flex items-center gap-3 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <BriefcaseIcon className="h-5 w-5" />
                    İlan Ver
                  </Link>

                  <Link
                    to="/ilanlarim"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <BriefcaseIcon className="h-5 w-5 text-gray-400" />
                    İlanlarım
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Settings className="h-5 w-5 text-gray-400" />
                      Admin Paneli
                    </Link>
                  )}

                  <Link
                    to="/hesap-ayarlari"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Settings className="h-5 w-5 text-gray-400" />
                    Hesap Ayarları
                  </Link>

                  <button
                    onClick={() => {
                      signOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors w-full text-left"
                  >
                    <LogOut className="h-5 w-5 text-gray-400" />
                    Çıkış Yap
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/giris"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <UserCircle className="h-5 w-5 text-gray-400" />
                    Giriş Yap
                  </Link>
                  <Link
                    to="/kayit"
                    className="flex items-center gap-3 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <UserCircle className="h-5 w-5" />
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