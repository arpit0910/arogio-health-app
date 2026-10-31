import { useTranslation } from "../../localization/LanguageProvider";
import { useState } from "react";
import { Platform, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as Linking from "expo-linking";
import { AppScreen } from "../../components/app/AppScreen";
import { CareBrand, useCareStyles } from "../../components/app/CareUI";
import { AppIcon } from "../../components/app/AppIcon";
import { Button } from "../../components/ui/Button";
import { usePalette } from "../../theme/AppearanceProvider";
import { useAuth } from "../../features/auth/context/AuthContext";
import {
  normalizeInviteCode,
  validInviteCode,
} from "../../features/referrals/model";
export default function InviteRoute() {
  const { t: tr } = useTranslation();
  const { code: raw } = useLocalSearchParams<{ code?: string | string[] }>();
  const code = normalizeInviteCode(raw),
    valid = validInviteCode(code);
  const { user, isLoading } = useAuth();
  const c = useCareStyles(),
    colors = usePalette();
  const [error, setError] = useState("");
  return (
    <AppScreen>
      <CareBrand />
      <View style={{ marginTop: 36, gap: 16 }}>
        <AppIcon name="users" size={40} />
        <Text style={c.heading}>
          {tr(valid
            ? "Good health is better together."
            : "This invite looks incomplete.")}
        </Text>
        <Text style={c.text}>
          {tr(valid
            ? "A friend invited you to Arogio. Use their code when you create an account, or add it before finishing setup."
            : "Ask your friend to share their invite link again. You can also enter their code manually during signup.")}
        </Text>
        {valid && (
          <View
            style={{
              backgroundColor: colors.subtle,
              padding: 20,
              borderRadius: 12,
              gap: 8,
            }}
          >
            <Text style={c.text}>{tr("Your friend’s referral code")}</Text>
            <Text selectable style={[c.title, { letterSpacing: 1.5 }]}>
              {code}
            </Text>
          </View>
        )}
        <Button
          title={
            tr(user
              ? user.profileCompletedAt
                ? "Go to my profile"
                : "Continue account setup"
              : "Create an account")
          }
          disabled={isLoading}
          onPress={() =>
            router.push(
              user
                ? user.profileCompletedAt
                  ? "/profile"
                  : {
                      pathname: "/setup-profile",
                      params: { ref: valid ? code : "" },
                    }
                : { pathname: "/signup", params: { ref: valid ? code : "" } },
            )
          }
        />
        {user?.profileCompletedAt && (
          <Text style={c.text}>
            {tr("Referral codes are accepted for new accounts before setup is complete.")}</Text>
        )}
        {Platform.OS === "web" && valid && (
          <>
            <Button
              title={tr("Open in the Arogio app")}
              variant="secondary"
              onPress={() =>
                void Linking.openURL(`arogiohealth://invite/${code}`).catch(
                  () =>
                    setError(
                      "Install Arogio first, then enter this code during signup or setup.",
                    ),
                )
              }
            />
            <Text style={c.text}>
              {tr("Already installed Arogio? Open the app. If you install it later, keep this code to enter during setup.")}</Text>
          </>
        )}
        {!!error && (
          <Text accessibilityRole="alert" style={c.text}>
            {tr(error)}
          </Text>
        )}
      </View>
    </AppScreen>
  );
}
