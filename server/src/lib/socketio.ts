import { WebSocket } from 'ws';
import { Server } from 'socket.io';
import protobuf from 'protobufjs';
import schedule from 'node-schedule';
// @ts-ignore
import * as UpstoxClient from 'upstox-js-sdk';
// C-3 FIX: Import from the new TypeScript tokenStore
import { getAccessToken } from '../util/tokenStore';
import fetchInstrumentDetails from '../util/fetchInstrumentDetails';
import { getMarketStatus } from '../util/fetchStockData';

// Initialize global variables
let protobufRoot: any = null;
let defaultClient = UpstoxClient.ApiClient.instance;
let apiVersion = '2.0';

// C-3 FIX: Do NOT read the token at module load time (it is always null on cold
// start because no user has authenticated yet). Instead, read it lazily right
// before each WebSocket connection is opened.
const getUpstoxAuth = () => {
  return getAccessToken() || (process.env.UPSTOX_ACCESS_TOKEN as string);
};

// Function to authorize the market data feed
const getMarketFeedUrl = async () => {
  return new Promise((resolve, reject) => {
    // C-3 FIX: Refresh the OAuth token on every call
    const OAUTH2 = defaultClient.authentications['OAUTH2'];
    OAUTH2.accessToken = getUpstoxAuth();

    let apiInstance = new UpstoxClient.WebsocketApi();

    apiInstance.getMarketDataFeedAuthorize(
      apiVersion,
      // @ts-ignore
      (error, data, response) => {
        if (error) {
          console.error('Upstox auth error:', error?.response?.res?.statusMessage ?? error);
          reject(error?.response?.res?.statusMessage ?? error);
        } else {
          resolve(data.data.authorizedRedirectUri);
        }
      }
    );
  });
};

const connectWebSocket = async (wsUrl: any) => {
  return new Promise((resolve, reject) => {
    // C-3 FIX: Use fresh token for each WebSocket connection
    const token = getUpstoxAuth();

    const ws = new WebSocket(wsUrl, {
      headers: {
        'Api-Version': apiVersion,
        Authorization: 'Bearer ' + token,
      },
      followRedirects: true,
    });

    ws.on('open', () => {
      console.log('ws connected');
      resolve(ws);
    });

    ws.on('close', () => {
      console.log('ws disconnected');
    });

    ws.on('error', (error: any) => {
      console.error('ws error:', error);
      reject(error);
    });
  });
};

const initProtobuf = async () => {
  protobufRoot = await protobuf.load(__dirname + '/MarketDataFeed.proto');
  console.log('Protobuf initialization complete');
};

const decodeProfobuf = (buffer: any) => {
  if (!protobufRoot) {
    console.warn('Protobuf not initialized yet!');
    return null;
  }

  const FeedResponse = protobufRoot.lookupType(
    'com.upstox.marketdatafeeder.rpc.proto.FeedResponse'
  );
  return FeedResponse.decode(buffer);
};

initProtobuf();

// H-3 FIX: Schedule market-status broadcast jobs ONCE at the server level using
// io.emit(), instead of creating two new jobs per socket connection. Previously,
// 1000 concurrent clients would create 2000 scheduled jobs all firing at once.
const setupMarketStatusJobs = (io: Server) => {
  schedule.scheduleJob({ hour: 9, minute: 15, tz: 'Asia/Kolkata' }, async () => {
    io.emit('marketStatusChange', await getMarketStatus());
  });

  schedule.scheduleJob({ hour: 15, minute: 30, tz: 'Asia/Kolkata' }, async () => {
    io.emit('marketStatusChange', await getMarketStatus());
  });
};

const connectSocket = async (app: any) => {
  const io = new Server(app, {
    cors: {
      origin: [
        'http://localhost:3000',
        'https://equity-nest.vercel.app',
        'https://equitynest.vercel.app',
        'https://equity-nest-mjil.vercel.app',
        process.env.CLIENT_DOMAIN as string,
      ].filter(Boolean),
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // H-3 FIX: Create market jobs once, not once per connection
  setupMarketStatusJobs(io);

  const socketToWsMap = new Map();

  io.on('connection', (socket: any) => {
    let ws: any;

    socket.on('selectSymbol', async (symbol: string) => {
      if (!socketToWsMap.has(socket.id)) {
        socketToWsMap.set(socket.id, ws);

        const instrument = await fetchInstrumentDetails(symbol);
        if (!instrument) {
          socket.emit('error', 'No instrument found for the given symbol.');
          return;
        }

        const instrumentKey = instrument.instrument_key;

        try {
          const wsUrl = await getMarketFeedUrl();
          ws = await connectWebSocket(wsUrl);

          socketToWsMap.set(socket.id, ws);

          const data = {
            guid: 'someguid',
            method: 'sub',
            data: {
              mode: 'full',
              instrumentKeys: [instrumentKey],
            },
          };

          ws.send(Buffer.from(JSON.stringify(data)));

          const messageHandler = (data: any) => {
            const decodedData = decodeProfobuf(data);
            socket.emit('symbolData', decodedData);
          };
          ws.on('message', messageHandler);

          const errorHandler = (err: Error) => {
            console.error('WebSocket Error:', err);
            socket.emit('error', 'WebSocket encountered an error.');
          };
          ws.on('error', errorHandler);

          const closeHandler = () => {
            ws.close();
            ws.removeListener('message', messageHandler);
            ws.removeListener('error', errorHandler);
            ws.removeListener('close', closeHandler);
          };
          ws.on('close', closeHandler);
        } catch (error) {
          console.error('An error occurred:', error);
          socket.emit('error', 'Error retrieving data for the given symbol.');
        }
      } else {
        return;
      }
    });

    // Handle socket.io disconnect and close the associated WebSocket
    socket.on('disconnect', () => {
      const clientWs = socketToWsMap.get(socket.id);

      if (clientWs && clientWs.readyState === clientWs.OPEN) {
        clientWs.close();
        clientWs.removeAllListeners();
      }

      socketToWsMap.delete(socket.id);
    });
  });
};

export default connectSocket;
