import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Controller('logs')
export class NetworkController {
  @Get('network')
  async tail(@Query('lines') lines = '200', @Res() res: Response) {
    const n = Math.max(1, Math.min(2000, parseInt(lines as string, 10) || 200));
    const logPath = path.join(process.cwd(), 'logs', 'network.log');

    if (!fs.existsSync(logPath)) {
      return res.status(404).json({ error: 'network log not found' });
    }

    try {
      const data = await fs.promises.readFile(logPath, 'utf8');
      const allLines = data.split(/\r?\n/).filter(Boolean);
      const last = allLines.slice(-n);
      return res.json({ lines: last, totalLines: allLines.length });
    } catch (err) {
      return res.status(500).json({ error: 'failed to read log', detail: err.message });
    }
  }
}
