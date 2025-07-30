import { useState } from 'react';
import Papa from 'papaparse';
import './App.css';
import { AiOutlineInfoCircle } from 'react-icons/ai';

function App() {
  const [showInfo, setShowInfo] = useState(false);
  const [pickList, setPickList] = useState([]);
  const [fileName, setFileName] = useState('');
  const [orderIds, setOrderIds] = useState([]);
  const [showPickList, setShowPickList] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);

    Papa.parse(file, {
      header: true,
      delimiter: '\t',
      complete: (results) => {
        const data = results.data;
        const grouped = {};

        data.forEach((row) => {
          const sku = row['sku'];
          const name = row['product-name'];
          const qty = parseInt(row['quantity-to-ship'], 10);

          if (!sku || !name || isNaN(qty)) return;

          // --- Type
          const typeMatch = name.match(/(Whole Bean Coffee|Ground Coffee|Fine Ground Coffee)/i);
          let type = typeMatch ? typeMatch[0] : '';
          type = type.replace(/Coffee/i, '').trim(); // Remove "Coffee" from type

          // Rename types
          if (/^fine ground$/i.test(type)) {
            type = 'Espresso Grind';
          } else if (/^ground$/i.test(type)) {
            type = 'Medium Grind';
          }

          // Remove everything starting from "10.5 oz", "Pack of", "Whole Bean", etc.
          let coffeeName = name;
          coffeeName = coffeeName.replace(/(Whole Bean Coffee|Ground Coffee|Fine Ground Coffee)/i, '');
          coffeeName = coffeeName.replace(/([\d.]+\s*(oz|lb)\s*(Bag|Box)?)/i, '');
          coffeeName = coffeeName.replace(/\(?Pack\s+of\s+\d+\)?/i, '');
          coffeeName = coffeeName.replace(/\(?\d+\s+Pack\)?/i, '');
          coffeeName = coffeeName.replace(/\d+\s+Pack\s+Box/i, '');
          coffeeName = coffeeName.replace(/\bCoffee\b/i, '');
          coffeeName = coffeeName.replace(/,+$/, '').trim();

          // Optional: clean prefix like "Equator Coffees," to keep only the product part
          const parts = coffeeName.split(',');
          coffeeName = parts.length > 1 ? parts[1].trim() : parts[0].trim();

          // --- Size logic
          let size = '';

          const ozMatch = name.match(/([\d.]+)\s*oz\s*(Bag|Box)?/i);
          if (ozMatch) {
            size = `${ozMatch[1]} oz`;
          } else {
            const lbMatch = name.match(/([\d.]+)\s*lb\s*(Bag|Box)?/i);
            if (lbMatch) {
              size = `${lbMatch[1]} lb`;
            } else {
              const packOfMatch = name.match(/\(?Pack\s+of\s+(\d+)\)?/i);
              const frontPackMatch = name.match(/\(?(\d+)\s+Pack\)?/i);
              const packBoxMatch = name.match(/(\d+)\s+Pack\s+Box/i);

              if (packOfMatch) {
                size = `${packOfMatch[1]}-Pack`;
              } else if (frontPackMatch) {
                size = `${frontPackMatch[1]}-Pack`;
              } else if (packBoxMatch) {
                size = `${packBoxMatch[1]}-Pack`;
              } else {
                const fallback = name.match(/([\d.]+)\s*(oz|lb)/i);
                if (fallback) {
                  size = `${fallback[1]} ${fallback[2].toLowerCase()}`;
                }
              }
            }
          }

          // --- Grouping key
          const key = `${sku}::${coffeeName}::${type}::${size}`;
          if (!grouped[key]) {
            grouped[key] = {
              sku,
              coffeeName,
              type,
              size,
              qty: 0,
            };
          }

          grouped[key].qty += qty;
        });

        const orderIds = Array.from(new Set(data.map(row => row['order-id']).filter(Boolean)));
        setOrderIds(orderIds);
        setPickList(Object.values(grouped));
      },
    });
  };

 return (
    <div className="App container text-center py-5" style={{ minHeight: '100vh', paddingBottom: '3rem' }}>
{!showInfo && !showPickList ? (
        <>
          <header className="App-header mb-4">
            <img
              src="/godzilla-192x192.png"
              alt="Logo"
              width="50"
              height="50"
              style={{ display: 'block', margin: '0 auto 1rem' }}
            />
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginBottom: '1rem',
              }}
            >
              <h2 style={{ margin: 0 }}>Pickzilla</h2>
              <button
                onClick={() => setShowInfo(true)}
                aria-label="Show info about Pickzilla"
                style={{
                  color: '#198754',
                  fontSize: '1.5rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  lineHeight: 1,
                  transform: 'translateY(-1px)', // adjust as needed
                }}
              >
                <AiOutlineInfoCircle />
              </button>
            </div>
            <input
              type="file"
              accept=".txt,.tsv"
              onChange={handleFileUpload}
              className="form-control mb-3"
              aria-label="Upload TSV or TXT file"
            />

            <div>
              <button
                onClick={() => setShowPickList(true)}
                disabled={pickList.length === 0}
                className="btn btn-success"
              >
                Generate Pick List
              </button>
            </div>
            <div style={{ minHeight: '2rem', marginTop: '2rem' }}>
              {fileName ? (
                <p className="small file-loaded-text">
                  File loaded: <strong>{fileName}</strong>
                </p>
              ) : (
                <span>&nbsp;</span>
              )}
            </div>
          </header>
        </>
) : showInfo ? (
        // Info screen
        <div className="info-screen p-4 text-start">
        <button
          onClick={() => setShowInfo(false)}
          className="link-success"
          aria-label="Back to main screen"
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            color: '#198754', // ensure it uses your green color
            textDecoration: 'underline', // optional, for link style
          }}
        >
          ← Back
        </button>

          <h3>About Pickzilla</h3>
          <p>
            Pickzilla is a tool to help you upload TSV or TXT files and generate pick lists easily.
            Use it to streamline your order fulfillment process.
          </p>
          <p>
            Upload your file, then click "Generate Pick List" to open your list in a new tab.
          </p>
        </div>
) : (
<div className="picklist-screen p-4 text-start">
  <button
    onClick={() => setShowPickList(false)}
    className="link-success"
    aria-label="Back to main screen"
    style={{
      background: 'none',
      border: 'none',
      padding: 0,
      cursor: 'pointer',
      color: '#198754',
      textDecoration: 'underline',
      fontSize: '1rem',
      marginBottom: '1rem',
    }}
  >
    ← Back
  </button>

  <h3>Pick List{fileName ? ` - ${fileName}` : ''}</h3>
  <table className="table table-dark table-bordered table-sm">
    <thead>
      <tr>
        <th>SKU</th>
        <th>Coffee Name</th>
        <th>Grind</th>
        <th>Size</th>
        <th>Quantity</th>
      </tr>
    </thead>
    <tbody>
      {pickList.map((item, index) => (
        <tr key={index}>
          <td>{item.sku}</td>
          <td>{item.coffeeName}</td>
          <td>{item.type}</td>
          <td>{item.size}</td>
          <td>{item.qty}</td>
        </tr>
      ))}
    </tbody>
  </table>

  {orderIds.length > 0 && (
    <div style={{ marginTop: '2rem' }}>
      <h5>Order IDs</h5>
      <p style={{ whiteSpace: 'pre-wrap' }}>{orderIds.join(', ')}</p>
    </div>
  )}
</div>
)}
      <footer
        style={{
          position: 'fixed',
          bottom: 0,
          width: '100%',
          textAlign: 'center',
          padding: '0.5rem 0',
          fontSize: '0.8rem',
          color: '#888',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
            built by{' '}
            <a
              href="https://github.com/danielbrainich"
              target="_blank"
              rel="noopener noreferrer"
              className="link-success"
            >
            Daniel B.
            </a>
      </footer>
    </div>
  );
}

export default App;