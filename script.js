/*
  Fast Food Billing System - script.js
  - Modular functions for auth, admin CRUD, user cart, orders, theme, and UI helpers.
  - Uses localStorage for persistence; no backend.
*/

/* ----------------------- Utilities & Storage ----------------------- */
const STORAGE = {
  users: 'ff_users',
  admins: 'ff_admins',
  items: 'ff_items',
  orders: 'ff_orders',
  completedOrders: 'ff_completed_orders',
  currentUser: 'ff_current_user',
  currentAdmin: 'ff_current_admin',
  theme: 'ff_theme',
  cart: 'ff_cart'
};

// Simple helper to get/set JSON
const get = (key) => JSON.parse(localStorage.getItem(key) || 'null');
const set = (key, val) => localStorage.setItem(key, JSON.stringify(val));

// Toast notification system
const toastEl = () => document.getElementById('toast');
function toast(message, type='info'){
  const t = toastEl(); if(!t) return;
  t.textContent = message; t.className = 'toast show';
  if(type==='error') t.style.background = '#ff4d4f'; else if(type==='success') t.style.background = 'var(--primary)'; else t.style.background='var(--secondary)';
  setTimeout(()=>{t.className='toast'},3000);
}

function uid(prefix='id'){return prefix + '_' + Math.random().toString(36).slice(2,9)}

/* ----------------------- Theme ----------------------- */
function initTheme(){
  const root = document.documentElement;
  const saved = localStorage.getItem(STORAGE.theme) || 'light';
  root.setAttribute('data-theme', saved==='dark' ? 'dark' : 'light');
}
function toggleTheme(){
  const root = document.documentElement; const cur = root.getAttribute('data-theme')||'light';
  const next = cur==='dark' ? 'light' : 'dark'; root.setAttribute('data-theme', next); localStorage.setItem(STORAGE.theme,next);
  syncThemeCheckboxes(); if(typeof renderStats==='function') renderStats();
}

function syncThemeCheckboxes(){
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.querySelectorAll('.checkbox-input').forEach(cb => cb.checked = isDark);
}

// Update user dashboard header based on active section
function updateUserDashboardHeader(section){
  const headerTitle = document.getElementById('headerTitle');
  const headerActions = document.getElementById('headerActions');
  if(!headerTitle || !headerActions) return;
  
  const searchInput = headerActions.querySelector('#searchInput');
  const categoryFilter = headerActions.querySelector('#categoryFilter');
  
  if(section === 'menu'){
    headerTitle.innerHTML = '<h2>Menu</h2><p class="muted">Browse and add items to your cart</p>';
    if(searchInput) searchInput.style.display = 'block';
    if(categoryFilter) categoryFilter.style.display = 'block';
  } else if(section === 'cart'){
    headerTitle.innerHTML = '<h2>Your Cart</h2><p class="muted">Review items and proceed to checkout</p>';
    if(searchInput) searchInput.style.display = 'none';
    if(categoryFilter) categoryFilter.style.display = 'none';
  } else if(section === 'receipt'){
    headerTitle.innerHTML = '<h2>Order History</h2><p class="muted">View your past orders and receipts</p>';
    if(searchInput) searchInput.style.display = 'none';
    if(categoryFilter) categoryFilter.style.display = 'none';
  }
}

// Update admin dashboard header based on active section
function updateAdminDashboardHeader(section){
  const headerTitle = document.getElementById('adminHeaderTitle');
  const addItemBtn = document.getElementById('addItemBtn');
  if(!headerTitle || !addItemBtn) return;
  
  if(section === 'items'){
    headerTitle.innerHTML = '<h2>Menu Items</h2><p class="muted">Add, edit, or remove food items</p>';
    addItemBtn.style.display = 'inline-block';
  } else if(section === 'orders'){
    headerTitle.innerHTML = '<h2>Orders & Fulfillment</h2><p class="muted">Manage pending and completed orders</p>';
    addItemBtn.style.display = 'none';
  } else if(section === 'users'){
    headerTitle.innerHTML = '<h2>Registered Users</h2><p class="muted">View all user accounts and details</p>';
    addItemBtn.style.display = 'none';
  } else if(section === 'stats'){
    headerTitle.innerHTML = '<h2>Dashboard Analytics</h2><p class="muted">View performance metrics and charts</p>';
    addItemBtn.style.display = 'none';
  }
}

/* ----------------------- Seed data ----------------------- */
function seedData(){
  if(!get(STORAGE.items)){
    const sample = [
      {id:uid('itm'),name:'Classic Burger',category:'Burgers',price:199,image:'/assets/images/ClassicBurger.jpg'},
      {id:uid('itm'),name:'Veg Pizza',category:'Pizzas',price:349,image:'/assets/images/VegPizza.jpg'},
      {id:uid('itm'),name:'Cheese Fries',category:'Sides',price:119,image:'/assets/images/CheeseFries.jpg'},
      {id:uid('itm'),name:'Coke',category:'Drinks',price:49,image:'/assets/images/Coke.jpg'},
      {id:uid('itm'),name:'Paneer Wrap',category:'Wraps',price:189,image:'/assets/images/PaneerWrap.jpg'},
      {id:uid('itm'),name:'Grilled Sandwich',category:'Sandwiches',price:159,image:'/assets/images/GrilledSandwich.jpg'},
      {id:uid('itm'),name:'Chocolate Shake',category:'Drinks',price:129,image:'/assets/images/ChocolateShake.jpg'},
      {id:uid('itm'),name:'BBQ Bacon Burger',category:'Burgers',price:249,image:'/assets/images/BBQBaconBurger.jpg'},
      {id:uid('itm'),name:'Margherita Pizza',category:'Pizzas',price:299,image:'/assets/images/MargheritaPizza.jpg'},
      {id:uid('itm'),name:'Pepperoni Pizza',category:'Pizzas',price:379,image:'/assets/images/PepperoniPizza.jpg'},
      {id:uid('itm'),name:'Spicy Chicken Wings',category:'Sides',price:199,image:'/assets/images/SpicyChickenWings.jpg'},
      {id:uid('itm'),name:'Garlic Bread',category:'Sides',price:89,image:'/assets/images/GarlicBread.jpg'},
      {id:uid('itm'),name:'Veggie Salad',category:'Salads',price:159,image:'/assets/images/VeggieSalad.jpg'},
      {id:uid('itm'),name:'Fish And Chips',category:'Combos',price:299,image:'/assets/images/Fish&Chips.jpg'},
      {id:uid('itm'),name:'Club Sandwich',category:'Sandwiches',price:179,image:'/assets/images/ClubSandwich.jpg'},
      {id:uid('itm'),name:'Tandoori Paneer Wrap',category:'Wraps',price:219,image:'/assets/images/TandooriPaneerWrap.jpg'},
      {id:uid('itm'),name:'Masala Dosa',category:'Breakfast',price:129,image:'/assets/images/MasalaDosa.jpg'},
      {id:uid('itm'),name:'Chocolate Brownie',category:'Desserts',price:99,image:'/assets/images/ChocolateBrownie.jpg'},
      {id:uid('itm'),name:'Vanilla Ice Cream',category:'Desserts',price:79,image:'/assets/images/VanillaIceCream.jpg'},
      {id:uid('itm'),name:'Mango Lassi',category:'Beverages',price:89,image:'/assets/images/MangoLassi.jpg'},
      {id:uid('itm'),name:'Breakfast Combo',category:'Breakfast',price:199,image:'/assets/images/BreakfastCombo.jpg'},
      {id:uid('itm'),name:'Veggie Wrap',category:'Wraps',price:149,image:'/assets/images/VeggieWrap.jpg'},
      {id:uid('itm'),name:'Iced Tea',category:'Drinks',price:59,image:'/assets/images/IcedTea.jpg'},
      {id:uid('itm'),name:'Nutella Crepe',category:'Desserts',price:139,image:'/assets/images/NutellaCrepe.jpg'}
    ];
    set(STORAGE.items, sample);
    if(!get(STORAGE.users)) set(STORAGE.users, []);
    if(!get(STORAGE.admins)) set(STORAGE.admins, [{id: '1', name: 'Admin', email: 'admin@fastfood.com', username: 'admin', password: 'admin123'}]);
    if(!get(STORAGE.orders)) set(STORAGE.orders, []);
  }
}

/* ----------------------- API Integration Functions ----------------------- */
const API_BASE = 'http://localhost:5002/api';

/* ----------------------- Auth: Users & Admins ----------------------- */
async function registerUserAPI({name,email,username,password}){
  try {
    const response = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, username, password })
    });

    const data = await response.json();

    if (data.success) {
      return { ok: true };
    } else {
      return { ok: false, msg: data.message };
    }
  } catch (error) {
    console.error("FULL ERROR:", error);
    return { ok: false, msg: error.message };
  }
}

async function registerAdminAPI({name,email,username,password,code}){
  try {
    const response = await fetch(`${API_BASE}/admin/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, username, password, code })
    });

    const data = await response.json();

    if (data.success) {
      return { ok: true };
    } else {
      return { ok: false, msg: data.message };
    }
  } catch (error) {
    console.error("FULL ERROR:", error);
    return { ok: false, msg: error.message };
  }
}

async function loginUserAPI({credential,password}){
  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ credential, password })
    });

    const data = await response.json();

    if (data.success) {
      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      return { ok: true, user: data.user };
    } else {
      return { ok: false, msg: data.message };
    }
  } catch (error) {
    console.error("FULL ERROR:", error);
    return { ok: false, msg: error.message };
  }
}

async function loginAdminAPI({credential,password}){
  try {
    const response = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ credential, password })
    });

    const data = await response.json();

    if (data.success) {
      // Store token and admin data
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('currentAdmin', JSON.stringify(data.admin));
      return { ok: true, admin: data.admin };
    } else {
      return { ok: false, msg: data.message };
    }
  } catch (error) {
    console.error("FULL ERROR:", error);
    return { ok: false, msg: error.message };
  }
}

/* ----------------------- Items Management ----------------------- */
async function getItemsAPI(){
  try {
    const token = localStorage.getItem('token') || localStorage.getItem('adminToken');

    const headers = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}/items`, {
      headers
   });

    const data = await response.json();

    if (data.success) {
      return data.data;
    } else {
      console.error('Failed to fetch items:', data.message);
      return [];
    }
  } catch (error) {
    console.error('Items fetch error:', error);
    return [];
  }
}

async function createItemAPI(itemData){
  try {
    const token = localStorage.getItem('adminToken');

    const response = await fetch(`${API_BASE}/items`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(itemData)
    });

    const data = await response.json();

    if (data.success) {
      toast('Item created successfully', 'success');
      return data.data;
    } else {
      toast(data.message, 'error');
      return null;
    }
  } catch (error) {
    console.error('Create item error:', error);
    toast('Failed to create item', 'error');
    return null;
  }
}

