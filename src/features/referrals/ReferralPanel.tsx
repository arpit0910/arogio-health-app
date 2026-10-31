import { useTranslation } from "../../localization/LanguageProvider";
import { useRef, useState } from "react";
import { Platform, Share, Text, View } from "react-native";
import { useAuth } from "../auth/context/AuthContext";
import { AppIcon } from "../../components/app/AppIcon";
import { useCareStyles } from "../../components/app/CareUI";
import { Button } from "../../components/ui/Button";
import { usePalette } from "../../theme/AppearanceProvider";
import { referralLink, referralMessage, validInviteCode } from "./model";

export function ReferralPanel() {
  const { t: tr } = useTranslation();
  const { user, reloadProfile } = useAuth();
  const c = useCareStyles(),
    colors = usePalette();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const lock = useRef(false);
  const code = user?.referralCode;
  async function share() {
    if (lock.current || !code || !validInviteCode(code)) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      if (Platform.OS === "web") {
        if (typeof navigator.share === "function")
          await navigator.share({
            title: "Join me on Arogio",
            text: referralMessage(code),
          });
        else if (navigator.clipboard) {
          await navigator.clipboard.writeText(referralMessage(code));
          setError("Invite copied. Paste it into a message to your friend.");
        } else setError("Select the link below to copy and share your invite.");
      } else
        await Share.share({
          title: "Join me on Arogio",
          message: referralMessage(code),
        });
    } catch (e) {
      if (!(e instanceof Error && e.name === "AbortError"))
        setError(
          "Sharing could not open. You can select and copy your invite link below.",
        );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  async function retry() {
    setBusy(true);
    setError("");
    try {
      await reloadProfile();
    } catch {
      setError("Your code could not be loaded. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <View
      style={{
        marginTop: 28,
        paddingTop: 24,
        borderTopWidth: 1,
        borderColor: colors.border,
        gap: 12,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <AppIcon name="users" size={26} />
        <Text accessibilityRole="header" style={c.title}>
          {tr("Refer a friend")}</Text>
      </View>
      <Text style={c.text}>
        {tr("A little care goes further together. Invite a friend to join Arogio with your personal code.")}</Text>
      {code && validInviteCode(code) ? (
        <>
          <View
            style={{
              backgroundColor: colors.subtle,
              borderRadius: 12,
              padding: 16,
              gap: 6,
            }}
          >
            <Text style={c.text}>{tr("Your referral code")}</Text>
            <Text
              selectable
              accessibilityLabel={tr(`Your referral code: ${code.split("").join(" ")}`)}
              style={[c.title, { letterSpacing: 1.5 }]}
            >
              {code}
            </Text>
          </View>
          <Button
            title={tr("Share invite")}
            leading={
              <AppIcon name="share" color={colors.onPrimary} size={20} />
            }
            onPress={() => void share()}
            loading={busy}
          />
          <Text selectable style={[c.text, { fontSize: 13 }]}>
            {referralLink(code)}
          </Text>
          <Text style={[c.text, { fontSize: 13 }]}>
            {tr("Your friend can enter this code at signup or before finishing account setup.")}</Text>
        </>
      ) : (
        <>
          <Text style={c.text}>
            {tr("Your referral code is not available yet. Refresh your profile to check again.")}</Text>
          <Button
            title={tr("Refresh referral code")}
            variant="secondary"
            loading={busy}
            onPress={() => void retry()}
          />
        </>
      )}
      {!!error && (
        <Text accessibilityLiveRegion="polite" style={c.text}>
          {tr(error)}
        </Text>
      )}
    </View>
  );
}
