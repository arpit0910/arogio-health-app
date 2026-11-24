import { AccessibleText as Text, AccessibleTextInput as TextInput } from '../../components/ui/AccessibleText';
import { useTranslation } from "../../localization/LanguageProvider";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  View,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Location from "expo-location";
import { AppScreen } from "../../components/app/AppScreen";
import { AppIcon } from "../../components/app/AppIcon";
import { CareDisclosure, useCareStyles } from "../../components/app/CareUI";
import { Button } from "../../components/ui/Button";
import { TouchTarget } from "../../components/ui/TouchTarget";
import { usePalette } from "../../theme/AppearanceProvider";
import { publicApi as apiClient } from "../care-directory/api";
import { bankListSchema, dialNumber, type Bank } from "../../services/api/healthResourcesApi";
type Coordinates = { latitude: number; longitude: number; time: number };
export function EmergencyButton({ inline = false }: { inline?: boolean }) {
  const router = useRouter();
  const { t: tr } = useTranslation();
  const colors = usePalette();
  return (
    <TouchTarget
      accessibilityRole="button"
      accessibilityLabel={tr("Emergency contacts and blood banks")}
      onPress={() => router.push("/emergency")}
      style={({ pressed }) => ({
        position: inline ? "relative" : "absolute",
        right: inline ? undefined : 16,
        bottom: inline ? undefined : 16,
        alignSelf: inline ? "stretch" : "flex-end",
        justifyContent: "center",
        paddingVertical: 14,
        minHeight: 52,
        paddingHorizontal: 18,
        borderRadius: 14,
        backgroundColor: colors.errorSurface,
        borderWidth: 1,
        borderColor: colors.error,
        opacity: pressed ? 0.75 : 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
      })}
    >
      <AppIcon name="phone" color={colors.error} size={22} />
      <Text
        style={{ color: colors.error, fontSize: 16, fontWeight: "600" }}
      >
        {tr("Emergency")}</Text>
      <AppIcon name="right" color={colors.error} size={18} />
    </TouchTarget>
  );
}
export function BloodBanksScreen() {
  const { t: tr, language, locale } = useTranslation();
  const [reportBank, setReportBank] = useState<string | null>(null), [reportText, setReportText] = useState(''), [reportStatus, setReportStatus] = useState(''), [sendingReport, setSendingReport] = useState(false);
  async function sendBankReport(id: string) {
    if (sendingReport) return;
    setSendingReport(true); setReportStatus('');
    try { await apiClient.request({ path: `/care/blood-banks/${id}/corrections`, method: 'POST', body: { message: reportText.trim() } }); setReportStatus('Report received for review. It does not change the listing automatically.'); setReportText(''); }
    catch { setReportStatus('Your report could not be sent. Please try again.'); }
    finally { setSendingReport(false); }
  }
  const c = useCareStyles(),
    colors = usePalette(),
    { nearby, search: initialSearch } = useLocalSearchParams<{ nearby?: string; search?: string }>();
  const [search, setSearch] = useState(initialSearch ?? ""),
    [term, setTerm] = useState(initialSearch ?? ""),
    [coords, setCoords] = useState<Coordinates | null>(null),
    [only24h, setOnly24h] = useState(false),
    [radius, setRadius] = useState(50),
    [page, setPage] = useState(1),
    [revision, setRevision] = useState(0);
  const hindi = language === 'hi';
  const requestKey = JSON.stringify([
    coords,
    term,
    only24h,
    radius,
    page,
    revision,
  ]);
  const [response, setResponse] = useState<{
    key: string;
    data: ReturnType<typeof bankListSchema.parse> | null;
    error: string;
  } | null>(null);
  const loading = response?.key !== requestKey,
    result = loading ? null : response?.data,
    error = loading ? "" : response?.error;
  const [locating, setLocating] = useState(false),
    [locationError, setLocationError] = useState("");
  const alive = useRef(true),
    locationLock = useRef(false),
    started = useRef(false);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  async function locate() {
    if (locationLock.current) return;
    locationLock.current = true;
    setLocating(true);
    setLocationError("");
    let timeout: ReturnType<typeof setTimeout> | undefined;
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!alive.current) return;
      if (!permission.granted)
        throw new Error(
          "Location access is off. Search by city or pincode below, or enable location in your device settings.",
        );
      const location = await Promise.race([
        Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        }),
        new Promise<never>((_, reject) => {
          timeout = setTimeout(
            () =>
              reject(
                new Error(
                  "Your location could not be found. Check device location services, retry, or search by city.",
                ),
              ),
            20000,
          );
        }),
      ]);
      if (!alive.current) return;
      setCoords({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        time: Date.now(),
      });
      setTerm("");
      setSearch("");
      setPage(1);
    } catch (issue) {
      if (alive.current)
        setLocationError(
          issue instanceof Error
            ? issue.message
            : "Location is unavailable. Search by city or pincode.",
        );
    } finally {
      if (timeout) clearTimeout(timeout);
      locationLock.current = false;
      if (alive.current) setLocating(false);
    }
  }
  useEffect(() => {
    if (nearby === "1" && !started.current) {
      started.current = true;
      void locate();
    }
  }, [nearby]);
  useEffect(() => {
    const controller = new AbortController();
    let current = true;
    const query = new URLSearchParams({
      page: String(page),
      search: term,
      only24h: String(only24h),
    });
    void apiClient
      .request({
        path: coords ? "/public/blood-banks/nearby" : `/public/blood-banks?${query}`,
        method: coords ? "POST" : "GET",
        body: coords
          ? {
              latitude: coords.latitude,
              longitude: coords.longitude,
              radiusKm: radius,
              page,
              only24h,
            }
          : undefined,
        signal: controller.signal,
      })
      .then((data) => {
        const parsed = bankListSchema.parse(data);
        if (current) setResponse({ key: requestKey, data: parsed, error: "" });
      })
      .catch(() => {
        if (current)
          setResponse({
            key: requestKey,
            data: null,
            error:
              "Blood banks could not load. Check your connection and retry.",
          });
      });
    return () => {
      current = false;
      controller.abort();
    };
  }, [coords, term, only24h, radius, page, revision, requestKey]);
  async function open(url: string) {
    try {
      await Linking.openURL(url);
    } catch {
      if (alive.current)
        setLocationError(
          "This link could not open. You can copy the bank address or phone number below.",
        );
    }
  }
  function bankRow(bank: Bank) {
    const phone = dialNumber(bank.phone, bank.country_code),
      emergency = dialNumber(bank.emergency_phone, bank.emergency_country_code);
    const destination =
      bank.latitude != null && bank.longitude != null
        ? `${bank.latitude},${bank.longitude}`
        : `${bank.name_en}, ${bank.address_en}, ${bank.city}, ${bank.state} ${bank.pincode || ""}`;
    return (
      <View
        key={bank.id}
        style={{
          padding: 18,
          borderRadius: 16,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          gap: 12,
        }}
      >
        <Text style={c.title}>{(hindi && bank.name_hi) || bank.name_en}</Text>
        <Text style={[c.text, { color: colors.primary }]}>
          {tr(bank.distanceKm == null
            ? `${bank.city}, ${bank.state}`
            : `${bank.distanceKm < 0.1 ? "Under 0.1" : bank.distanceKm.toFixed(1)} km away · straight-line`)}
        </Text>
        <Text selectable style={c.text}>
          {(hindi && bank.address_hi) || bank.address_en}
          {bank.pincode ? ` · ${bank.pincode}` : ""}
        </Text>
        <Text style={c.text}>
          {[
            bank.is_24_7 && "Listed as 24 hours",
            bank.is_government && "Government",
            bank.component_facility && "Components",
            bank.apheresis_facility && "Apheresis",
          ]
            .filter(Boolean)
            .join(" · ") || "Call for service details"}
        </Text>
        <Text style={c.text}>
          {tr("Listed groups:")}{" "}
          {bank.available_blood_groups.join(", ") || "Not provided"}
        </Text>
        <Text style={c.text}>
          {tr("Call to confirm blood availability and opening hours.")}</Text>
        {!bank.is_verified && <Text style={c.text}>{tr('Directory listing. Call to confirm details and blood availability.')}</Text>}
        {bank.is_verified && !!bank.verified_at && <Text style={c.text}>{tr("Reviewed listing")}: {new Date(bank.verified_at).toLocaleDateString(locale)}</Text>}
        <Button title={tr('Report incorrect information')} variant="secondary" onPress={() => { setReportBank(bank.id); setReportStatus(''); setReportText(''); }} />
        {reportBank === bank.id && <View style={{ gap: 12 }}><Text style={c.text}>{tr('Describe a directory correction only. Do not include medical records or personal health information.')}</Text><TextInput accessibilityLabel={tr('Directory correction')} value={reportText} onChangeText={setReportText} multiline maxLength={1000} style={{ color: colors.ink, minHeight: 80, padding: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 12 }} /><Button title={tr('Send correction')} loading={sendingReport} disabled={reportText.trim().length < 10} onPress={() => void sendBankReport(bank.id)} />{!!reportStatus && <Text accessibilityLiveRegion="polite" style={c.text}>{tr(reportStatus)}</Text>}</View>}
        {bank.phone && (
          <Text selectable style={c.text}>
            {tr("Phone: ")}{bank.country_code} {bank.phone}
          </Text>
        )}
        {bank.emergency_phone && (
          <Text selectable style={c.text}>
            {tr("Emergency contact: ")}{bank.emergency_country_code}{" "}
            {bank.emergency_phone}
          </Text>
        )}
        {!!phone && (
          <Button title={tr("Call blood bank")} leading={<AppIcon name="phone" color={colors.onPrimary} size={20} />} onPress={() => void open(phone)} />
        )}
        {!!emergency && emergency !== phone && (
          <Button
            title={tr("Call emergency contact")}
            leading={<AppIcon name="phone" size={20} />}
            variant="secondary"
            onPress={() => void open(emergency)}
          />
        )}
        {!phone && !emergency && (
          <Text style={c.text}>{tr("No telephone number listed.")}</Text>
        )}
        <Button
          title={tr("Open directions")}
          leading={<AppIcon name="directions" size={20} />}
          variant="secondary"
          onPress={() =>
            void open(
              `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`,
            )
          }
        />
      </View>
    );
  }
  return (
    <AppScreen
      title={tr("Blood banks")}
      back
      onRefresh={() => setRevision((value) => value + 1)}
      refreshing={loading && !!response?.data}
    >
      <View style={{ gap: 16 }}>
        <Text style={c.heading}>{tr("Find a blood bank near you")}</Text>
        <Text style={c.text}>
          {tr("Find contact details and directions. This directory does not show live blood stock or provide emergency dispatch.")}</Text>
        <Button
          title={tr(coords ? "Update my location" : "Find near me")}
          loading={locating}
          leading={
            <AppIcon name="location" color={colors.onPrimary} size={20} />
          }
          onPress={() => void locate()}
        />
        <Text style={c.text}>
          {tr(coords
            ? `Location checked ${new Date(coords.time).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}. Distances are straight-line, not travel distance.`
            : "Location is used for this search only and is not saved. You can also search without sharing it.")}
        </Text>
        {!!locationError && (
          <Text
            accessibilityRole="alert"
            style={[c.text, { color: colors.error }]}
          >
            {locationError}
          </Text>
        )}
        <View style={{ gap: 16 }}>
        <TextInput
          accessibilityLabel={tr("City, pincode or blood-bank name")}
          placeholder={tr("City, pincode or bank name")}
          placeholderTextColor={colors.placeholder}
          value={search}
          onChangeText={setSearch}
          maxLength={150}
          onSubmitEditing={() => {
            setCoords(null);
            setTerm(search.trim());
            setPage(1);
          }}
          style={{
            color: colors.ink,
            minHeight: 52,
            padding: 14,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
          }}
        />
        <Button
          title={tr("Search directory")}
          variant="secondary"
          onPress={() => {
            setCoords(null);
            setTerm(search.trim());
            setPage(1);
          }}
        />
        <CareDisclosure title={tr("Filter listed services")}><View style={{ gap: 16 }}>
        <Button
          title={
            tr(only24h ? "24-hour listings only: on" : "24-hour listings only: off")
          }
          variant="secondary"
          onPress={() => {
            setOnly24h(!only24h);
            setPage(1);
          }}
        />
        {!!coords && (
          <View style={{ gap: 8 }}>
            <Text style={c.text}>{tr("Search radius: ")}{radius} {tr(" km")}</Text>
            <Button
              title={tr(radius === 50 ? "Expand to 200 km" : "Use 50 km radius")}
              variant="secondary"
              onPress={() => {
                setRadius(radius === 50 ? 200 : 50);
                setPage(1);
              }}
            />
          </View>
        )}
        </View></CareDisclosure>
        </View>

        {loading ? (
          <ActivityIndicator accessibilityLabel={tr("Loading blood banks")} />
        ) : error ? (
          <>
            <Text accessibilityRole="alert" style={c.text}>
              {tr(error)}
            </Text>
            <Button
              title={tr("Retry")}
              onPress={() => setRevision((value) => value + 1)}
            />
          </>
        ) : (
          result && (
            <>
              {!!coords && result.missingCoordinates > 0 && (
                <Text style={c.text}>
                  {result.missingCoordinates} {tr(" listings have no coordinates and cannot be distance-ranked. Search by city to see them.")}</Text>
              )}
              <Text style={c.title}>
                {tr(coords
                  ? "Nearest listings"
                  : term
                    ? `Results for ${term}`
                    : "Blood-bank directory")}
              </Text>
              {result.items.length ? (
                result.items.map(bankRow)
              ) : (
                <Text style={c.text}>
                  {tr(coords
                    ? "No banks found in this radius. Expand the radius or search by city."
                    : "No matching banks. Clear the search and filters, or pull to refresh after the directory is updated.")}
                </Text>
              )}
              {(page > 1 || result.hasNext) && <View style={{ gap: 12 }}>
              <Text style={c.text}>{tr("Page ")}{page}</Text>
              <Button
                title={tr("Previous page")}
                variant="secondary"
                disabled={page === 1}
                onPress={() => setPage(page - 1)}
              />
              <Button
                title={tr("Next page")}
                variant="secondary"
                disabled={!result.hasNext}
                onPress={() => setPage(page + 1)}
              />
              </View>}
            </>
          )
        )}
      </View>
    </AppScreen>
  );
}
