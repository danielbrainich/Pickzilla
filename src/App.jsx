import { useState } from 'react';
import Papa from 'papaparse';
import './App.css';

function App() {
  const [fileName, setFileName] = useState(null);
  const [pickList, setPickList] = useState([]);
  const [orderIds, setOrderIds] = useState([]);

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
            type = 'Espresso Ground';
          } else if (/^ground$/i.test(type)) {
            type = 'Medium Grind';
          }

          // Remove everything starting from "10.5 oz", "Pack of", "Whole Bean", etc.
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

  const openPickListInNewTab = () => {
    if (pickList.length === 0) return;

    const html = `
  <html>
  <head>
    <title>Pick List</title>
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <style>
      body {
        background-color: #121212;
        color: #f0f0f0;
        font-family: sans-serif;
        padding: 2rem;
        margin: 0;
      }
      h2 {
        margin-bottom: 1rem;
        color: #fff;
        text-align: center;
      }
      table {
        max-width: 700px;
        width: 100%;
        margin: 0 auto;
        border-collapse: collapse;
        font-size: 1rem;
        table-layout: auto;
      }
      th, td {
        padding: 10px 14px;
        border: 1px solid #444;
        text-align: left;
      }
      th {
        background-color: #333;
        color: #fff;
      }
      tr {
        background-color: #1e1e1e;
      }
      tr:hover {
        background-color: #2a2a2a;
      }
      .no-wrap {
        white-space: nowrap;
      }  
    </style>
  </head>
  <body>
    <h2>Amazon Pick List${fileName ? ` - ${fileName}` : ''}</h2>
    <table>
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
        ${pickList
        .map(
          (item) => `
          <tr>
            <td>${item.sku}</td>
            <td>${item.coffeeName}</td>
            <td>${item.type}</td>
            <td class="no-wrap">${item.size}</td>
            <td>${item.qty}</td>
          </tr>
        `
        )
        .join('')}
      </tbody>
    </table>
<table style="margin-top: 3rem;">
  <thead>
    <tr>
      <th>Order IDs</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="white-space: pre-wrap;">${orderIds.join(', ')}</td>
    </tr>
  </tbody>
</table>
  </body>
  </html>
`;

    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.open();
      newWindow.document.write(html);
      newWindow.document.close();
    } else {
      alert('Please allow pop-ups for this site to view the pick list.');
    }
  };

  return (
    <div className="App container text-center py-5">
      <header className="App-header mb-4">
        <img
          src="/medium-tiger.png"
          alt="Logo"
          style={{ display: 'block', margin: '0 auto 1rem', width: '50px', height: 'auto' }}
        />
        <h2 className="mb-4">Amazon Pick List Generator</h2>

        <input
          type="file"
          accept=".txt,.tsv"
          onChange={handleFileUpload}
          className="form-control mb-3"
          aria-label="Upload TSV or TXT file"
        />

        <div>
          <button
            onClick={openPickListInNewTab}
            disabled={pickList.length === 0}
            className="btn btn-danger"
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
      <footer
        style={{
          position: 'fixed',
          bottom: 0,
          width: '100%',
          textAlign: 'center',
          padding: '0.5rem 0',
          fontSize: '0.8rem',
          color: '#888',
          backgroundColor: '#121212',
        }}
      >
        built by Daniel B.
      </footer>
    </div>
  );
}

export default App;