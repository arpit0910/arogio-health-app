package expo.modules.healthsources

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.IBinder
import android.provider.Settings
import java.time.LocalDate
import java.time.ZoneId
import org.json.JSONObject

/** Native cumulative counter survives React unmounts and activity dismissal. */
class PhoneStepsService : Service(), SensorEventListener {
  companion object {
    fun preferences(context: Context) = context.getSharedPreferences("arogio.phone.counter", Context.MODE_PRIVATE)
    fun totals(context: Context, owner: String): Map<String, Int> {
      val json = JSONObject(preferences(context).getString("totals.$owner", "{}") ?: "{}")
      return json.keys().asSequence().associateWith { json.getInt(it) }
    }
  }
  private lateinit var manager: SensorManager
  override fun onCreate() {
    super.onCreate()
    manager = getSystemService(SENSOR_SERVICE) as SensorManager
  }
  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    val prefs = preferences(this)
    if (!prefs.getBoolean("enabled", false)) { stopSelf(); return START_NOT_STICKY }
    val notifications = getSystemService(NOTIFICATION_SERVICE) as NotificationManager
    notifications.createNotificationChannel(NotificationChannel("phone-steps", "Step counting", NotificationManager.IMPORTANCE_LOW))
    val builder = Notification.Builder(this, "phone-steps")
      .setContentTitle("Arogio is counting your steps")
      .setContentText("Phone counting stays on when you close the app. Manage it in Activity.")
      .setSmallIcon(android.R.drawable.ic_menu_directions).setOngoing(true)
    packageManager.getLaunchIntentForPackage(packageName)?.let {
      builder.setContentIntent(PendingIntent.getActivity(this, 0, it, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT))
    }
    startForeground(7103, builder.build())
    val sensor = manager.getDefaultSensor(Sensor.TYPE_STEP_COUNTER)
    try {
      if (sensor == null || !manager.registerListener(this, sensor, SensorManager.SENSOR_DELAY_NORMAL)) {
        stopSelf(); return START_NOT_STICKY
      }
    } catch (_: SecurityException) { stopSelf(); return START_NOT_STICKY }
    return START_STICKY
  }
  override fun onSensorChanged(event: SensorEvent) {
    val prefs = preferences(this)
    if (!prefs.getBoolean("enabled", false)) return
    val owner = prefs.getString("owner", null) ?: return
    val count = event.values[0].toInt()
    val boot = Settings.Global.getInt(contentResolver, Settings.Global.BOOT_COUNT, -1)
    val previous = prefs.getInt("counter", -1)
    val sameBoot = prefs.getInt("boot", -2) == boot
    val delta = if (previous >= 0 && sameBoot && count >= previous) count - previous else 0
    val today = LocalDate.now(ZoneId.of("Asia/Kolkata"))
    val totals = JSONObject(prefs.getString("totals.$owner", "{}") ?: "{}")
    // The cumulative sensor does not provide per-step timestamps. Attribute
    // increments to the reporting day, including the first sample after midnight.
    val day = today.toString()
    totals.put(day, totals.optInt(day, 0) + delta)
    totals.keys().asSequence().toList().filter { it < today.minusDays(29).toString() }.forEach { totals.remove(it) }
    prefs.edit().putInt("counter", count).putInt("boot", boot).putString("day", day)
      .putString("totals.$owner", totals.toString()).commit()
  }
  override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}
  override fun onDestroy() { manager.unregisterListener(this); super.onDestroy() }
  override fun onBind(intent: Intent?): IBinder? = null
}
