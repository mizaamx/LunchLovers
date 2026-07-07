import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  ShoppingBag, 
  ChevronRight, 
  LogOut, 
  Home, 
  CheckCircle2, 
  Clock, 
  Package, 
  AlertCircle,
  Utensils,
  CalendarDays,
  Plus,
  Trash2,
  Edit2,
  Save,
  Check,
  Loader2,
  Coffee,
  KeyRound
} from 'lucide-react';
import { db, auth, storage } from '../firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  getDoc, 
  setDoc, 
  addDoc, 
  deleteDoc, 
  getDocs, 
  where 
} from 'firebase/firestore';

// Fallback images for easy select
const FOOD_IMAGES = [
  { url: '/keto_salmon.webp', label: 'Salmón Keto' },
  { url: '/vegan_bowl.webp', label: 'Bowl Vegano' },
  { url: '/protein_chicken.webp', label: 'Pollo Fitness' },
  { url: '/keto_vegan_salad.webp', label: 'Ensalada Tofu' }
];

const mockUsers = [
  { id: 'usr-1', name: 'SOFÍA RAMÍREZ', email: 'sofia.gdl@gmail.com', phone: '3312457890', plan: 'normal', status: 'active', paymentStatus: 'paid', createdAt: '2026-05-10' },
  { id: 'usr-2', name: 'MATEO HERNÁNDEZ', email: 'mateo.fit@outlook.com', phone: '3345678901', plan: 'pro', status: 'active', paymentStatus: 'pending', createdAt: '2026-05-12' },
  { id: 'usr-3', name: 'VALERIA FLORES', email: 'vale.vegan@gmail.com', phone: '3356789012', plan: 'basic', status: 'active', paymentStatus: 'paid', createdAt: '2026-05-15' },
];

const mockOrders = [
  { 
    id: 'LL-5283', 
    userName: 'SOFÍA RAMÍREZ', 
    userEmail: 'sofia.gdl@gmail.com', 
    mealIds: ['dish-1', 'dish-3'],
    address: 'Av. Chapultepec 450, Col. Americana, Guadalajara (44160).', 
    deliveryDate: 'Lunes 08/06/2026', 
    status: 'en cocina', 
    total: 890 
  }
];

const getPlanCalories = (plan) => {
  if (!plan) return 'Sin Plan';
  const planLower = plan.toLowerCase();
  if (planLower.includes('600')) return 'Light Lovers';
  if (planLower.includes('800')) return 'Hearty Lovers';
  if (planLower === 'godinez') return 'Paquete Godínez';
  if (planLower === 'comida_diaria') return 'Comida Diaria';
  if (['basic', 'normal', 'pro'].includes(planLower)) return 'Legacy';
  return plan;
};

