import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

// interface for the instrument data
interface Instrument {
  instrument_key: string;
  exchange_token: string;
  tradingsymbol: string;
  name: string;
  last_price: string;
  expiry: string;
  strike: string;
  tick_size: string;
  lot_size: string;
  instrument_type: string;
  option_type: string;
  exchange: string;
}

const fetchInstrumentDetails = async (
  stockName: string
): Promise<Instrument | null> => {
  return new Promise((resolve, reject) => {
    let found = false;
    fs.createReadStream(path.join(__dirname, 'NSE.csv'))
      .pipe(csv())
      .on('data', (row: Instrument) => {
        if (!found && (row.tradingsymbol === stockName || row.name === stockName)) {
          found = true;
          resolve(row);
        }
      })
      .on('end', () => {
        if (!found) {
          resolve(null); // Resolve with null if stock not found
        }
      })
      .on('error', (error: any) => {
        reject(error);
      });
  });
};

export default fetchInstrumentDetails;
