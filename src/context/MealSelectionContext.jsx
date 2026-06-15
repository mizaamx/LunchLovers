import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../firebase/config';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  query, 
  where, 
  limit as firestoreLimit, 
  serverTimestamp 
} from 'firebase/firestore';


const MealSelectionContext = createContext(null);

export const useMealSelection = () => useContext(MealSelectionContext);

export const PLAN_LIMITS = {
  basic: 5,
  normal: 10,
  pro: 15,
};

// Date validation helper: returns the Monday of the week that the selection applies to
export function getTargetWeekMonday(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay(); // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
  
  // Calculate difference to find this week's Monday
  // If day is Sunday (0), it is -6 days from Monday. Otherwise, it is 1 - day.
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  
  // If it's Saturday (6) or Sunday (0), selection is for the UPCOMING week
  if (day === 6 || day === 0) {
    monday.setDate(monday.getDate() + 7);
  }
  
  return monday;
}

export function getWeekId(date = new Date()) {
  const monday = getTargetWeekMonday(date);
  const yyyy = monday.getFullYear();
  const mm = String(monday.getMonth() + 1).padStart(2, '0');
  const dd = String(monday.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export const getEmptySelections = (plan) => {
  const structure = {};
  const slots = plan === 'basic' ? ['comida'] 
              : plan === 'normal' ? ['comida', 'cena'] 
              : plan === 'pro' ? ['comida', 'cena', 'snack', 'bebida'] 
              : [];
  const days = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
  days.forEach(day => {
    structure[day] = {};
    slots.forEach(slot => {
      structure[day][slot] = null;
    });
  });
  return structure;
};

export function MealSelectionProvider({ children }) {
  const { user, updateProfile } = useAuth();
  
  // Time simulation state: forced to 'real' in production
  const [simulatedMode, setSimulatedMode] = useState('real');

  const [selectedDays, setSelectedDays] = useState({
    lunes: {},
    martes: {},
    miercoles: {},
    jueves: {},
    viernes: {}
  });
  const [dishes, setDishes] = useState([]); // Dishes to show in the catalog
  const [allDishes, setAllDishes] = useState([]); // All dishes in inventory
  const [activeMenu, setActiveMenu] = useState(null); // Active WeeklyMenus doc
  const [userSelectionDoc, setUserSelectionDoc] = useState(null); // Saved selection from UserSelections
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [withCutlery, setWithCutlery] = useState(false);
  const [shippingCost, setShippingCost] = useState(30);

  // Save simulation mode to local storage when changed
  useEffect(() => {
    localStorage.setItem('meal_simulated_mode', simulatedMode);
  }, [simulatedMode]);

  // Determine current active date based on simulation mode
  const getSimulatedDate = () => {
    if (simulatedMode === 'weekend') {
      // Force Saturday noon
      return new Date('2026-06-13T12:00:00');
    }
    if (simulatedMode === 'weekday') {
      // Force Monday noon
      return new Date('2026-06-15T12:00:00');
    }
    return new Date();
  };

  const simulatedDate = getSimulatedDate();
  const dayOfWeek = simulatedDate.getDay();
  const isSelectionOpen = (dayOfWeek === 6 || dayOfWeek === 0);
  const weekId = getWeekId(simulatedDate);

  // Compute selectedMealIds as a flat list for backward compatibility
  const selectedMealIds = React.useMemo(() => {
    const ids = [];
    Object.values(selectedDays).forEach(dayObj => {
      if (dayObj) {
        Object.values(dayObj).forEach(val => {
          if (val) ids.push(val);
        });
      }
    });
    return ids;
  }, [selectedDays]);

  // Load all dishes (inventory) and filter based on weekly menu / user selections
  const loadMealSelectionData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!db) {
        console.warn('Firestore is not initialized');
        setLoading(false);
        return;
      }

      // 1. Fetch all inventory dishes
      const dishesSnap = await getDocs(collection(db, 'Dishes'));
      const dishesList = dishesSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAllDishes(dishesList);

      const plan = user?.plan || null;

      // 2. Load selection flow depending on lock status
      if (isSelectionOpen) {
        // PERIOD IS OPEN: Load active weekly menu and user's current selection
        const menuQuery = query(
          collection(db, 'WeeklyMenus'), 
          where('isActive', '==', true),
          firestoreLimit(1)
        );
        const menuSnap = await getDocs(menuQuery);
        
        if (!menuSnap.empty) {
          const menuData = menuSnap.docs[0].data();
          setActiveMenu({ id: menuSnap.docs[0].id, ...menuData });
          
          // Filter display dishes based on active weekly menu list (support day-by-day object or flat array)
          const availableData = menuData.availableDishes || [];
          let availableIds = [];
          if (Array.isArray(availableData)) {
            availableIds = availableData;
          } else if (availableData && typeof availableData === 'object') {
            availableIds = Array.from(new Set(Object.values(availableData).flat()));
          }
          const weeklyDishes = dishesList.filter(d => availableIds.includes(d.id));
          setDishes(weeklyDishes);
        } else {
          setActiveMenu(null);
          setDishes([]); // No active menu configured
        }

        // Load user's selection for this week if it exists
        if (user) {
          const selectionRef = doc(db, 'UserSelections', `${user.uid}_${weekId}`);
          const selectionSnap = await getDoc(selectionRef);
          if (selectionSnap.exists()) {
            const data = selectionSnap.data();
            setUserSelectionDoc(data);
            
            if (data.withCutlery !== undefined) {
              setWithCutlery(data.withCutlery);
            } else {
              setWithCutlery(false);
            }

            if (data.selectedDays) {
              setSelectedDays(data.selectedDays);
            } else if (data.selectedDishes) {
              // Convert old format to day slots
              const oldDishes = data.selectedDishes || [];
              const newStructure = getEmptySelections(plan);
              const slots = Object.keys(newStructure.lunes);
              const days = Object.keys(newStructure);
              let index = 0;
              for (const day of days) {
                for (const slot of slots) {
                  if (index < oldDishes.length) {
                    newStructure[day][slot] = oldDishes[index++];
                  }
                }
              }
              setSelectedDays(newStructure);
            } else {
              setSelectedDays(getEmptySelections(plan));
            }
          } else {
            setWithCutlery(false);
            // Check user profile for selectedDays or selectedMeals
            if (user.selectedDays && Object.keys(user.selectedDays).length > 0) {
              setSelectedDays(user.selectedDays);
            } else if (user.selectedMeals && user.selectedMeals.length > 0) {
              const oldDishes = user.selectedMeals || [];
              const newStructure = getEmptySelections(plan);
              const slots = Object.keys(newStructure.lunes);
              const days = Object.keys(newStructure);
              let index = 0;
              for (const day of days) {
                for (const slot of slots) {
                  if (index < oldDishes.length) {
                    newStructure[day][slot] = oldDishes[index++];
                  }
                }
              }
              setSelectedDays(newStructure);
            } else {
              setSelectedDays(getEmptySelections(plan));
            }
          }
        }
      } else {
        // PERIOD IS CLOSED: Show only what the user selected last weekend (read-only)
        if (user) {
          const selectionRef = doc(db, 'UserSelections', `${user.uid}_${weekId}`);
          const selectionSnap = await getDoc(selectionRef);
          
          if (selectionSnap.exists()) {
            const data = selectionSnap.data();
            setUserSelectionDoc(data);
            
            if (data.withCutlery !== undefined) {
              setWithCutlery(data.withCutlery);
            } else {
              setWithCutlery(false);
            }

            if (data.selectedDays) {
              setSelectedDays(data.selectedDays);
            } else {
              // Fallback
              const oldDishes = data.selectedDishes || [];
              const newStructure = getEmptySelections(plan);
              const slots = Object.keys(newStructure.lunes);
              const days = Object.keys(newStructure);
              let index = 0;
              for (const day of days) {
                for (const slot of slots) {
                  if (index < oldDishes.length) {
                    newStructure[day][slot] = oldDishes[index++];
                  }
                }
              }
              setSelectedDays(newStructure);
            }
            
            // Extract flat list for catalog filtering
            const selectedIds = [];
            const daysObj = data.selectedDays || {};
            Object.values(daysObj).forEach(dayObj => {
              if (dayObj) {
                Object.values(dayObj).forEach(val => {
                  if (val) selectedIds.push(val);
                });
              }
            });
            if (selectedIds.length === 0 && data.selectedDishes) {
              selectedIds.push(...data.selectedDishes);
            }
            
            // Client sees ONLY their selected meals
            const userDishes = dishesList.filter(d => selectedIds.includes(d.id));
            setDishes(userDishes);
          } else {
            setUserSelectionDoc(null);
            setSelectedDays(getEmptySelections(plan));
            setWithCutlery(false);
            setDishes([]); // Did not select anything
          }
        } else {
          setDishes([]);
        }
      }
    } catch (err) {
      console.error('Error loading selection data:', err);
      setError('Error al sincronizar con Firestore.');
    } finally {
      setLoading(false);
    }
  };

  // Trigger load when database, user, simulation mode, or week ID changes
  useEffect(() => {
    loadMealSelectionData();
  }, [user?.uid, simulatedMode, weekId]);

  // Determine current limit based on plan
  const plan = user?.plan || null;
  const planLimit = plan ? PLAN_LIMITS[plan] || 0 : 0;

  const assignDishToSlot = (day, slot, dishId) => {
    setError(null);

    if (!isSelectionOpen) {
      setError('El periodo de selección de menú está cerrado.');
      return false;
    }

    if (!user) {
      setError('Debes iniciar sesión para seleccionar tus platillos semanales.');
      return false;
    }

    if (!plan) {
      setError('No tienes una suscripción activa. Por favor elige uno de nuestros planes.');
      return false;
    }

    setSelectedDays((prev) => {
      const updated = { ...prev };
      if (!updated[day]) updated[day] = {};
      updated[day] = { ...updated[day], [slot]: dishId };
      return updated;
    });
    return true;
  };

  const removeDishFromSlot = (day, slot) => {
    if (!isSelectionOpen) {
      setError('El periodo de selección de menú está cerrado.');
      return;
    }
    setError(null);
    setSelectedDays((prev) => {
      const updated = { ...prev };
      if (updated[day]) {
        updated[day] = { ...updated[day], [slot]: null };
      }
      return updated;
    });
  };

  const clearSelection = () => {
    if (!isSelectionOpen) {
      setError('El periodo de selección de menú está cerrado.');
      return;
    }
    setError(null);
    setSelectedDays(getEmptySelections(plan));
  };

  const getDishesForDay = useCallback((day) => {
    if (!activeMenu) return [];
    const availableData = activeMenu.availableDishes || [];
    if (Array.isArray(availableData)) {
      return allDishes.filter(d => availableData.includes(d.id));
    } else if (availableData && typeof availableData === 'object') {
      const dayIds = availableData[day] || [];
      return allDishes.filter(d => dayIds.includes(d.id));
    }
    return [];
  }, [activeMenu, allDishes]);

  const saveSelection = async () => {
    if (!user) return;
    if (!isSelectionOpen) {
      setError('El periodo de selección de menú está cerrado.');
      return;
    }

    setIsSyncing(true);
    setSyncSuccess(false);
    setError(null);

    try {
      // 1. Save to UserSelections collection with ID userId_weekId
      const selectionRef = doc(db, 'UserSelections', `${user.uid}_${weekId}`);
      await setDoc(selectionRef, {
        userId: user.uid,
        weekId: weekId,
        selectedDays: selectedDays,
        selectedDishes: selectedMealIds, // flat list of IDs
        withCutlery: withCutlery,
        timestamp: serverTimestamp()
      });

      // 2. Sync to user profile object for backward compatibility
      await updateProfile({
        selectedDays: selectedDays,
        selectedMeals: selectedMealIds,
        withCutlery: withCutlery
      });

      // 3. Update active/pending orders in Firestore in parallel
      try {
        const q = query(
          collection(db, 'orders'), 
          where('userId', '==', user.uid), 
          where('status', 'in', ['pendiente', 'en cocina'])
        );
        const ordersSnap = await getDocs(q);
        for (const orderDoc of ordersSnap.docs) {
          await setDoc(doc(db, 'orders', orderDoc.id), {
            selectedDays: selectedDays,
            selectedMeals: selectedMealIds,
            withCutlery: withCutlery
          }, { merge: true });
        }
      } catch (errOrder) {
        console.warn('Error syncing active orders:', errOrder);
      }

      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);
      await loadMealSelectionData(); // reload
    } catch (err) {
      setError('Ocurrió un error al guardar tu selección. Intenta de nuevo.');
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <MealSelectionContext.Provider
      value={{
        selectedDays,
        selectedMealIds,
        assignDishToSlot,
        removeDishFromSlot,
        clearSelection,
        saveSelection,
        limit: planLimit,
        plan,
        error,
        setError,
        isSyncing,
        syncSuccess,
        
        // Shipping and Cutlery variables
        withCutlery,
        setWithCutlery,
        shippingCost,
        setShippingCost,
        
        // Dynamic Firestore fields
        dishes,
        allDishes,
        activeMenu,
        loading,
        loadMealSelectionData,
        getDishesForDay,
        
        // Time simulation props
        simulatedMode,
        setSimulatedMode,
        isSelectionOpen,
        weekId,
        simulatedDate
      }}
    >
      {children}
    </MealSelectionContext.Provider>
  );
}
