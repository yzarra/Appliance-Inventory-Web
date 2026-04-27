// appliance page 

import { useState, useEffect } from 'react';

// dashboard 
function Dashboard({ token, onLogout }) {

  // variables
  const [appliances, setAppliances] = useState([]);       // array of all appliances from DB
  const [loading, setLoading] = useState(true);            
  const [error, setError] = useState('');                  

  // search state
  const [searchBrand, setSearchBrand] = useState('');
  const [searchPrice, setSearchPrice] = useState('');
  const [searchResults, setSearchResults] = useState(null); 

  // add appliance state
  const [showAdd, setShowAdd] = useState(false);          
  const [newType, setNewType] = useState('Fridge');
  const [newBrand, setNewBrand] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [addError, setAddError] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  // edit appliance state
  const [editingId, setEditingId] = useState(null);       
  const [editType, setEditType] = useState('');
  const [editBrand, setEditBrand] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editError, setEditError] = useState('');

  // currency converter state -> for ExchangeRate API
  const [currency, setCurrency] = useState(localStorage.getItem('currency') || 'USD');
  const [rate, setRate] = useState(1);                   
  const [rateLoading, setRateLoading] = useState(false);

  // valid appliance types 
  const validTypes = ['Fridge', 'Air Conditioner', 'Washer', 'Dryer',
    'Freezer', 'Stove', 'Dishwasher', 'Water Heater', 'Microwave'];

  // card style
  const glassCard = {
    background: 'rgba(154, 152, 200, 0.15)',
    border: '1px solid rgba(154, 152, 200, 0.3)',
    backdropFilter: 'blur(12px)',
    borderRadius: '14px',
    padding: '20px',
  };

  // input field style
  const inputStyle = {
    padding: '9px 13px',
    borderRadius: '8px',
    border: '1px solid rgba(154,152,200,0.4)',
    background: 'rgba(154,152,200,0.1)',
    color: '#f5e0d8',
    outline: 'none',
    fontSize: '13px',
    width: '100%',
    boxSizing: 'border-box',
    marginBottom: '10px',
  };

  // main button style
  const coralBtn = {
    padding: '8px 18px',
    borderRadius: '8px',
    border: '1.5px solid rgba(212,106,72,0.7)',
    background: 'rgba(212,106,72,0.2)',
    color: '#d46a48',
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer',
  };

  // secondary button style
  const ghostBtn = {
    padding: '8px 18px',
    borderRadius: '8px',
    border: '1.5px solid rgba(154,152,200,0.4)',
    background: 'rgba(154,152,200,0.1)',
    color: 'rgba(245,224,216,0.7)',
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer',
  };

  // select dropdown style
  const selectStyle = {
    padding: '9px 13px',
    borderRadius: '8px',
    border: '1px solid rgba(154,152,200,0.4)',
    background: '#2a2850',
    color: '#f5e0d8',
    outline: 'none',
    fontSize: '13px',
    width: '100%',
    boxSizing: 'border-box',
    marginBottom: '10px',
  };

  // auth headers
  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}` // attach JWT token like a wristband on every request
  };

// eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchAppliances();
    const savedCurrency = localStorage.getItem('currency') || 'USD';
    fetchRate(savedCurrency);
  }, []);

  const fetchAppliances = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://appliance-inventory-web-production.up.railway.app/api/appliances', {
        headers: authHeaders
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAppliances(data); 
    } catch (err) {
      setError('Failed to load appliances');
    }
    setLoading(false);
  };

 // add appliance function
  const handleAdd = async () => {
    setAddError('');
    if (!newBrand || !newPrice) return setAddError('All fields are required');
    if (newPrice < 1) return setAddError('Price must be at least $1');
    setAddLoading(true);

    try {
      // basically call addAppliance() in controller
      const res = await fetch('https://appliance-inventory-web-production.up.railway.app/api/appliances', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ type: newType, brand: newBrand, price: parseFloat(newPrice) / rate})
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Add new appliance to existing array
      setAppliances(prev => [...prev, data]);
      setShowAdd(false);
      setNewBrand('');
      setNewPrice('');
      setNewType('Fridge');
    } catch (err) {
      setAddError(err.message || 'Failed to add appliance');
    }
    setAddLoading(false);
  };

  // edit appliance function
  const startEdit = (appliance) => {
    setEditingId(appliance.serial);
    setEditType(appliance.type);
    setEditBrand(appliance.brand);
    setEditPrice(appliance.price * rate); 
    setEditError('');
  };

  // When user clicks "Save" on edit form
  const handleEdit = async (serial) => {
    setEditError('');
    try {
      // call editAppliance method in controller
      const res = await fetch(`https://appliance-inventory-web-production.up.railway.app/api/appliances/${serial}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ type: editType, brand: editBrand, price: parseFloat(editPrice) / rate })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Update that appliance in the array  
      setAppliances(prev => prev.map(a => a.serial === serial ? data : a));
      setEditingId(null); // close edit form
    } catch (err) {
      setEditError(err.message || 'Failed to update appliance');
    }
  };
  // delete appliance function
  const handleDelete = async (serial) => {
    // confirm before deleting
    if (!window.confirm('Are you sure you want to delete this appliance?')) return;
    try {      // call delete method in controller
      const res = await fetch(`https://appliance-inventory-web-production.up.railway.app/api/appliances/${serial}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      // if delete failed, throw error
      if (!res.ok) throw new Error('Failed to delete appliance');
    // Remove deleted appliance from the array
        setAppliances(prev => prev.filter(a => a.serial !== serial));
    } catch (err) {
      setError('Failed to delete appliance');
    }
  };

  // search function
  const handleSearch = async (type) => {
    try {
      // construct query string based on search type
      const query = type === 'brand'
        ? `?brand=${searchBrand}`
        : `?maxPrice=${searchPrice / rate}`; 

      const res = await fetch(`https://appliance-inventory-web-production.up.railway.app/api/appliances/search${query}`, {
        headers: authHeaders
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSearchResults(data); 
    } catch (err) {
      setError('Search failed');
    }
  };

  const clearSearch = () => {
    setSearchResults(null);
    setSearchBrand('');
    setSearchPrice('');
  };

  // fetch exchange rate for selected currency
  const fetchRate = async (targetCurrency) => {
    if (targetCurrency === 'USD') { setRate(1); return; } // USD is base, no conversion needed
    setRateLoading(true);
    try {
      // import ExchangeRate API 
      const res = await fetch(`https://api.exchangerate-api.com/v4/latest/USD`);
      const data = await res.json();
      setRate(data.rates[targetCurrency] || 1); // get the rate for selected currency
    } catch {
      setRate(1); // fallback to 1 if API fails
    }
    setRateLoading(false);
  };

  const handleCurrencyChange = (e) => {
    const selected = e.target.value;
    setCurrency(selected);
    localStorage.setItem('currency', selected);
    fetchRate(selected);
  };

  // helper method. Convert a USD price to the selected currency
  const convertPrice = (usdPrice) => {
    return (parseFloat(usdPrice) * rate).toFixed(2);
  };

  // det which appliances to display
  const displayedAppliances = searchResults !== null ? searchResults : appliances;

  // rendering dashboard UI
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #22223a 0%, #32325e 100%)',
      padding: '24px'
    }}>

      {/* ── NAVBAR ── */}
      <div style={{
        ...glassCard,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        padding: '14px 24px',
      }}>
        <h1 style={{ 
            color: '#f5e0d8', 
            fontSize: '30px', 
            fontWeight: '700',
            fontFamily: "'Bebas Neue', sans-serif",
            textShadow: '2px 2px 0 #d46a48, 1px 1px 0 rgba(0,0,0,0.35)',            letterSpacing: '3px',
            }}>
          Appliance Inventory
        </h1>
        {/* Appliance count badge, like applianceCount in Java */}
    <span style={{
        background: 'rgba(212,106,72,0.2)',
        border: '1.5px solid rgba(212,106,72,0.7)',
        color: '#d46a48',
        fontSize: '12px',
        fontWeight: '600',
        padding: '3px 10px',
        borderRadius: '20px',
    }}>
        {appliances.length} {appliances.length === 1 ? 'appliance' : 'appliances'}
    </span>
        <button style={coralBtn} onClick={onLogout}>Log out</button>
      </div>

      {/* ── CONTROLS ROW — Add + Search + Currency ── */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>

        {/* Add Appliance Button */}
        <button style={coralBtn} onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? '✕ Cancel' : '+ Add Appliance'}
        </button>

        {/* Currency Selector. Calls ExchangeRate API on change */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'rgba(245,224,216,0.7)', fontSize: '13px' }}>Currency:</span>
          <select
            value={currency}
            onChange={handleCurrencyChange}
            style={{ ...selectStyle, width: 'auto', marginBottom: 0, padding: '8px 12px' }}
          >
            {/* Common currencies to toggle between */}
            {['USD', 'CAD', 'EUR', 'GBP', 'JPY', 'AUD', 'CHF', 'CNY'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {rateLoading && <span style={{ color: 'rgba(245,224,216,0.5)', fontSize: '12px' }}>fetching rate...</span>}
        </div>
      </div>

      {/* ── ADD APPLIANCE FORM — only visible when showAdd is true ── */}
      {showAdd && (
        <div style={{ ...glassCard, marginBottom: '24px', maxWidth: '480px' }}>
          <h2 style={{ color: '#f5e0d8', fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
            New Appliance
          </h2>
          {addError && <p style={{ color: '#d46a48', fontSize: '13px', marginBottom: '10px' }}>{addError}</p>}

          {/* Type dropdown — like your valid types check in Java */}
          <select style={selectStyle} value={newType} onChange={e => setNewType(e.target.value)}>
            {validTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <input style={inputStyle} placeholder="Brand" value={newBrand} onChange={e => setNewBrand(e.target.value)} />
          <input style={inputStyle} placeholder={`Price (${currency})`} type="number" value={newPrice} onChange={e => setNewPrice(e.target.value)} />

          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button style={coralBtn} onClick={handleAdd} disabled={addLoading}>
              {addLoading ? 'Adding...' : 'Add Appliance'}
            </button>
            <button style={ghostBtn} onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* ── SEARCH BAR ── */}
      <div style={{ ...glassCard, marginBottom: '24px' }}>
        <h2 style={{ color: '#f5e0d8', fontSize: '15px', fontWeight: '600', marginBottom: '14px' }}>Search</h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>

          {/* Search by brand */}
          <div style={{ flex: 1, minWidth: '160px' }}>
            <p style={{ color: 'rgba(245,224,216,0.6)', fontSize: '12px', marginBottom: '6px' }}>By Brand</p>
            <input
              style={{ ...inputStyle, marginBottom: 0 }}
              placeholder="e.g. Samsung"
              value={searchBrand}
              onChange={e => setSearchBrand(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch('brand')}
            />
          </div>
          <button style={coralBtn} onClick={() => handleSearch('brand')}>Search</button>

          {/* Divider */}
          <span style={{ color: 'rgba(245,224,216,0.3)', alignSelf: 'center' }}>|</span>

          {/* Search by max price */}
          <div style={{ flex: 1, minWidth: '160px' }}>
            <p style={{ color: 'rgba(245,224,216,0.6)', fontSize: '12px', marginBottom: '6px' }}>Max Price ({currency})</p>
            <input
              style={{ ...inputStyle, marginBottom: 0 }}
              placeholder="e.g. 500"
              type="number"
              value={searchPrice}
              onChange={e => setSearchPrice(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch('price')}
            />
          </div>
          <button style={coralBtn} onClick={() => handleSearch('price')}>Search</button>

          {/* Clear search — only shows when search results are active */}
          {searchResults !== null && (
            <button style={ghostBtn} onClick={clearSearch}>✕ Clear</button>
          )}
        </div>
      </div>

      {/* ── APPLIANCE CARDS GRID ── */}
      {loading ? (
        <p style={{ color: 'rgba(245,224,216,0.6)' }}>Loading appliances...</p>
      ) : error ? (
        <p style={{ color: '#d46a48' }}>{error}</p>
      ) : displayedAppliances.length === 0 ? (
        <p style={{ color: 'rgba(245,224,216,0.5)', fontSize: '14px' }}>
          {searchResults !== null ? 'No appliances match your search.' : 'No appliances yet. Add your first one!'}
        </p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
          {displayedAppliances.map(appliance => (
            <div key={appliance.serial} style={glassCard}>

              {/* ── VIEW MODE — normal card display ── */}
              {editingId !== appliance.serial ? (
                <>
                  {/* Serial badge */}
                  <div style={{
                    display: 'inline-block',
                    background: '#d46a48',
                    color: '#22223a',
                    fontSize: '10px',
                    fontWeight: '700',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    marginBottom: '10px'
                  }}>
                    Serial #{appliance.serial}
                  </div>

                  {/* Brand and type */}
                  <p style={{ color: 'rgba(245,224,216,0.65)', fontSize: '11px', marginBottom: '2px' }}>
                    {appliance.brand} · {appliance.type}
                  </p>

                  {/* Price — converted if currency selected */}
                  <p style={{ color: '#f5e0d8', fontSize: '22px', fontWeight: '700', marginBottom: '4px' }}>
                    {currency} {convertPrice(appliance.price)}
                  </p>

                  {/* Show original USD price if converted */}
                  {currency !== 'USD' && (
                    <p style={{ color: 'rgba(245,224,216,0.4)', fontSize: '11px', marginBottom: '12px' }}>
                      USD ${parseFloat(appliance.price).toFixed(2)}
                    </p>
                  )}

                  {/* Edit and Delete buttons */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <button style={{ ...ghostBtn, fontSize: '12px', padding: '6px 14px' }}
                        onClick={() => startEdit(appliance)}>
                        Edit
                    </button>
                    <button style={{ 
                        fontSize: '12px', 
                        padding: '6px 14px',
                        borderRadius: '8px',
                        border: '1.5px solid rgba(212,106,72,0.7)',
                        background: 'rgba(212,106,72,0.15)',
                        color: '#d46a48',
                        fontWeight: '600',
                        cursor: 'pointer',
                    }}
                        onClick={() => handleDelete(appliance.serial)}>
                        Delete
                    </button>
                </div>
                </>
                
              ) : (
                // ── EDIT MODE — inline edit form on the card ──
                <>
                  <p style={{ color: '#f5e0d8', fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>
                    Editing #{appliance.serial}
                  </p>
                  {editError && <p style={{ color: '#d46a48', fontSize: '12px', marginBottom: '8px' }}>{editError}</p>}

                  <select style={selectStyle} value={editType} onChange={e => setEditType(e.target.value)}>
                    {validTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <input style={inputStyle} placeholder="Brand" value={editBrand} onChange={e => setEditBrand(e.target.value)} />
                  <input style={inputStyle} placeholder={`Price (${currency})`} type="number" value={editPrice} onChange={e => setEditPrice(e.target.value)} />

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={{ ...coralBtn, fontSize: '12px', padding: '6px 14px' }}
                      onClick={() => handleEdit(appliance.serial)}>
                      Save
                    </button>
                    <button style={{ ...ghostBtn, fontSize: '12px', padding: '6px 14px' }}
                      onClick={() => setEditingId(null)}>
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// return statement
export default Dashboard;