async function updateItemAPI(itemId, itemData){
  try {
    const token = localStorage.getItem('adminToken');

    const response = await fetch(`${API_BASE}/items/${itemId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(itemData)
    });

    const data = await response.json();

    if (data.success) {
      toast('Item updated successfully', 'success');
      return true;
    } else {
      toast(data.message, 'error');
      return false;
    }
  } catch (error) {
    console.error('Update item error:', error);
    toast('Failed to update item', 'error');
    return false;
  }
}

async function deleteItemAPI(itemId){
  try {
    const token = localStorage.getItem('adminToken');

    const response = await fetch(`${API_BASE}/items/${itemId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (data.success) {
      toast('Item deleted successfully', 'success');
      return true;
    } else {
      toast(data.message, 'error');
      return false;
    }
  } catch (error) {
    console.error('Delete item error:', error);
    toast('Failed to delete item', 'error');
    return false;
  }
}

/* ----------------------- Orders Management ----------------------- */
async function createOrderAPI(orderData){
  try {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });

    const data = await response.json();

    if (data.success) {
      toast('Order placed successfully!', 'success');
      return data.data;
    } else {
      toast(data.message, 'error');
      return null;
    }
  } catch (error) {
    console.error('Order creation error:', error);
    toast('Failed to place order', 'error');
    return null;
  }
}

async function getUserOrdersAPI(){
  try {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const userId = user.id;

    if (!userId) return [];

    const response = await fetch(`${API_BASE}/orders/user/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (data.success) {
      return data.data;
    } else {
      console.error('Failed to fetch orders:', data.message);
      return [];
    }
  } catch (error) {
    console.error('Orders fetch error:', error);
    return [];
  }
}

async function getAllOrdersAPI(){
  try {
    const token = localStorage.getItem('adminToken');

    const response = await fetch(`${API_BASE}/orders`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (data.success) {
      return data.data;
    } else {
      console.error('Failed to fetch all orders:', data.message);
      return [];
    }
  } catch (error) {
    console.error('All orders fetch error:', error);
    return [];
  }
}

async function updateOrderStatusAPI(orderId, status){
  try {
    const token = localStorage.getItem('adminToken');

    const response = await fetch(`${API_BASE}/orders/${orderId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });

    const data = await response.json();

    if (data.success) {
      toast('Order status updated', 'success');
      return true;
    } else {
      toast(data.message, 'error');
      return false;
    }
  } catch (error) {
    console.error('Update order status error:', error);
    toast('Failed to update order status', 'error');
    return false;
  }
}

async function getUsersAPI(){
  try {
    const token = localStorage.getItem('adminToken');

    const response = await fetch(`${API_BASE}/users`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (data.success) {
      return data.data;
    } else {
      console.error('Failed to fetch users:', data.message);
      return [];
    }
  } catch (error) {
    console.error('Users fetch error:', error);
    return [];
  }
}

async function deleteUserAPI(userId){
  try {
    const token = localStorage.getItem('adminToken');

    const response = await fetch(`${API_BASE}/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (data.success) {
      toast('User deleted successfully', 'success');
      return true;
    } else {
      toast(data.message, 'error');
      return false;
    }
  } catch (error) {
    console.error('Delete user error:', error);
    toast('Failed to delete user', 'error');
    return false;
  }
}

/* ----------------------- Cart Management ----------------------- */
async function getCartAPI(){
  try {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const userId = user.id;

    if (!userId) return [];

    const response = await fetch(`${API_BASE}/cart/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (data.success) {
      return data.data;
    } else {
      console.error('Failed to fetch cart:', data.message);
      return [];
    }
  } catch (error) {
    console.error('Cart fetch error:', error);
    return [];
  }
}

async function addToCartAPI(itemId, quantity = 1){
  try {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const userId = user.id;

    if (!userId) {
      toast('Please login first', 'error');
      return;
    }

    const response = await fetch(`${API_BASE}/cart`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: userId,
        item_id: itemId,
        quantity: quantity
      })
    });

    const data = await response.json();

    if (data.success) {
      toast('Added to cart', 'success');
      return true;
    } else {
      toast(data.message, 'error');
      return false;
    }
  } catch (error) {
    console.error('Add to cart error:', error);
    toast('Failed to add to cart', 'error');
    return false;
  }
}

async function updateCartItemAPI(cartId, quantity){
  try {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE}/cart/${cartId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ quantity })
    });

    const data = await response.json();

    if (data.success) {
      return true;
    } else {
      toast(data.message, 'error');
      return false;
    }
  } catch (error) {
    console.error('Update cart error:', error);
    toast('Failed to update cart', 'error');
    return false;
  }
}

async function removeFromCartAPI(cartId){
  try {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE}/cart/${cartId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (data.success) {
      return true;
    } else {
      toast(data.message, 'error');
      return false;
    }
  } catch (error) {
    console.error('Remove from cart error:', error);
    toast('Failed to remove item', 'error');
    return false;
  }
}

/* ----------------------- Render helpers ----------------------- */
function el(tag,cls=''){const e=document.createElement(tag);if(cls) e.className=cls;return e}

/* ----------------------- Page: Admin Dashboard ----------------------- */
function setupAdminPage(){
  const addItemBtn = document.getElementById('addItemBtn');
  const addModal = document.getElementById('addItemModal');
  const itemForm = document.getElementById('itemForm');
  const itemsSection = document.getElementById('itemsSection');
  const ordersSection = document.getElementById('ordersSection');
  const ordersList = document.getElementById('ordersList');
  const adminName = document.getElementById('adminName');

  const current = JSON.parse(localStorage.getItem('currentAdmin') || 'null');
  if(current) adminName.textContent = current.name;

  let editingId = null;
  let items = []; // Store items for admin
  let orders = []; // Store orders for admin

  async function loadItems(){
    items = get(STORAGE.items) || [];
    renderItems();
  }

  async function loadOrders(){
    orders = get(STORAGE.orders) || [];
    renderOrders();
  }

  function renderItems(){
    itemsSection.innerHTML=''; 
    items.forEach(it=>{
      const card = el('div','card-item glass');
      card.innerHTML = `<img src="${it.image}" alt="${it.name}" loading="lazy" onerror="this.onerror=null;this.src='https://via.placeholder.com/800x600?text=No+Image';"><div class="card-body"><h4>${it.name}</h4><p class="muted">${it.category}</p><div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px"><strong>₹${it.price}</strong><div><button class='btn outline edit' data-id='${it.id}'>Edit</button><button class='btn primary del' data-id='${it.id}'>Delete</button></div></div></div>`;
      itemsSection.appendChild(card);
    });
    // attach events
    itemsSection.querySelectorAll('.edit').forEach(b=>b.onclick=e=>{const id=e.currentTarget.dataset.id; const it=items.find(x=>x.id===id);editingId=id;document.getElementById('itemName').value=it.name;document.getElementById('itemCategory').value=it.category;document.getElementById('itemPrice').value=it.price;document.getElementById('itemImage').value=it.image; addModal.classList.remove('hidden');});
    itemsSection.querySelectorAll('.del').forEach(b=>b.onclick=e=>{const id=e.currentTarget.dataset.id; if(confirm('Delete item?')){ const allItems = get(STORAGE.items) || []; const filtered = allItems.filter(x => x.id != id); set(STORAGE.items, filtered); loadItems(); toast('Item deleted'); }});
  }

  function renderOrders(){
    ordersList.innerHTML=''; 
    orders.forEach(o=>{
      const row = el('div','glass'); row.style.padding='10px'; row.style.marginBottom='8px';
      row.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center"><div><strong>Order ${o.id}</strong><div class='muted'>${o.created_at} • ${o.user_name || 'User'}</div></div><div style="display:flex;gap:8px;align-items:center"><strong>₹${o.grand_total.toFixed(2)}</strong><button class='btn outline details-btn' data-id='${o.id}'>Details</button>${o.status !== 'completed' ? `<button class='btn primary complete-btn' data-id='${o.id}'>Complete</button>` : '<span class="status-completed" style="color: var(--success); font-weight: 600;">✓ Completed</span>'}</div></div>`;
      ordersList.appendChild(row);
    });
    ordersList.querySelectorAll('.details-btn').forEach(b=>b.onclick=(e)=>{ const id=e.currentTarget.dataset.id; showOrderDetails(id); });
    ordersList.querySelectorAll('.complete-btn').forEach(b=>b.onclick=(e)=>{ const id=e.currentTarget.dataset.id; if(confirm('Mark order '+id+' as completed?')){ const allOrders = get(STORAGE.orders) || []; const order = allOrders.find(o => o.id == id); if(order){ order.status = 'completed'; set(STORAGE.orders, allOrders); loadOrders(); toast('Order marked as completed'); } } });
  }

  function renderCompletedOrders(){
    const completedList = document.getElementById('completedList');
    if(!completedList) return;
    
    const completedOrders = orders.filter(o => o.status === 'completed');
    completedList.innerHTML = '';
    
    if(completedOrders.length === 0) {
      completedList.innerHTML = '<p class="muted">No completed orders yet</p>';
      return;
    }
    
    completedOrders.forEach(o=>{
      const row = el('div','glass'); row.style.padding='10px'; row.style.marginBottom='8px';
      row.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center"><div><strong>Order ${o.id}</strong><div class='muted'>${o.created_at} • ${o.user_name || 'User'}</div></div><div style="display:flex;gap:8px;align-items:center"><strong>₹${o.grand_total.toFixed(2)}</strong><button class='btn outline details-btn' data-id='${o.id}'>Details</button><span class="status-completed" style="color: var(--success); font-weight: 600;">✓ Completed</span></div></div>`;
      completedList.appendChild(row);
    });
    completedList.querySelectorAll('.details-btn').forEach(b=>b.onclick=(e)=>{ const id=e.currentTarget.dataset.id; showOrderDetails(id); });
  }

  addItemBtn.onclick = ()=>{editingId=null;document.getElementById('itemForm').reset();addModal.classList.remove('hidden')}
  document.getElementById('cancelItem').onclick = ()=> addModal.classList.add('hidden')

  itemForm.onsubmit = async (ev)=>{
    ev.preventDefault(); const data={name:document.getElementById('itemName').value,category:document.getElementById('itemCategory').value,price:parseFloat(document.getElementById('itemPrice').value||0),image:document.getElementById('itemImage').value};
    const allItems = get(STORAGE.items) || [];
    if(editingId){
      const item = allItems.find(x => x.id == editingId);
      if(item){ Object.assign(item, data); }
    } else {
      data.id = Date.now().toString();
      allItems.push(data);
    }
    set(STORAGE.items, allItems);
    addModal.classList.add('hidden'); loadItems(); toast('Item saved');
  }

  // Tab switching for orders
  document.querySelectorAll('.tab-btn').forEach(tab => {
    tab.addEventListener('click', (e) => {
      const tabType = e.currentTarget.dataset.tab;
      
      // Update active tab
      document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
      e.currentTarget.classList.add('active');
      
      // Show appropriate content
      if(tabType === 'all') {
        ordersList.style.display = 'block';
        document.getElementById('completedList').style.display = 'none';
        renderOrders();
      } else if(tabType === 'completed') {
        ordersList.style.display = 'none';
        document.getElementById('completedList').style.display = 'block';
        renderCompletedOrders();
      }
    });
  });

  // sidebar nav
  // --- REPLACE LINES 505 to 515 ---
document.querySelectorAll('.side-link').forEach(link => {
    link.addEventListener('click', (e) => {
        const section = e.currentTarget.dataset.section;
        if(!section) return;

        // Hide all
        document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
        document.querySelectorAll('.side-link').forEach(l => l.classList.remove('active'));

        // Show selected
        document.getElementById(section + 'Section')?.classList.remove('hidden');
        e.currentTarget.classList.add('active');

        // Update header
        updateAdminDashboardHeader(section);

        // LOAD DATA based on section
        if(section === 'items') {
          renderItems();
        } else if(section === 'orders') {
          // Show all orders tab by default
          document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
          document.querySelector('.tab-btn[data-tab="all"]').classList.add('active');
          ordersList.style.display = 'block';
          document.getElementById('completedList').style.display = 'none';
          renderOrders();
        } else if(section === 'users') {
          renderUsers();
        } else if(section === 'stats') {
          renderStats();
        }
    });
});
  /*document.querySelectorAll('.side-link').forEach(a=>a.addEventListener('click',(e)=>{
    document.querySelectorAll('.side-link').forEach(x=>x.classList.remove('active'));
    e.currentTarget.classList.add('active');
    const sec = e.currentTarget.dataset.section;
    document.getElementById('itemsSection').classList.toggle('hidden', sec!=='items');
    document.getElementById('ordersSection').classList.toggle('hidden', sec!=='orders');
    document.getElementById('completedSection').classList.toggle('hidden', sec!=='orders');
    const usersSec = document.getElementById('usersSection'); if(usersSec) usersSec.classList.toggle('hidden', sec!=='users');
    const statsSec = document.getElementById('statsSection'); if(statsSec) statsSec.classList.toggle('hidden', sec!=='stats');
    if(sec==='users'){ renderUsers(); } else if(sec==='stats'){ renderStats(); }
    updateAdminDashboardHeader(sec);
  }));*/

  // --- PASTE AT LINE 520 ---
  document.getElementById('adminLogout')?.addEventListener('click', () => {
    localStorage.removeItem(STORAGE.currentAdmin);
    window.location.href = 'index.html';
  });

  loadItems(); loadOrders();
  // renderCompletedOrders(); // TODO: Update to use API
}


