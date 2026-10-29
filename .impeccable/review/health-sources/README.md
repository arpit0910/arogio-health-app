# Health source picker review

The previews use synthetic app names, not a real installed-app inventory. `first-320.png` checks initial single-source selection and a long app label at 320 units; `connected-390.png` checks settings with one selected app; `empty-390.png` checks the teaching state when no compatible apps are found. Actual native installed-app discovery still needs device verification.

Reproduce HTML with `node scripts/preview-health-sources.cjs <width> <first|connected|empty>`. The script renders shipping picker/settings components using react-native-web and a fixture context. The previews verify composition, not native behavior or navigation.

The local Expo Android discovery module compiles, Expo autolinking resolves it, Android bundle export succeeds, and 73 tests pass. A new Android build is required to include the discovery module and its narrow package-visibility queries.
