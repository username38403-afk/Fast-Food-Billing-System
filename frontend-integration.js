// frontend-integration.js
// Example code showing how to integrate your existing frontend with the new backend API

// Replace localStorage operations with API calls

// ==================== AUTHENTICATION ====================

// Replace your existing loginUser function
async function loginUserAPI({ credential, password }) {
  try {
    const response = await fetch('http://localhost:5000/api/login', {
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
    console.error('Login error:', error);
    return { ok: false, msg: 'Network error' };
  }
}

// Replace your existing registerUser function
async function registerUserAPI({ name, email, username, password }) {
  try {
    const response = await fetch('http://localhost:5000/api/register', {
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
    console.error('Registration error:', error);
    return { ok: false, msg: 'Network error' };
  }
}

// ==================== ITEMS ====================

// Replace your existing getItems function
async function getItemsAPI() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5000/api/items', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
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

// ==================== CART ====================

// Replace your existing getCart function
async function getCartAPI() {
  try {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const userId = user.id;

    if (!userId) return [];

    const response = await fetch(`http://localhost:5000/api/cart/${userId}`, {
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

// Replace your existing addToCart function
async function addToCartAPI(itemId, quantity = 1) {
  try {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const userId = user.id;

    if (!userId) {
      toast('Please login first', 'error');
      return;
    }

    const response = await fetch('http://localhost:5000/api/cart', {
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
      // Refresh cart display
      renderCart();
    } else {
      toast(data.message, 'error');
    }
  } catch (error) {
    console.error('Add to cart error:', error);
    toast('Failed to add to cart', 'error');
  }
}

// Replace your existing saveCart function
async function updateCartItemAPI(cartId, quantity) {
  try {
    const token = localStorage.getItem('token');

    const response = await fetch(`http://localhost:5000/api/cart/${cartId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ quantity })
    });

    const data = await response.json();

    if (data.success) {
      renderCart();
    } else {
      toast(data.message, 'error');
    }
  } catch (error) {
    console.error('Update cart error:', error);
    toast('Failed to update cart', 'error');
  }
}

// Replace cart item removal
async function removeFromCartAPI(cartId) {
  try {
    const token = localStorage.getItem('token');

    const response = await fetch(`http://localhost:5000/api/cart/${cartId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (data.success) {
      renderCart();
    } else {
      toast(data.message, 'error');
    }
  } catch (error) {
    console.error('Remove from cart error:', error);
    toast('Failed to remove item', 'error');
  }
}

// ==================== ORDERS ====================

// Replace your existing checkout/order creation
async function createOrderAPI(cartItems, total, tax, discount, grandTotal) {
  try {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const userId = user.id;

    if (!userId) {
      toast('Please login first', 'error');
      return false;
    }

    // Transform cart items to order items format
    const orderItems = cartItems.map(item => ({
      item_id: item.item_id,
      quantity: item.quantity,
      price: item.price
    }));

    const response = await fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: userId,
        items: orderItems,
        total,
        tax,
        discount,
        grand_total: grandTotal
      })
    });

    const data = await response.json();

    if (data.success) {
      toast('Order placed successfully!', 'success');
      // Clear local cart
      clearCart();
      return true;
    } else {
      toast(data.message, 'error');
      return false;
    }
  } catch (error) {
    console.error('Order creation error:', error);
    toast('Failed to place order', 'error');
    return false;
  }
}

// ==================== ADMIN FUNCTIONS ====================

// Admin login
async function loginAdminAPI({ credential, password }) {
  try {
    const response = await fetch('http://localhost:5000/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ credential, password })
    });

    const data = await response.json();

    if (data.success) {
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('currentAdmin', JSON.stringify(data.admin));
      return { ok: true, admin: data.admin };
    } else {
      return { ok: false, msg: data.message };
    }
  } catch (error) {
    console.error('Admin login error:', error);
    return { ok: false, msg: 'Network error' };
  }
}

// Admin: Create item
async function createItemAPI(itemData) {
  try {
    const token = localStorage.getItem('adminToken');

    const response = await fetch('http://localhost:5000/api/items', {
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

// Admin: Update item
async function updateItemAPI(itemId, itemData) {
  try {
    const token = localStorage.getItem('adminToken');

    const response = await fetch(`http://localhost:5000/api/items/${itemId}`, {
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

// Admin: Delete item
async function deleteItemAPI(itemId) {
  try {
    const token = localStorage.getItem('adminToken');

    const response = await fetch(`http://localhost:5000/api/items/${itemId}`, {
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

// ==================== UTILITY FUNCTIONS ====================

// Check if user is authenticated
function isAuthenticated() {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('currentUser');
  return token && user;
}

// Check if admin is authenticated
function isAdminAuthenticated() {
  const token = localStorage.getItem('adminToken');
  const admin = localStorage.getItem('currentAdmin');
  return token && admin;
}

// Logout user
function logoutUser() {
  localStorage.removeItem('token');
  localStorage.removeItem('currentUser');
  window.location.href = 'index.html';
}

// Logout admin
function logoutAdmin() {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('currentAdmin');
  window.location.href = 'index.html';
}

// ==================== MIGRATION NOTES ====================

/*
To migrate your existing frontend:

1. Replace localStorage-based functions with API calls
2. Update your seedData() function to not populate items (let API handle it)
3. Add authentication checks before showing user-specific content
4. Update cart operations to use API calls
5. Modify order creation to use the new API
6. Add error handling for network requests
7. Update admin functions to use API calls with authentication

Key changes:
- getItems() -> getItemsAPI()
- addToCart() -> addToCartAPI()
- getCart() -> getCartAPI()
- loginUser() -> loginUserAPI()
- registerUser() -> registerUserAPI()

Remember to start the backend server before testing the frontend!
*/