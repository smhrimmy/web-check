import fs from 'fs';
import path from 'path';

export default async function (req, res) {
  try {
    const urlObj = new URL(req.url, `http://${req.headers.host}`);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    // Expecting ['api', 'functionName']
    
    let functionName = pathParts[1];
    
    if (!functionName) {
      return res.status(400).json({ error: 'Function name is missing' });
    }

    // Sanitize
    functionName = functionName.replace(/[^a-zA-Z0-9-]/g, '');
    
    // Dynamic import
    // Note: We use a relative path. In Vercel, this should resolve to the file in _lib
    const handlerModule = await import(`./_lib/${functionName}.js`);
    
    if (handlerModule && handlerModule.default) {
      return handlerModule.default(req, res);
    } else {
      return res.status(500).json({ error: 'Invalid handler module' });
    }
  } catch (error) {
    console.error('Dispatcher error:', error);
    return res.status(404).json({ error: 'Function not found or internal error' });
  }
}
