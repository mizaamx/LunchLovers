import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../firebase/config';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  query, 
  where, 
  limit as firestoreLimit, 
  serverTimestamp 
} from 'firebase/firestore';


const MealSelectionContext = createContext(null);

export const useMealSelection = () => useContext(MealSelectionContext);

export const PLAN_LIMITS = {
  cal800_1: 5,
  cal800_2: 10,
  cal800_3: 15,
  cal600_1: 5,
  cal600_2: 10,
  cal600_3: 15,
  comida_diaria: 5,
  godinez: 5,
  basic: 5,
  normal: 10,
  pro: 15,
};

// Date validation helper: returns the Monday of the week that the selection applies to (always next week)
export function getTargetWeekMonday(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay(); // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
  
  // Calculate difference to find this week's Monday
  // If day is Sunday (0), it is -6 days from Monday. Otherwise, it is 1 - day.
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  
  // Always shift to the upcoming calendar week (next week)
  monday.setDate(monday.getDate() + 7);
  
  return monday;
}

export function getWeekId(date = new Date()) {
  const monday = getTargetWeekMonday(date);
  const yyyy = monday.getFullYear();
  const mm = String(monday.getMonth() + 1).padStart(2, '0');
  const dd = String(monday.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function isDayBlockedBy48h(weekId, dayName, currentDate = new Date()) {
  return false;
}

export const getEmptySelections = (plan) => {
  const structure = {};
  let slots = [];
  if (['cal800_1', 'cal600_1', 'comida_diaria', 'godinez', 'basic'].includes(plan)) {
    slots = ['comida'];
  } else if (['cal800_2', 'cal600_2', 'normal'].includes(plan)) {
    slots = ['comida', 'cena'];
  } else if (['cal800_3', 'cal600_3', 'pro'].includes(plan)) {
    slots = ['comida', 'cena', 'snack', 'bebida'];
  }
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
  const [isAccepted, setIsAccepted] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [withCutlery, setWithCutlery] = useState(false);
  const [shippingCost, setShippingCost] = useState(0);

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
  const isSelectionOpen = true; // Always allow entering the catalog to modify, subject to 48-hour day blocking
  const weekId = getWeekId(simulatedDate);

  const isDayBlocked = useCallback((dayName) => {
    return false;
  }, []);

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
            setIsAccepted(data.isAccepted || false);
            
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
            setIsAccepted(false);
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
            setIsAccepted(data.isAccepted || false);
            
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
            setIsAccepted(false);
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

    if (isAccepted) {
      setError('Tu selección ya ha sido confirmada y aceptada. No se puede modificar.');
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

    // Validation for plan limits (both daily and weekly)
    if (dishId) {
      const planLimit = PLAN_LIMITS[plan] || 5;
      let dailyLimit = 1;
      if (['cal800_2', 'cal600_2', 'normal'].includes(plan)) {
        dailyLimit = 2;
      } else if (['cal800_3', 'cal600_3', 'pro'].includes(plan)) {
        dailyLimit = 3;
      }

      // 1. Weekly limit validation (excluding current slot)
      let totalSelected = 0;
      Object.entries(selectedDays).forEach(([d, slotsObj]) => {
        Object.entries(slotsObj).forEach(([s, val]) => {
          if (val && !(d === day && s === slot)) {
            totalSelected++;
          }
        });
      });
      if (totalSelected >= planLimit) {
        setError(`Límite semanal alcanzado: Tu plan solo permite seleccionar hasta ${planLimit} platillos por semana.`);
        return false;
      }

      // 2. Daily limit validation (excluding current slot)
      let dailySelected = 0;
      const daySlots = selectedDays[day] || {};
      Object.entries(daySlots).forEach(([s, val]) => {
        if (val && s !== slot) {
          dailySelected++;
        }
      });
      if (dailySelected >= dailyLimit) {
        setError(`Límite diario alcanzado: Tu plan solo permite seleccionar hasta ${dailyLimit} platillos por día.`);
        return false;
      }
    }

    // Validation for limitOneOfEach (Uno de cada uno) restriction
    if (user.limitOneOfEach) {
      const targetDish = allDishes.find(d => d.id === dishId);
      if (targetDish) {
        const getNormalizedCategory = (cat) => {
          const c = (cat || '').toLowerCase();
          if (c === 'comida' || c === 'cena' || c === 'platillo' || !c) return 'platillo';
          if (c === 'snack' || c === 'snacks') return 'snack';
          if (c === 'bebida' || c === 'bebidas') return 'bebida';
          return c;
        };

        const newCat = getNormalizedCategory(targetDish.category);
        const daySlots = selectedDays[day] || {};
        const hasDuplicate = Object.entries(daySlots).some(([s, id]) => {
          if (s === slot || !id) return false;
          const otherDish = allDishes.find(d => d.id === id);
          if (!otherDish) return false;
          return getNormalizedCategory(otherDish.category) === newCat;
        });

        if (hasDuplicate) {
          const catName = newCat === 'platillo' ? 'platillo principal' : newCat === 'bebida' ? 'bebida' : 'snack';
          setError(`Límite activado: Ya tienes seleccionado un ${catName} para el día ${day}.`);
          return false;
        }
      }
    }

    setSelectedDays((prev) => {
      const updated = { ...prev };
      if (!updated[day]) updated[day] = {};
      updated[day] = { ...updated[day], [slot]: dishId };
      return updated;
    });
    setIsAccepted(false); // Mark selections dirty to require verification again
    return true;
  };

  const removeDishFromSlot = (day, slot) => {
    if (isAccepted) {
      setError('Tu selección ya ha sido confirmada y aceptada. No se puede modificar.');
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
    setIsAccepted(false); // Mark selections dirty to require verification again
  };

  const clearSelection = () => {
    setError(null);
    if (isAccepted) {
      setError('Tu selección ya ha sido confirmada y aceptada. No se puede modificar.');
      return;
    }
    setSelectedDays((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach(day => {
        const slots = Object.keys(updated[day]);
        slots.forEach(slot => {
          updated[day][slot] = null;
        });
      });
      return updated;
    });
    setIsAccepted(false); // Mark selections dirty to require verification again
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

  const saveSelection = async (acceptSelection = false) => {
    if (!user) return;
    if (user.paymentStatus === 'pending') {
      setError('Tu pago está pendiente de verificación por el administrador.');
      return;
    }
    if (isAccepted) {
      setError('Tu selección ya ha sido confirmada y aceptada. No se puede guardar de nuevo.');
      return;
    }
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
        isAccepted: acceptSelection,
        timestamp: serverTimestamp()
      });

      // 2. Sync to user profile object for backward compatibility
      await updateProfile({
        selectedDays: selectedDays,
        selectedMeals: selectedMealIds,
        withCutlery: withCutlery
      });

      // 3. Update active/pending orders in Firestore in parallel or create one if none exists
      try {
        const q = query(
          collection(db, 'orders'), 
          where('userId', '==', user.uid), 
          where('weekId', '==', weekId)
        );
        const ordersSnap = await getDocs(q);
        if (!ordersSnap.empty) {
          for (const orderDoc of ordersSnap.docs) {
            await setDoc(doc(db, 'orders', orderDoc.id), {
              selectedDays: selectedDays,
              selectedMeals: selectedMealIds,
              withCutlery: withCutlery,
              updatedAt: new Date().toISOString()
            }, { merge: true });
          }
        } else {
          // Create new order
          const newOrderData = {
            userId: user.uid,
            userName: user.name || 'Cliente',
            userEmail: user.email || 'correo@gdl.com',
            weekId: weekId,
            plan: user.plan || null,
            selectedDays: selectedDays,
            selectedMealIds: selectedMealIds, // flat list
            withCutlery: withCutlery,
            status: 'pendiente',
            createdAt: new Date().toISOString(),
            deliveryAddress: user.address || {
              street: '',
              colony: '',
              municipality: 'Guadalajara',
              zipCode: '',
              instructions: ''
            }
          };
          await addDoc(collection(db, 'orders'), newOrderData);
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
        isAccepted,
        setIsAccepted,
        isDayBlocked,
        
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
