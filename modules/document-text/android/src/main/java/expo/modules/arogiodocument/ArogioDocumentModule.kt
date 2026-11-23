package expo.modules.arogiodocument

import android.net.Uri
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.latin.TextRecognizerOptions
import com.google.mlkit.vision.text.devanagari.DevanagariTextRecognizerOptions
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ArogioDocumentModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ArogioDocumentText")
    AsyncFunction("recognize") { path: String, language: String, promise: Promise ->
      try {
        val context = appContext.reactContext ?: throw IllegalStateException("App is not ready")
        val uri = Uri.parse(path)
        require(uri.scheme == "file" || uri.scheme == "content") { "Choose a local document photo" }
        val image = InputImage.fromFilePath(context, uri)
        val recognizer = if (language == "hi") TextRecognition.getClient(DevanagariTextRecognizerOptions.Builder().build())
          else TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS)
        recognizer.process(image)
          .addOnSuccessListener { result -> promise.resolve(result.text) }
          .addOnFailureListener { promise.reject("OCR_FAILED", "Could not read this document photo", it) }
          .addOnCompleteListener { recognizer.close() }
      } catch (error: Exception) { promise.reject("OCR_FAILED", "Could not open this document photo", error) }
    }
  }
}
