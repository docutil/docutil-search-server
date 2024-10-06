import bodyParser from 'body-parser';
import express from 'express';
import { handleSearch, handleStatus, handleSyncHook } from './_handlers';
import { error } from './error';

const PORT = Number.parseInt(process.env.DSS_PORT || '10099');

const app = express();
app.use(bodyParser.json());
app.use(error);

app.all('/api/v1/:site/hook', handleSyncHook);
app.get('/api/v1/:site/search', handleSearch);
app.get('/api/v1/status', handleStatus);
app.get('/', handleStatus);

app.listen(PORT, () => {
  console.log(`hosted on http://127.0.0.1:${PORT}`);
});
