import cron from 'node-cron';
import { config } from './config/environment';
import { cacheService } from './services/cache';
import { checkAppointments } from './utils/appointmentChecker';
import { telegramService } from "./services/telegram";
import http from 'http'; // Import the http module for the keep-alive ping
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

app.listen(port, () => {
 // Keep-Alive Cron Job (every 10 minutes) - This is the existing pinging mechanism
const keepAlivePingCron = '*/10 * * * *'; // Every 10 minutes
cron.schedule(keepAlivePingCron, keepAlive);
console.log(`Keep-alive ping job scheduled with cron: ${keepAlivePingCron} to ${`http://localhost:${port}/health`}`);
})

sendDailyNotification();
// Önbellek temizleme işlemini başlat
cacheService.startCleanupInterval();

// Zamanlanmış görevi başlat
cron.schedule(config.app.checkInterval, checkAppointments);

const dailyNotificationCron = '0 9 * * *'; // Example: 9:00 AM daily

cron.schedule(dailyNotificationCron, sendDailyNotification);

console.log(`Vize randevu kontrolü başlatıldı. Kontrol sıklığı: ${config.app.checkInterval}`);
console.log(`Hedef ülke: ${config.app.targetCountry}`);
console.log(`Hedef ülkeler: ${config.app.missionCountries.join(', ')}`);
if (config.app.targetCities.length > 0) {
  console.log(`Hedef şehirler: ${config.app.targetCities.join(', ')}`);
}

// İlk kontrolü yap
void checkAppointments();
async function sendDailyNotification() 
{
 // Inside your app.listen callback in index.ts, after the server starts:
const startupMessage = "Visa check çalışıyor 🤖";
telegramService.sendNotificationStr(startupMessage, false) // Send as plain text
  .then(() => console.log("Startup notification sent."))
  .catch(error => console.error("Failed to send startup notification:", error));
}

async function keepAlive(){
  const now = new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' });
  const healthCheckUrl = `http://localhost:${port}/health`; // Pings your app's /health endpoint
  console.log(`[${now}] Sending keep-alive ping to ${healthCheckUrl}`);

  const req = http.get(healthCheckUrl, (res) => { // Sends an HTTP GET request
    // ... (handles response)
  });
  // ... (error handling)
  req.end();
}