import { App } from 'uWebSockets.js';
import { handleSearch, handleSyncHook, handleStatus } from './_handlers';

const PORT = parseInt(process.env.DSS_PORT || '10099')

const app = App();
app.any(`/api/v1/:site/hook`, handleSyncHook);
app.get(`/api/v1/:site/search`, handleSearch);
app.get('/api/v1/status', handleStatus);
app.get('/', handleStatus);

app.listen(PORT, () => {
  console.log(`hosted on http://127.0.0.1:${PORT}`);
});
