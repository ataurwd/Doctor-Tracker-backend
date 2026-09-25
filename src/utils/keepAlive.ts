/**
 * Render Keep-Alive Service
 *
 * Render's free tier spins down web services after 15 minutes of inactivity.
 * This service automatically pings the server's public endpoint every 12 minutes
 * to register activity with Render's router and prevent the server from sleeping.
 *
 * Render automatically exposes the `RENDER_EXTERNAL_URL` environment variable
 * for deployed web services (e.g. `https://your-service.onrender.com`).
 */

export const initKeepAlive = (): void => {
  const targetBaseUrl =
    process.env.RENDER_EXTERNAL_URL ||
    process.env.SERVER_URL ||
    process.env.PING_URL;

  if (!targetBaseUrl) {
    console.log(
      '[Keep-Alive] No RENDER_EXTERNAL_URL or SERVER_URL detected. Keep-alive self-ping is idle. (Render sets RENDER_EXTERNAL_URL automatically in production).'
    );
    return;
  }

  // Format the target health check URL
  const cleanBaseUrl = targetBaseUrl.replace(/\/+$/, '');
  const healthUrl = cleanBaseUrl.endsWith('/api/health')
    ? cleanBaseUrl
    : `${cleanBaseUrl}/api/health`;

  // Default interval: 12 minutes (720,000 ms), well before Render's 15-minute inactivity limit
  const intervalMs = parseInt(
    process.env.KEEP_ALIVE_INTERVAL_MS || '720000',
    10
  );
  const intervalMinutes = Math.round(intervalMs / 60000);

  console.log(
    `[Keep-Alive] Active! Pinging ${healthUrl} every ${intervalMinutes} minutes to prevent Render free-tier sleep.`
  );

  const pingServer = async () => {
    try {
      const response = await fetch(healthUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'DoctorTracker-KeepAlive/1.0',
        },
        signal: AbortSignal.timeout(15000), // 15s timeout
      });

      if (response.ok) {
        console.log(
          `[Keep-Alive] Ping successful at ${new Date().toLocaleTimeString()} (Status: ${response.status})`
        );
      } else {
        console.warn(
          `[Keep-Alive] Ping returned unexpected status: ${response.status} at ${new Date().toLocaleTimeString()}`
        );
      }
    } catch (error: any) {
      console.warn(
        `[Keep-Alive] Ping attempt error: ${error.message} (Will retry in ${intervalMinutes}m)`
      );
    }
  };

  // Initial ping after 30 seconds to confirm external routing
  setTimeout(pingServer, 30000);

  // Recurring ping interval
  const timer = setInterval(pingServer, intervalMs);

  // Ensure timer does not prevent graceful process termination
  if (timer.unref) {
    timer.unref();
  }
};