export default function AdminDashboard({ setCurrentPage, setActiveSection }) {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'users', 'dishes', 'weeklyMenu'
  
  // Data lists
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [userSelections, setUserSelections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  // Custom modal for dish/order/user delete confirmation
  const [dishToDelete, setDishToDelete] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [selectedOrderForMealsModal, setSelectedOrderForMealsModal] = useState(null);

  // Password change modal state
  const [userForPasswordChange, setUserForPasswordChange] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Edit client modal state
  const [clientToEdit, setClientToEdit] = useState(null);
  const [editClientName, setEditClientName] = useState('');
  const [editClientPhone, setEditClientPhone] = useState('');
  const [isSavingClientDetails, setIsSavingClientDetails] = useState(false);

  // Dish form state
  const [showDishForm, setShowDishForm] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  const [dishName, setDishName] = useState('');
  const [dishDescription, setDishDescription] = useState('');
  const [calories, setCalories] = useState(350);
  const [protein, setProtein] = useState(20);
  const [fat, setFat] = useState(10);
  const [carbs, setCarbs] = useState(30);
  const [imageUrl, setImageUrl] = useState('/keto_salmon.webp');
  const [category, setCategory] = useState('platillo'); // 'platillo', 'snack', 'bebida'
  const [isSavingDish, setIsSavingDish] = useState(false);
  const [imageSource, setImageSource] = useState('preset'); // 'preset' or 'upload'
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // States for new administrator registration
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [isSavingAdmin, setIsSavingAdmin] = useState(false);

  // Weekly Menu configuration state
  const [selectedWeekId, setSelectedWeekId] = useState('');
  const [weeklyMenuByDay, setWeeklyMenuByDay] = useState({
    lunes: [],
    martes: [],
    miercoles: [],
    jueves: [],
    viernes: []
  });
  const [activeWeeklyMenuDay, setActiveWeeklyMenuDay] = useState('lunes');
  const [menuIsActive, setMenuIsActive] = useState(false);
  const [isSavingMenu, setIsSavingMenu] = useState(false);

  // Load next 4 Mondays for Weekly Menu setup dropdown
  const upcomingMondays = React.useMemo(() => {
    const list = [];
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    monday.setHours(0,0,0,0);
    
    for (let i = 0; i < 4; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i * 7);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      list.push(`${yyyy}-${mm}-${dd}`);
    }
    return list;
  }, []);

  // Initialize selected week to the first Monday
  useEffect(() => {
    if (upcomingMondays.length > 0 && !selectedWeekId) {
      setSelectedWeekId(upcomingMondays[0]);
    }
  }, [upcomingMondays, selectedWeekId]);

  // Load orders, users and dishes from Firestore
  useEffect(() => {
    let unsubscribeOrders = () => {};
    let unsubscribeUsers = () => {};
    let unsubscribeDishes = () => {};
    let unsubscribeSelections = () => {};

    const setupListeners = async () => {
      setLoading(true);
      if (db) {
        try {
          // 1. Listen to Orders
          const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
          unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
            const list = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              userName: doc.data().userName || doc.data().name || 'Cliente',
              userEmail: doc.data().userEmail || doc.data().email || 'correo@gdl.com',
              mealIds: doc.data().selectedMealIds || doc.data().mealIds || doc.data().selectedMeals || [],
              address: doc.data().deliveryAddress 
                ? `${doc.data().deliveryAddress.street}, ${doc.data().deliveryAddress.colony}, ${doc.data().deliveryAddress.municipality} (${doc.data().deliveryAddress.zipCode}). ${doc.data().deliveryAddress.instructions}` 
                : doc.data().address || 'Sin dirección',
              deliveryDate: doc.data().deliveryDate?.toDate 
                ? doc.data().deliveryDate.toDate().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'numeric' })
                : 'Lunes programado',
            }));
            setOrders(db ? list : (list.length > 0 ? list : mockOrders));
            setLoading(false);
          }, (err) => {
            console.error('Error fetching orders:', err);
            setOrders(db ? [] : mockOrders);
            setLoading(false);
          });

          // 2. Listen to Users
          const usersQuery = query(collection(db, 'users'));
          unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
            const list = snapshot.docs.map(doc => ({
              id: doc.id,
              name: doc.data().name || 'Cliente',
              email: doc.data().email || 'correo@gdl.com',
              phone: doc.data().phone || 'Sin teléfono',
              address: doc.data().address || null,
              plan: doc.data().plan || null,
              status: doc.data().status || 'active',
              paymentStatus: doc.data().paymentStatus || 'pending',
              createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate().toISOString().split('T')[0] : (doc.data().createdAt || '2026-05-01'),
              role: doc.data().role || 'user',
              isAdmin: doc.data().isAdmin || false,
              limitOneOfEach: doc.data().limitOneOfEach || false,
            }));
            setUsers(db ? list : (list.length > 0 ? list : mockUsers));
          }, (err) => {
            console.error('Error fetching users:', err);
            setUsers(db ? [] : mockUsers);
          });

          // 2.5. Listen to UserSelections
          const selectionsQuery = query(collection(db, 'UserSelections'));
          unsubscribeSelections = onSnapshot(selectionsQuery, (snapshot) => {
            const list = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            setUserSelections(list);
          }, (err) => {
            console.error('Error fetching selections:', err);
          });

          // 3. Listen to Dishes
          const dishesQuery = query(collection(db, 'Dishes'));
          unsubscribeDishes = onSnapshot(dishesQuery, (snapshot) => {
            const list = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            setDishes(list);
          }, (err) => {
            console.error('Error fetching dishes:', err);
          });

        } catch (err) {
          console.warn('Firestore initialization failed:', err);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    setupListeners();

    return () => {
      unsubscribeOrders();
      unsubscribeUsers();
      unsubscribeDishes();
      unsubscribeSelections();
    };
  }, []);

  // Dynamically load Weekly Menu configuration when selected week changes
  useEffect(() => {
    const loadWeeklyMenu = async () => {
      if (!db || !selectedWeekId) return;
      try {
        const menuSnap = await getDocs(query(collection(db, 'WeeklyMenus'), where('__name__', '==', selectedWeekId)));
        if (!menuSnap.empty) {
          const menuData = menuSnap.docs[0].data();
          const rawAvailable = menuData.availableDishes || [];
          if (Array.isArray(rawAvailable)) {
            setWeeklyMenuByDay({
              lunes: rawAvailable,
              martes: rawAvailable,
              miercoles: rawAvailable,
              jueves: rawAvailable,
              viernes: rawAvailable
            });
          } else if (rawAvailable && typeof rawAvailable === 'object') {
            setWeeklyMenuByDay({
              lunes: rawAvailable.lunes || [],
              martes: rawAvailable.martes || [],
              miercoles: rawAvailable.miercoles || [],
              jueves: rawAvailable.jueves || [],
              viernes: rawAvailable.viernes || []
            });
          } else {
            setWeeklyMenuByDay({
              lunes: [],
              martes: [],
              miercoles: [],
              jueves: [],
              viernes: []
            });
          }
          setMenuIsActive(menuData.isActive || false);
        } else {
          setWeeklyMenuByDay({
            lunes: [],
            martes: [],
            miercoles: [],
            jueves: [],
            viernes: []
          });
          setMenuIsActive(false);
        }
      } catch (err) {
        console.error('Error loading weekly menu:', err);
      }
    };

    loadWeeklyMenu();
  }, [selectedWeekId]);

  // Handle order status updates
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      if (db) {
        const displayOrder = displayOrders.find(o => o.id === orderId);
        const orderRef = doc(db, 'orders', orderId);
        const orderSnap = await getDoc(orderRef);
        
        if (!orderSnap.exists() && displayOrder && displayOrder.isSelectionOrder) {
          await setDoc(orderRef, {
            userId: displayOrder.userId,
            userName: displayOrder.userName,
            userEmail: displayOrder.userEmail,
            weekId: displayOrder.weekId,
            plan: displayOrder.plan || null,
            selectedDays: displayOrder.selectedDays,
            selectedMealIds: displayOrder.mealIds,
            status: newStatus,
            createdAt: new Date().toISOString(),
            deliveryAddress: {
              street: displayOrder.rawAddress?.street || '',
              colony: displayOrder.rawAddress?.colony || '',
              municipality: displayOrder.rawAddress?.municipality || 'Guadalajara',
              zipCode: displayOrder.rawAddress?.zipCode || '',
              instructions: displayOrder.rawAddress?.instructions || ''
            }
          });
        } else {
          await setDoc(orderRef, { status: newStatus }, { merge: true });
        }
        showSuccess('Estatus del pedido actualizado.');
      } else {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      }
    } catch (err) {
      console.error(err);
      showError('Error al actualizar estatus.');
    }
  };

  // Helper messages
  const showError = (msg) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(null), 4000);
  };

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // CRUD Actions for Dishes
  const handleOpenDishForm = (dish = null) => {
    setImageFile(null);
    setImagePreview('');
    if (dish) {
      setEditingDish(dish);
      setDishName(dish.name);
      setDishDescription(dish.description || '');
      setCalories(dish.macros?.calories || 350);
      setProtein(dish.macros?.protein || 20);
      setFat(dish.macros?.fat || 10);
      setCarbs(dish.macros?.carbs || 30);
      setImageUrl(dish.imageUrl || '/keto_salmon.webp');
      setCategory(dish.category || 'platillo');
      
      const isPreset = FOOD_IMAGES.some(img => img.url === dish.imageUrl);
      setImageSource(isPreset ? 'preset' : 'upload');
      if (!isPreset) {
        setImagePreview(dish.imageUrl);
      }
    } else {
      setEditingDish(null);
      setDishName('');
      setDishDescription('');
      setCalories(350);
      setProtein(20);
      setFat(10);
      setCarbs(30);
      setImageUrl('/keto_salmon.webp');
      setCategory('platillo');
      setImageSource('preset');
    }
    setShowDishForm(true);
  };

  const handleSaveDish = async (e) => {
    e.preventDefault();
    if (!dishName.trim()) {
      showError('El nombre del platillo es requerido.');
      return;
    }

    setIsSavingDish(true);
    let finalImageUrl = imageUrl;

    try {
      if (imageSource === 'upload') {
        if (imageFile) {
          const fileRef = ref(storage, `dishes/${Date.now()}_${imageFile.name}`);
          const snapshot = await uploadBytes(fileRef, imageFile);
          finalImageUrl = await getDownloadURL(snapshot.ref);
        } else if (editingDish) {
          finalImageUrl = editingDish.imageUrl;
        } else {
          showError('Por favor selecciona una imagen de tu equipo para subir.');
          setIsSavingDish(false);
          return;
        }
      }

      const dishData = {
        name: dishName,
        description: dishDescription,
        imageUrl: finalImageUrl,
        category,
        macros: {
          calories: Number(calories),
          protein: Number(protein),
          fat: Number(fat),
          carbs: Number(carbs)
        }
      };

      if (db) {
        if (editingDish) {
          await setDoc(doc(db, 'Dishes', editingDish.id), dishData, { merge: true });
          showSuccess('Platillo actualizado exitosamente.');
        } else {
          await addDoc(collection(db, 'Dishes'), dishData);
          showSuccess('Platillo creado exitosamente.');
        }
      }
      setImageFile(null);
      setImagePreview('');
      setShowDishForm(false);
    } catch (err) {
      console.error(err);
      showError('Error al guardar el platillo y subir la imagen.');
    } finally {
      setIsSavingDish(false);
    }
  };

  const confirmDeleteDish = async () => {
    if (!dishToDelete) return;
    try {
      await deleteDoc(doc(db, 'Dishes', dishToDelete.id));
      showSuccess(`Platillo "${dishToDelete.name}" eliminado con éxito.`);
    } catch (err) {
      console.error(err);
      showError('Error al eliminar platillo.');
    } finally {
      setDishToDelete(null);
    }
  };

  // Prepopulate Firestore with default seed dishes
  const handleSeedData = async () => {
    if (!db) return;
    setLoading(true);
    try {
      const defaultSeedDishes = [
        {
          name: 'Amanida de Saumon avec Avocat',
          description: 'Salmón premium a la plancha servido con espinacas frescas y láminas de aguacate con aderezo cítrico.',
          macros: { calories: 420, protein: 38, carbs: 8, fat: 24 },
          imageUrl: '/keto_salmon.webp'
        },
        {
          name: 'Buddha Bowl de Quinoa avec Edamame',
          description: 'Mezcla nutritiva de garbanzos, camote asado, edamames, col morada y aguacate sobre una base de quinoa.',
          macros: { calories: 380, protein: 16, carbs: 52, fat: 12 },
          imageUrl: '/vegan_bowl.webp'
        },
        {
          name: 'Salată de Pui et Quinoa Fitness',
          description: 'Pechuga de pollo a la parrilla marinada en finas hierbas con brócoli al vapor y arroz de quinoa integral.',
          macros: { calories: 410, protein: 45, carbs: 35, fat: 8 },
          imageUrl: '/protein_chicken.webp'
        },
        {
          name: 'Ensalada de Tofu Crujiente avec Végétaux',
          description: 'Tofu extra firme en cubos con aguacate fresco, espinacas tiernas y semillas de calabaza tostadas.',
          macros: { calories: 310, protein: 18, carbs: 10, fat: 22 },
          imageUrl: '/keto_vegan_salad.webp'
        },
        {
          name: 'Saumon Glacé Oriental Style Keto',
          description: 'Lomo de salmón fresco con costra de ajonjolí y verduras asadas al wok bajas en carbohidratos.',
          macros: { calories: 395, protein: 35, carbs: 11, fat: 21 },
          imageUrl: '/keto_salmon.webp'
        },
        {
          name: 'Curry de Poids Chiches et Quinoa Fit',
          description: 'Garbanzos y vegetales de temporada salteados en curry de coco y jengibre, enriquecidos con proteína vegetal.',
          macros: { calories: 440, protein: 22, carbs: 48, fat: 14 },
          imageUrl: '/vegan_bowl.webp'
        }
      ];

      for (const dish of defaultSeedDishes) {
        await addDoc(collection(db, 'Dishes'), dish);
      }
      showSuccess('Platillos de demostración sembrados exitosamente.');
    } catch (err) {
      console.error(err);
      showError('Error al sembrar platillos.');
    } finally {
      setLoading(false);
    }
  };

  // Weekly Menu Configurations Actions
  const handleToggleWeeklyDish = (dishId) => {
    setWeeklyMenuByDay(prev => {
      const dayDishes = prev[activeWeeklyMenuDay] || [];
      const updatedDayDishes = dayDishes.includes(dishId)
        ? dayDishes.filter(id => id !== dishId)
        : [...dayDishes, dishId];
      return {
        ...prev,
        [activeWeeklyMenuDay]: updatedDayDishes
      };
    });
  };

  const handleSaveWeeklyMenu = async () => {
    if (!selectedWeekId) return;
    setIsSavingMenu(true);
    try {
      await setDoc(doc(db, 'WeeklyMenus', selectedWeekId), {
        availableDishes: weeklyMenuByDay,
        isActive: menuIsActive
      }, { merge: true });
      showSuccess(`Menú semanal para la semana del ${selectedWeekId} guardado exitosamente.`);
    } catch (err) {
      showError('Error al guardar el menú semanal.');
      console.error(err);
    } finally {
      setIsSavingMenu(false);
    }
  };

  const handleSetMenuAsActive = async () => {
    if (!selectedWeekId) return;
    setIsSavingMenu(true);
    try {
      // 1. Query all active weekly menus and set them to inactive
      const activeQuery = query(collection(db, 'WeeklyMenus'), where('isActive', '==', true));
      const activeSnap = await getDocs(activeQuery);
      
      for (const menuDoc of activeSnap.docs) {
        await setDoc(doc(db, 'WeeklyMenus', menuDoc.id), { isActive: false }, { merge: true });
      }

      // 2. Set the selected menu as active
      await setDoc(doc(db, 'WeeklyMenus', selectedWeekId), {
        availableDishes: weeklyMenuByDay,
        isActive: true
      }, { merge: true });

      setMenuIsActive(true);
      showSuccess(`¡Menú de la semana del ${selectedWeekId} establecido como el MENÚ ACTIVO del sistema!`);
    } catch (err) {
      showError('Error al activar el menú semanal.');
      console.error(err);
    } finally {
      setIsSavingMenu(false);
    }
  };

  const handleDeactivateMenu = async () => {
    if (!selectedWeekId) return;
    setIsSavingMenu(true);
    try {
      await setDoc(doc(db, 'WeeklyMenus', selectedWeekId), {
        isActive: false
      }, { merge: true });
      setMenuIsActive(false);
      showSuccess(`El menú de la semana del ${selectedWeekId} ha sido desactivado y guardado como Borrador.`);
    } catch (err) {
      showError('Error al desactivar el menú semanal.');
      console.error(err);
    } finally {
      setIsSavingMenu(false);
    }
  };

  const handleTogglePaymentStatus = async (client) => {
    const newStatus = client.paymentStatus === 'paid' ? 'pending' : 'paid';
    try {
      if (db) {
        const userRef = doc(db, 'users', client.id);
        const updates = { paymentStatus: newStatus };
        if (newStatus === 'paid') {
          updates.status = 'active';
        }
        await setDoc(userRef, updates, { merge: true });
        showSuccess(`Estatus de pago de ${client.name} actualizado a "${newStatus === 'paid' ? 'Pagado' : 'Pendiente'}"${newStatus === 'paid' ? ' y activado en el sistema.' : ''}`);
      } else {
        setUsers(prev => prev.map(u => u.id === client.id ? { ...u, paymentStatus: newStatus, status: newStatus === 'paid' ? 'active' : u.status } : u));
      }
    } catch (err) {
      console.error(err);
      showError('Error al actualizar estatus de pago.');
    }
  };

  const handlePlanChange = async (client, newPlan) => {
    try {
      const planValue = newPlan || null;
      if (db) {
        const userRef = doc(db, 'users', client.id);
        await setDoc(userRef, { plan: planValue }, { merge: true });
        showSuccess(`Plan de ${client.name} actualizado a "${planValue ? 'Plan ' + planValue.toUpperCase() : 'Sin Suscripción'}"`);
      } else {
        setUsers(prev => prev.map(u => u.id === client.id ? { ...u, plan: planValue } : u));
        showSuccess(`Plan de ${client.name} actualizado en el simulador.`);
      }
    } catch (err) {
      console.error(err);
      showError('Error al actualizar el plan del cliente.');
    }
  };

  const handleToggleLimitOneOfEach = async (client) => {
    try {
      const newValue = !client.limitOneOfEach;
      if (db) {
        const userRef = doc(db, 'users', client.id);
        await setDoc(userRef, { limitOneOfEach: newValue }, { merge: true });
        showSuccess(`Restricción '1 de c/u' para ${client.name} actualizada.`);
      } else {
        setUsers(prev => prev.map(u => u.id === client.id ? { ...u, limitOneOfEach: newValue } : u));
        showSuccess(`Restricción actualizada en el simulador.`);
      }
    } catch (err) {
      console.error(err);
      showError('Error al actualizar la restricción del cliente.');
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setIsSavingAdmin(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Sesión de administrador no encontrada.');
      }
      const token = await currentUser.getIdToken(true);

      const response = await fetch('/api/crearNuevoAdmin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newAdminName,
          email: newAdminEmail,
          password: newAdminPassword
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'No se pudo crear el administrador.');
      }

      showSuccess(`¡Administrador ${newAdminEmail} registrado con éxito!`);
      setNewAdminName('');
      setNewAdminEmail('');
      setNewAdminPassword('');
    } catch (err) {
      console.error(err);
      showError(err.message || 'Error al registrar al administrador.');
    } finally {
      setIsSavingAdmin(false);
    }
  };

  const handleSubscriptionStatusChange = async (client, newStatus) => {
    try {
      if (db) {
        const userRef = doc(db, 'users', client.id);
        await setDoc(userRef, { status: newStatus }, { merge: true });
        showSuccess(`Estatus de suscripción de ${client.name} actualizado a "${newStatus === 'active' ? 'Activo' : newStatus === 'paused' ? 'Pausado' : 'Cancelado'}"`);
      } else {
        setUsers(prev => prev.map(u => u.id === client.id ? { ...u, status: newStatus } : u));
        showSuccess(`Estatus de ${client.name} actualizado en el simulador.`);
      }
    } catch (err) {
      console.error(err);
      showError('Error al actualizar el estatus de suscripción del cliente.');
    }
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      if (db) {
        await deleteDoc(doc(db, 'users', userToDelete.id));
        showSuccess(`Cliente "${userToDelete.name}" eliminado con éxito.`);
      } else {
        setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
        showSuccess(`Cliente "${userToDelete.name}" eliminado del simulador.`);
      }
    } catch (err) {
      console.error(err);
      showError('Error al eliminar cliente de la base de datos.');
    } finally {
      setUserToDelete(null);
    }
  };

  // Delete an order from Firestore
  const confirmDeleteOrder = async () => {
    if (!orderToDelete) return;
    try {
      if (db) {
        await deleteDoc(doc(db, 'orders', orderToDelete.id));
        if (orderToDelete.isSelectionOrder && orderToDelete.selectionDocId) {
          await deleteDoc(doc(db, 'UserSelections', orderToDelete.selectionDocId));
        }
        showSuccess(`Orden #${orderToDelete.orderNumber} eliminada exitosamente.`);
      } else {
        setOrders(prev => prev.filter(o => o.id !== orderToDelete.id));
        showSuccess(`Pedido eliminado del simulador.`);
      }
    } catch (err) {
      console.error(err);
      showError('Error al eliminar el pedido.');
    } finally {
      setOrderToDelete(null);
    }
  };

  // Change any user's password via secure backend endpoint
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!userForPasswordChange || !newPassword) return;
    if (newPassword.length < 6) {
      showError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setIsChangingPassword(true);
    try {
      const currentUser = auth.currentUser;
      const token = await currentUser.getIdToken(true);
      const response = await fetch('/api/cambiarContrasenaUsuario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ uid: userForPasswordChange.id, newPassword })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error al cambiar contraseña.');
      showSuccess(`Contraseña de ${userForPasswordChange.name} actualizada correctamente.`);
      setUserForPasswordChange(null);
      setNewPassword('');
    } catch (err) {
      console.error(err);
      showError(err.message || 'Error al cambiar la contraseña.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSaveClientDetails = async (e) => {
    e.preventDefault();
    if (!clientToEdit || !editClientName.trim()) return;
    setIsSavingClientDetails(true);
    try {
      if (db) {
        await setDoc(doc(db, 'users', clientToEdit.id), { 
          name: editClientName, 
          phone: editClientPhone 
        }, { merge: true });
        showSuccess(`Datos de ${editClientName} actualizados con éxito.`);
      } else {
        setUsers(prev => prev.map(u => u.id === clientToEdit.id ? { ...u, name: editClientName, phone: editClientPhone } : u));
        showSuccess(`Datos de ${editClientName} actualizados en el simulador.`);
      }
      setClientToEdit(null);
    } catch (err) {
      console.error(err);
      showError('Error al actualizar los datos del cliente.');
    } finally {
      setIsSavingClientDetails(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setCurrentPage('landing');
    setActiveSection('inicio');
  };

  // Mapping dishes to ID for easy rendering in the Orders section
  const dishesMap = React.useMemo(() => {
    const map = {};
    dishes.forEach(d => {
      map[d.id] = { name: d.name, image: d.imageUrl };
    });
    return map;
  }, [dishes]);

  // Compute combined orders and selections in real-time
  const displayOrders = React.useMemo(() => {
    const usersMap = {};
    users.forEach(u => {
      usersMap[u.id] = u;
    });

    const list = [];
    const processedSelectionKeys = new Set();

    // 1. Process all UserSelections as weekly orders
    userSelections.forEach(sel => {
      const selUser = usersMap[sel.userId];
      const userName = selUser?.name || 'Cliente';
      const userEmail = selUser?.email || 'correo@gdl.com';
      
      let addressStr = 'Sin dirección';
      if (selUser?.address) {
        const addr = selUser.address;
        addressStr = `${addr.street || ''}, ${addr.colony || ''}, ${addr.municipality || 'Guadalajara'} (${addr.zipCode || ''}). ${addr.instructions || ''}`;
      } else if (sel.deliveryAddress) {
        const addr = sel.deliveryAddress;
        addressStr = `${addr.street || ''}, ${addr.colony || ''}, ${addr.municipality || 'Guadalajara'} (${addr.zipCode || ''}). ${addr.instructions || ''}`;
      }

      // Find if there is an order document in the orders collection for this user and week
      const matchingOrder = orders.find(o => o.userId === sel.userId && o.weekId === sel.weekId);
      const status = matchingOrder ? matchingOrder.status : 'pendiente';
      const orderId = matchingOrder ? matchingOrder.id : sel.id;

      if (matchingOrder) {
        processedSelectionKeys.add(matchingOrder.id);
      }

      list.push({
        id: orderId,
        isSelectionOrder: true,
        selectionDocId: sel.id,
        userId: sel.userId,
        weekId: sel.weekId,
        userName,
        userEmail,
        userPhone: selUser?.phone || sel.phone || 'Sin teléfono',
        plan: matchingOrder?.plan || selUser?.plan || null,
        selectedDays: sel.selectedDays || {},
        mealIds: sel.selectedDishes || [],
        address: addressStr,
        rawAddress: selUser?.address || sel.deliveryAddress || null,
        status: status,
        createdAt: sel.timestamp?.toDate ? sel.timestamp.toDate().toISOString() : new Date().toISOString()
      });
    });

    // 2. Process remaining orders (like new subscription orders without weekly selections)
    orders.forEach(order => {
      if (processedSelectionKeys.has(order.id)) return;
      
      if (order.weekId && list.some(l => l.userId === order.userId && l.weekId === order.weekId)) {
        return;
      }

      list.push({
        id: order.id,
        isSelectionOrder: false,
        userId: order.userId,
        weekId: order.weekId || null,
        userName: order.userName || order.clientName || 'Cliente',
        userEmail: order.userEmail || order.clientEmail || 'correo@gdl.com',
        userPhone: usersMap[order.userId]?.phone || order.phone || 'Sin teléfono',
        plan: order.plan || usersMap[order.userId]?.plan || null,
        selectedDays: order.selectedDays || {},
        mealIds: order.selectedMealIds || order.mealIds || order.selectedMeals || [],
        address: order.address || 'Sin dirección',
        status: order.status || 'pendiente',
        createdAt: order.createdAt
      });
    });

    // Sort by createdAt ascending (oldest first)
    const sorted = list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    return sorted.map((order, index) => ({
      ...order,
      orderNumber: index + 1
    }));
  }, [orders, userSelections, users]);

  // Badge calculations
  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pendiente').length,
    kitchenOrders: orders.filter(o => o.status === 'en cocina').length,
    totalUsers: users.length,
    activeDishes: dishes.length,
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-64 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col p-6 flex-shrink-0 text-left">
        <div className="flex items-center space-x-3 pb-6 border-b border-slate-800 mb-8">
          <div className="w-8 h-8 rounded-lg bg-retro-terracota flex items-center justify-center font-black text-white text-sm">
            LL
          </div>
          <div>
            <h1 className="text-sm font-black tracking-wider uppercase text-retro-crema">Lunch Lovers</h1>
            <span className="text-[10px] font-black text-retro-mostaza uppercase tracking-widest font-sans">Panel de Control</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="space-y-1.5 flex-grow">
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === 'orders'
                ? 'bg-retro-terracota text-white shadow-md shadow-retro-terracota/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <ShoppingBag className="w-4 h-4" />
              <span>Pedidos de Clientes</span>
            </div>
            <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${activeTab === 'orders' ? 'rotate-90' : ''}`} />
          </button>

          <button
            onClick={() => setActiveTab('dishes')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === 'dishes'
                ? 'bg-retro-terracota text-white shadow-md shadow-retro-terracota/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Utensils className="w-4 h-4" />
              <span>Inventario de Platillos</span>
            </div>
            <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${activeTab === 'dishes' ? 'rotate-90' : ''}`} />
          </button>

          <button
            onClick={() => setActiveTab('weeklyMenu')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === 'weeklyMenu'
                ? 'bg-retro-terracota text-white shadow-md shadow-retro-terracota/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <CalendarDays className="w-4 h-4" />
              <span>Menú Semanal</span>
            </div>
            <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${activeTab === 'weeklyMenu' ? 'rotate-90' : ''}`} />
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === 'users'
                ? 'bg-retro-terracota text-white shadow-md shadow-retro-terracota/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Users className="w-4 h-4" />
              <span>Clientes Registrados</span>
            </div>
            <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${activeTab === 'users' ? 'rotate-90' : ''}`} />
          </button>

          <button
            onClick={() => setActiveTab('admins')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === 'admins'
                ? 'bg-retro-terracota text-white shadow-md shadow-retro-terracota/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Users className="w-4 h-4 text-retro-mostaza" />
              <span>Administradores</span>
            </div>
            <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${activeTab === 'admins' ? 'rotate-90' : ''}`} />
          </button>
        </nav>

        {/* Sidebar Footer Actions */}
        <div className="pt-6 border-t border-slate-800 space-y-2 mt-auto">
          <button
            onClick={() => {
              setCurrentPage('landing');
              setActiveSection('inicio');
            }}
            className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
          >
            <Home className="w-4 h-4 text-retro-crema/60" />
            <span>Ir al Sitio Público</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-950/20 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WORKSPACE */}
      <main className="flex-grow p-6 sm:p-8 overflow-y-auto text-left">
        
        {/* Workspace Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-800">
          <div>
            <h2 className="text-2xl font-black text-retro-crema tracking-tight font-sans">
              {activeTab === 'orders' && 'Panel de Pedidos'}
              {activeTab === 'users' && 'Directorio de Clientes'}
              {activeTab === 'dishes' && 'Inventario de Platillos'}
              {activeTab === 'weeklyMenu' && 'Configuración de Menú Semanal'}
              {activeTab === 'admins' && 'Administradores del Sistema'}
            </h2>
            <p className="text-slate-400 text-xs mt-1">
              {activeTab === 'orders' && 'Monitorea las entregas activas de la Zona Metropolitana de Guadalajara y actualiza sus estados.'}
              {activeTab === 'users' && 'Directorio completo de usuarios registrados y sus planes activos.'}
              {activeTab === 'dishes' && 'Crea, edita o elimina los platillos y especifica el desglose de macronutrientes.'}
              {activeTab === 'weeklyMenu' && 'Arma el menú de platillos disponibles para las próximas semanas de entrega.'}
              {activeTab === 'admins' && 'Crea y gestiona las cuentas de los administradores que tienen acceso total al sistema.'}
            </p>
          </div>
          
          <div className="text-[10px] font-black uppercase tracking-wider bg-slate-900 border border-slate-800 text-retro-mostaza px-3.5 py-1.5 rounded-full flex items-center space-x-1.5 self-start sm:self-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-retro-mostaza animate-pulse" />
            <span>Entorno: {db ? 'Firestore Online' : 'Simulador Local (Demo)'}</span>
          </div>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-950/50 border border-red-800 rounded-2xl text-xs font-bold text-red-200 flex items-center space-x-2.5 animate-bounce">
            <AlertCircle className="w-4.5 h-4.5 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success notification */}
        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-950/50 border border-emerald-800 rounded-2xl text-xs font-bold text-emerald-200 flex items-center space-x-2.5 animate-pulse">
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* STATS ROW */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900/50 border border-slate-800/80 p-5 rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Pedidos</span>
              <Package className="w-4.5 h-4.5 text-retro-crema/60" />
            </div>
            <p className="text-2xl font-black text-slate-100 mt-2 font-sans">{stats.totalOrders}</p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/80 p-5 rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pendientes</span>
              <Clock className="w-4.5 h-4.5 text-retro-mostaza" />
            </div>
            <p className="text-2xl font-black text-slate-100 mt-2 font-sans">{stats.pendingOrders}</p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/80 p-5 rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Platillos</span>
              <Utensils className="w-4.5 h-4.5 text-retro-terracota" />
            </div>
            <p className="text-2xl font-black text-slate-100 mt-2 font-sans">{stats.activeDishes}</p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/80 p-5 rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clientes</span>
              <Users className="w-4.5 h-4.5 text-retro-oliva" />
            </div>
            <p className="text-2xl font-black text-slate-100 mt-2 font-sans">{stats.totalUsers}</p>
          </div>
        </div>

        {/* LOADING INDICATOR */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-10 h-10 border-4 border-slate-800 border-t-retro-terracota rounded-full animate-spin mx-auto mb-4" />
            <p className="text-xs text-slate-400 font-bold">Sincronizando con Firestore...</p>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            
            {/* VIEW TAB 1: ORDERS TABLE */}
            {activeTab === 'orders' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-800/30 text-slate-400 border-b border-slate-800 font-black uppercase text-[10px] tracking-wider">
                      <th className="p-4 sm:p-5">Pedido</th>
                      <th className="p-4 sm:p-5">Cliente</th>
                      <th className="p-4 sm:p-5">Platillos Seleccionados</th>
                      <th className="p-4 sm:p-5">Dirección de Entrega</th>
                      <th className="p-4 sm:p-5">Estado</th>
                      <th className="p-4 sm:p-5">Acciones</th>
                    </tr>
                  </thead>
<tbody className="divide-y divide-slate-800/60 font-medium">
                    {displayOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-800/20 transition-colors">
                        <td className="p-4 sm:p-5 font-black text-retro-crema align-top whitespace-nowrap">
                          <div>Orden #{order.orderNumber}</div>
                          <div className="text-[9px] text-slate-500 font-bold mt-0.5" title={order.id}>
                            ID: {order.id.length > 8 ? order.id.substring(0, 8) + '...' : order.id}
                          </div>
                          {order.weekId && (
                            <div className="text-[9px] text-slate-500 font-bold mt-1 uppercase tracking-wider">
                              Semana: {order.weekId}
                            </div>
                          )}
                        </td>
                        
                        <td className="p-4 sm:p-5 align-top">
                          <div className="font-extrabold text-slate-200">{order.userName}</div>
                          <div className="text-[10px] text-slate-500 font-semibold mt-0.5">{order.userEmail}</div>
                          <div className="text-[10px] text-slate-400 font-bold mt-0.5 flex items-center gap-1">
                            <span>📞</span> 
                            <span>{order.userPhone || 'Sin teléfono'}</span>
                          </div>
                          {order.plan && (
                            <div className="mt-1.5">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase border tracking-wider ${
                                order.plan.includes('600')
                                  ? 'bg-amber-950/40 text-amber-300 border-amber-800/40'
                                  : order.plan.includes('800')
                                  ? 'bg-retro-terracota/20 text-retro-terracota border-retro-terracota/30'
                                  : 'bg-slate-900 text-slate-400 border-slate-800'
                              }`}>
                                {getPlanCalories(order.plan)}
                              </span>
                            </div>
                          )}
                        </td>

                        <td className="p-4 sm:p-5 align-top font-sans">
                          {(order.selectedDays && Object.keys(order.selectedDays).length > 0) || (order.mealIds && order.mealIds.length > 0) ? (
                            <button
                              onClick={() => setSelectedOrderForMealsModal(order)}
                              className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-900 text-slate-350 hover:text-slate-100 rounded-xl font-black text-[10px] tracking-wider uppercase transition-colors border border-slate-800 hover:border-slate-700 shadow-md flex items-center space-x-1"
                            >
                              <Utensils className="w-3.5 h-3.5 text-retro-terracota" />
                              <span>Ver Platillos</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-650 font-bold italic">Sin selección</span>
                          )}
                        </td>

                        <td className="p-4 sm:p-5 align-top max-w-xs text-slate-300 font-bold leading-relaxed">
                          {order.address}
                        </td>

                        <td className="p-4 sm:p-5 align-top">
                          <div className="flex flex-col space-y-2">
                            <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[9px] font-black uppercase border tracking-widest w-fit ${
                              order.status === 'pendiente' 
                                ? 'bg-amber-950/40 text-amber-300 border-amber-800/40' 
                                : order.status === 'en cocina' 
                                ? 'bg-blue-950/40 text-blue-300 border-blue-800/40' 
                                : order.status === 'en camino' 
                                ? 'bg-purple-950/40 text-purple-300 border-purple-800/40' 
                                : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40'
                            }`}>
                              {order.status}
                            </span>
                            
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                              className="bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl px-2.5 py-1.5 text-[11px] font-black focus:outline-none"
                            >
                              <option value="pendiente">Pendiente</option>
                              <option value="en cocina">En cocina</option>
                              <option value="en camino">En camino</option>
                              <option value="entregado">Entregado</option>
                            </select>
                          </div>
                        </td>

                        {/* DELETE ORDER BUTTON */}
                        <td className="p-4 sm:p-5 align-top">
                          <button
                            onClick={() => setOrderToDelete(order)}
                            className="p-2 rounded-xl bg-red-950/30 hover:bg-red-900/40 text-red-400 hover:text-red-300 border border-red-900/30 transition-colors"
                            title="Eliminar pedido"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan="6" className="py-12 text-center text-slate-500 font-bold">
                          No hay pedidos registrados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* VIEW TAB 2: DISH INVENTORY (CRUD) */}
            {activeTab === 'dishes' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm font-black uppercase tracking-wider text-retro-crema">Inventario de Platillos</h3>
                  <div className="flex space-x-2">
                    {dishes.length === 0 && (
                      <button
                        onClick={handleSeedData}
                        className="px-4 py-2 border border-dashed border-retro-mostaza text-retro-mostaza hover:bg-retro-mostaza/10 rounded-xl font-bold text-xs flex items-center space-x-1.5"
                      >
                        <Coffee className="w-3.5 h-3.5" />
                        <span>Sembrar Platillos Demo</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenDishForm()}
                      className="px-4 py-2 bg-retro-terracota hover:bg-retro-terracota/90 text-white rounded-xl font-black text-xs flex items-center space-x-1.5 shadow-lg shadow-retro-terracota/10"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>Nuevo Platillo</span>
                    </button>
                  </div>
                </div>

                {/* Form Editor Modal / Inline */}
                {showDishForm && (
                  <form onSubmit={handleSaveDish} className="mb-8 p-6 bg-slate-950 rounded-2xl border border-slate-800 animate-fade-in">
                    <h4 className="text-xs font-black uppercase tracking-widest text-retro-crema mb-4 pb-2 border-b border-slate-800">
                      {editingDish ? 'Editar Platillo' : 'Crear Nuevo Platillo'}
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Nombre</label>
                        <input
                          type="text"
                          required
                          placeholder="Ej. Amanida de Saumon avec Avocat"
                          value={dishName}
                          onChange={(e) => setDishName(e.target.value)}
                          className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs font-bold focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Categoría del Alimento</label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs font-bold focus:outline-none"
                        >
                          <option value="platillo">Platillo</option>
                          <option value="snack">Snack</option>
                          <option value="bebida">Bebida</option>
                        </select>
                      </div>
                    </div>

                    <div className="mb-4 text-left">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Imagen del Platillo</label>
                      <div className="flex space-x-2 mb-3">
                        <button
                          type="button"
                          onClick={() => setImageSource('preset')}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${
                            imageSource === 'preset'
                              ? 'bg-retro-terracota text-white'
                              : 'bg-slate-900 text-slate-400 hover:bg-slate-850'
                          }`}
                        >
                          Predefinidos (Galería)
                        </button>
                        <button
                          type="button"
                          onClick={() => setImageSource('upload')}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${
                            imageSource === 'upload'
                              ? 'bg-retro-terracota text-white'
                              : 'bg-slate-900 text-slate-400 hover:bg-slate-850'
                          }`}
                        >
                          Subir desde Equipo
                        </button>
                      </div>

                      {imageSource === 'preset' ? (
                        <div className="flex items-center space-x-3">
                          <select
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            className="flex-grow px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs font-bold focus:outline-none"
                          >
                            {FOOD_IMAGES.map((img) => (
                              <option key={img.url} value={img.url}>{img.label}</option>
                            ))}
                          </select>
                          <img
                            src={imageUrl}
                            alt="Preview"
                            className="w-12 h-12 object-cover rounded-xl border border-slate-800"
                            onError={(e) => { e.target.src = '/keto_salmon.webp'; }}
                          />
                        </div>
                      ) : (
                        <div className="flex items-center space-x-4 p-4 bg-slate-900/50 border border-slate-800 rounded-2xl">
                          <div className="flex-grow">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  setImageFile(file);
                                  setImagePreview(URL.createObjectURL(file));
                                }
                              }}
                              className="w-full text-xs text-slate-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-slate-800 file:text-retro-crema hover:file:bg-slate-750 cursor-pointer"
                            />
                            <p className="text-[9px] text-slate-500 font-bold mt-1.5">Formatos soportados: PNG, JPG, WEBP. Se sube al guardar el platillo.</p>
                          </div>
                          {(imagePreview || imageUrl) && (
                            <img
                              src={imagePreview || imageUrl}
                              alt="Preview"
                              className="w-12 h-12 object-cover rounded-xl border border-slate-800 flex-shrink-0"
                              onError={(e) => { e.target.src = '/keto_salmon.webp'; }}
                            />
                          )}
                        </div>
                      )}
                    </div>

                    <div className="mb-4">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Descripción</label>
                      <textarea
                        rows="2"
                        placeholder="Escribe los detalles y preparación del platillo..."
                        value={dishDescription}
                        onChange={(e) => setDishDescription(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs font-bold focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Calorías (Kcal)</label>
                        <input
                          type="number"
                          required
                          value={calories}
                          onChange={(e) => setCalories(e.target.value)}
                          className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs font-bold focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Proteínas (g)</label>
                        <input
                          type="number"
                          required
                          value={protein}
                          onChange={(e) => setProtein(e.target.value)}
                          className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs font-bold focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Grasas (g)</label>
                        <input
                          type="number"
                          required
                          value={fat}
                          onChange={(e) => setFat(e.target.value)}
                          className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs font-bold focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Carbohidratos (g)</label>
                        <input
                          type="number"
                          required
                          value={carbs}
                          onChange={(e) => setCarbs(e.target.value)}
                          className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs font-bold focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => setShowDishForm(false)}
                        className="px-4 py-2 border border-slate-800 hover:bg-slate-900 text-slate-400 rounded-xl font-bold text-xs"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={isSavingDish}
                        className="px-4 py-2 bg-retro-terracota hover:bg-retro-terracota/90 text-white rounded-xl font-black text-xs flex items-center space-x-1"
                      >
                        {isSavingDish ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Guardando...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-3.5 h-3.5" />
                            <span>{editingDish ? 'Guardar Cambios' : 'Crear Platillo'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}

                {/* Dishes inventory list */}
                {dishes.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dishes.map((dish) => (
                      <div key={dish.id} className="bg-slate-950 border border-slate-800/80 rounded-2xl overflow-hidden flex flex-col text-left">
                        <div className="relative h-44 overflow-hidden bg-slate-900">
                          <img
                            src={dish.imageUrl}
                            alt={dish.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = '/keto_salmon.webp'; }}
                          />
                          <div className="absolute top-3 right-3 bg-slate-950/80 px-2 py-0.5 rounded text-[10px] font-black text-retro-crema border border-slate-800">
                            {dish.macros?.calories || 0} Kcal
                          </div>
                        </div>
                        <div className="p-4 flex-grow flex flex-col justify-between">
                          <div>
                            <h4 className="font-extrabold text-sm text-retro-crema leading-snug line-clamp-1">{dish.name}</h4>
                            <p className="text-[11px] text-slate-400 font-semibold mt-1 leading-normal line-clamp-2 min-h-[32px]">
                              {dish.description}
                            </p>
                            
                            <div className="grid grid-cols-3 gap-1.5 text-center mt-3 p-2 bg-slate-900 border border-slate-800/40 rounded-xl text-[10px] font-bold text-slate-300">
                              <div>
                                <span className="text-[8px] text-slate-500 uppercase block">Pro</span>
                                <span>{dish.macros?.protein || 0}g</span>
                              </div>
                              <div>
                                <span className="text-[8px] text-slate-500 uppercase block">Grasa</span>
                                <span>{dish.macros?.fat || 0}g</span>
                              </div>
                              <div>
                                <span className="text-[8px] text-slate-500 uppercase block">Carb</span>
                                <span>{dish.macros?.carbs || 0}g</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end space-x-1.5 mt-4 pt-3 border-t border-slate-900">
                            <button
                              onClick={() => handleOpenDishForm(dish)}
                              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDishToDelete(dish)}
                              className="p-2 bg-red-950/20 hover:bg-red-950 border border-red-900/40 hover:border-red-900 text-red-400 hover:text-red-200 rounded-lg transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-16 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                    <Utensils className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-xs font-bold">No hay platillos en el inventario. Agrega uno nuevo o siembra los de demostración.</p>
                  </div>
                )}
              </div>
            )}

            {/* VIEW TAB 3: WEEKLY MENU CONFIGURATOR */}
            {activeTab === 'weeklyMenu' && (
              <div className="p-6 text-left">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-800">
                  <div className="flex items-center space-x-3">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-400">Seleccionar Semana (Lunes):</label>
                    <select
                      value={selectedWeekId}
                      onChange={(e) => setSelectedWeekId(e.target.value)}
                      className="bg-slate-950 border border-slate-800 hover:border-slate-700 text-retro-crema rounded-xl px-3.5 py-2 text-xs font-black focus:outline-none"
                    >
                      {upcomingMondays.map((week) => (
                        <option key={week} value={week}>
                          Lunes {new Date(week + 'T00:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })} ({week})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveWeeklyMenu}
                      disabled={isSavingMenu}
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-colors disabled:opacity-50 ${
                        menuIsActive
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/10'
                          : 'bg-slate-950 hover:bg-slate-850 border border-slate-800 text-retro-crema hover:text-white'
                      }`}
                    >
                      {isSavingMenu ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      <span>{menuIsActive ? 'Guardar Cambios (Menú Activo)' : 'Guardar Borrador'}</span>
                    </button>
                    
                    {menuIsActive ? (
                      <button
                        onClick={handleDeactivateMenu}
                        disabled={isSavingMenu}
                        className="px-4 py-2.5 bg-red-950/20 hover:bg-red-950 border border-red-900/45 text-red-400 hover:text-red-200 rounded-xl font-black text-xs flex items-center space-x-1.5 transition-colors disabled:opacity-50"
                      >
                        {isSavingMenu ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <AlertCircle className="w-3.5 h-3.5" />}
                        <span>Desactivar (Hacer Borrador)</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleSetMenuAsActive}
                        disabled={isSavingMenu || Object.values(weeklyMenuByDay).flat().length === 0}
                        className="px-4 py-2.5 bg-retro-terracota hover:bg-retro-terracota/90 text-white rounded-xl font-black text-xs flex items-center space-x-1.5 shadow-lg shadow-retro-terracota/10 transition-colors disabled:opacity-50"
                      >
                        {isSavingMenu ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        <span>Establecer como Activo</span>
                      </button>
                    )}
                  </div>
                </div>

                {menuIsActive && (
                  <div className="mb-6 p-4 bg-emerald-950/20 border border-emerald-800/40 rounded-2xl text-xs font-semibold text-emerald-300 flex items-start space-x-3.5">
                    <AlertCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-bold text-emerald-200 uppercase tracking-wide text-[10px]">Este Menú está ACTIVO</h5>
                      <p className="mt-0.5 leading-relaxed">
                        Cualquier platillo que agregues o quites aquí se actualizará en tiempo real en la aplicación para los clientes. Presiona <strong>"Guardar Cambios (Menú Activo)"</strong> para confirmar las correcciones.
                      </p>
                    </div>
                  </div>
                )}

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 mb-6 text-left">
                  <div className="flex items-center justify-between border-b border-slate-850 pb-3 mb-3">
                    <div>
                      <h4 className="text-xs font-black text-retro-crema uppercase tracking-wide">Configuración del Menú Semanal</h4>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                        Selecciona qué platillos del inventario están disponibles para cada día de la semana.
                      </p>
                    </div>
                    <span className={`px-3.5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      menuIsActive 
                        ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40' 
                        : 'bg-slate-900 text-slate-500 border-slate-850'
                    }`}>
                      {menuIsActive ? 'Menú Activo en la App' : 'Borrador'}
                    </span>
                  </div>

                  {/* Horizontal Day Picker for Admin */}
                  <div className="flex flex-wrap items-center gap-2">
                    {['lunes', 'martes', 'miercoles', 'jueves', 'viernes'].map((day) => {
                      const isSelectedDay = activeWeeklyMenuDay === day;
                      const countForDay = (weeklyMenuByDay[day] || []).length;
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => setActiveWeeklyMenuDay(day)}
                          className={`px-4 py-2 rounded-xl text-xs font-black transition-all uppercase tracking-wider ${
                            isSelectedDay
                              ? 'bg-retro-terracota text-white shadow-md shadow-retro-terracota/10'
                              : 'bg-slate-900 text-slate-400 hover:bg-slate-850 border border-slate-800'
                          }`}
                        >
                          <span>{day === 'miercoles' ? 'Mié' : day.substring(0, 3)}</span>
                          <span className={`ml-2 px-1.5 py-0.5 rounded text-[9px] font-black ${
                            isSelectedDay ? 'bg-white text-retro-terracota' : 'bg-slate-950 text-slate-500'
                          }`}>
                            {countForDay}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {dishes.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dishes.map((dish) => {
                      const isSelected = (weeklyMenuByDay[activeWeeklyMenuDay] || []).includes(dish.id);
                      return (
                        <div
                          key={dish.id}
                          onClick={() => handleToggleWeeklyDish(dish.id)}
                          className={`p-3.5 rounded-2xl border cursor-pointer flex items-center space-x-3.5 transition-all duration-200 ${
                            isSelected
                              ? 'bg-retro-terracota/10 border-retro-terracota text-white shadow-md'
                              : 'bg-slate-950 border-slate-850 text-slate-300 hover:border-slate-800'
                          }`}
                        >
                          <img
                            src={dish.imageUrl}
                            alt={dish.name}
                            className="w-12 h-12 object-cover rounded-xl border border-slate-800"
                            onError={(e) => { e.target.src = '/keto_salmon.webp'; }}
                          />
                          <div className="flex-grow text-left">
                            <h5 className="font-extrabold text-xs text-retro-crema line-clamp-1">{dish.name}</h5>
                            <span className="text-[10px] text-slate-500 font-semibold">{dish.macros?.calories || 0} Kcal • {dish.macros?.protein || 0}g Pro</span>
                          </div>
                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-colors ${
                            isSelected 
                              ? 'bg-retro-terracota border-retro-terracota text-white' 
                              : 'border-slate-700 bg-slate-900'
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-500 font-bold border border-dashed border-slate-800 rounded-2xl">
                    No hay platillos en el inventario para configurar el menú.
                  </div>
                )}
              </div>
            )}

            {/* VIEW TAB 4: USERS DIRECTORY */}
            {activeTab === 'users' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-800/30 text-slate-400 border-b border-slate-800 font-black uppercase text-[10px] tracking-wider">
                      <th className="p-4 sm:p-5">Cliente</th>
                      <th className="p-4 sm:p-5">Correo Electrónico</th>
                      <th className="p-4 sm:p-5">Fecha de Registro</th>
                      <th className="p-4 sm:p-5">Plan de Comidas</th>
                      <th className="p-4 sm:p-5 text-center">Estado de Pago</th>
                      <th className="p-4 sm:p-5 text-right">Estatus Suscripción</th>
                      <th className="p-4 sm:p-5 text-center">Limitado (1 de c/u)</th>
                      <th className="p-4 sm:p-5 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {users.map((client) => (
                      <tr key={client.id} className="hover:bg-slate-800/20 transition-colors">
                        <td className="p-4 sm:p-5 font-black text-slate-200">
                          <div>{client.name}</div>
                          <div className="text-[10px] text-slate-500 font-bold mt-0.5">{client.phone || 'Sin teléfono'}</div>
                        </td>
                        
                        <td className="p-4 sm:p-5 font-extrabold text-slate-300">
                          {client.email}
                        </td>

                        <td className="p-4 sm:p-5 text-slate-400">
                          {client.createdAt}
                        </td>

                        <td className="p-4 sm:p-5">
                          <select
                            value={client.plan || ''}
                            onChange={(e) => handlePlanChange(client, e.target.value)}
                            className="px-2 py-1.5 rounded-xl text-[10px] font-black uppercase focus:outline-none border bg-slate-950 cursor-pointer text-retro-crema border-retro-crema/20"
                          >
                            <option value="" className="text-slate-500">Sin Plan</option>
                            {['basic', 'normal', 'pro'].includes(client.plan) && (
                              <option value={client.plan} className="text-slate-400 bg-slate-900">
                                Legacy ({client.plan === 'basic' ? 'Básico' : client.plan === 'normal' ? 'Normal' : 'Pro'})
                              </option>
                            )}
                            <option value="cal800_1" className="text-retro-terracota bg-slate-900">Plan Hearty Lovers (1 Comida)</option>
                            <option value="cal800_2" className="text-retro-terracota bg-slate-900">Plan Hearty Lovers (2 Comidas)</option>
                            <option value="cal800_3" className="text-retro-terracota bg-slate-900">Plan Hearty Lovers (3 Comidas)</option>
                            <option value="cal600_1" className="text-retro-mostaza bg-slate-900">Plan Light Lovers (1 Comida)</option>
                            <option value="cal600_2" className="text-retro-mostaza bg-slate-900">Plan Light Lovers (2 Comidas)</option>
                            <option value="cal600_3" className="text-retro-mostaza bg-slate-900">Plan Light Lovers (3 Comidas)</option>
                            <option value="godinez" className="text-retro-crema bg-slate-900">Paquete Godínez</option>
                            <option value="comida_diaria" className="text-retro-crema bg-slate-900">Comida Diaria (Flexible)</option>
                          </select>
                        </td>

                        <td className="p-4 sm:p-5 text-center">
                          <div className="flex items-center justify-center space-x-2.5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                              client.paymentStatus === 'paid'
                                ? 'bg-emerald-950/20 text-emerald-400 border-emerald-800/20'
                                : 'bg-amber-950/20 text-amber-400 border-amber-800/20'
                            }`}>
                              {client.paymentStatus === 'paid' ? 'Pagado' : 'Pendiente'}
                            </span>
                            <button
                              onClick={() => handleTogglePaymentStatus(client)}
                              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all tracking-wider ${
                                client.paymentStatus === 'paid'
                                  ? 'bg-amber-950/40 text-amber-300 hover:bg-amber-950 border border-amber-800/40'
                                  : 'bg-emerald-950/40 text-emerald-300 hover:bg-emerald-950 border border-emerald-800/40'
                              }`}
                            >
                              {client.paymentStatus === 'paid' ? 'Marcar Pendiente' : 'Aprobar Pago'}
                            </button>
                          </div>
                        </td>

                        <td className="p-4 sm:p-5 text-right">
                          <select
                            value={client.status || 'active'}
                            onChange={(e) => handleSubscriptionStatusChange(client, e.target.value)}
                            className={`px-2 py-1.5 rounded-xl text-[10px] font-black uppercase focus:outline-none border bg-slate-950 cursor-pointer ${
                              client.status === 'active' 
                                ? 'text-emerald-400 border-emerald-800/20' 
                                : client.status === 'paused' 
                                ? 'text-amber-400 border-amber-800/20' 
                                : 'text-slate-500 border-slate-800'
                            }`}
                          >
                            <option value="active" className="text-emerald-400 bg-slate-900">Activo</option>
                            <option value="paused" className="text-amber-400 bg-slate-900">Pausado</option>
                            <option value="cancelled" className="text-slate-500 bg-slate-900">Cancelado</option>
                          </select>
                        </td>

                        <td className="p-4 sm:p-5 text-center">
                          <button
                            onClick={() => handleToggleLimitOneOfEach(client)}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all tracking-wider ${
                              client.limitOneOfEach
                                ? 'bg-indigo-950/40 text-indigo-300 hover:bg-indigo-950 border border-indigo-800/40'
                                : 'bg-slate-900 text-slate-400 hover:bg-slate-850 border border-slate-800'
                            }`}
                          >
                            {client.limitOneOfEach ? 'Habilitado' : 'Deshabilitado'}
                          </button>
                        </td>

                        <td className="p-4 sm:p-5 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => { 
                                setClientToEdit(client); 
                                setEditClientName(client.name || ''); 
                                setEditClientPhone(client.phone && client.phone !== 'Sin teléfono' ? client.phone : ''); 
                              }}
                              className="p-2 bg-blue-950/20 hover:bg-blue-900/30 border border-blue-900/40 text-blue-400 hover:text-blue-200 rounded-lg transition-colors"
                              title="Editar Datos del Cliente"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => { setUserForPasswordChange(client); setNewPassword(''); }}
                              className="p-2 bg-blue-950/20 hover:bg-blue-900/30 border border-blue-900/40 text-blue-400 hover:text-blue-200 rounded-lg transition-colors"
                              title="Cambiar Contraseña"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setUserToDelete(client)}
                              className="p-2 bg-red-950/20 hover:bg-red-950 border border-red-900/40 hover:border-red-900 text-red-400 hover:text-red-200 rounded-lg transition-colors"
                              title="Eliminar Cliente"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                     {users.length === 0 && (
                      <tr>
                        <td colSpan="6" className="py-12 text-center text-slate-500 font-bold">
                          No hay clientes registrados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* VIEW TAB 5: ADMINISTRATORS MANAGEMENT */}
            {activeTab === 'admins' && (
              <div className="space-y-8">
                {/* Admin Registration Form */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl relative overflow-hidden">
                  <div className="absolute top-[-40px] right-[-40px] w-36 h-36 bg-retro-terracota/5 rounded-full blur-2xl pointer-events-none" />
                  
                  <h3 className="text-base font-black text-retro-crema mb-1 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-retro-mostaza" />
                    Registrar Nuevo Administrador
                  </h3>
                  <p className="text-slate-400 text-xs font-semibold mb-6">
                    El nuevo administrador tendrá acceso total a los datos, platillos, menús y pedidos.
                  </p>

                  <form onSubmit={handleCreateAdmin} className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2 font-sans">
                        Nombre Completo
                      </label>
                      <input
                        type="text"
                        required
                        value={newAdminName}
                        onChange={(e) => setNewAdminName(e.target.value)}
                        placeholder="Ej. Juan Pérez"
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-retro-terracota focus:outline-none rounded-xl text-xs font-bold text-slate-200 placeholder-slate-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2 font-sans">
                        Correo Electrónico
                      </label>
                      <input
                        type="email"
                        required
                        value={newAdminEmail}
                        onChange={(e) => setNewAdminEmail(e.target.value)}
                        placeholder="Ej. juan.admin@lunchlovers.com"
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-retro-terracota focus:outline-none rounded-xl text-xs font-bold text-slate-200 placeholder-slate-600"
                      />
                    </div>
                    <div className="flex gap-4 items-end">
                      <div className="flex-grow">
                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2 font-sans">
                          Contraseña (mín. 6 caracteres)
                        </label>
                        <input
                          type="password"
                          required
                          minLength={6}
                          value={newAdminPassword}
                          onChange={(e) => setNewAdminPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-retro-terracota focus:outline-none rounded-xl text-xs font-bold text-slate-200 placeholder-slate-600"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isSavingAdmin}
                        className="px-6 py-3 bg-retro-terracota hover:bg-retro-terracota/90 text-white rounded-xl font-black text-xs transition-colors flex items-center space-x-1.5 h-11 flex-shrink-0 disabled:opacity-50"
                      >
                        {isSavingAdmin ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Guardando...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Crear Admin</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Admins List Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-800/30 text-slate-400 border-b border-slate-800 font-black uppercase text-[10px] tracking-wider">
                        <th className="p-4 sm:p-5">Nombre</th>
                        <th className="p-4 sm:p-5">Correo Electrónico</th>
                        <th className="p-4 sm:p-5">Fecha de Registro</th>
                        <th className="p-4 sm:p-5">Rol</th>
                        <th className="p-4 sm:p-5 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-medium">
                      {users.filter(u => u.role === 'admin' || u.isAdmin).map((adminUser) => (
                        <tr key={adminUser.id} className="hover:bg-slate-800/20 transition-colors">
                          <td className="p-4 sm:p-5 font-black text-slate-200">
                            {adminUser.name}
                          </td>
                          <td className="p-4 sm:p-5 font-extrabold text-slate-300">
                            {adminUser.email}
                          </td>
                          <td className="p-4 sm:p-5 text-slate-400">
                            {adminUser.createdAt}
                          </td>
                          <td className="p-4 sm:p-5">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border bg-retro-mostaza/20 text-retro-mostaza border-retro-mostaza/20">
                              Administrador
                            </span>
                          </td>
                          <td className="p-4 sm:p-5 text-right">
                            <button
                              onClick={() => setUserToDelete(adminUser)}
                              className="p-2 bg-red-950/20 hover:bg-red-950 border border-red-900/40 hover:border-red-900 text-red-400 hover:text-red-200 rounded-lg transition-colors"
                              title="Eliminar Administrador"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {users.filter(u => u.role === 'admin' || u.isAdmin).length === 0 && (
                        <tr>
                          <td colSpan="5" className="py-12 text-center text-slate-500 font-bold">
                            No hay otros administradores registrados.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}
      </main>

      {/* Custom Delete Confirmation Modal */}
      <AnimatePresence>
        {dishToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" 
              onClick={() => setDishToDelete(null)} 
            />
            {/* Modal Content */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-sm w-full relative z-10 text-left shadow-2xl overflow-hidden"
            >
              {/* Background decoration */}
              <div className="absolute top-[-30px] right-[-30px] w-20 h-20 bg-red-900/10 rounded-full blur-xl pointer-events-none" />
              
              <h3 className="text-sm font-black uppercase tracking-wider text-retro-crema mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                ¿Eliminar Platillo?
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-6 font-semibold">
                ¿Estás seguro de que deseas eliminar <span className="text-retro-terracota font-black">"{dishToDelete.name}"</span>? Esta acción es permanente y lo removerá del inventario y del menú semanal.
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setDishToDelete(null)}
                  className="px-4 py-2 bg-slate-950 border border-slate-800 hover:bg-slate-850 text-slate-400 hover:text-slate-200 rounded-xl font-bold text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteDish}
                  className="px-4 py-2 bg-red-650 hover:bg-red-600 text-white rounded-xl font-black text-xs transition-colors shadow-lg shadow-red-650/15"
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {userToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" 
              onClick={() => setUserToDelete(null)} 
            />
            {/* Modal Content */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-sm w-full relative z-10 text-left shadow-2xl overflow-hidden"
            >
              <div className="absolute top-[-30px] right-[-30px] w-20 h-20 bg-red-900/10 rounded-full blur-xl pointer-events-none" />
              
              <h3 className="text-sm font-black uppercase tracking-wider text-retro-crema mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                ¿Eliminar Cliente?
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-6 font-semibold">
                ¿Estás seguro de que deseas eliminar al cliente <span className="text-retro-terracota font-black">"{userToDelete.name}"</span> ({userToDelete.email})? Esta acción eliminará su perfil de usuario de forma permanente en la base de datos.
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setUserToDelete(null)}
                  className="px-4 py-2 bg-slate-950 border border-slate-800 hover:bg-slate-850 text-slate-400 hover:text-slate-200 rounded-xl font-bold text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteUser}
                  className="px-4 py-2 bg-red-650 hover:bg-red-600 text-white rounded-xl font-black text-xs transition-colors shadow-lg shadow-red-650/15"
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* DELETE ORDER CONFIRMATION MODAL */}
        {orderToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" 
              onClick={() => setOrderToDelete(null)} 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-sm w-full relative z-10 text-left shadow-2xl overflow-hidden"
            >
              <div className="absolute top-[-30px] right-[-30px] w-20 h-20 bg-red-900/10 rounded-full blur-xl pointer-events-none" />
              <h3 className="text-sm font-black uppercase tracking-wider text-retro-crema mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                ¿Eliminar Pedido?
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-6 font-semibold">
                ¿Estás seguro de que deseas eliminar la <span className="text-retro-terracota font-black">Orden #{orderToDelete.orderNumber}</span> de <span className="text-retro-crema font-bold">{orderToDelete.userName}</span>? Esta acción es permanente e irreversible.
              </p>
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setOrderToDelete(null)}
                  className="px-4 py-2 bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-xl font-bold text-xs transition-colors">
                  Cancelar
                </button>
                <button type="button" onClick={confirmDeleteOrder}
                  className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded-xl font-black text-xs transition-colors shadow-lg">
                  Eliminar Pedido
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* CHANGE PASSWORD MODAL */}
        {userForPasswordChange && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" 
              onClick={() => { setUserForPasswordChange(null); setNewPassword(''); }} 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-sm w-full relative z-10 text-left shadow-2xl overflow-hidden"
            >
              <div className="absolute top-[-30px] right-[-30px] w-20 h-20 bg-blue-900/10 rounded-full blur-xl pointer-events-none" />
              <h3 className="text-sm font-black uppercase tracking-wider text-retro-crema mb-1 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-blue-400" />
                Cambiar Contraseña
              </h3>
              <p className="text-xs text-slate-400 font-semibold mb-5">
                Establece una nueva contraseña para <span className="text-retro-crema font-black">{userForPasswordChange.name}</span> ({userForPasswordChange.email}).
              </p>
              <form onSubmit={handleChangePassword}>
                <div className="mb-5">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Nueva Contraseña (mínimo 6 caracteres)</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nueva contraseña..."
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-blue-600 focus:outline-none rounded-xl text-xs font-bold text-slate-200 placeholder-slate-600"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button type="button"
                    onClick={() => { setUserForPasswordChange(null); setNewPassword(''); }}
                    className="px-4 py-2 bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-xl font-bold text-xs transition-colors">
                    Cancelar
                  </button>
                  <button type="submit" disabled={isChangingPassword || newPassword.length < 6}
                    className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-xl font-black text-xs transition-colors shadow-lg disabled:opacity-50 flex items-center space-x-1.5">
                    {isChangingPassword ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />}
                    <span>{isChangingPassword ? 'Guardando...' : 'Cambiar Contraseña'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* EDIT CLIENT DETAILS MODAL */}
        {clientToEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" 
              onClick={() => { setClientToEdit(null); }} 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-sm w-full relative z-10 text-left shadow-2xl overflow-hidden"
            >
              <div className="absolute top-[-30px] right-[-30px] w-20 h-20 bg-blue-900/10 rounded-full blur-xl pointer-events-none" />
              <h3 className="text-sm font-black uppercase tracking-wider text-retro-crema mb-1 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                Editar Datos de Cliente
              </h3>
              <p className="text-xs text-slate-400 font-semibold mb-5">
                Modifica los datos personales de <span className="text-retro-crema font-black">{clientToEdit.name}</span> ({clientToEdit.email}).
              </p>
              <form onSubmit={handleSaveClientDetails}>
                <div className="mb-4">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    value={editClientName}
                    onChange={(e) => setEditClientName(e.target.value)}
                    placeholder="Nombre completo..."
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-blue-600 focus:outline-none rounded-xl text-xs font-bold text-slate-200 placeholder-slate-600"
                  />
                </div>
                <div className="mb-5">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Teléfono</label>
                  <input
                    type="text"
                    value={editClientPhone}
                    onChange={(e) => setEditClientPhone(e.target.value)}
                    placeholder="Ej. 3312345678"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-blue-600 focus:outline-none rounded-xl text-xs font-bold text-slate-200 placeholder-slate-600"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button type="button"
                    onClick={() => { setClientToEdit(null); }}
                    className="px-4 py-2 bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-xl font-bold text-xs transition-colors">
                    Cancelar
                  </button>
                  <button type="submit" disabled={isSavingClientDetails || !editClientName.trim()}
                    className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-xl font-black text-xs transition-colors shadow-lg disabled:opacity-50 flex items-center space-x-1.5">
                    {isSavingClientDetails ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>{isSavingClientDetails ? 'Guardando...' : 'Guardar Cambios'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* VIEW MEALS DETAILS MODAL */}
        {selectedOrderForMealsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" 
              onClick={() => setSelectedOrderForMealsModal(null)} 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md w-full relative z-10 text-left shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="absolute top-[-30px] right-[-30px] w-20 h-20 bg-retro-terracota/10 rounded-full blur-xl pointer-events-none" />
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-retro-crema flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-retro-mostaza" />
                    Platillos Seleccionados
                  </h3>
                  <p className="text-xs font-black text-slate-200 mt-1">
                    {selectedOrderForMealsModal.userName}
                  </p>
                  <p className="text-[10px] text-slate-500 font-semibold">
                    {selectedOrderForMealsModal.userEmail}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedOrderForMealsModal(null)}
                  className="text-slate-400 hover:text-slate-200 text-lg font-bold p-1"
                >
                  ✕
                </button>
              </div>

              {/* Calorie plan info */}
              <div className="mb-4 p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-xs font-bold">
                <span className="text-slate-400 font-bold">Plan contratado:</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border tracking-wider ${
                  selectedOrderForMealsModal.plan?.includes('600')
                    ? 'bg-amber-950/40 text-amber-300 border-amber-800/40'
                    : selectedOrderForMealsModal.plan?.includes('800')
                    ? 'bg-retro-terracota/20 text-retro-terracota border-retro-terracota/30'
                    : 'bg-slate-900 text-slate-350 border-slate-850'
                }`}>
                  {getPlanCalories(selectedOrderForMealsModal.plan)}
                </span>
              </div>

              {selectedOrderForMealsModal.weekId && (
                <div className="mb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Semana de Entrega: <span className="text-retro-crema font-extrabold">{selectedOrderForMealsModal.weekId}</span>
                </div>
              )}

              <div className="space-y-4 py-2 border-t border-b border-slate-850 max-h-[50vh] overflow-y-auto">
                {selectedOrderForMealsModal.selectedDays && Object.keys(selectedOrderForMealsModal.selectedDays).length > 0 ? (
                  <div className="space-y-3">
                    {['lunes', 'martes', 'miercoles', 'jueves', 'viernes'].map((day) => {
                      const dayObj = selectedOrderForMealsModal.selectedDays[day] || {};
                      const slots = Object.keys(dayObj).filter(slot => dayObj[slot] !== null && dayObj[slot] !== '');
                      if (slots.length === 0) return null;
                      
                      const formatDay = (d) => {
                        const map = { lunes: 'Lunes', martes: 'Martes', miercoles: 'Miércoles', jueves: 'Jueves', viernes: 'Viernes' };
                        return map[d] || d;
                      };
                      const formatSlot = (s) => {
                        const map = { comida: 'Platillo 1', cena: 'Platillo 2', snack: 'Platillo 3', bebida: 'Platillo 4' };
                        const userPlan = selectedOrderForMealsModal.plan || '';
                        const limits = {
                          cal800_1: 1,
                          cal600_1: 1,
                          comida_diaria: 1,
                          godinez: 1,
                          basic: 1,
                        };
                        if (userPlan && limits[userPlan] === 1 && s === 'comida') {
                          return 'Platillo';
                        }
                        return map[s] || s;
                      };
                      
                      return (
                        <div key={day} className="p-3 bg-slate-950/50 rounded-xl border border-slate-850">
                          <span className="text-[10px] font-black text-retro-mostaza uppercase tracking-wider block mb-2 border-b border-slate-850 pb-1">
                            {formatDay(day)}
                          </span>
                          <div className="space-y-2">
                            {slots.map(slot => {
                              const dishId = dayObj[slot];
                              const dish = dishesMap[dishId];
                              return dish ? (
                                <div key={slot} className="flex items-center space-x-2.5">
                                  <img
                                    src={dish.image || '/keto_salmon.webp'}
                                    alt={dish.name}
                                    className="w-8 h-8 object-cover rounded-lg border border-slate-800"
                                    onError={(e) => { e.target.src = '/keto_salmon.webp'; }}
                                  />
                                  <div>
                                    <span className="text-[11px] text-slate-200 font-extrabold block leading-tight">
                                      {dish.name}
                                    </span>
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-0.5 block">
                                      {formatSlot(slot)}
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <div key={slot} className="text-[10px] text-slate-500 italic">
                                  Platillo ID: {dishId} ({formatSlot(slot)})
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : selectedOrderForMealsModal.mealIds && Array.isArray(selectedOrderForMealsModal.mealIds) && selectedOrderForMealsModal.mealIds.length > 0 ? (
                  <div className="space-y-2.5 font-sans">
                    {selectedOrderForMealsModal.mealIds.map((mealId, idx) => {
                      const dish = dishesMap[mealId];
                      return dish ? (
                        <div key={idx} className="flex items-center space-x-3 p-2.5 bg-slate-950/50 rounded-xl border border-slate-850">
                          <img
                            src={dish.image || '/keto_salmon.webp'}
                            alt={dish.name}
                            className="w-8 h-8 object-cover rounded-lg border border-slate-800"
                            onError={(e) => { e.target.src = '/keto_salmon.webp'; }}
                          />
                          <span className="text-[11px] text-slate-200 font-extrabold leading-tight">{dish.name}</span>
                        </div>
                      ) : (
                        <div key={idx} className="text-[10px] text-slate-500 italic p-2.5 bg-slate-950/50 rounded-xl border border-slate-850">
                          Platillo ID: {mealId}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-6 text-center text-slate-500 font-bold italic">
                    Sin selección registrada
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForMealsModal(null)}
                  className="px-5 py-2 bg-slate-950 border border-slate-800 hover:bg-slate-850 text-slate-350 hover:text-white rounded-xl font-bold text-xs transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
