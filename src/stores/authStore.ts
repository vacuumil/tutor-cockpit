// src/stores/authStore.ts
import { create } from 'zustand';
import bcrypt from 'bcryptjs';

interface AuthState {
  isAuthenticated: boolean;
  passphraseHash: string | null;
  isLoading: boolean;
  
  // Actions
  initializeAuth: () => Promise<void>;
  login: (passphrase: string) => Promise<boolean>;
  logout: () => void;
  changePassphrase: (oldPassphrase: string, newPassphrase: string) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  passphraseHash: null,
  isLoading: true,

  initializeAuth: async () => {
    try {
      const savedHash = localStorage.getItem('tutor_passphrase_hash');
      const isAuth = localStorage.getItem('tutor_auth') === 'true';
      
      set({ 
        isAuthenticated: isAuth,
        passphraseHash: savedHash,
        isLoading: false 
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ isLoading: false });
    }
  },

  login: async (passphrase: string) => {
    try {
      const { passphraseHash } = get();
      
      if (!passphraseHash) {
        // First time login - create hash
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(passphrase, salt);
        
        localStorage.setItem('tutor_passphrase_hash', hash);
        localStorage.setItem('tutor_auth', 'true');
        localStorage.setItem('tutor_initialized', 'true');
        
        set({ 
          isAuthenticated: true,
          passphraseHash: hash 
        });
        
        return true;
      } else {
        // Verify existing passphrase
        const isValid = await bcrypt.compare(passphrase, passphraseHash);
        
        if (isValid) {
          localStorage.setItem('tutor_auth', 'true');
          set({ isAuthenticated: true });
          return true;
        }
        
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('tutor_auth');
    set({ isAuthenticated: false });
  },

  changePassphrase: async (oldPassphrase: string, newPassphrase: string) => {
    try {
      const { passphraseHash } = get();
      
      if (!passphraseHash) return false;
      
      const isValid = await bcrypt.compare(oldPassphrase, passphraseHash);
      
      if (!isValid) return false;
      
      const salt = await bcrypt.genSalt(10);
      const newHash = await bcrypt.hash(newPassphrase, salt);
      
      localStorage.setItem('tutor_passphrase_hash', newHash);
      set({ passphraseHash: newHash });
      
      return true;
    } catch (error) {
      console.error('Change passphrase error:', error);
      return false;
    }
  },
}));