// Render registered users for admin
function renderUsers(){
  const usersList = document.getElementById('usersList');
  if(!usersList) return;
  const users = get(STORAGE.users) || [];
  usersList.innerHTML = '';
  if(users.length===0) { usersList.innerHTML = '<p class="muted">No registered users</p>'; return; }
  const table = document.createElement('div');
  table.style.display='grid';
  table.style.gap='8px';
  users.forEach(u=>{
    const row = document.createElement('div');
    row.className='glass';
    row.style.padding='10px';
    row.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center"><div><strong>${u.name}</strong><div class='muted'>${u.email} • ${u.username}</div></div><div style="display:flex;gap:8px"><button class='btn outline details-user' data-username='${u.username}'>Details</button><button class='btn outline del-user' data-username='${u.username}'>Delete</button></div></div>`;
    table.appendChild(row);
  });
  usersList.appendChild(table);
  usersList.querySelectorAll('.details-user').forEach(b=>b.onclick=(e)=>{ const username=e.currentTarget.dataset.username; showUserDetails(username); });
  usersList.querySelectorAll('.del-user').forEach(b=>b.onclick=(e)=>{ const username=e.currentTarget.dataset.username; if(confirm('Delete user '+username+'?')){ let users = get(STORAGE.users) || []; users = users.filter(x=>x.username!==username); set(STORAGE.users,users); renderUsers(); toast('User removed','info'); } });
}

// Render completed orders for admin
function renderCompletedOrders(){
  const holder = document.getElementById('completedList'); if(!holder) return;
  const completed = getCompletedOrders();
  holder.innerHTML = '';
  if(completed.length===0){ holder.innerHTML = '<p class="muted">No completed orders yet</p>'; return; }
  completed.forEach(o=>{
    const row = el('div','glass'); row.style.padding='10px'; row.style.marginBottom='8px';
    row.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center"><div><strong>Order ${o.id}</strong><div class='muted'>Completed: ${o.completedAt} • ${o.customer}</div></div><div style="display:flex;gap:8px;align-items:center"><strong>₹${o.grand.toFixed(2)}</strong><button class='btn outline details-completed' data-id='${o.id}'>Details</button></div></div>`;
    holder.appendChild(row);
  });
  holder.querySelectorAll('.details-completed').forEach(b=>b.onclick=(e)=>{ const id=e.currentTarget.dataset.id; showCompletedOrderDetails(id); });
}

function showCompletedOrderDetails(orderId){
  const completed = getCompletedOrders();
  const order = completed.find(o=>o.id===orderId);
  if(!order) return; const content=document.getElementById('orderDetailsContent');
  content.innerHTML = `<div style="margin:10px 0"><div style="display:flex;justify-content:space-between;margin-bottom:8px"><span><strong>Order ID:</strong></span><span>${order.id}</span></div><div style="display:flex;justify-content:space-between;margin-bottom:8px"><span><strong>Customer:</strong></span><span>${order.customer}</span></div><div style="display:flex;justify-content:space-between;margin-bottom:8px"><span><strong>Date:</strong></span><span>${order.date}</span></div><div style="display:flex;justify-content:space-between;margin-bottom:8px"><span><strong>Completed At:</strong></span><span>${order.completedAt}</span></div></div><hr><h4>Items Ordered</h4><div style="margin:8px 0">${order.items.map(i=>`<div style="display:flex;justify-content:space-between;padding:6px;background:rgba(0,0,0,0.05);margin:4px 0;border-radius:4px"><span>${i.name} x ${i.qty}</span><span>₹${(i.price*i.qty).toFixed(2)}</span></div>`).join('')}</div><hr><div style="display:flex;justify-content:space-between;margin:6px 0"><span>Subtotal:</span><strong>₹${order.subtotal.toFixed(2)}</strong></div><div style="display:flex;justify-content:space-between;margin:6px 0"><span>Tax (10%):</span><strong>₹${order.tax.toFixed(2)}</strong></div><div style="display:flex;justify-content:space-between;margin:6px 0"><span>Discount:</span><strong>₹${order.discount.toFixed(2)}</strong></div><div style="display:flex;justify-content:space-between;margin:6px 0;padding:8px;background:var(--primary);color:white;border-radius:6px"><span><strong>Grand Total</strong></span><strong>₹${order.grand.toFixed(2)}</strong></div>`;
  document.getElementById('orderDetailsModal').classList.remove('hidden');
}

// Show order details modal
async function showOrderDetails(orderId){
  const orders = get(STORAGE.orders) || [];
  const order = orders.find(o => o.id == orderId);
  if(!order) return;
  const content = document.getElementById('orderDetailsContent');
  content.innerHTML = `
    <div style="margin:10px 0">
      <div style="display:flex;justify-content:space-between;margin-bottom:8px"><span><strong>Order ID:</strong></span><span>${order.id}</span></div>
      <div style="display:flex;justify-content:space-between;margin-bottom:8px"><span><strong>Customer:</strong></span><span>${order.user_name}</span></div>
      <div style="display:flex;justify-content:space-between;margin-bottom:8px"><span><strong>Date:</strong></span><span>${new Date(order.created_at).toLocaleString()}</span></div>
      <div style="display:flex;justify-content:space-between;margin-bottom:8px"><span><strong>Status:</strong></span><span>${order.status}</span></div>
    </div>
    <hr>
    <h4>Items Ordered</h4>
    <div style="margin:8px 0">${order.items.map(i=>`<div style="display:flex;justify-content:space-between;padding:6px;background:rgba(0,0,0,0.05);margin:4px 0;border-radius:4px"><span>${i.name} x ${i.quantity}</span><span>₹${(i.price*i.quantity).toFixed(2)}</span></div>`).join('')}</div>
    <hr>
    <div style="display:flex;justify-content:space-between;margin:6px 0"><span>Subtotal:</span><strong>₹${order.total.toFixed(2)}</strong></div>
    <div style="display:flex;justify-content:space-between;margin:6px 0"><span>Tax (10%):</span><strong>₹${order.tax.toFixed(2)}</strong></div>
    <div style="display:flex;justify-content:space-between;margin:6px 0"><span>Discount:</span><strong>₹${order.discount.toFixed(2)}</strong></div>
    <div style="display:flex;justify-content:space-between;margin:6px 0;padding:8px;background:var(--primary);color:white;border-radius:6px"><span><strong>Grand Total</strong></span><strong>₹${order.grand_total.toFixed(2)}</strong></div>
  `;
  document.getElementById('orderDetailsModal').classList.remove('hidden');
}

// Show user details modal
function showUserDetails(username){
  const users = get(STORAGE.users) || [];
  const user = users.find(u => u.username === username);
  if(!user) return;
  const content = document.getElementById('userDetailsContent');
  if(!content) return;
  content.innerHTML = `
    <div style="margin:10px 0">
      <div style="margin-bottom:12px"><span style="color:var(--muted)">Name</span><div style="font-size:1.1rem;font-weight:600">${user.name}</div></div>
      <div style="margin-bottom:12px"><span style="color:var(--muted)">Email</span><div style="font-size:1rem">${user.email}</div></div>
      <div style="margin-bottom:12px"><span style="color:var(--muted)">Username</span><div style="font-size:1rem">${user.username}</div></div>
      <div style="margin-bottom:12px"><span style="color:var(--muted)">User ID</span><div style="font-size:0.9rem;color:var(--muted)">${user.id}</div></div>
    </div>
  `;
  const modal = document.getElementById('userDetailsModal');
  if(modal) modal.classList.remove('hidden');
}

