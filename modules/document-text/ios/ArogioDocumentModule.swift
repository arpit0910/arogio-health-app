import ExpoModulesCore
import Vision

public class ArogioDocumentModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ArogioDocumentText")
    AsyncFunction("recognize") { (path: String, language: String) throws -> String in
      guard let url = URL(string: path), url.isFileURL else {
        throw NSError(domain: "ArogioDocumentText", code: 1, userInfo: [NSLocalizedDescriptionKey: "Choose a local photo"])
      }
      let request = VNRecognizeTextRequest()
      request.recognitionLevel = .accurate
      request.usesLanguageCorrection = false
      let supported = try request.supportedRecognitionLanguages()
      let wanted = language == "hi" ? "hi-IN" : "en-US"
      guard supported.contains(wanted) else {
        throw NSError(domain: "ArogioDocumentText", code: 2, userInfo: [NSLocalizedDescriptionKey: "Document language is not supported on this device"])
      }
      request.recognitionLanguages = [wanted]
      try VNImageRequestHandler(url: url).perform([request])
      return (request.results ?? []).compactMap { $0.topCandidates(1).first?.string }.joined(separator: "\n")
    }
  }
}
