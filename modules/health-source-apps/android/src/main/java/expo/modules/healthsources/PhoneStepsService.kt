package expo.modules.healthsources

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.IBinder
import android.os.Build
import android.os.SystemClock
import android.provider.Settings
import java.time.Instant
import java.time.ZoneId
import org.json.JSONObject

/** Native cumulative counter survives React unmounts and activity dismissal. */
class PhoneStepsService : Service(), SensorEventListener {
  companion object {
    @Volatile private var runningOwner: String? = null
    fun isRunning(owner: String) = runningOwner == owner
    fun canCount(context: Context) = Build.VERSION.SDK_INT < Build.VERSION_CODES.Q ||
      context.checkSelfPermission(android.Manifest.permission.ACTIVITY_RECOGNITION) == PackageManager.PERMISSION_GRANTED
    fun preferences(context: Context) = context.getSharedPreferences("arogio.phone.counter", Context.MODE_PRIVATE)
    fun totals(context: Context, owner: String): Map<String, Int> {
      val json = JSONObject(preferences(context).getString("totals.$owner", "{}") ?: "{}")
      return json.keys().asSequence().associateWith { json.getInt(it) }
    }
  }
  private lateinit var manager: SensorManager
  private var hasSample = false
  override fun onCreate() {
    super.onCreate()
    manager = getSystemService(SENSOR_SERVICE) as SensorManager
  }
  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    val prefs = preferences(this)
    val owner = prefs.getString("owner", null)
    if (owner == null || !prefs.getBoolean("enabled", false) || !canCount(this)) {
      stopSelf()
      return START_NOT_STICKY
    }
    if (isRunning(owner)) return START_STICKY
    manager.unregisterListener(this)
    runningOwner = null
    hasSample = false
    val notifications = getSystemService(NOTIFICATION_SERVICE) as NotificationManager
    notifications.createNotificationChannel(NotificationChannel("phone-steps", "Step counting", NotificationManager.IMPORTANCE_LOW))
    val builder = Notification.Builder(this, "phone-steps")
      .setContentTitle("Arogio is counting your steps")
      .setContentText("Phone counting stays on when you close the app. Manage it in Activity.")
      .setSmallIcon(android.R.drawable.ic_menu_directions).setOngoing(true)
    packageManager.getLaunchIntentForPackage(packageName)?.let {
      builder.setContentIntent(PendingIntent.getActivity(this, 0, it, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT))
    }
    val sensor = manager.getDefaultSensor(Sensor.TYPE_STEP_COUNTER)
    try {
      startForeground(7103, builder.build())
      if (sensor == null || !manager.registerListener(this, sensor, SensorManager.SENSOR_DELAY_NORMAL)) {
        stopSelf(); return START_NOT_STICKY
      }
    } catch (_: SecurityException) { stopSelf(); return START_NOT_STICKY }
    runningOwner = owner
    return START_STICKY
  }
  override fun onSensorChanged(event: SensorEvent) {
    val prefs = preferences(this)
    if (!prefs.getBoolean("enabled", false)) return
    val owner = prefs.getString("owner", null) ?: return
    if (!isRunning(owner)) return
    val count = event.values[0].toInt()
    val boot = Settings.Global.getInt(contentResolver, Settings.Global.BOOT_COUNT, -1)
    val previous = prefs.getInt("counter", -1)
    val sensorDelayMs = ((SystemClock.elapsedRealtimeNanos() - event.timestamp) / 1_000_000).coerceAtLeast(0)
    val today = Instant.ofEpochMilli(System.currentTimeMillis() - sensorDelayMs).atZone(ZoneId.of("Asia/Kolkata")).toLocalDate()
    // The cumulative sensor does not provide per-step timestamps. Attribute
    // recent increments to the reporting day; do not assign multi-day gaps to today.
    val day = today.toString()
    val cutoff = today.minusDays(1).toString()
    val sameBoot = hasSample || (boot >= 0 && prefs.getInt("boot", -2) == boot)
    val recent = prefs.getString("day", "")?.let { it in cutoff..day } == true
    val delta = if (previous >= 0 && sameBoot && recent && count >= previous) count - previous else 0
    val totals = JSONObject(prefs.getString("totals.$owner", "{}") ?: "{}")
    totals.put(day, totals.optInt(day, 0) + delta)
    totals.keys().asSequence().toList().filter { it < today.minusDays(29).toString() }.forEach { totals.remove(it) }
    prefs.edit().putInt("counter", count).putInt("boot", boot).putString("day", day)
      .putString("totals.$owner", totals.toString()).apply()
    hasSample = true
  }
  override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}
  override fun onDestroy() {
    runningOwner = null
    manager.unregisterListener(this)
    super.onDestroy()
  }
  override fun onBind(intent: Intent?): IBinder? = null
}