// Render admin stats
function renderStats(){
  const orders = get(STORAGE.orders) || [];
  const users = get(STORAGE.users) || [];
  const items = get(STORAGE.items) || [];

  // Filter completed orders
  const completedOrders = orders.filter(o => o.status === 'completed');
  const allOrders = orders;

  // Basic stats
  const totalRevenue = allOrders.reduce((sum, o) => sum + o.grand_total, 0);
  const totalItemsSold = allOrders.reduce((sum, o) => sum + o.items.reduce((itemSum, i) => itemSum + i.quantity, 0), 0);

  // Today's orders
  const today = new Date().toLocaleDateString();
  const todayOrders = allOrders.filter(o => {
    const orderDate = new Date(o.created_at).toLocaleDateString();
    return orderDate === today;
  }).length;

  // Average order value
  const avgOrderValue = allOrders.length > 0 ? (totalRevenue / allOrders.length).toFixed(2) : 0;

  // Top selling item
  const itemCounts = {};
  allOrders.forEach(o => {
    o.items.forEach(i => {
      itemCounts[i.name] = (itemCounts[i.name] || 0) + i.quantity;
    });
  });
  const topItem = Object.keys(itemCounts).length > 0
    ? Object.keys(itemCounts).reduce((a, b) => itemCounts[a] > itemCounts[b] ? a : b)
    : 'N/A';
  const topItemCount = itemCounts[topItem] || 0;

  // Top category
  const categoryCounts = {};
  allOrders.forEach(o => {
    o.items.forEach(i => {
      const cat = items.find(it => it.name === i.name)?.category || 'Other';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + i.quantity;
    });
  });
  const topCategory = Object.keys(categoryCounts).length > 0
    ? Object.keys(categoryCounts).reduce((a, b) => categoryCounts[a] > categoryCounts[b] ? a : b)
    : 'N/A';
  const topCategoryCount = categoryCounts[topCategory] || 0;

  // Completed orders
  const completedCount = completedOrders.length;

  // Update DOM
  const totalOrdersEl = document.getElementById('totalOrders');
  if(totalOrdersEl) totalOrdersEl.textContent = allOrders.length;

  const totalRevenueEl = document.getElementById('totalRevenue');
  if(totalRevenueEl) totalRevenueEl.textContent = `₹${totalRevenue.toFixed(2)}`;

  const totalUsersEl = document.getElementById('totalUsers');
  if(totalUsersEl) totalUsersEl.textContent = users.length;

  const totalItemsEl = document.getElementById('totalItems');
  if(totalItemsEl) totalItemsEl.textContent = items.length;

  // Secondary KPIs
  const todayOrdersEl = document.getElementById('todayOrders');
  if(todayOrdersEl) todayOrdersEl.textContent = todayOrders;

  const avgOrderValueEl = document.getElementById('avgOrderValue');
  if(avgOrderValueEl) avgOrderValueEl.textContent = `₹${avgOrderValue}`;

  const totalItemsSoldEl = document.getElementById('totalItemsSold');
  if(totalItemsSoldEl) totalItemsSoldEl.textContent = totalItemsSold;

  const avgOrderValEl = document.getElementById('avgOrderVal');
  if(avgOrderValEl) avgOrderValEl.textContent = `₹${avgOrderValue}`;

  const topItemEl = document.getElementById('topItem');
  if(topItemEl) topItemEl.textContent = topItem !== 'N/A' ? topItem : 'N/A';

  const topItemCountEl = document.getElementById('topItemCount');
  if(topItemCountEl) topItemCountEl.textContent = topItem !== 'N/A' ? `${topItemCount} units sold` : '0 units sold';

  const completedCountEl = document.getElementById('completedCount');
  if(completedCountEl) completedCountEl.textContent = completedCount;

  const topCategoryEl = document.getElementById('topCategory');
  if(topCategoryEl) topCategoryEl.textContent = topCategory !== 'N/A' ? topCategory : 'N/A';

  const topCategoryCountEl = document.getElementById('topCategoryCount');
  if(topCategoryCountEl) topCategoryCountEl.textContent = topCategory !== 'N/A' ? `${topCategoryCount} items` : '0 items';

  // Create Chart.js graphs
  setTimeout(()=>{ createCharts(allOrders, items); }, 100);
}

function createCharts(orders, items){
  // Derive colors from CSS variables so charts reflect current theme immediately
  const comp = getComputedStyle(document.documentElement);
  const textColor = (comp.getPropertyValue('--text') || '#1a1a1a').trim();
  const mutedColor = (comp.getPropertyValue('--text-muted') || '#666666').trim();
  const gridColor = (comp.getPropertyValue('--input-border') || 'rgba(0,0,0,0.08)').trim();
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: { legend: { labels: { color: textColor, font: { family: 'Poppins' } } } },
    scales: { 
      y: { ticks: { color: textColor }, grid: { color: gridColor } },
      x: { ticks: { color: textColor }, grid: { color: gridColor } }
    }
  };

  // Revenue Trend Chart
  const revCtx = document.getElementById('revenueChart');
  if(revCtx && typeof Chart !== 'undefined'){
    const daily = {};
    orders.forEach(o=>{
        const d = new Date(o.created_at).toLocaleDateString();
        daily[d] = (daily[d] || 0) + o.grand_total;
    });
    const dates = Object.keys(daily).sort();
    const revenues = dates.map(d => daily[d]);
    if(window.revenueChart instanceof Chart) window.revenueChart.destroy();
    window.revenueChart = new Chart(revCtx, {
      type: 'line',
      data: {
        labels: dates.length > 0 ? dates : ['No Data'],
        datasets: [{
          label: 'Daily Revenue',
          data: revenues.length > 0 ? revenues : [0],
          borderColor: '#ff6b35',
          backgroundColor: 'rgba(255,107,53,0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }]
      },
      options: { ...chartOptions, plugins: { ...chartOptions.plugins, title: { display: true, text: 'Revenue Trend', color: textColor } }, elements: { point: { radius: 3 } } }
    });
  }

  // Orders Chart (Bar Chart)
  const ordCtx = document.getElementById('ordersChart');
  if(ordCtx && typeof Chart !== 'undefined'){
    const cats = [...new Set(orders.flatMap(o=>o.items.map(i=>i.name)))];
    const catCounts = cats.map(c=> orders.reduce((cnt,o)=>cnt + o.items.filter(i=>i.name===c).length, 0));
    
    if(window.ordersChart instanceof Chart) window.ordersChart.destroy();
    window.ordersChart = new Chart(ordCtx, {
      type: 'bar',
      data: {
        labels: cats.length > 0 ? cats.slice(0,5) : ['No Data'],
        datasets: [{
          label: 'Items Sold',
          data: catCounts.length > 0 ? catCounts.slice(0,5) : [0],
          backgroundColor: ['#ff6b35', '#00c896', '#ffa500', '#7c3aed', '#14b8a6']
        }]
      },
      options: { ...chartOptions, plugins: { ...chartOptions.plugins, legend: { labels: { color: textColor } } } }
    });
  }

  // Category Distribution (Pie Chart)
  const catCtx = document.getElementById('categoryChart');
  if(catCtx && typeof Chart !== 'undefined'){
    const cats = [...new Set(items.map(i=>i.category))];
    const catItems = cats.map(c=> items.filter(i=>i.category===c).length);
    
    if(window.categoryChart instanceof Chart) window.categoryChart.destroy();
    window.categoryChart = new Chart(catCtx, {
      type: 'doughnut',
      data: {
        labels: cats.length > 0 ? cats : ['No Data'],
        datasets: [{
          data: catItems.length > 0 ? catItems : [1],
          backgroundColor: ['#ff6b35', '#00c896', '#ffa500', '#7c3aed', '#14b8a6', '#f97316']
        }]
      },
      options: { ...chartOptions, plugins: { ...chartOptions.plugins, legend: { ...chartOptions.plugins.legend, position: 'bottom' } } }
    });
  }
}

/* ----------------------- Global Receipt Functions (for user page & history) ----------------------- */
function generateReceiptText(order){ 
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN');
    const timeStr = now.toLocaleTimeString('en-IN');
    const receiptWidth = 65;
    const customerName = order.customer || JSON.parse(localStorage.getItem('currentUser') || '{}').name || 'Customer';
    
    let out = '';
    out += '\n' + '='.repeat(receiptWidth) + '\n';
    out += '              🍔 FAST FOOD BILLING SYSTEM 🍔\n';
    out += '                   RECEIPT';
    out += '\n' + '='.repeat(receiptWidth) + '\n\n';
    
    out += 'INVOICE INFORMATION:\n';
    out += '-'.repeat(receiptWidth) + '\n';
    out += `Order ID      : ${order.id}\n`;
    out += `Customer Name : ${customerName}\n`;
    out += `Date          : ${dateStr}\n`;
    out += `Time          : ${timeStr}\n`;
    out += `Status        : Completed\n`;
    out += '-'.repeat(receiptWidth) + '\n\n';
    
    out += 'ITEMS ORDERED:\n';
    out += '-'.repeat(receiptWidth) + '\n';
    out += `${'Item Name'.padEnd(30)} ${'Rate'.padStart(10)} ${'Qty'.padStart(6)} ${'Amount'.padStart(13)}\n`;
    out += '-'.repeat(receiptWidth) + '\n';
    
    order.items.forEach(i=>{
      const name = i.name.length > 30 ? i.name.substring(0, 27) + '...' : i.name.padEnd(30);
      const rate = `₹${i.price.toFixed(2)}`.padStart(10);
      const qty = String(i.qty).padStart(6);
      const amount = `₹${(i.price * i.qty).toFixed(2)}`.padStart(13);
      out += `${name} ${rate} ${qty} ${amount}\n`;
    });
    
    out += '-'.repeat(receiptWidth) + '\n\n';
    out += 'BILLING SUMMARY:\n';
    out += '-'.repeat(receiptWidth) + '\n';
    out += `Subtotal (before tax)     : ₹${order.subtotal.toFixed(2).padStart(10)}\n`;
    out += `Tax @ 10%                 : ₹${order.tax.toFixed(2).padStart(10)}\n`;
    
    if(order.discount > 0) {
      out += `Discount Applied          : -₹${order.discount.toFixed(2).padStart(9)}\n`;
    }
    
    out += '-'.repeat(receiptWidth) + '\n';
    out += `TOTAL PAYABLE             : ₹${order.grand.toFixed(2).padStart(10)}\n`;
    out += '-'.repeat(receiptWidth) + '\n\n';
    
    out += 'PAYMENT DETAILS:\n';
    out += `Payment Method  : Cash / Digital Payment\n`;
    out += `Transaction ID  : ${order.id}\n`;
    out += `Received By     : POS System\n\n`;
    
    out += '='.repeat(receiptWidth) + '\n';
    out += '                 THANK YOU FOR YOUR ORDER!\n';
    out += '                  Please visit us again.\n';
    out += '        🌟 We appreciate your business! 🌟\n';
    out += '='.repeat(receiptWidth) + '\n\n';
    
    out += 'Contact Information:\n';
    out += 'Email   : support@fastfoodbilling.com\n';
    out += 'Phone   : +91 98765 43210\n';
    out += 'Website : www.fastfoodbilling.com\n';
    out += 'Hours   : 9:00 AM - 9:00 PM IST\n\n';
    
    out += `Generated : ${now.toLocaleString('en-IN')}\n`;
    out += '© 2026 Fast Food Billing System. All rights reserved.\n';
    out += 'Data Privacy Policy & Terms & Conditions apply.\n\n';
    
    return out;
}

function buildReceiptHTML(order){
    // Adapt API order structure to receipt format
    const adaptedOrder = {
      id: order.id,
      date: new Date(order.created_at).toLocaleString(),
      customer: JSON.parse(localStorage.getItem('currentUser') || '{}').name || 'Customer',
      items: order.items.map(item => ({
        name: item.name,
        price: item.price,
        qty: item.quantity
      })),
      subtotal: order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      tax: order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 0.10,
      discount: order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) > 500 ? order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 0.05 : 0,
      grand: order.grand_total
    };

    return `
    <div style='font-family:Poppins;padding:20px;background:var(--card);color:var(--text);border-radius:8px'>
      <div style='text-align:center;margin-bottom:16px'>
        <div style='font-size:24px;margin-bottom:4px'>🍔 Fast Food Billing</div>
        <div style='font-size:0.9rem;color:var(--text-muted);margin:4px 0'>Modern Point-of-Sale System</div>
        <div style='font-size:0.8rem;color:var(--text-muted)'>support@fastfoodbilling.com | +91 98765 43210</div>
      </div>
      <hr style='border:1px solid rgba(0,0,0,0.06)'>
      <table style='width:100%;font-size:0.9rem;margin:12px 0;color:var(--text)'>
        <tr><td><strong>Invoice #</strong></td><td style='text-align:right'>${adaptedOrder.id}</td></tr>
        <tr><td><strong>Date & Time</strong></td><td style='text-align:right'>${adaptedOrder.date}</td></tr>
        <tr><td><strong>Customer</strong></td><td style='text-align:right'>${adaptedOrder.customer}</td></tr>
      </table>
      <hr style='border:1px solid rgba(0,0,0,0.06)'>
      <div style='margin:12px 0'>
        <div style='display:flex;justify-content:space-between;font-weight:600;padding:8px 0;border-bottom:2px solid rgba(0,0,0,0.12)'>
          <span style='flex:1'>Item</span>
          <span style='flex:0 0 80px;text-align:center'>Rate</span>
          <span style='flex:0 0 60px;text-align:center'>Qty</span>
          <span style='flex:0 0 90px;text-align:right'>Amount</span>
        </div>
        ${adaptedOrder.items.map(i=>`<div style='display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(0,0,0,0.06);align-items:center;color:var(--text)'>
          <span style='flex:1'>${i.name}</span>
          <span style='flex:0 0 80px;text-align:center'>₹${i.price.toFixed(2)}</span>
          <span style='flex:0 0 60px;text-align:center;font-weight:600;font-size:1.1rem'>${String(i.qty).padStart(2, '0')}</span>
          <span style='flex:0 0 90px;text-align:right;font-weight:500'>₹${(i.price*i.qty).toFixed(2)}</span>
        </div>`).join('')}
      </div>
      <hr style='border:1px solid rgba(0,0,0,0.06)'>
      <table style='width:100%;font-size:0.9rem;color:var(--text)'>
        <tr style='border-bottom:1px solid rgba(0,0,0,0.06)'><td>Subtotal</td><td style='text-align:right'>₹${adaptedOrder.subtotal.toFixed(2)}</td></tr>
        <tr style='border-bottom:1px solid rgba(0,0,0,0.06)'><td>Tax (10%)</td><td style='text-align:right'>₹${adaptedOrder.tax.toFixed(2)}</td></tr>
        <tr style='background:rgba(255,235,166,0.6)'><td><strong>Discount Applied</strong></td><td style='text-align:right'><strong>-₹${adaptedOrder.discount.toFixed(2)}</strong></td></tr>
        <tr style='background:linear-gradient(90deg,var(--primary),var(--primary-light));color:white;font-weight:600;font-size:1rem'><td>TOTAL AMOUNT</td><td style='text-align:right'>₹${adaptedOrder.grand.toFixed(2)}</td></tr>
      </table>
      <hr style='border:1px solid rgba(0,0,0,0.06);margin:12px 0'>
      <div style='text-align:center;margin:12px 0;font-size:0.9rem;color:var(--text)'>
        <div style='color:var(--text-muted);margin-bottom:8px'><strong>Payment Method:</strong> Cash/Digital</div>
        <div style='color:var(--text-muted)'>Thank you for your order! ✨</div>
        <div style='color:var(--text-muted);font-size:0.8rem;margin-top:8px'>Please visit again soon!</div>
      </div>
      <hr style='border:1px dashed rgba(0,0,0,0.06)'>
      <div style='text-align:center;font-size:0.75rem;color:var(--text-muted);margin-top:8px'>
        Generated: ${new Date().toLocaleString()}<br>
        © 2026 Fast Food Billing System. All rights reserved.
      </div>
    </div>`;
}

