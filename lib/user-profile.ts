export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Save user profile to localStorage
export const saveUserProfile = (profile: Partial<UserProfile>): void => {
  try {
    const existingProfile = getUserProfile();
    
    // Create a complete profile by merging existing and new data
    const updatedProfile: UserProfile = {
      name: profile.name || existingProfile?.name || '',
      email: profile.email || existingProfile?.email || '',
      phone: profile.phone || existingProfile?.phone || '',
      address: {
        street: profile.address?.street || existingProfile?.address?.street || '',
        city: profile.address?.city || existingProfile?.address?.city || '',
        postalCode: profile.address?.postalCode || existingProfile?.address?.postalCode || '',
        country: profile.address?.country || existingProfile?.address?.country || 'Germany',
      },
      updatedAt: new Date().toISOString(),
      createdAt: existingProfile?.createdAt || new Date().toISOString(),
    };
    
    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
    
    // Dispatch custom event to notify components about profile update
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('profileUpdate', { detail: { profile: updatedProfile } }));
    }
  } catch (error) {
    console.error('Error saving user profile:', error);
  }
};

// Get user profile from localStorage
export const getUserProfile = (): UserProfile | null => {
  try {
    const profile = localStorage.getItem('userProfile');
    
    if (profile) {
      const parsed = JSON.parse(profile);
      return parsed;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

// Check if user profile exists
export const hasUserProfile = (): boolean => {
  const profile = getUserProfile();
  return !!(profile?.name && profile?.email && profile?.phone && profile?.address?.street);
};

// Update profile from checkout form data
export const updateProfileFromCheckout = (formData: {
  name: string;
  email: string;
  phone: string;
  address: string;
}): void => {
  // Parse address string into structured format
  const addressParts = formData.address.split(',').map(part => part.trim());
  
  // More robust address parsing
  let street = addressParts[0] || '';
  let city = addressParts[1] || '';
  let postalCode = addressParts[2] || '';
  let country = addressParts[3] || 'Germany';
  
  // If we have fewer parts, try to extract city and postal code from the second part
  if (addressParts.length === 2) {
    const cityPostalMatch = addressParts[1].match(/^(.+?)\s+(\d{5})$/);
    if (cityPostalMatch) {
      city = cityPostalMatch[1].trim();
      postalCode = cityPostalMatch[2];
    } else {
      city = addressParts[1];
    }
  }
  
  const address = {
    street,
    city,
    postalCode,
    country,
  };

  saveUserProfile({
    name: formData.name,
    email: formData.email,
    phone: formData.phone,
    address,
  });
};

// Hook to listen for profile updates
export function useProfileUpdates(callback: (profile: UserProfile | null) => void) {
  if (typeof window === 'undefined') return;
  
  const handleProfileUpdate = (event: CustomEvent) => {
    callback(event.detail.profile);
  };

  window.addEventListener('profileUpdate', handleProfileUpdate as EventListener);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('profileUpdate', handleProfileUpdate as EventListener);
  };
} 