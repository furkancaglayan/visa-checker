import cron from 'node-cron';
import { config } from './config/environment';
import { cacheService } from './services/cache';
import { checkAppointments } from './utils/appointmentChecker';

import express, { Request, Response } from 'express';

const app = express();
const port = process.env.PORT || 4000;

app.get('/', (req: Request, res: Response) => { // Add : Request and : Response
  res.send('Visa Bot Task Runner Active and Healthy!');
});

// If you have other routes, apply the same fix:
app.get('/health', (req: Request, res: Response) => { // Add : Request and : Response
  res.status(200).json({ status: 'ok', message: 'Visa checker is running its tasks.' });
});

// Önbellek temizleme işlemini başlat
cacheService.startCleanupInterval();

// Zamanlanmış görevi başlat
cron.schedule(config.app.checkInterval, checkAppointments);
console.log(`Vize randevu kontrolü başlatıldı. Kontrol sıklığı: ${config.app.checkInterval}`);
console.log(`Hedef ülke: ${config.app.targetCountry}`);
console.log(`Hedef ülkeler: ${config.app.missionCountries.join(', ')}`);
if (config.app.targetCities.length > 0) {
  console.log(`Hedef şehirler: ${config.app.targetCities.join(', ')}`);
}

// İlk kontrolü yap
void checkAppointments();