import { useTranslation } from "../../localization/LanguageProvider";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as Location from "expo-location";
import { AppScreen } from "../../components/app/AppScreen";
import { AppIcon } from "../../components/app/AppIcon";
import { CareDisclosure, useCareStyles } from "../../components/app/CareUI";
import { Button } from "../../components/ui/Button";
import { TouchTarget } from "../../components/ui/TouchTarget";
import { usePalette } from "../../theme/AppearanceProvider";
import { apiClient } from "../../services/api/client";
import { bankListSchema, dialNumber, type Bank } from "./api";
type Coordinates = { latitude: number; longitude: number; time: number };
export function EmergencyButton() {
  const { t: tr } = useTranslation();
  const colors = usePalette();
  return (
    <TouchTarget
      accessibilityRole="button"
      accessibilityLabel={tr("Emergency: find nearby blood banks")}
      onPress={() => router.push("/blood-banks?nearby=1")}
      style={({ pressed }) => ({
        position: "absolute",
        right: 16,
        bottom: 16,
        minHeight: 52,
        paddingHorizontal: 18,
        borderRadius: 14,
        backgroundColor: pressed ? colors.ink : colors.error,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
      })}
    >
      <AppIcon name="drop" color={colors.onPrimary} size={22} />
      <Text
        style={{ color: colors.onPrimary, fontSize: 16, fontWeight: "600" }}
      >
        {tr("Emergency")}</Text>
    </TouchTarget>
  );
}
export function BloodBanksScreen() {
  const { t: tr, language, locale } = useTranslation();
  const c = useCareStyles(),
    colors = usePalette(),
    { nearby } = useLocalSearchParams<{ nearby?: string }>();
  const [search, setSearch] = useState(""),
    [term, setTerm] = useState(""),
    [coords, setCoords] = useState<Coordinates | null>(null),
    [group, setGroup] = useState(""),
    [only24h, setOnly24h] = useState(false),
    [radius, setRadius] = useState(50),
    [page, setPage] = useState(1),
    [revision, setRevision] = useState(0),
    [override, setHindi] = useState<boolean | null>(null);
  const hindi = override ?? language === 'hi';
  const requestKey = JSON.stringify([
    coords,
    term,
    group,
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
    if (group) query.set("bloodGroup", group);
    void apiClient
      .request({
        path: coords ? "/blood-banks/nearby" : `/blood-banks?${query}`,
        method: coords ? "POST" : "GET",
        body: coords
          ? {
              latitude: coords.latitude,
              longitude: coords.longitude,
              radiusKm: radius,
              page,
              only24h,
              ...(group ? { bloodGroup: group } : {}),
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
  }, [coords, term, group, only24h, radius, page, revision, requestKey]);
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
          paddingVertical: 22,
          borderBottomWidth: 1,
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
          <Button title={tr("Call blood bank")} onPress={() => void open(phone)} />
        )}
        {!!emergency && emergency !== phone && (
          <Button
            title={tr("Call emergency contact")}
            variant="secondary"
            onPress={() => void open(emergency)}
          />
        )}
        {!phone && !emergency && (
          <Text style={c.text}>{tr("No telephone number listed.")}</Text>
        )}
        <Button
          title={tr("Open directions")}
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
      refreshing={loading && !!result}
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
        <CareDisclosure title={tr("Search by city or filter")}><View style={{ gap: 16 }}>
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
        <Button
          title={tr(hindi ? "Show English names" : "हिन्दी नाम और पते")}
          variant="secondary"
          onPress={() => setHindi(!hindi)}
        />
        <Text style={c.title}>{tr("Filter listed services")}</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {["", "A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(
            (value) => (
              <TouchTarget
                key={value}
                accessibilityRole="button"
                accessibilityState={{ selected: group === value }}
                onPress={() => {
                  setGroup(value);
                  setPage(1);
                }}
                style={{
                  minWidth: 48,
                  minHeight: 48,
                  padding: 12,
                  borderRadius: 12,
                  backgroundColor:
                    group === value ? colors.primary : colors.subtle,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    color: group === value ? colors.onPrimary : colors.ink,
                  }}
                >
                  {value || "All"}
                </Text>
              </TouchTarget>
            ),
          )}
        </View>
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
        {(!!group || only24h) && <Text style={c.text}>{tr("Filters: ")}{[group, only24h && '24-hour listings'].filter(Boolean).join(' · ')}</Text>}
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
                    : "No matching banks. Try another city, pincode or filter.")}
                </Text>
              )}
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
            </>
          )
        )}
      </View>
    </AppScreen>
  );
}
