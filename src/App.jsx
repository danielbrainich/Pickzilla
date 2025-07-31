import { useState, useRef } from 'react';
import Papa from 'papaparse';
import './App.css';
import { AiOutlineInfoCircle } from 'react-icons/ai';

function App() {
  const [showInfo, setShowInfo] = useState(false);
  const [pickList, setPickList] = useState([]);
  const [fileName, setFileName] = useState('');
  const [orderIds, setOrderIds] = useState([]);
  const [showPickList, setShowPickList] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const REQUIRED_HEADERS = ['sku', 'product-name', 'quantity-to-ship', 'order-id'];

  const handleFileUpload = (e) => {
    setError(''); // Clear previous errors
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);

    Papa.parse(file, {
      header: true,
      delimiter: '\t',
      complete: (results) => {
        const { data, meta } = results;

        // Check if required headers are present (case-insensitive)
        const headers = meta.fields?.map((h) => h.toLowerCase()) || [];
        const missingHeaders = REQUIRED_HEADERS.filter(
          (required) => !headers.includes(required)
        );

        if (missingHeaders.length > 0) {
          const plural = missingHeaders.length > 1;
          setError(
            `File is missing required ${plural ? 'headers' : 'header'}: ${missingHeaders.join(', ')}. Please upload a valid file.`
          );
          setPickList([]);
          setOrderIds([]);
          setShowPickList(false);
          return;
        }

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
      error: (err) => {
        setError(`Parsing error: ${err.message}`);
        setPickList([]);
        setOrderIds([]);
        setShowPickList(false);
      },
    });
  };

  return (
    <div
      className="App container text-center py-5"
      style={{ minHeight: '100vh', paddingBottom: '3rem' }}
    >
      {!showInfo && !showPickList ? (
        <>
          <header className="App-header mb-4">
            <img
              src="/godzilla.gif"
              alt="Logo"
              width="300"
              height="auto"
              className="pickzilla-logo"
            />
            <div className="title-row">
              <h2 style={{ margin: 0 }}>Pickzilla</h2>
              <button
                onClick={() => setShowInfo(true)}
                aria-label="Show info about Pickzilla"
                className="info-button"
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
            {error && (
              <div className="alert-success-custom" role="alert">
                {error}
                <button
                  type="button"
                  onClick={() => setError('')}
                  aria-label="Close"
                  className="alert-close-button"
                >
                  ×
                </button>
              </div>
            )}
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
        <div className="info-screen p-4 text-start">
          <button
            onClick={() => {
              setShowInfo(false);
              setFileName('');
              setPickList([]);
              setOrderIds([]);
              setError('');
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
            className="back-button"
            aria-label="Back to main screen"
          >
            ← Back
          </button>
          <div className="container bg-dark text-white rounded p-3 mt-2 shadow-lg">
            <h3 className="mb-3">About Pickzilla</h3>
            <p>
              <strong>Pickzilla</strong> is the easiest way to generate a{' '}
              <strong>pick list</strong> from your{' '}
              <strong>Amazon Seller Central Unshipped Order Report</strong>.
            </p>

            <h5 className="mt-4">What’s a Pick List?</h5>
            <p>
              A <strong>pick list</strong> is a simplified summary of all the products
              you need to ship—grouped by SKU—so your team can fulfill orders efficiently.
            </p>

            <h5 className="mt-4">How It Works</h5>
            <ol className="ms-3">
              <li>Log in to <strong>Amazon Seller Central</strong></li>
              <li>Go to <strong>Orders → Order Reports → Unshipped Orders</strong></li>
              <li>Request and download your report</li>
              <li>Upload the file to <strong>Pickzilla</strong></li>
              <li>
                Click <strong>Generate Pick List</strong> to create your pick list
              </li>
            </ol>
            <h5 className="mt-4">Try It Out</h5>
            <p>
              Want to test it before uploading your own file? Download a sample {' '}
              <strong>Amazon Seller Central Unshipped Order Report</strong> below and
              give it a try.
            </p>

            <div className="text-center mt-4 mb-2">
              <a
                href="/sample-unshipped-orders.txt"
                download
                className="btn btn-success"
              >
                Download Sample Report
              </a>
            </div>
          </div>
        </div>
      ) : (
        <div className="picklist-screen container text-start">
          <button
            onClick={() => {
              setShowPickList(false);
              setFileName('');
              setPickList([]);
              setOrderIds([]);
              setError('');
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
            className="back-button"
            aria-label="Back to main screen"
          >
            ← Back
          </button>
          <h3 className="pt-2 pb-2">Pick List{fileName ? ` - ${fileName}` : ''}</h3>
          <div className="table-responsive">
            <table className="table table-dark table-bordered table-sm custom-table">
              <colgroup>
                <col style={{ width: '15%' }} /> {/* SKU */}
                <col style={{ width: '75%' }} /> {/* Product Name */}
                <col style={{ width: '7%' }} /> {/* Quantity */}
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
      <footer className="footer">
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