function displayReceipt(order){
    const receiptArea = document.getElementById('receiptArea');
    const receiptSection = document.getElementById('receiptSection');
    const menuSection = document.getElementById('menuSection');
    const cartSection = document.getElementById('cartSection');
    if(receiptSection) receiptSection.classList.remove('hidden');
    if(menuSection) menuSection.classList.add('hidden');
    if(cartSection) cartSection.classList.add('hidden');
    if(!receiptArea) return;
    receiptArea.innerHTML = buildReceiptHTML(order);
}

/* ----------------------- Page: User Dashboard ----------------------- */
function setupUserPage(){
  const menuSection = document.getElementById('menuSection');
  const categoryFilter = document.getElementById('categoryFilter');
  const searchInput = document.getElementById('searchInput');
  const cartSection = document.getElementById('cartSection');
  const cartList = document.getElementById('cartList');
  const subtotalEl = document.getElementById('subtotal');
  const taxEl = document.getElementById('tax');
  const discountEl = document.getElementById('discount');
  const grandEl = document.getElementById('grand');
  const checkoutBtn = document.getElementById('checkoutBtn');
  const clearCartBtn = document.getElementById('clearCart');
  const receiptArea = document.getElementById('receiptArea');
  const receiptSection = document.getElementById('receiptSection');

  const current = JSON.parse(localStorage.getItem('currentUser') || 'null');
  if(current) document.getElementById('currentUserName').textContent = current.name;

  let items = []; // Store items globally for this page
  let cart = []; // Store cart globally for this page

  async function loadItems(){
    items = get(STORAGE.items) || [];
    renderCategories();
    renderMenu();
  }

  function loadCart(){
    cart = get(STORAGE.cart) || [];
    renderCart();
  }

  function renderCategories(){
    const cats = new Set();
    items.forEach(i => cats.add(i.category));
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    cats.forEach(c => {
      const o = document.createElement('option');
      o.value = c;
      o.textContent = c;
      categoryFilter.appendChild(o);
    });
  }

  function renderMenu(){
    menuSection.innerHTML = '';
    const q = searchInput.value.toLowerCase();
    const cat = categoryFilter.value;

    const filteredItems = items.filter(i =>
      (cat === 'all' || i.category === cat) &&
      (i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q))
    );

    filteredItems.forEach(it => {
      const c = el('div','card-item glass');
      c.innerHTML = `<img src='${it.image}' alt='${it.name}' loading="lazy" onerror="this.onerror=null;this.src='https://via.placeholder.com/800x600?text=No+Image';"><div class='card-body'><h4>${it.name}</h4><p class='muted'>${it.category}</p><div style='display:flex;justify-content:space-between;align-items:center;margin-top:8px'><strong>₹${it.price}</strong><button class='btn primary add' data-id='${it.id}'>Add</button></div></div>`;
      menuSection.appendChild(c);
    });

    menuSection.querySelectorAll('.add').forEach(b => b.onclick = (e) => {
      const id = e.currentTarget.dataset.id;
      const item = items.find(i => i.id == id);
      if (item) {
        // Check if item already in cart
        const existingItem = cart.find(c => c.id == id);
        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          cart.push({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: 1
          });
        }
        set(STORAGE.cart, cart);
        loadCart();
        toast('Item added to cart', 'success');
      }
    });
  }

  function renderCart(){
    cartList.innerHTML = '';
    if(cart.length === 0){
      cartList.innerHTML = '<p class="muted">Cart is empty</p>';
    } else {
      cart.forEach(it => {
        const row = el('div','glass');
        row.style.display = 'flex';
        row.style.justifyContent = 'space-between';
        row.style.alignItems = 'center';
        row.style.padding = '8px';
        row.innerHTML = `<div><strong>${it.name}</strong><div class='muted'>₹${it.price} x ${it.quantity}</div></div><div><button class='btn outline dec' data-id='${it.id}'>-</button><button class='btn outline inc' data-id='${it.id}'>+</button><button class='btn primary rem' data-id='${it.id}'>Remove</button></div>`;
        cartList.appendChild(row);
      });

      cartList.querySelectorAll('.inc').forEach(b => b.onclick = (e) => {
        const cartId = e.currentTarget.dataset.id;
        const cartItem = cart.find(c => c.id == cartId);
        if (cartItem) {
          cartItem.quantity += 1;
          set(STORAGE.cart, cart);
          loadCart();
          toast('Quantity updated', 'success');
        }
      });

      cartList.querySelectorAll('.dec').forEach(b => b.onclick = (e) => {
        const cartId = e.currentTarget.dataset.id;
        const cartItem = cart.find(c => c.id == cartId);
        if (cartItem) {
          cartItem.quantity -= 1;
          if (cartItem.quantity <= 0) {
            cart = cart.filter(c => c.id != cartId);
          }
          set(STORAGE.cart, cart);
          loadCart();
          toast('Quantity updated', 'success');
        }
      });

      cartList.querySelectorAll('.rem').forEach(b => b.onclick = (e) => {
        const cartId = e.currentTarget.dataset.id;
        cart = cart.filter(c => c.id != cartId);
        set(STORAGE.cart, cart);
        loadCart();
        toast('Item removed from cart', 'info');
      });
    }

    // billing calculation
    const subtotal = cart.reduce((s,i) => s + (i.price * i.quantity), 0);
    const tax = subtotal * 0.10;
    const discount = subtotal > 500 ? subtotal * 0.05 : 0;
    const grand = subtotal + tax - discount;
    subtotalEl.textContent = `₹${subtotal.toFixed(2)}`;
    taxEl.textContent = `₹${tax.toFixed(2)}`;
    discountEl.textContent = `₹${discount.toFixed(2)}`;
    grandEl.textContent = `₹${grand.toFixed(2)}`;
  }

  checkoutBtn.onclick = async ()=>{
    if(cart.length === 0){ toast('Cart empty','error'); return; }
    const subtotal = cart.reduce((s,i) => s + (i.price * i.quantity), 0);
    const tax = subtotal * 0.10;
    const discount = subtotal > 500 ? subtotal * 0.05 : 0;
    const grand = subtotal + tax - discount;

    // Create order object
    const order = {
      id: uid('order'),
      user_id: current.id,
      user_name: current.name,
      items: cart.map(c => ({ name: c.name, price: c.price, quantity: c.quantity })),
      total: subtotal,
      tax: tax,
      discount: discount,
      grand_total: grand,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    // Save to localStorage
    const orders = get(STORAGE.orders) || [];
    orders.push(order);
    set(STORAGE.orders, orders);

    // Store last order for downloads
    localStorage.setItem('lastOrder', JSON.stringify(order));

    // Clear cart
    set(STORAGE.cart, []);
    cart = [];
    renderCart();

    toast('Order placed','success');
    displayReceipt(order);
  }

  clearCartBtn.onclick = () => {
    if(confirm('Clear cart?')) {
      cart = [];
      set(STORAGE.cart, cart);
      renderCart();
      toast('Cart cleared','info');
    }
  }



  // sidebar navigation
  document.querySelectorAll('.side-link').forEach(a=>a.onclick=e=>{
    document.querySelectorAll('.side-link').forEach(x=>x.classList.remove('active')); e.currentTarget.classList.add('active'); const sec=e.currentTarget.dataset.section; document.getElementById('menuSection').classList.toggle('hidden', sec!=='menu'); document.getElementById('cartSection').classList.toggle('hidden', sec!=='cart'); receiptSection.classList.toggle('hidden', sec!=='receipt'); updateUserDashboardHeader(sec);
  });

  document.getElementById('logoutBtn').onclick = ()=>{ localStorage.removeItem(STORAGE.currentUser); localStorage.removeItem('token'); localStorage.removeItem('currentUser'); window.location.href='index.html'; }

  // search/filter
  searchInput.oninput = renderMenu; categoryFilter.onchange = renderMenu;

  // Load data from API
  loadItems();
  loadCart();
  loadUserOrders();
}

