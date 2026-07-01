import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase/config';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile as fbUpdateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Force refresh token to ensure custom claims are retrieved
          const idTokenResult = await firebaseUser.getIdTokenResult(true);
          const isAdmin = !!idTokenResult.claims.admin;

          // Fetch extra profile data from Firestore
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          let profileData = {};
          if (userDocSnap.exists()) {
            profileData = userDocSnap.data();
          }

          const userData = {
            uid: firebaseUser.uid,
            name: profileData.name || firebaseUser.displayName || firebaseUser.email.split('@')[0].toUpperCase(),
            email: firebaseUser.email,
            phone: profileData.phone || '',
            emailVerified: firebaseUser.emailVerified,
            isAdmin: isAdmin,
            role: isAdmin ? 'admin' : 'user',
            plan: profileData.plan || (isAdmin ? 'pro' : 'basic'),
            paymentStatus: profileData.paymentStatus || 'pending',
            address: profileData.address || {
              street: '',
              colony: '',
              municipality: 'Guadalajara',
              zipCode: '',
              instructions: ''
            },
            selectedMeals: profileData.selectedMeals || [],
            orderHistory: profileData.orderHistory || []
          };

          setUser(userData);
          localStorage.setItem('lunch_lovers_user', JSON.stringify(userData));
        } catch (error) {
          console.error("Error setting up user profile from Firebase:", error);
        }
      } else {
        setUser(null);
        localStorage.removeItem('lunch_lovers_user');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    // Force refresh token to get claims
    const idTokenResult = await firebaseUser.getIdTokenResult(true);
    const isAdmin = !!idTokenResult.claims.admin;

    // Load user profile from Firestore
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDocSnap = await getDoc(userDocRef);
    let profileData = {};
    if (userDocSnap.exists()) {
      profileData = userDocSnap.data();
    }

    const userData = {
      uid: firebaseUser.uid,
      name: profileData.name || firebaseUser.displayName || email.split('@')[0].toUpperCase(),
      email: email,
      phone: profileData.phone || '',
      emailVerified: firebaseUser.emailVerified,
      isAdmin: isAdmin,
      role: isAdmin ? 'admin' : 'user',
      plan: profileData.plan || (isAdmin ? 'pro' : 'basic'),
      paymentStatus: profileData.paymentStatus || 'pending',
      address: profileData.address || {
        street: '',
        colony: '',
        municipality: 'Guadalajara',
        zipCode: '',
        instructions: ''
      },
      selectedMeals: profileData.selectedMeals || [],
      orderHistory: profileData.orderHistory || []
    };

    setUser(userData);
    localStorage.setItem('lunch_lovers_user', JSON.stringify(userData));
    return userData;
  };

  const register = async (name, email, password, phone) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Enviar correo de verificación de Firebase Auth
    await sendEmailVerification(firebaseUser);

    // Update Firebase display name
    await fbUpdateProfile(firebaseUser, { displayName: name });

    const newUserDoc = {
      name: name,
      email: email,
      phone: phone || '',
      plan: 'basic',
      paymentStatus: 'pending',
      address: {
        street: '',
        colony: '',
        municipality: 'Guadalajara',
        zipCode: '',
        instructions: ''
      },
      selectedMeals: [],
      orderHistory: []
    };

    // Save profile to Firestore
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    await setDoc(userDocRef, newUserDoc);

    const userData = {
      uid: firebaseUser.uid,
      name: name,
      email: email,
      phone: phone || '',
      emailVerified: firebaseUser.emailVerified,
      isAdmin: false,
      role: 'user',
      plan: 'basic',
      paymentStatus: 'pending',
      address: newUserDoc.address,
      selectedMeals: [],
      orderHistory: []
    };

    setUser(userData);
    localStorage.setItem('lunch_lovers_user', JSON.stringify(userData));
    return userData;
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const firebaseUser = userCredential.user;

    // Force refresh token to check custom claims (admin)
    const idTokenResult = await firebaseUser.getIdTokenResult(true);
    const isAdmin = !!idTokenResult.claims.admin;

    // Load or create profile in Firestore
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDocSnap = await getDoc(userDocRef);
    let profileData = {};

    if (userDocSnap.exists()) {
      profileData = userDocSnap.data();
    } else {
      profileData = {
        name: firebaseUser.displayName || firebaseUser.email.split('@')[0].toUpperCase(),
        email: firebaseUser.email,
        phone: '',
        plan: 'basic',
        paymentStatus: 'pending',
        address: {
          street: '',
          colony: '',
          municipality: 'Guadalajara',
          zipCode: '',
          instructions: ''
        },
        selectedMeals: [],
        orderHistory: []
      };
      await setDoc(userDocRef, profileData);
    }

    const userData = {
      uid: firebaseUser.uid,
      name: profileData.name,
      email: firebaseUser.email,
      phone: profileData.phone || '',
      emailVerified: firebaseUser.emailVerified,
      isAdmin: isAdmin,
      role: isAdmin ? 'admin' : 'user',
      plan: profileData.plan || 'basic',
      paymentStatus: profileData.paymentStatus || 'pending',
      address: profileData.address || {
        street: '',
        colony: '',
        municipality: 'Guadalajara',
        zipCode: '',
        instructions: ''
      },
      selectedMeals: profileData.selectedMeals || [],
      orderHistory: profileData.orderHistory || []
    };

    setUser(userData);
    localStorage.setItem('lunch_lovers_user', JSON.stringify(userData));
    return userData;
  };

  const resendVerificationEmail = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    } else {
      throw new Error("No hay sesión de usuario activa para enviar la verificación.");
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    localStorage.removeItem('lunch_lovers_user');
  };

  const updateProfile = async (updatedData) => {
    if (!user) return;
    
    // Update Firestore
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, updatedData, { merge: true });

    // Update local state
    setUser((prev) => {
      const updatedUser = { ...prev, ...updatedData };
      localStorage.setItem('lunch_lovers_user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  const resetPassword = async (email) => {
    await sendPasswordResetEmail(auth, email);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, loginWithGoogle, resendVerificationEmail, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}
