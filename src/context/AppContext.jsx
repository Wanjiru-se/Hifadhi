/*
  Demo application state.

  Holds the signed-in demo user, whether the business has one or several
  branches, and the working data for this stage: products, inventory
  batches and sales records, which can be added, updated and deleted.
  There is no database yet (that is Weeks 5 to 6): the session is
  remembered in localStorage so a page refresh keeps you signed in, and all
  data changes are kept in memory and reset on refresh.
*/
import { createContext, useCallback, useContext, useState } from 'react';
import {
  batches as demoBatches,
  branches as demoBranches,
  business as demoBusiness,
  demoAccounts,
  products as demoProducts,
  recentSales as demoSales,
  users as demoUsers,
} from '../data/demoData';
import { allocateFefo, returnAllocations } from '../utils/stock';

const STORAGE_KEY = 'hifadhi-demo-session';

const AppContext = createContext(null);

function loadStored() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveStored(value) {
  try {
    if (value) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage unavailable: the demo still works for this visit */
  }
}

/* The Business Admin created during registration */
function ownerUser(session) {
  return {
    id: 'u-owner',
    name: session.name,
    email: session.email,
    role: 'Business Admin',
    branchAccess: 'All Branches',
    status: 'Active',
    lastActive: 'Today',
  };
}

/* A newly registered business starts with exactly one branch */
function singleBranchSetup(stored) {
  const branch = {
    id: 'br-first',
    name: stored.branchName || 'Kilimani',
    location: stored.branchLocation || 'Kilimani, Nairobi',
    manager: stored.ownerName || 'Ann Wanjiku',
    managerNote: 'Owner',
    status: 'Active',
    products: demoProducts.length,
  };
  return [branch];
}

