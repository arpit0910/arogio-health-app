package expo.modules.healthsources

import android.graphics.Bitmap
import android.graphics.Canvas
import android.util.Base64
import java.io.ByteArrayOutputStream
import android.content.Intent
import android.content.pm.PackageManager
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class HealthSourcesModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ArogioHealthSources")
    AsyncFunction("startPhoneSteps") { owner: String, initial: Map<String, Int> ->
      val context = appContext.reactContext ?: throw IllegalStateException("App context unavailable")
      val sensors = context.getSystemService(android.content.Context.SENSOR_SERVICE) as android.hardware.SensorManager
      if (sensors.getDefaultSensor(android.hardware.Sensor.TYPE_STEP_COUNTER) == null) throw IllegalStateException("No cumulative step sensor available")
      val prefs = PhoneStepsService.preferences(context)
      val continuing = prefs.getBoolean("enabled", false) && prefs.getString("owner", null) == owner
      val edit = prefs.edit().putString("owner", owner).putBoolean("enabled", true)
      if (!prefs.contains("totals.$owner")) edit.putString("totals.$owner", org.json.JSONObject(initial).toString())
      if (!continuing) edit.remove("counter").remove("boot").remove("day")
      edit.commit()
      try { context.startForegroundService(Intent(context, PhoneStepsService::class.java)) }
      catch (error: Exception) { prefs.edit().putBoolean("enabled", false).commit(); throw error }
    }
    AsyncFunction("stopPhoneSteps") { owner: String, clear: Boolean ->
      val context = appContext.reactContext ?: throw IllegalStateException("App context unavailable")
      val prefs = PhoneStepsService.preferences(context)
      if (prefs.getString("owner", null) == owner || owner.isEmpty()) {
        prefs.edit().putBoolean("enabled", false).remove("counter").commit()
        context.stopService(Intent(context, PhoneStepsService::class.java))
      }
      if (clear) prefs.edit().remove("totals.$owner").commit()
    }
    AsyncFunction("phoneStepTotals") { owner: String ->
      val context = appContext.reactContext ?: throw IllegalStateException("App context unavailable")
      PhoneStepsService.totals(context, owner)
    }
    AsyncFunction("openHealthApp") { packageName: String ->
      val context = appContext.reactContext ?: throw IllegalStateException("App context unavailable")
      val intent = context.packageManager.getLaunchIntentForPackage(packageName)
        ?: throw IllegalStateException("This app cannot be opened. Open it from your phone.")
      context.startActivity(intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
    }
    AsyncFunction("getInstalledHealthApps") {
      val context = appContext.reactContext ?: throw IllegalStateException("App context unavailable")
      val manager = context.packageManager
      val intents = listOf(
        Intent("androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE"),
        Intent("android.intent.action.VIEW_PERMISSION_USAGE").addCategory("android.intent.category.HEALTH_PERMISSIONS")
      )
      val excluded = setOf(context.packageName, "com.google.android.apps.healthdata", "com.android.healthconnect.controller")
      @Suppress("DEPRECATION")
      val candidates = intents.flatMap { manager.queryIntentActivities(it, PackageManager.MATCH_ALL) }.map { it.activityInfo.applicationInfo }
      // Some installed writer apps do not expose a discoverable rationale activity.
      // Still require actual Health Connect WRITE permissions below, never just a name.
      val known = listOf("com.pebble.ring.app", "com.sec.android.app.shealth").mapNotNull { packageName ->
        @Suppress("DEPRECATION")
        runCatching { manager.getApplicationInfo(packageName, 0) }.getOrNull()
      }
      (candidates + known).distinctBy { it.packageName }.mapNotNull { app ->
        val packageName = app.packageName
        if (!app.enabled || packageName in excluded) return@mapNotNull null
        // Keep non-writers visible without presenting them as working sync sources.
        runCatching {
          @Suppress("DEPRECATION")
          val permissions = manager.getPackageInfo(packageName, PackageManager.GET_PERMISSIONS).requestedPermissions.orEmpty()
          val supported = mapOf(
            "Steps" to "STEPS", "SleepSession" to "SLEEP", "HeartRate" to "HEART_RATE",
            "Weight" to "WEIGHT", "Distance" to "DISTANCE", "Nutrition" to "NUTRITION",
            "ExerciseSession" to "EXERCISE", "FloorsClimbed" to "FLOORS_CLIMBED",
            "ActiveCaloriesBurned" to "ACTIVE_CALORIES_BURNED", "TotalCaloriesBurned" to "TOTAL_CALORIES_BURNED",
            "RestingHeartRate" to "RESTING_HEART_RATE", "Hydration" to "HYDRATION"
          ).filter { (_, permission) -> permissions.contains("android.permission.health.WRITE_" + permission) }.keys.toList()
          if (supported.isEmpty()) return@mapNotNull null
          run {
            val icon = runCatching {
              val drawable = manager.getApplicationIcon(app)
              val bitmap = Bitmap.createBitmap(96, 96, Bitmap.Config.ARGB_8888)
              drawable.setBounds(0, 0, 96, 96)
              drawable.draw(Canvas(bitmap))
              val bytes = ByteArrayOutputStream()
              bitmap.compress(Bitmap.CompressFormat.PNG, 100, bytes)
              bitmap.recycle()
              "data:image/png;base64," + Base64.encodeToString(bytes.toByteArray(), Base64.NO_WRAP)
            }.getOrNull()
            mapOf("id" to packageName, "name" to manager.getApplicationLabel(app).toString(), "icon" to icon, "supportsHealthConnect" to true, "metrics" to supported)
          }
        }.getOrNull()
      }.sortedBy { (it["name"] as? String)?.lowercase() }
    }
  }
}