// Render user's past orders (pending + completed)
async function loadUserOrders(){
  const holder = document.getElementById('orderHistory');
  if(!holder) return;

  const orders = await getUserOrdersAPI();
  if(!orders || orders.length === 0){
    holder.innerHTML = '<p class="muted">No previous orders</p>';
    return;
  }

  // sort by date desc
  orders.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));

  holder.innerHTML = '';
  orders.forEach(o=>{
    const row = el('div','glass');
    row.style.padding='10px';
    row.style.marginBottom='8px';
    row.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center"><div><strong>Order ${o.id}</strong><div class='muted'>${new Date(o.created_at).toLocaleString()}</div></div><div style="display:flex;gap:8px;align-items:center"><strong>₹${o.grand_total.toFixed(2)}</strong><button class='btn outline view-order' data-id='${o.id}'>View</button><button class='btn outline txt-order' data-id='${o.id}'>TXT</button><button class='btn outline pdf-order' data-id='${o.id}'>PDF</button><button class='btn primary print-order' data-id='${o.id}'>Print</button></div></div>`;
    holder.appendChild(row);
  });

  // attach handlers - simplified for now
  holder.querySelectorAll('.view-order').forEach(b=>b.onclick=(e)=>{
    const id = e.currentTarget.dataset.id;
    const ord = orders.find(x=>x.id == id);
    if(ord) displayReceipt(ord);
  });

  // TXT download handler
  holder.querySelectorAll('.txt-order').forEach(b=>b.onclick=(e)=>{
    const id = e.currentTarget.dataset.id;
    const ord = orders.find(x=>x.id == id);
    if(ord) {
      const txt = generateReceiptText(ord);
      const blob = new Blob([txt],{type:'text/plain'});
      const a=document.createElement('a');
      a.href=URL.createObjectURL(blob);
      a.download=`receipt_${ord.id}.txt`;
      a.click();
      URL.revokeObjectURL(a.href);
    }
  });

  // PDF download handler
  holder.querySelectorAll('.pdf-order').forEach(b=>b.onclick=async (e)=>{
    const id = e.currentTarget.dataset.id;
    const ord = orders.find(x=>x.id == id);
    if(ord) {
      try {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.2/html2pdf.bundle.min.js');
        const receiptHTML = buildReceiptHTML(ord);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = receiptHTML;
        tempDiv.style.fontFamily = 'Poppins';
        tempDiv.style.padding = '20px';
        tempDiv.style.background = 'var(--card)';
        tempDiv.style.color = 'var(--text)';
        tempDiv.style.borderRadius = '8px';
        document.body.appendChild(tempDiv);

        const opt = {
          margin: 0.3,
          filename: `receipt_${ord.id}.pdf`,
          image: {type:'jpeg', quality:0.98},
          html2canvas: {scale:2},
          jsPDF: {unit:'in', format:'letter', orientation:'portrait'}
        };
        await html2pdf().set(opt).from(tempDiv).save();
        document.body.removeChild(tempDiv);
      } catch(err) {
        toast('PDF generation failed', 'error');
      }
    }
  });

  // Print handler
  holder.querySelectorAll('.print-order').forEach(b=>b.onclick=(e)=>{
    const id = e.currentTarget.dataset.id;
    const ord = orders.find(x=>x.id == id);
    if(ord) {
      const receiptHTML = buildReceiptHTML(ord);
      const w = window.open('', 'PRINT');
      w.document.write(`<html><head><title>Receipt ${ord.id}</title><link href='https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap' rel='stylesheet'><style>body{margin:0;padding:10px;font-family:Poppins,Arial}</style></head><body>${receiptHTML}</body></html>`);
      w.document.close();
      w.focus();
      w.print();
      w.close();
    }
  });
}

