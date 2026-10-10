/*
  Demo application state.

  Holds the signed-in demo user, whether the business has one or several
  branches, and the working data for this stage: products, inventory
  batches and sales records, which can be added, updated and deleted.
  There is no database yet (that is Weeks 5 to 6): the session is
  remembered in localStorage so a page refresh keeps you signed in, and all
  data changes are kept in memory and reset on refresh.
*/
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
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
  const [productList, setProductList] = useState([]);
  useEffect(() => {
  async function loadProducts() {
    try {
      const response = await fetch('http://localhost:5000/api/products');

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const products = await response.json();
      setProductList(products);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  }

  loadProducts();
}, []);
 const [batchList, setBatchList] = useState([]);

useEffect(() => {
  async function loadInventory() {
    try {
      const response = await fetch('http://localhost:5000/api/inventory');

      if (!response.ok) {
        throw new Error('Failed to fetch inventory');
      }

      const batches = await response.json();

      setBatchList(batches);
    } catch (error) {
      console.error('Error loading inventory:', error);
    }
  }

  loadInventory();
}, []);

useEffect(() => {
  async function loadSales() {
    try {
      const response = await fetch('http://localhost:5000/api/sales');

      if (!response.ok) {
        throw new Error('Failed to fetch sales');
      }

      const sales = await response.json();

      setSalesList(sales);
    } catch (error) {
      console.error('Error loading sales:', error);
    }
  }

  loadSales();
}, []);
  /* Opening sales history: already reflected in the opening batch quantities, so no allocations */
  const [salesList, setSalesList] = useState([]);
  const [databaseBranches, setDatabaseBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState('br-kilimani');
  useEffect(() => {
  async function loadBranches() {
    try {
      const response = await fetch('http://localhost:5000/api/branches');

      if (!response.ok) {
        throw new Error('Failed to fetch branches');
      }

      const branches = await response.json();

      setDatabaseBranches(branches);

      const kilimani = branches.find((branch) => branch.name === 'Kilimani');

      if (kilimani) {
        setSelectedBranchId(kilimani.id);
      }
    } catch (error) {
      console.error('Error loading branches:', error);
    }
  }

  loadBranches();
}, []);

  const persist = useCallback((next) => {
    saveStored(next);
  }, []);

  const baseBranches =
  branchMode === 'multi' ? demoBranches : singleBranchSetup(stored?.setup ?? {});
const branchList =
  databaseBranches.length > 0
    ? databaseBranches
    : [...baseBranches, ...extraBranches];
    useEffect(() => {
  if (
    databaseBranches.length > 0 &&
    !databaseBranches.some((branch) => branch.id === selectedBranchId)
  ) {
    setSelectedBranchId(databaseBranches[0].id);
  }
}, [databaseBranches, selectedBranchId]);
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
  const addProduct = useCallback(async (product) => {
  try {
    const response = await fetch('http://localhost:5000/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product),
    });

    if (!response.ok) {
      throw new Error('Failed to add product');
    }

    const savedProduct = await response.json();

    setProductList((list) => [...list, savedProduct]);

    return savedProduct;
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
}, []);
  const updateProduct = useCallback(async (id, changes) => {
  try {
    const response = await fetch(`http://localhost:5000/api/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(changes),
    });

    if (!response.ok) {
      throw new Error('Failed to update product');
    }

    const updatedProduct = await response.json();

    setProductList((list) =>
      list.map((product) =>
        product.id === id ? updatedProduct : product
      ),
    );

    return updatedProduct;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
}, []);
  const deleteProduct = useCallback(async (id) => {
  try {
    const response = await fetch(`http://localhost:5000/api/products/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete product');
    }

    setProductList((list) =>
      list.filter((product) => product.id !== id)
    );
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}, []);

  /* Inventory batches (id is the Batch ID, which can be edited) */
  const addBatch = useCallback(async (batch) => {
  try {
    const response = await fetch('http://localhost:5000/api/inventory', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(batch),
    });

    if (!response.ok) {
      throw new Error('Failed to add inventory batch');
    }

    const savedBatch = await response.json();

    setBatchList((list) => [...list, savedBatch]);

    return savedBatch;
  } catch (error) {
    console.error('Error adding inventory batch:', error);
    throw error;
  }
}, []);
  const updateBatch = useCallback(async (id, changes) => {
  try {
    const currentBatch = batchList.find((batch) => batch.id === id);

    if (!currentBatch?.databaseId) {
      throw new Error('Database batch ID not found');
    }

    const response = await fetch(
      `http://localhost:5000/api/inventory/${currentBatch.databaseId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(changes),
      },
    );

    if (!response.ok) {
      throw new Error('Failed to update inventory batch');
    }

    const updatedBatch = await response.json();

    setBatchList((list) =>
      list.map((batch) =>
        batch.id === id ? updatedBatch : batch
      ),
    );

    return updatedBatch;
  } catch (error) {
    console.error('Error updating inventory batch:', error);
    throw error;
  }
}, [batchList]);
  const deleteBatch = useCallback(async (id) => {
  try {
    const currentBatch = batchList.find((batch) => batch.id === id);

    if (!currentBatch?.databaseId) {
      throw new Error('Database batch ID not found');
    }

    const response = await fetch(
      `http://localhost:5000/api/inventory/${currentBatch.databaseId}`,
      {
        method: 'DELETE',
      },
    );

    if (!response.ok) {
      throw new Error('Failed to delete inventory batch');
    }

    setBatchList((list) => list.filter((batch) => batch.id !== id));
  } catch (error) {
    console.error('Error deleting inventory batch:', error);
    throw error;
  }
}, [batchList]);

  /*
    Sales records and their effect on stock (see utils/stock.js).
    Callers validate available stock first; these only apply the change.
  */
  const addSale = useCallback(
  async (sale) => {
    try {
      const response = await fetch('http://localhost:5000/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: sale.productId,
          branchId: selectedBranchId,
          quantity: sale.quantity,
          date: sale.date,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add sale');
      }

      const savedSale = await response.json();

      setSalesList((list) => [...list, savedSale]);

// Reload inventory because PostgreSQL has already
// deducted the stock using FEFO.
const inventoryResponse = await fetch(
  'http://localhost:5000/api/inventory'
);

if (!inventoryResponse.ok) {
  throw new Error('Sale saved, but inventory refresh failed');
}

const updatedBatches = await inventoryResponse.json();
setBatchList(updatedBatches); 

      return savedSale;
    } catch (error) {
      console.error('Error adding sale:', error);
      throw error;
    }
  },
  [batchList, selectedBranchId],
);
  const updateSale = useCallback(
  async (id, changes) => {
    try {
      const oldSale = salesList.find((sale) => sale.id === id);

      if (!oldSale) {
        throw new Error('Sales record not found');
      }

      const response = await fetch(
        `http://localhost:5000/api/sales/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId: changes.productId,
            branchId: oldSale.branchId,
            quantity: changes.quantity,
            date: changes.date,
          }),
        },
      );

      const updatedSale = await response.json();

      if (!response.ok) {
        throw new Error(
          updatedSale.message || 'Failed to update sales record'
        );
      }

      // Update the Sales list with the saved database record
      setSalesList((list) =>
        list.map((sale) =>
          sale.id === id ? updatedSale : sale
        )
      );

      // Reload inventory because PostgreSQL handles FEFO
      const inventoryResponse = await fetch(
        'http://localhost:5000/api/inventory'
      );

      if (!inventoryResponse.ok) {
        throw new Error('Sale updated, but inventory refresh failed');
      }

      const updatedBatches = await inventoryResponse.json();
      setBatchList(updatedBatches);

      return updatedSale;
    } catch (error) {
      console.error('Error updating sale:', error);
      throw error;
    }
  },
  [salesList],
);
  const deleteSale = useCallback(async (id) => {
  try {
    const response = await fetch(
      `http://localhost:5000/api/sales/${id}`,
      {
        method: 'DELETE',
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || 'Failed to delete sales record'
      );
    }

    // Remove the deleted sale from the frontend
    setSalesList((list) =>
      list.filter((sale) => sale.id !== id)
    );

    // Reload inventory after PostgreSQL restores the stock
    const inventoryResponse = await fetch(
      'http://localhost:5000/api/inventory'
    );

    if (!inventoryResponse.ok) {
      throw new Error('Sale deleted, but inventory refresh failed');
    }

    const updatedBatches = await inventoryResponse.json();
    setBatchList(updatedBatches);

    return result;
  } catch (error) {
    console.error('Error deleting sale:', error);
    throw error;
  }
}, []);

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