export function AppProvider({ children }) {
  const stored = loadStored();

  const [session, setSession] = useState(stored?.session ?? null);
  const [businessInfo, setBusinessInfo] = useState(stored?.business ?? demoBusiness);
  const [branchMode, setBranchModeState] = useState(stored?.branchMode ?? 'multi');
  const [extraBranches, setExtraBranches] = useState([]);
  const [userList, setUserList] = useState(() =>
    stored?.session?.userId === 'u-owner' ? [ownerUser(stored.session)] : demoUsers,
  );
  const [productList, setProductList] = useState(demoProducts);
  const [batchList, setBatchList] = useState(() =>
    /* Older demo batches have no unit cost, so take it from their product */
    demoBatches.map((b) => ({
      unitCost: demoProducts.find((p) => p.id === b.productId)?.unitCost ?? 0,
      ...b,
    })),
  );
  /* Opening sales history: already reflected in the opening batch quantities, so no allocations */
  const [salesList, setSalesList] = useState(demoSales);
  const [selectedBranchId, setSelectedBranchId] = useState('br-kilimani');

  const persist = useCallback((next) => {
    saveStored(next);
  }, []);

  const baseBranches =
    branchMode === 'multi' ? demoBranches : singleBranchSetup(stored?.setup ?? {});
  const branchList = [...baseBranches, ...extraBranches];
  const isMultiBranch = branchList.length > 1;

  const currentUser = session
    ? userList.find((u) => u.id === session.userId) ?? {
        id: session.userId,
        name: session.name,
        email: session.email,
        role: 'Business Admin',
      }
    : null;

  const signIn = useCallback(
    (roleKey) => {
      const account = demoAccounts[roleKey];
      const nextSession = { userId: account.userId, role: account.role };
      setSession(nextSession);
      setBusinessInfo(demoBusiness);
      setUserList(demoUsers);
      setBranchModeState('multi');
      setExtraBranches([]);
      setSelectedBranchId(account.branchId);
      persist({ session: nextSession, business: demoBusiness, branchMode: 'multi' });
    },
    [persist],
  );

  const signOut = useCallback(() => {
    setSession(null);
    persist(null);
  }, [persist]);

  /* Called at the end of Business Registration */
  const completeRegistration = useCallback(
    ({ ownerName, businessName, businessType, email, branchName, branchLocation }) => {
      const nextBusiness = { ...demoBusiness, name: businessName, type: businessType, email };
      const setup = { branchName, branchLocation, ownerName };
      const nextSession = { userId: 'u-owner', role: 'admin', name: ownerName, email };
      setSession(nextSession);
      setUserList([ownerUser(nextSession)]);
      setBusinessInfo(nextBusiness);
      setBranchModeState('single');
      setExtraBranches([]);
      setSelectedBranchId('br-first');
      persist({ session: nextSession, business: nextBusiness, branchMode: 'single', setup });
    },
    [persist],
  );

  /* Prototype switches used on the Settings page for demonstrations */
  const setRole = useCallback(
    (roleKey) => {
      const account = demoAccounts[roleKey];
      const nextSession = { userId: account.userId, role: account.role };
      setSession(nextSession);
      setUserList(demoUsers);
      persist({ ...(loadStored() ?? {}), session: nextSession });
    },
    [persist],
  );

  const setBranchMode = useCallback(
    (mode) => {
      setBranchModeState(mode);
      setExtraBranches([]);
      setSelectedBranchId(mode === 'multi' ? 'br-kilimani' : 'br-first');
      persist({ ...(loadStored() ?? {}), branchMode: mode });
    },
    [persist],
  );

  /* Products */
  const addProduct = useCallback((product) => {
    setProductList((list) => [...list, product]);
  }, []);
  const updateProduct = useCallback((id, changes) => {
    setProductList((list) => list.map((p) => (p.id === id ? { ...p, ...changes } : p)));
  }, []);
  const deleteProduct = useCallback((id) => {
    setProductList((list) => list.filter((p) => p.id !== id));
  }, []);

  /* Inventory batches (id is the Batch ID, which can be edited) */
  const addBatch = useCallback((batch) => {
    setBatchList((list) => [...list, batch]);
  }, []);
  const updateBatch = useCallback((id, changes) => {
    setBatchList((list) => list.map((b) => (b.id === id ? { ...b, ...changes } : b)));
    /* If the Batch ID was renamed, keep sales pointing at the same batch */
    if (changes.id && changes.id !== id) {
      setSalesList((list) =>
        list.map((s) =>
          s.allocations?.some((a) => a.batchId === id)
            ? { ...s, allocations: s.allocations.map((a) => (a.batchId === id ? { ...a, batchId: changes.id } : a)) }
            : s,
        ),
      );
    }
  }, []);
  const deleteBatch = useCallback((id) => {
    setBatchList((list) => list.filter((b) => b.id !== id));
  }, []);

  /*
    Sales records and their effect on stock (see utils/stock.js).
    Callers validate available stock first; these only apply the change.
  */
  const addSale = useCallback(
    (sale) => {
      const { batches, allocations } = allocateFefo(batchList, sale.productId, sale.quantity);
      setBatchList(batches);
      setSalesList((list) => [...list, { ...sale, allocations }]);
    },
    [batchList],
  );
  const updateSale = useCallback(
    (id, changes) => {
      const old = salesList.find((s) => s.id === id);
      if (!old) return;
      /* Opening records are already reflected in stock: update the record only */
      if (!old.allocations) {
        setSalesList((list) => list.map((s) => (s.id === id ? { ...s, ...changes } : s)));
        return;
      }
      const restored = returnAllocations(batchList, old.allocations);
      const next = { ...old, ...changes };
      const { batches, allocations } = allocateFefo(restored, next.productId, next.quantity);
      setBatchList(batches);
      setSalesList((list) => list.map((s) => (s.id === id ? { ...next, allocations } : s)));
    },
    [batchList, salesList],
  );
  const deleteSale = useCallback(
    (id) => {
      const old = salesList.find((s) => s.id === id);
      if (old?.allocations) setBatchList(returnAllocations(batchList, old.allocations));
      setSalesList((list) => list.filter((s) => s.id !== id));
    },
    [batchList, salesList],
  );

  const addBranch = useCallback((branch) => {
    setExtraBranches((list) => [...list, branch]);
  }, []);

  const addUser = useCallback((user) => {
    setUserList((list) => [...list, user]);
  }, []);

  const selectedBranch =
    branchList.find((b) => b.id === selectedBranchId) ?? branchList[0];

  const value = {
    session,
    isAdmin: session?.role === 'admin',
    currentUser,
    business: businessInfo,
    branches: branchList,
    isMultiBranch,
    branchMode,
    selectedBranch,
    setSelectedBranchId,
    users: userList,
    products: productList,
    batches: batchList,
    sales: salesList,
    signIn,
    signOut,
    completeRegistration,
    setRole,
    setBranchMode,
    addProduct,
    updateProduct,
    deleteProduct,
    addBatch,
    updateBatch,
    deleteBatch,
    addSale,
    updateSale,
    deleteSale,
    addBranch,
    addUser,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