/* ----------------------- Page: Auth (user & admin) ----------------------- */
function setupAuthPage(){
  // Tabs
  document.querySelectorAll('.tab').forEach(t=>t.onclick=(e)=>{ document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active')); e.currentTarget.classList.add('active'); const tab=e.currentTarget.dataset.tab; document.querySelectorAll('.form').forEach(f=>f.classList.remove('active')); document.querySelectorAll('.form').forEach(f=>{ if(f.id.toLowerCase().includes(tab)) f.classList.add('active')}); });

  // show/hide passwords
  document.querySelectorAll('.show-pass').forEach(btn=>btn.onclick=(e)=>{ const inp = e.currentTarget.parentElement.querySelector('input'); if(inp.type==='password') inp.type='text'; else inp.type='password'; });

  // User auth
  const signinForm = document.getElementById('signinForm'); const signupForm = document.getElementById('signupForm');
  if(signupForm){ signupForm.onsubmit = async (ev)=>{
    ev.preventDefault(); const name=document.getElementById('suName').value.trim(); const email=document.getElementById('suEmail').value.trim(); const username=document.getElementById('suUser').value.trim(); const pass=document.getElementById('suPass').value; const pass2=document.getElementById('suPass2').value;
    if(!name||!email||!username||!pass) return toast('Please fill all fields','error'); if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return toast('Invalid email','error'); if(pass!==pass2) return toast('Passwords do not match','error');
    const res = await registerUserAPI({name,email,username,password:pass}); if(!res.ok) return toast(res.msg,'error'); toast('Account created','success'); setTimeout(()=>{ window.location.href='user-auth.html'; },800);
  }}
  if(signinForm){ signinForm.onsubmit = async (ev)=>{ ev.preventDefault(); const cred=document.getElementById('signinUser').value.trim(); const pass=document.getElementById('signinPass').value; if(!cred||!pass) return toast('Provide credentials','error'); const res=await loginUserAPI({credential:cred,password:pass}); if(!res.ok) return toast(res.msg,'error'); toast('Welcome back','success'); setTimeout(()=>{ window.location.href='user-dashboard.html'; },600); }}

  // Admin auth
  const adminSignup = document.getElementById('adminSignupForm'); const adminSignin = document.getElementById('adminSigninForm');
  if(adminSignup){ adminSignup.onsubmit = async (ev)=>{ ev.preventDefault(); const name=document.getElementById('adName').value.trim(); const email=document.getElementById('adEmail').value.trim(); const code=document.getElementById('adCode').value.trim(); const username=document.getElementById('adUser').value.trim(); const pass=document.getElementById('adPass').value; const pass2=document.getElementById('adPass2').value; if(pass!==pass2) return toast('Passwords do not match','error'); if(code !== 'ADMIN123') return toast('Invalid admin code','error'); const admins = get(STORAGE.admins) || []; if(admins.find(a => a.username === username)) return toast('Admin username exists','error'); admins.push({id: Date.now().toString(), name, email, username, password: pass}); set(STORAGE.admins, admins); toast('Admin registered','success'); setTimeout(()=>{ window.location.href='admin-auth.html'; },700); }}
  if(adminSignin){ adminSignin.onsubmit = async (ev)=>{ ev.preventDefault(); const cred=document.getElementById('adminSignUser').value.trim(); const pass=document.getElementById('adminSignPass').value; const admins = get(STORAGE.admins) || []; const admin = admins.find(a => (a.username === cred || a.email === cred) && a.password === pass); if(!admin) return toast('Invalid credentials','error'); localStorage.setItem(STORAGE.currentAdmin, JSON.stringify(admin)); toast('Welcome, admin','success'); setTimeout(()=>{ window.location.href='admin-dashboard.html'; },600); }}
}

/* ----------------------- Global init ----------------------- */
function checkPasswordStrength(password){
  if(!password) return 0;
  let strength = 0;
  if(password.length >= 8) strength++;
  if(/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if(/\d/.test(password)) strength++;
  if(/[!@#$%^&*]/.test(password)) strength++;
  return Math.min(strength, 3);
}

function openEditProfileModal(){
  const page = document.body.dataset.page;
  const current = page === 'user-dashboard' ? get(STORAGE.currentUser) : get(STORAGE.currentAdmin);
  if(!current) return toast('No user info','error');
  
  const modal = document.getElementById('editProfileModal');
  if(!modal) return;
  
  // Populate form fields
  document.getElementById('editName').value = current.name || '';
  document.getElementById('editEmail').value = current.email || '';
  document.getElementById('editUsername').value = current.username || '';
  document.getElementById('editPassword').value = '';
  document.getElementById('passwordStrength').style.display = 'none';
  
  modal.classList.add('active');
}

function closeEditProfileModal(){
  const modal = document.getElementById('editProfileModal');
  if(modal) modal.classList.remove('active');
}

function init(){ initTheme(); seedData();
  syncThemeCheckboxes();
  // attach theme toggles (elements with class .themeToggle)
  document.querySelectorAll('.themeToggle').forEach(b=>b.onclick=()=>{ toggleTheme(); updateThemeIcons(); if(typeof renderStats==='function') renderStats(); });
  // attach checkbox theme toggles
  document.querySelectorAll('.checkbox-input').forEach(cb=>{ cb.onchange=()=>{ toggleTheme(); }; });
  // make sure icons reflect saved theme
  updateThemeIcons();
  // add show-pass toggles already wired in setupAuthPage

  const page = document.body.dataset.page;
  if(page==='admin-dashboard'){ const cur = JSON.parse(localStorage.getItem('currentAdmin') || 'null'); if(!cur){ window.location.href='admin-auth.html'; return } setupAdminPage(); }
  if(page==='user-dashboard'){ const cur = JSON.parse(localStorage.getItem('currentUser') || 'null'); if(!cur){ window.location.href='user-auth.html'; return } setupUserPage(); }
  if(page==='user-auth' || page==='admin-auth'){ setupAuthPage(); }

  // index - quick fab
  const fab = document.getElementById('fab'); if(fab) fab.onclick = ()=>{ window.location.href='user-auth.html'; }

  // Add small delay loader mimic
  document.querySelectorAll('.ripple').forEach(b=>b.addEventListener('click', (e)=>{ const r=e.currentTarget; const circle=document.createElement('span'); circle.style.cssText='position:absolute;left:50%;top:50%;width:120px;height:120px;background:rgba(255,255,255,0.12);border-radius:50%;transform:translate(-50%,-50%);opacity:.6;pointer-events:none;'; r.appendChild(circle); setTimeout(()=>circle.remove(),350); }));

  // Settings Modal Handlers
  const settingsBtn = document.getElementById('settingsBtn');
  const settingsModal = document.getElementById('settingsModal');
  const settingsClose = document.getElementById('settingsClose');
  const editProfileBtn = document.getElementById('editProfileBtn');
  
  if(settingsBtn && settingsModal){
    settingsBtn.onclick = ()=>{ 
      settingsModal.classList.add('active');
      renderProfilesList();
    };
  }
  if(settingsClose && settingsModal){
    settingsClose.onclick = ()=>{ settingsModal.classList.remove('active'); };
  }
  
  // Close modal when clicking outside
  if(settingsModal){
    settingsModal.onclick = (e)=>{ if(e.target === settingsModal) settingsModal.classList.remove('active'); };
  }
  
  // Edit Profile Modal Handlers
  const editProfileModal = document.getElementById('editProfileModal');
  const editProfileClose = document.getElementById('editProfileClose');
  const editProfileForm = document.getElementById('editProfileForm');
  const editProfileCancelBtn = document.getElementById('editProfileCancelBtn');
  const editPasswordInput = document.getElementById('editPassword');
  const passwordStrengthDiv = document.getElementById('passwordStrength');
  
  if(editProfileBtn){
    editProfileBtn.onclick = ()=>{ openEditProfileModal(); };
  }
  
  if(editProfileClose){
    editProfileClose.onclick = ()=>{ closeEditProfileModal(); };
  }
  
  if(editProfileCancelBtn){
    editProfileCancelBtn.onclick = ()=>{ closeEditProfileModal(); };
  }
  
  // Close modal when clicking outside
  if(editProfileModal){
    editProfileModal.onclick = (e)=>{ if(e.target === editProfileModal) closeEditProfileModal(); };
  }
  
  // Password strength indicator
  if(editPasswordInput){
    editPasswordInput.oninput = (e)=>{
      const pass = e.target.value;
      if(!pass){
        passwordStrengthDiv.style.display = 'none';
        return;
      }
      passwordStrengthDiv.style.display = 'flex';
      const strength = checkPasswordStrength(pass);
      const bars = passwordStrengthDiv.querySelectorAll('.strength-bar');
      bars.forEach((bar, idx)=>{
        bar.className = 'strength-bar';
        if(idx < strength){
          if(strength === 1) bar.classList.add('weak');
          else if(strength === 2) bar.classList.add('medium');
          else bar.classList.add('strong');
        }
      });
    };
  }
  
  // Edit Profile Form Submission
  if(editProfileForm){
    editProfileForm.onsubmit = async (ev)=>{
      ev.preventDefault();
      
      const page = document.body.dataset.page;
      const isFromList = editProfileForm.dataset.isFromList === 'true';
      const editingUsername = editProfileForm.dataset.editingUsername;
      
      const name = document.getElementById('editName').value.trim();
      const email = document.getElementById('editEmail').value.trim();
      const username = document.getElementById('editUsername').value.trim();
      const password = document.getElementById('editPassword').value;
      
      if(!name) return toast('Name cannot be empty','error');
      if(!email) return toast('Email cannot be empty','error');
      if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return toast('Invalid email','error');
      if(!username) return toast('Username cannot be empty','error');
      
      const allKey = page === 'user-dashboard' ? STORAGE.users : STORAGE.admins;
      const allUsers = get(allKey) || [];
      
      let profileToUpdate;
      
      if(isFromList){
        // Editing from profiles list
        profileToUpdate = allUsers.find(u => u.username === editingUsername);
        if(!profileToUpdate) return toast('Profile not found','error');
        
        // Check if new username is already taken by another profile
        if(username !== editingUsername && allUsers.some(u => u.username === username)){
          return toast('Username already taken','error');
        }
      } else {
        // Editing own profile
        const current = page === 'user-dashboard' ? get(STORAGE.currentUser) : get(STORAGE.currentAdmin);
        if(!current) return toast('No user info','error');
        profileToUpdate = current;
        
        // Check if username already exists
        if(username !== profileToUpdate.username && allUsers.some(u => u.username === username && u.username !== profileToUpdate.username)){
          return toast('Username already taken','error');
        }
      }
      
      const oldUsername = profileToUpdate.username;
      const updated = {
        ...profileToUpdate, 
        name: name, 
        email: email, 
        username: username
      };
      
      if(password){
        updated.password = password;
      }
      
      // Update in all users/admins list
      const idx = allUsers.findIndex(u => u.username === oldUsername);
      if(idx >= 0){
        allUsers[idx] = updated;
        save(allKey, allUsers);
      }
      
      // If editing own profile, update current user/admin
      if(!isFromList){
        const storageKey = page === 'user-dashboard' ? STORAGE.currentUser : STORAGE.currentAdmin;
        save(storageKey, updated);
        
        // Update profile display in settings
        if(document.getElementById('profileName')){
          document.getElementById('profileName').textContent = updated.name;
          document.getElementById('profileEmail').textContent = updated.email;
          document.getElementById('profileAvatar').textContent = updated.name.charAt(0).toUpperCase();
        }
        
        // Update in sidebar
        if(document.getElementById('currentUserName')){
          document.getElementById('currentUserName').textContent = updated.name;
        }
        if(document.getElementById('adminName')){
          document.getElementById('adminName').textContent = updated.name;
        }
      }
      
      toast('Profile updated successfully','success');
      
      // Clear form flags
      editProfileForm.dataset.isFromList = 'false';
      editProfileForm.dataset.editingUsername = '';
      
      // Close modal and refresh profiles list
      closeEditProfileModal();
      renderProfilesList();
    };
  }
  
  // Update profile info in settings modal for dashboards
  function updateProfileInSettings(){
    const current = document.body.dataset.page === 'user-dashboard' ? get(STORAGE.currentUser) : get(STORAGE.currentAdmin);
    if(current && document.getElementById('profileName')){
      const name = current.name || current.username || 'User';
      const email = current.email || current.username || 'user@email.com';
      document.getElementById('profileName').textContent = name;
      document.getElementById('profileEmail').textContent = email;
      document.getElementById('profileAvatar').textContent = name.charAt(0).toUpperCase();
    }
  }
  updateProfileInSettings();
  renderProfilesList();

  // Confirmation Dialog Handlers
  const confirmDialog = document.getElementById('confirmDialog');
  const confirmYes = document.getElementById('confirmYes');
  const confirmNo = document.getElementById('confirmNo');
  let confirmCallback = null;
  
  function showConfirmDialog(title, message, warning = '', callback){
    if(!confirmDialog) return callback(false);
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;
    const warningEl = document.getElementById('confirmWarning');
    if(warning){
      warningEl.textContent = warning;
      warningEl.style.display = 'block';
    } else {
      warningEl.style.display = 'none';
    }
    confirmCallback = callback;
    confirmDialog.classList.add('active');
  }
  
  if(confirmYes){
    confirmYes.onclick = ()=>{
      confirmDialog.classList.remove('active');
      if(confirmCallback) confirmCallback(true);
      confirmCallback = null;
    };
  }
  
  if(confirmNo){
    confirmNo.onclick = ()=>{
      confirmDialog.classList.remove('active');
      if(confirmCallback) confirmCallback(false);
      confirmCallback = null;
    };
  }
  
  // Close dialog when clicking outside
  if(confirmDialog){
    confirmDialog.onclick = (e)=>{
      if(e.target === confirmDialog){
        confirmDialog.classList.remove('active');
        if(confirmCallback) confirmCallback(false);
        confirmCallback = null;
      }
    };
  }
  
  // Create Profile Handler
  const createProfileBtn = document.getElementById('createProfileBtn');
  if(createProfileBtn){
    createProfileBtn.onclick = ()=>{
      const page = document.body.dataset.page;
      if(page === 'user-dashboard'){
        window.location.href = 'user-auth.html#signup';
      } else if(page === 'admin-dashboard'){
        window.location.href = 'admin-auth.html#signup';
      }
    };
  }
  
  // Delete Profile Handler
  const deleteProfileBtn = document.getElementById('deleteProfileBtn');
  if(deleteProfileBtn){
    deleteProfileBtn.onclick = ()=>{
      const page = document.body.dataset.page;
      const current = page === 'user-dashboard' ? get(STORAGE.currentUser) : get(STORAGE.currentAdmin);
      if(!current) return toast('No profile to delete','error');
      
      showConfirmDialog(
        'Delete Profile',
        `Are you sure you want to delete the profile "${current.name}"? This action cannot be undone and all your data will be permanently removed.`,
        '⚠️ This action cannot be undone',
        (confirmed)=>{
          if(!confirmed) return;
          
          const storageKey = page === 'user-dashboard' ? STORAGE.currentUser : STORAGE.currentAdmin;
          const allKey = page === 'user-dashboard' ? STORAGE.users : STORAGE.admins;
          
          // Remove from all users/admins list
          const allUsers = get(allKey) || [];
          const filteredUsers = allUsers.filter(u => u.username !== current.username);
          save(allKey, filteredUsers);
          
          // Clear current user/admin
          localStorage.removeItem(storageKey);
          
          toast('Profile deleted successfully','success');
          
          // Redirect to appropriate page
          const redirectUrl = page === 'user-dashboard' ? 'user-auth.html' : 'admin-auth.html';
          setTimeout(()=>{ window.location.href = redirectUrl; }, 800);
        }
      );
    };
  }

  // Render Profiles List
  function renderProfilesList(){
    const page = document.body.dataset.page;
    const profilesList = document.getElementById('profilesList');
    if(!profilesList) return;
    
    const allKey = page === 'user-dashboard' ? STORAGE.users : STORAGE.admins;
    const allProfiles = get(allKey) || [];
    const current = page === 'user-dashboard' ? get(STORAGE.currentUser) : get(STORAGE.currentAdmin);
    
    if(allProfiles.length === 0){
      profilesList.innerHTML = '<p class="no-profiles-msg">No profiles found</p>';
      return;
    }
    
    profilesList.innerHTML = '';
    allProfiles.forEach(profile => {
      const isActive = current && current.username === profile.username;
      const nameInitial = (profile.name || profile.username || 'U').charAt(0).toUpperCase();
      
      const profileItem = document.createElement('div');
      profileItem.className = `profile-item ${isActive ? 'active' : ''}`;
      profileItem.innerHTML = `
        <div class="profile-item-info">
          <div class="profile-item-avatar">${nameInitial}</div>
          <div class="profile-item-details">
            <p class="profile-item-name">${profile.name || profile.username}</p>
            <p class="profile-item-email">${profile.email || 'No email'}</p>
            ${isActive ? '<span class="profile-item-active-badge">Active</span>' : ''}
          </div>
        </div>
        <div class="profile-item-actions">
          <button class="profile-item-btn edit-profile-item" data-username="${profile.username}" title="Edit"><i class="fas fa-edit"></i> Edit</button>
          <button class="profile-item-btn delete delete-profile-item" data-username="${profile.username}" title="Delete"><i class="fas fa-trash-alt"></i> Delete</button>
        </div>
      `;
      profileItem.dataset.username = profile.username;
      profilesList.appendChild(profileItem);
    });
    
    // Wire up profile item click handler to switch active profile
    profilesList.querySelectorAll('.profile-item').forEach(item => {
      item.addEventListener('click', (e) => {
        // Don't switch if clicking on edit/delete buttons
        if(e.target.closest('.profile-item-btn')) return;
        
        const username = item.dataset.username;
        switchProfile(username);
      });
    });
    
    // Wire up edit handlers
    profilesList.querySelectorAll('.edit-profile-item').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        const username = e.currentTarget.dataset.username;
        const allProfiles = get(allKey) || [];
        const profile = allProfiles.find(p => p.username === username);
        if(profile){
          // Populate edit form with selected profile
          document.getElementById('editName').value = profile.name || '';
          document.getElementById('editEmail').value = profile.email || '';
          document.getElementById('editUsername').value = profile.username || '';
          document.getElementById('editPassword').value = '';
          document.getElementById('passwordStrength').style.display = 'none';
          
          // Store the username being edited
          document.getElementById('editProfileForm').dataset.editingUsername = username;
          document.getElementById('editProfileForm').dataset.isFromList = 'true';
          
          // Open edit modal
          const editProfileModal = document.getElementById('editProfileModal');
          if(editProfileModal) editProfileModal.classList.add('active');
        }
      };
    });
    
    // Wire up delete handlers
    profilesList.querySelectorAll('.delete-profile-item').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        const username = e.currentTarget.dataset.username;
        const allProfiles = get(allKey) || [];
        const profile = allProfiles.find(p => p.username === username);
        if(profile){
          const page = document.body.dataset.page;
          const current = page === 'user-dashboard' ? get(STORAGE.currentUser) : get(STORAGE.currentAdmin);
          
          // Prevent deleting the currently active profile
          if(current && current.username === username){
            return toast('Cannot delete active profile. Switch to another profile first.','warning');
          }
          
          showConfirmDialog(
            'Delete Profile',
            `Are you sure you want to delete the profile "${profile.name}"? This action cannot be undone.`,
            '⚠️ This action cannot be undone',
            (confirmed) => {
              if(!confirmed) return;
              
              const allKey = page === 'user-dashboard' ? STORAGE.users : STORAGE.admins;
              const allUsers = get(allKey) || [];
              const filteredUsers = allUsers.filter(u => u.username !== username);
              save(allKey, filteredUsers);
              
              toast('Profile deleted successfully','success');
              renderProfilesList();
            }
          );
        }
      };
    });
  }
  
  // Switch active profile
  function switchProfile(username){
    const page = document.body.dataset.page;
    const allKey = page === 'user-dashboard' ? STORAGE.users : STORAGE.admins;
    const currentKey = page === 'user-dashboard' ? STORAGE.currentUser : STORAGE.currentAdmin;
    
    const allProfiles = get(allKey) || [];
    const profile = allProfiles.find(p => p.username === username);
    
    if(!profile){
      return toast('Profile not found','error');
    }
    
    const currentProfile = get(currentKey);
    if(currentProfile && currentProfile.username === username){
      return toast('Already using this profile','info');
    }
    
    // Update current user/admin
    save(currentKey, profile);
    
    // Update sidebar and header display
    if(page === 'user-dashboard'){
      const userNameEl = document.getElementById('currentUserName') || document.querySelector('[data-user-name]');
      if(userNameEl){
        userNameEl.textContent = profile.name || profile.username;
      }
    } else {
      const adminNameEl = document.getElementById('adminName') || document.querySelector('[data-admin-name]');
      if(adminNameEl){
        adminNameEl.textContent = profile.name || profile.username;
      }
    }
    
    // Update settings modal profile info
    const profileNameEl = document.getElementById('profileName');
    const profileEmailEl = document.getElementById('profileEmail');
    const profileAvatarEl = document.getElementById('profileAvatar');
    
    if(profileNameEl) profileNameEl.textContent = profile.name || profile.username;
    if(profileEmailEl) profileEmailEl.textContent = profile.email || 'No email';
    if(profileAvatarEl) profileAvatarEl.textContent = (profile.name || profile.username).charAt(0).toUpperCase();
    
    // Refresh profiles list to update active badge
    renderProfilesList();
    
    toast(`Switched to ${profile.name || profile.username}`,'success');
  }
  
  // Sync across tabs/pages when storage changes (keep histories and admin lists fresh)
  window.addEventListener('storage', (ev)=>{
    try{
      if(ev.key===STORAGE.orders || ev.key===STORAGE.completedOrders){ if(typeof renderUserOrderHistory==='function') renderUserOrderHistory(); if(typeof renderOrders==='function') renderOrders(); if(typeof renderCompletedOrders==='function') renderCompletedOrders(); if(typeof renderStats==='function') renderStats(); }
      if(ev.key===STORAGE.items){ if(typeof renderItems==='function') renderItems(); if(typeof renderMenu==='function') renderMenu(); }
    }catch(err){ /* ignore */ }
  });
}

