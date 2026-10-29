package expo.modules.healthsources

import android.content.Intent
import android.content.pm.PackageManager
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class HealthSourcesModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ArogioHealthSources")
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
      candidates.distinctBy { it.activityInfo.packageName }.mapNotNull { activity ->
        val app = activity.activityInfo.applicationInfo
        val packageName = app.packageName
        if (!app.enabled || packageName in excluded) return@mapNotNull null
        // Read-only consumers cannot supply measurements to Arogio.
        runCatching {
          @Suppress("DEPRECATION")
          val permissions = manager.getPackageInfo(packageName, PackageManager.GET_PERMISSIONS).requestedPermissions.orEmpty()
          if (permissions.none { it.startsWith("android.permission.health.WRITE_") }) null
          else mapOf("id" to packageName, "name" to manager.getApplicationLabel(app).toString())
        }.getOrNull()
      }.sortedBy { it["name"]?.lowercase() }
    }
  }
}
