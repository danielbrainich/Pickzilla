import { useState } from 'react';
import Papa from 'papaparse';
import './App.css';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { useRef } from 'react';

function App() {
  const [showInfo, setShowInfo] = useState(false);
  const [pickList, setPickList] = useState([]);
  const [fileName, setFileName] = useState('');
  const [orderIds, setOrderIds] = useState([]);
  const [showPickList, setShowPickList] = useState(false);
  const fileInputRef = useRef(null);


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

      const key = `${sku}::${name}`;

      if (!grouped[key]) {
        grouped[key] = {
          sku,
          name,
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
              src="/godzilla.gif"
              alt="Logo"
              width="300"
              height="auto"
style={{ display: 'block', margin: '0 auto 1rem', borderRadius: '10px' }}
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
              ref={fileInputRef}
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
          onClick={() => {
            setShowInfo(false); // or setShowPickList(false);
            setFileName('');
            setPickList([]);
            setOrderIds([]);
            if (fileInputRef.current) fileInputRef.current.value = '';
          }}
          className="link-success"
          aria-label="Back to main screen"
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            color: '#198754',
            textDecoration: 'underline',
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
<div className="picklist-screen container text-start">
<button
  onClick={() => {
    setShowPickList(false); // or setShowPickList(false);
    setFileName('');
    setPickList([]);
    setOrderIds([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }}
  className="link-success"
  aria-label="Back to main screen"
  style={{
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    color: '#198754',
    textDecoration: 'underline',
  }}
>
  ← Back
</button>
  <h3 className="pt-2 pb-2">Pick List{fileName ? ` - ${fileName}` : ''}</h3>
  <div className="table-responsive">
    <table className="table table-dark table-bordered table-sm custom-table">
        <colgroup>
    <col style={{ width: '15%' }} />  {/* SKU */}
    <col style={{ width: '75%' }} />  {/* Product Name */}
    <col style={{ width: '7%' }} />  {/* Quantity */}
  </colgroup>
      <thead>
        <tr>
          <th>SKU</th>
          <th>Product Name</th>
          <th>Quantity</th>
        </tr>
      </thead>
      <tbody>
        {pickList.map((item, index) => (
          <tr key={index}>
            <td>{item.sku}</td>
            <td>{item.name}</td>
            <td>{item.qty}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

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