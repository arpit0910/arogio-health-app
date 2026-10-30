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
      val candidates = intents.flatMap { manager.queryIntentActivities(it, PackageManager.MATCH_ALL) }
      candidates.map { it.activityInfo.applicationInfo }.distinctBy { it.packageName }.mapNotNull { app ->
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
