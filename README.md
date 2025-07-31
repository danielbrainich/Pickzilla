# Pickzilla

Pickzilla is a simple React app that generates a pick list from your Amazon Seller Central Unshipped Order Report. It helps sellers efficiently group products by SKU and quantity to streamline order fulfillment.

## Why Pickzilla?

Amazon Seller Central does not natively provide an easy way to generate a consolidated pick list from unshipped orders. The alternatives involve integrating complex warehouse management systems or dealing with difficult manual fulfillment processes. Pickzilla offers a quick, easy, and free solution to create pick lists so you can fulfill orders more efficiently.

## Features

- Upload Amazon Seller Central Unshipped Order reports (TSV/TXT format)
- Validates required headers (`sku`, `product-name`, `quantity-to-ship`, `order-id`)
- Groups products by SKU and product name with summed quantities
- Displays an easy-to-read pick list table with SKU, product name, and total quantity to ship
- Shows all unique order IDs included in the uploaded report
- User-friendly error handling for missing headers or parsing issues
- Built-in info screen explaining what Pickzilla is and how to use it
- Sample report available for testing without real data

## How to Use

1. Log in to your Amazon Seller Central account.  
2. Navigate to **Orders → Order Reports → Unshipped Orders**.  
3. Request and download your unshipped orders report as a TSV or TXT file.  
4. Open Pickzilla and upload your downloaded report using the file input.  
5. Click **Generate Pick List** to view a grouped summary of SKUs and quantities.  
6. Use this pick list to efficiently fulfill your orders.

## File Format Requirements

Pickzilla expects the uploaded file to be tab-delimited with at least the following headers (case insensitive):

- `sku`  
- `product-name`  
- `quantity-to-ship`  
- `order-id`  

If any of these are missing, Pickzilla will show an error and refuse to generate a pick list.

## Technologies Used

- React
- Papaparse for TSV parsing  
- Bootstrap CSS for basic styling

## License

MIT License © Daniel B.