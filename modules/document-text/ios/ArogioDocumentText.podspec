Pod::Spec.new do |s|
  s.name = 'ArogioDocumentText'
  s.version = '1.0.0'
  s.summary = 'On-device document text recognition for Arogio'
  s.description = 'Reads local document photos with Apple Vision.'
  s.author = 'Arogio'
  s.homepage = 'https://arogio.com'
  s.license = { :type => 'MIT' }
  s.platforms = { :ios => '15.1' }
  s.source = { :git => '' }
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.source_files = '**/*.{h,m,mm,swift}'
  s.frameworks = 'Vision'
  s.swift_version = '5.9'
end
