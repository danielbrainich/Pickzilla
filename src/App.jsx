import { useState } from 'react';
import Papa from 'papaparse';
import './App.css';

function App() {
  const [fileName, setFileName] = useState(null);
  const [pickList, setPickList] = useState([]);

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

          // Trim name into clean columns
          const nameParts = name.split(',');
          const coffeeName = nameParts[1]?.trim() || 'Unknown';
          const typeMatch = name.match(/(Whole Bean Coffee|Ground Coffee|Fine Ground Coffee)/i);
          const type = typeMatch ? typeMatch[0] : 'Unknown';
          const sizeMatch = name.match(/[\d.]+\s*oz\s*Bag/i);
          const size = sizeMatch ? sizeMatch[0] : 'Unknown';

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
        table-layout: auto; /* columns sized to content */
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
        background-color: #1e1e1e; /* uniform row background */
      }
      tr:hover {
        background-color: #2a2a2a; /* subtle hover effect */
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
          <th>Type</th>
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
            <td>${item.size}</td>
            <td>${item.qty}</td>
          </tr>
        `
          )
          .join('')}
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

        {fileName && (
<p className="mt-3 small file-loaded-text">
  File loaded: <strong>{fileName}</strong>
</p>
        )}
      </header>
    </div>
  );
}

export default App;