/* Update theme toggle icons (moon/sun) across page */
function updateThemeIcons(){
  const cur = document.documentElement.getAttribute('data-theme') || 'light';
  document.querySelectorAll('.themeToggle').forEach(btn=>{
    const i = btn.querySelector('i');
    if(!i) return;
    if(cur==='dark'){ i.className='fas fa-sun'; } else { i.className='fas fa-moon'; }
  });
}

// Dynamic script loader
function loadScript(src){
  return new Promise((resolve,reject)=>{
    if(document.querySelector(`script[src="${src}"]`)) return resolve();
    const s=document.createElement('script'); s.src=src; s.onload=resolve; s.onerror=reject; document.head.appendChild(s);
  });
}

document.addEventListener('DOMContentLoaded', init);


/* --- ADD TO script.js (User Dashboard Section) --- */

// 1. Fixed Checkout to generate receipt
const checkoutBtn = document.getElementById('checkoutBtn');
if(checkoutBtn) {
    checkoutBtn.onclick = async () => {
        const cart = await getCartAPI();
        if(cart.length === 0) return toast("Cart is empty", "error");
        
        // Logic to calculate totals
        const subtotal = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
        const tax = subtotal * 0.1;
        const grand = subtotal + tax;

        const orderData = {
            items: cart,
            subtotal,
            tax,
            grand_total: grand,
            created_at: new Date().toLocaleString()
        };

        const result = await createOrderAPI(orderData);
        if(result) {
            renderReceipt(orderData); // Show receipt immediately
            document.querySelector('[data-section="receipt"]').click(); // Switch to receipt tab
        }
    };
}

// 2. Receipt Rendering Logic
function renderReceipt(order) {
    const area = document.getElementById('receiptArea');
    if(!area) return;
    area.innerHTML = buildReceiptHTML(order);
}

function buildReceiptText(order){
    const adaptedOrder = {
      id: order.id,
      date: new Date(order.created_at).toLocaleString(),
      customer: JSON.parse(localStorage.getItem('currentUser') || '{}').name || 'Customer',
      items: order.items.map(item => ({
        name: item.name,
        price: item.price,
        qty: item.quantity
      })),
      subtotal: order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      tax: order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 0.10,
      discount: order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) > 500 ? order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 0.05 : 0,
      grand: order.grand_total
    };

    let text = '';
    text += '================================\n';
    text += '        FAST FOOD BILLING       \n';
    text += '   Modern Point-of-Sale System  \n';
    text += '================================\n\n';
    text += 'Invoice #: ' + adaptedOrder.id + '\n';
    text += 'Date & Time: ' + adaptedOrder.date + '\n';
    text += 'Customer: ' + adaptedOrder.customer + '\n\n';
    text += '--------------------------------\n';
    text += 'Item                    Rate   Qty   Amount\n';
    text += '--------------------------------\n';
    
    adaptedOrder.items.forEach(item => {
        const name = item.name.padEnd(20, ' ');
        const rate = ('₹' + item.price.toFixed(2)).padStart(6, ' ');
        const qty = String(item.qty).padStart(3, ' ');
        const amount = ('₹' + (item.price * item.qty).toFixed(2)).padStart(8, ' ');
        text += name + rate + qty + amount + '\n';
    });
    
    text += '--------------------------------\n';
    text += 'Subtotal:              ₹' + adaptedOrder.subtotal.toFixed(2) + '\n';
    text += 'Tax (10%):             ₹' + adaptedOrder.tax.toFixed(2) + '\n';
    text += 'Discount:             -₹' + adaptedOrder.discount.toFixed(2) + '\n';
    text += '================================\n';
    text += 'TOTAL AMOUNT:          ₹' + adaptedOrder.grand.toFixed(2) + '\n';
    text += '================================\n\n';
    text += 'Payment Method: Cash/Digital\n';
    text += 'Thank you for your order! ✨\n\n';
    text += 'support@fastfoodbilling.com\n';
    text += '+91 98765 43210\n';
    
    return text;
}

// 3. Fix Download Buttons
document.getElementById('downloadTxt')?.addEventListener('click', () => {
    const order = JSON.parse(localStorage.getItem('lastOrder') || '{}');
    if(!order.id) return;
    
    // Create formatted text receipt
    const textReceipt = buildReceiptText(order);
    const blob = new Blob([textReceipt], { type: 'text/plain' });
    const anchor = document.createElement('a');
    anchor.download = 'receipt_' + order.id + '.txt';
    anchor.href = window.URL.createObjectURL(blob);
    anchor.click();
    URL.revokeObjectURL(anchor.href);
});

document.getElementById('downloadPdf')?.addEventListener('click', async () => {
    const order = JSON.parse(localStorage.getItem('lastOrder') || '{}');
    if(!order.id) return;
    
    try {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.2/html2pdf.bundle.min.js');
        
        // Temporarily apply light theme for PDF generation
        const originalTheme = document.documentElement.getAttribute('data-theme');
        document.documentElement.setAttribute('data-theme', 'light');
        
        const opt = { 
            margin: 0.3, 
            filename: 'receipt_' + order.id + '.pdf', 
            image: { type: 'jpeg', quality: 0.98 }, 
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };
        
        const receiptArea = document.getElementById('receiptArea');
        await html2pdf().set(opt).from(receiptArea).save();
        
        // Restore original theme
        if(originalTheme) {
            document.documentElement.setAttribute('data-theme', originalTheme);
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
        
        toast('PDF downloaded successfully');
    } catch(err) { 
        console.error('PDF generation error:', err);
        toast('PDF generation failed', 'error'); 
    }
});

document.getElementById('printBtn')?.addEventListener('click', () => {
    window.print();
});

/* ----------------------- End of script.js ----------------------- */

