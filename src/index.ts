import cron from 'node-cron';
import { config } from './config/environment';
import { cacheService } from './services/cache';
import { checkAppointments } from './utils/appointmentChecker';
import { telegramService } from "./services/telegram";

sendDailyNotification();
// Önbellek temizleme işlemini başlat
cacheService.startCleanupInterval();

// Zamanlanmış görevi başlat
cron.schedule(config.app.checkInterval, checkAppointments);

const dailyNotificationCronMorning = '0 9 * * *'; // Example: 9:00 AM daily
const dailyNotificationCronEvening = '0 21 * * *'; // Example: 9:00 AM daily
cron.schedule(dailyNotificationCronMorning, sendDailyNotification);
cron.schedule(dailyNotificationCronEvening, sendDailyNotification);

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
const startupMessage = "Vize kontrol botu çalışmaya devam ediyor 🤖";
telegramService.sendNotificationStr(startupMessage, false) // Send as plain text
  .then(() => console.log("Telegram başlangıç bildirimi gönderildi."))
  .catch(error => console.error("Failed to send startup notification:", error));
}