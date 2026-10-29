const {
  withAndroidManifest,
  withDangerousMod,
  AndroidConfig,
} = require('expo/config-plugins');
const fs = require('node:fs/promises');
const path = require('node:path');

// Generate this activity through Expo so regenerated Android projects retain it.
module.exports = function withHealthRationale(config) {
  config = withAndroidManifest(config, (mod) => {
    const application = AndroidConfig.Manifest.getMainApplicationOrThrow(
      mod.modResults,
    );
    const main = AndroidConfig.Manifest.getMainActivityOrThrow(mod.modResults);
    const activityName = '.health.HealthDataRationaleActivity';
    const rationaleAction = 'androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE';
    main['intent-filter'] = (main['intent-filter'] ?? []).filter(
      (filter) =>
        !(filter.action ?? []).some(
          (action) => action.$['android:name'] === rationaleAction,
        ),
    );
    application.activity = (application.activity ?? []).filter(
      (activity) => activity.$['android:name'] !== activityName,
    );
    application.activity.push({
      $: { 'android:name': activityName, 'android:exported': 'true' },
      'intent-filter': [
        { action: [{ $: { 'android:name': rationaleAction } }] },
      ],
    });
    const alias = (application['activity-alias'] ?? []).find(
      (item) => item.$['android:name'] === 'ViewPermissionUsageActivity',
    );
    if (alias) alias.$['android:targetActivity'] = activityName;
    mod.modResults.manifest.queries ??= [];
    const queries = mod.modResults.manifest.queries;
    if (
      !queries.some((item) =>
        (item.package ?? []).some(
          (pkg) =>
            pkg.$['android:name'] === 'com.google.android.apps.healthdata',
        ),
      )
    )
      queries.push({
        package: [
          { $: { 'android:name': 'com.google.android.apps.healthdata' } },
        ],
      });
    return mod;
  });
  return withDangerousMod(config, [
    'android',
    async (mod) => {
      const packageName = mod.android.package;
      if (
        !packageName ||
        !/^[a-zA-Z][\w]*(\.[a-zA-Z][\w]*)+$/.test(packageName)
      )
        throw new Error(
          'A valid Android package is required for Health Connect.',
        );
      const directory = path.join(
        mod.modRequest.platformProjectRoot,
        'app/src/main/java',
        ...packageName.split('.'),
        'health',
      );
      await fs.mkdir(directory, { recursive: true });
      await fs.writeFile(
        path.join(directory, 'HealthDataRationaleActivity.kt'),
        `package ${packageName}.health

import android.app.Activity
import android.os.Bundle
import android.content.Intent
import android.net.Uri
import android.graphics.Color
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import android.widget.Button

class HealthDataRationaleActivity : Activity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    val density = resources.displayMetrics.density
    fun dp(value: Int) = (value * density).toInt()
    val content = LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
      setPadding(dp(24), dp(32), dp(24), dp(32))
      setBackgroundColor(Color.rgb(255, 253, 250))
      fitsSystemWindows = true
    }
    fun paragraph(text: String, size: Float) {
      content.addView(TextView(this).apply {
        this.text = text
        textSize = size
        setTextColor(Color.rgb(32, 62, 50))
        setPadding(0, dp(12), 0, dp(12))
      })
    }
    paragraph("Arogio health data access", 24f)
    paragraph("Choose what you share", 19f)
    paragraph("With your permission, Arogio reads steps, sleep, heart rate, weight, distance, energy, exercise, floors climbed and water intake from Health Connect from the one source app you select to show your daily overview and seven-day history. Other source apps are excluded. You may allow only the data types you choose.", 16f)
    paragraph("Your readings stay on this device", 19f)
    paragraph("Readings are held in memory during your signed-in app session. Optional background refresh keeps a recent overview encrypted on this device. Disconnect or sign out to clear the cache and stop refreshes. Arogio does not upload these readings to its API, use them for advertising, change your health profile or write back to Health Connect.", 16f)
    paragraph("You control access", 19f)
    paragraph("Disconnect in Arogio clears displayed readings and stops refreshes. To revoke Android permissions, open Health Connect settings. This does not delete original records in Samsung Health, Google Fit or Health Connect.", 16f)
    content.addView(Button(this).apply {
      text = "View Arogio privacy information"
      setOnClickListener { startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("arogiohealth://privacy")).setPackage(packageName)) }
    })
    content.addView(Button(this).apply { text = "Done"; setOnClickListener { finish() } })
    setContentView(ScrollView(this).apply { fitsSystemWindows = true; addView(content) })
  }
}
`,
      );
      return mod;
    },
  ]);
};
